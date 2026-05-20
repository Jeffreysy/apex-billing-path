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
 *   GET  /mycase-auth?debug=true   -> shows diagnostic info
 *   POST /mycase-auth              -> refreshes access token
 */

const AUTH_BASE = "https://auth.mycase.com";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const clientId = Deno.env.get("MYCASE_PUBLIC_KEY")!;
const clientSecret = Deno.env.get("MYCASE_SECRET_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const REDIRECT_URI = `${supabaseUrl}/functions/v1/mycase-auth`;

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

    // -- GET with ?debug=true: show diagnostic info
    if (url.searchParams.get("debug") === "true") {
      const authorizeUrl = buildAuthorizeUrl();
      return new Response(
        `<html><body style="font-family:sans-serif;padding:40px;max-width:700px">
          <h2>MyCase OAuth — Diagnostic</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">Authorize Endpoint</td>
                <td style="padding:8px;border:1px solid #ccc"><code>${AUTH_BASE}/login_sessions/new</code></td></tr>
            <tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">Token Endpoint</td>
                <td style="padding:8px;border:1px solid #ccc"><code>${AUTH_BASE}/tokens</code></td></tr>
            <tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">Client ID</td>
                <td style="padding:8px;border:1px solid #ccc"><code>${clientId || 'NOT SET'}</code></td></tr>
            <tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">Client Secret</td>
                <td style="padding:8px;border:1px solid #ccc"><code>${clientSecret ? '****' + clientSecret.slice(-4) : 'NOT SET'}</code></td></tr>
            <tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">Redirect URI</td>
                <td style="padding:8px;border:1px solid #ccc"><code>${REDIRECT_URI}</code></td></tr>
            <tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">Full Authorize URL</td>
                <td style="padding:8px;border:1px solid #ccc;word-break:break-all"><code>${authorizeUrl}</code></td></tr>
          </table>
          <br/>
          <p><strong>Prerequisites (per MyCase docs):</strong></p>
          <ol>
            <li>Client credentials issued by MyCase support</li>
            <li>Redirect URI registered by MyCase support (they set it, not you)</li>
            <li>Authorizing user must have <em>"Manage your firm's preferences, billing, and payment options"</em> permission set to <strong>Yes</strong></li>
          </ol>
          <br/>
          <a href="${authorizeUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px">Attempt Authorization →</a>
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
