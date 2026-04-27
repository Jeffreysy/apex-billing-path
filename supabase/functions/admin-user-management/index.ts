import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(18));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

async function writeAuditLog(
  adminClient: ReturnType<typeof createClient>,
  actorId: string,
  action: string,
  recordId: string,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
) {
  await adminClient.from("audit_log").insert({
    table_name: "profiles",
    record_id: recordId,
    action,
    old_data: oldData,
    new_data: newData,
    performed_by: actorId,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: currentRole } = await userClient.rpc("current_user_role");
    if (!["admin", "partner"].includes(currentRole || "")) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const action = payload.action;

    if (!["invite", "create", "reset_password", "resend_invite", "delete"].includes(action)) {
      return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // ── INVITE (send Supabase invite email) ──
    if (action === "invite") {
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        payload.email,
        {
          data: { full_name: payload.fullName || payload.email },
          ...(payload.redirectTo ? { redirectTo: payload.redirectTo } : {}),
        },
      );

      if (inviteError || !inviteData.user) {
        throw inviteError || new Error("Unable to invite user");
      }

      const managedUserId = inviteData.user.id;

      await adminClient.from("profiles").upsert({
        id: managedUserId,
        email: payload.email,
        full_name: payload.fullName || payload.email,
        role: payload.role,
        is_active: true,
      });

      await writeAuditLog(adminClient, user.id, "admin_invite_user", managedUserId, null, {
        email: payload.email,
        full_name: payload.fullName || payload.email,
        role: payload.role,
      });

      return new Response(JSON.stringify({
        success: true,
        user: { id: managedUserId, email: payload.email, role: payload.role },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CREATE (immediate account with temp password) ──
    if (action === "create") {
      const temporaryPassword = payload.temporaryPassword?.trim() || generateTemporaryPassword();

      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email: payload.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: payload.fullName || payload.email,
          must_change_password: true,
        },
        app_metadata: { role: payload.role },
      });

      if (createError || !createdUser.user) {
        throw createError || new Error("Unable to create user");
      }

      const managedUserId = createdUser.user.id;

      await adminClient.from("profiles").upsert({
        id: managedUserId,
        email: payload.email,
        full_name: payload.fullName || payload.email,
        role: payload.role,
        is_active: true,
      });

      await writeAuditLog(adminClient, user.id, "admin_create_user", managedUserId, null, {
        email: payload.email,
        full_name: payload.fullName || payload.email,
        role: payload.role,
        is_active: true,
      });

      return new Response(JSON.stringify({
        success: true,
        user: { id: managedUserId, email: payload.email, role: payload.role },
        temporaryPassword,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RESEND INVITE (generate a magic link for an existing user) ──
    if (action === "resend_invite") {
      const { data: existingUser, error: existingUserError } = await adminClient.auth.admin.getUserById(payload.userId);
      if (existingUserError || !existingUser.user) {
        throw existingUserError || new Error("Unable to find user");
      }

      const targetEmail = existingUser.user.email;
      if (!targetEmail) {
        throw new Error("User has no email address on file");
      }

      const redirectTo = payload.redirectTo || undefined;
      let deliveryMode: "invite" | "magic_link" = "invite";

      const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(targetEmail, {
        data: {
          full_name: existingUser.user.user_metadata?.full_name || targetEmail,
        },
        ...(redirectTo ? { redirectTo } : {}),
      });

      if (inviteError) {
        deliveryMode = "magic_link";
        const { error: magicLinkError } = await adminClient.auth.resetPasswordForEmail(targetEmail, {
          ...(redirectTo ? { redirectTo } : {}),
        });

        if (magicLinkError) {
          const inviteDetails = [
            typeof inviteError.status === "number" ? `status=${inviteError.status}` : null,
            inviteError.code ? `code=${inviteError.code}` : null,
            inviteError.message || null,
          ].filter(Boolean).join(" | ");

          const recoveryDetails = [
            typeof magicLinkError.status === "number" ? `status=${magicLinkError.status}` : null,
            magicLinkError.code ? `code=${magicLinkError.code}` : null,
            magicLinkError.message || null,
          ].filter(Boolean).join(" | ");

          throw new Error(
            `Invite email failed (${inviteDetails || "unknown error"}). Fallback login email failed (${recoveryDetails || "unknown error"}).`,
          );
        }
      }

      await writeAuditLog(adminClient, user.id, "admin_resend_invite", payload.userId, null, {
        email: targetEmail,
        delivery_mode: deliveryMode,
      });

      return new Response(JSON.stringify({
        success: true,
        emailed: true,
        deliveryMode,
        message: deliveryMode === "invite"
          ? `Invite email sent to ${targetEmail}`
          : `Login email sent to ${targetEmail}`,
        user: { id: payload.userId, email: targetEmail },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RESET PASSWORD ──
    if (action === "reset_password") {
      const temporaryPassword = generateTemporaryPassword();

      const { data: existingUser, error: existingUserError } = await adminClient.auth.admin.getUserById(payload.userId);
      if (existingUserError || !existingUser.user) {
        throw existingUserError || new Error("Unable to find user");
      }

      const { data: updatedUser, error: resetError } = await adminClient.auth.admin.updateUserById(payload.userId, {
        password: temporaryPassword,
        user_metadata: {
          ...(existingUser.user.user_metadata || {}),
          must_change_password: true,
        },
      });

      if (resetError || !updatedUser.user) {
        throw resetError || new Error("Unable to reset password");
      }

      await writeAuditLog(adminClient, user.id, "admin_reset_password", payload.userId, {
        email: updatedUser.user.email,
      }, {
        email: updatedUser.user.email,
        must_change_password: true,
      });

      return new Response(JSON.stringify({
        success: true,
        user: { id: updatedUser.user.id, email: updatedUser.user.email },
        temporaryPassword,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE USER ──
    if (action === "delete") {
      if (payload.userId === user.id) {
        throw new Error("You cannot delete your own account");
      }

      const { data: existingUser, error: existingUserError } = await adminClient.auth.admin.getUserById(payload.userId);
      if (existingUserError || !existingUser.user) {
        throw existingUserError || new Error("Unable to find user");
      }

      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id, email, full_name, role, is_active")
        .eq("id", payload.userId)
        .maybeSingle();

      await writeAuditLog(adminClient, user.id, "admin_delete_user", payload.userId, {
        email: existingProfile?.email || existingUser.user.email,
        full_name: existingProfile?.full_name || existingUser.user.user_metadata?.full_name || null,
        role: existingProfile?.role || existingUser.user.app_metadata?.role || null,
        is_active: existingProfile?.is_active ?? null,
      }, null);

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(payload.userId);
      if (deleteError) {
        throw deleteError;
      }

      return new Response(JSON.stringify({
        success: true,
        user: { id: payload.userId, email: existingProfile?.email || existingUser.user.email },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unhandled action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
