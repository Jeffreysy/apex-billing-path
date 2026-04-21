import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * MyCase OAuth2 Authorization Code Flow handler.
 *
 * Two modes:
 *   GET  /mycase-auth              → redirects to MyCase login
 *   GET  /mycase-auth?code=XYZ     → exchanges code for tokens, stores in mycase_sync_state
 *   POST /mycase-auth              → refreshes access token using stored refresh_token
 */

const MYCASE_DOMAIN = "grand-rapids-law-group.mycase.com";
const AUTH_BASE = "https://auth.mycase.com";
const API_BASE = `https://${MYCASE_DOMAIN}`;

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const clientId = Deno.env.get("MYCASE_PUBLIC_KEY")!;
const clientSecret = Deno.env.get("MYCASE_SECRET_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// The redirect URI must match what's registered in MyCase
const REDIRECT_URI = `${supabaseUrl}/functions/v1/mycase-auth`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const sb = createClient(supabaseUrl, serviceRoleKey);
  const url = new URL(req.url);

  try {
    // ── POST: refresh the access token ──────────────────────────
    if (req.method === "POST") {
      const { data: state } = await sb
        .from("mycase_sync_state")
        .select("refresh_token")
        .eq("sync_key", "oauth")
        .single();

      if (!state?.refresh_token) {
        return new Response(
          JSON.stringify({
            error: "No refresh token stored. Complete OAuth flow first.",
            authorize_url: buildAuthorizeUrl(),
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokens = await exchangeToken({
        grant_type: "refresh_token",
        refresh_token: state.refresh_token,
      });

      await storeTokens(sb, tokens);

      return new Response(
        JSON.stringify({
          success: true,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── GET with ?code= : exchange authorization code ───────────
    const code = url.searchParams.get("code");
    if (code) {
      const tokens = await exchangeToken({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      });

      await storeTokens(sb, tokens);

      return new Response(
        `<html><body style="font-family:sans-serif;padding:40px">
          <h2>✅ MyCase Connected!</h2>
          <p>Access token received and stored. You can close this tab.</p>
          <p><small>Token expires in ${tokens.expires_in} seconds.
          Refresh token stored for automatic renewal.</small></p>
        </body></html>`,
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // ── GET without code: redirect to MyCase login ──────────────
    return Response.redirect(buildAuthorizeUrl(), 302);
  } catch (err) {
    const message = (err as Error).message;
    // Store error in sync state
    await sb.from("mycase_sync_state").upsert(
      {
        sync_key: "oauth",
        last_error: message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sync_key" }
    );

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildAuthorizeUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
  });
  return `${AUTH_BASE}/login_sessions/new?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

async function exchangeToken(
  params: Record<string, string>
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    ...params,
  });

  const resp = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `MyCase token exchange failed (${resp.status}): ${text.slice(0, 500)}`
    );
  }

  return await resp.json();
}

async function storeTokens(
  sb: ReturnType<typeof createClient>,
  tokens: TokenResponse
) {
  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString();

  await sb.from("mycase_sync_state").upsert(
    {
      sync_key: "oauth",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      last_error: null,
      updated_at: new Date().toISOString(),
      meta: {
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
        last_refreshed: new Date().toISOString(),
      },
    },
    { onConflict: "sync_key" }
  );
}
