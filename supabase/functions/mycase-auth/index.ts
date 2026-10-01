import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * MyCase OAuth2 Authorization Code Flow handler.
 *
 * Endpoints per MyCase docs (https://mycaseapi.stoplight.io):
 *   Authorize: https://auth.mycase.com/login_sessions/new
 *   Token:     https://auth.mycase.com/tokens
 *
 * Modes:
 *   GET  /mycase-auth              -> redirects to MyCase login
 *   GET  /mycase-auth?code=XYZ     -> exchanges code for tokens
 *   GET  /mycase-auth?debug=true   -> shows env-var diagnostic
 *   POST /mycase-auth              -> refreshes access token
 */

const AUTH_BASE = "https://auth.mycase.com";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Rob's backend config uses MC_-prefixed names; older Supabase setup used
// MYCASE_-prefixed names. Check every likely name so a naming mismatch doesn't
// silently send blank credentials (which MyCase rejects with invalid_client).
const CLIENT_ID_NAMES = [
  "MYCASE_PUBLIC_KEY",
  "MC_PUBLIC_KEY",
  "MYCASE_CLIENT_ID",
  "MC_CLIENT_ID",
];
const CLIENT_SECRET_NAMES = [
  "MYCASE_SECRET_KEY",
  "MC_SECRET_KEY",
  "MYCASE_CLIENT_SECRET",
  "MC_CLIENT_SECRET",
];

function firstEnv(names: string[]): string {
  for (const n of names) {
    const v = Deno.env.get(n);
    if (v) return v;
  }
  return "";
}

const clientId = firstEnv(CLIENT_ID_NAMES);
const clientSecret = firstEnv(CLIENT_SECRET_NAMES);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Must EXACTLY match the redirect_uri MyCase registered for this app and that
// was used at sign-in. MyCase registered the firm's own backend callback, not
// Supabase. For the authorization_code exchange this value is a matching check
// only — it does not need to be a URL this function actually serves.
const REDIRECT_URI =
  firstEnv(["MYCASE_REDIRECT_URI", "MC_REDIRECT_URI"]) ||
  "https://mycase.elizabethrosariolaw.net/api/oauth/callback";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const sb = createClient(supabaseUrl, serviceRoleKey);
  const url = new URL(req.url);

  try {
    // -- POST: refresh the access token
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

    // -- GET with ?code= : exchange authorization code
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

    // -- GET with ?debug=true: show env-var diagnostic
    if (url.searchParams.get("debug") === "true") {
      const envRows = [...CLIENT_ID_NAMES, ...CLIENT_SECRET_NAMES, "MYCASE_REDIRECT_URI", "MC_REDIRECT_URI"]
        .map((n) => {
          const v = Deno.env.get(n);
          const shown = v ? `SET (len ${v.length}, ****${v.slice(-4)})` : "not set";
          return `<tr><td style="padding:6px;border:1px solid #ccc"><code>${n}</code></td><td style="padding:6px;border:1px solid #ccc">${shown}</td></tr>`;
        })
        .join("");
      return new Response(
        `<html><body style="font-family:sans-serif;padding:40px;max-width:760px">
          <h2>MyCase OAuth — Env Var Diagnostic</h2>
          <p>Which credential env vars are actually populated in this Supabase project:</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><th style="padding:6px;border:1px solid #ccc;text-align:left">Env Var Name</th><th style="padding:6px;border:1px solid #ccc;text-align:left">Status</th></tr>
            ${envRows}
          </table>
          <p style="margin-top:16px"><strong>Resolved client_id:</strong> <code>${clientId ? '****' + clientId.slice(-4) : 'NONE — all candidate names empty'}</code></p>
          <p><strong>Resolved client_secret:</strong> <code>${clientSecret ? '****' + clientSecret.slice(-4) : 'NONE — all candidate names empty'}</code></p>
          <p><strong>Resolved redirect_uri:</strong> <code>${REDIRECT_URI}</code></p>
        </body></html>`,
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // -- GET without code: redirect to MyCase login
    return Response.redirect(buildAuthorizeUrl(), 302);
  } catch (err) {
    const message = (err as Error).message;
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
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
  });
  return `${AUTH_BASE}/login_sessions/new?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  firm_uuid?: string;
  scope?: string;
}

async function exchangeToken(
  params: Record<string, string>
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    ...params,
  });

  const resp = await fetch(`${AUTH_BASE}/tokens`, {
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
        firm_uuid: tokens.firm_uuid || null,
        scope: tokens.scope || null,
        last_refreshed: new Date().toISOString(),
      },
    },
    { onConflict: "sync_key" }
  );
}
