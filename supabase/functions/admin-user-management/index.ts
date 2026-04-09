import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InvitePayload = {
  action: "invite";
  email: string;
  fullName?: string;
  role: "admin" | "partner" | "attorney" | "paralegal" | "billing_clerk" | "read_only";
  redirectTo?: string;
};

type CreatePayload = {
  action: "create";
  email: string;
  fullName?: string;
  role: "admin" | "partner" | "attorney" | "paralegal" | "billing_clerk" | "read_only";
  temporaryPassword?: string;
};

type ResetPasswordPayload = {
  action: "reset_password";
  userId: string;
};

type DeleteUserPayload = {
  action: "delete";
  userId: string;
};

type UserManagementPayload = InvitePayload | CreatePayload | ResetPasswordPayload | DeleteUserPayload;

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
  const { error } = await adminClient.from("audit_log").insert({
    table_name: "profiles",
    record_id: recordId,
    action,
    old_data: oldData,
    new_data: newData,
    performed_by: actorId,
  });

  if (error) {
    throw error;
  }
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
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
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

    const { data: currentRole, error: roleError } = await userClient.rpc("current_user_role");
    if (roleError || !["admin", "partner"].includes(currentRole || "")) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as UserManagementPayload;
    if (!["invite", "create", "reset_password", "delete"].includes(payload.action)) {
      return new Response(JSON.stringify({ error: "Unsupported action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let managedUserId: string | null = null;
    let temporaryPassword: string | null = null;

    if (payload.action === "invite") {
      const inviteOptions = {
        data: {
          full_name: payload.fullName || payload.email,
        },
        ...(payload.redirectTo ? { redirectTo: payload.redirectTo } : {}),
      };

      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(payload.email, inviteOptions);

      if (inviteError || !inviteData.user) {
        throw inviteError || new Error("Unable to invite user");
      }

      managedUserId = inviteData.user.id;
    } else if (payload.action === "create") {
      temporaryPassword = payload.temporaryPassword?.trim() || generateTemporaryPassword();

      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email: payload.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: payload.fullName || payload.email,
          must_change_password: true,
        },
        app_metadata: {
          role: payload.role,
        },
      });

      if (createError || !createdUser.user) {
        throw createError || new Error("Unable to create user");
      }

      managedUserId = createdUser.user.id;

      await writeAuditLog(
        adminClient,
        user.id,
        "admin_create_user",
        managedUserId,
        null,
        {
          email: payload.email,
          full_name: payload.fullName || payload.email,
          role: payload.role,
          is_active: true,
        },
      );
    } else if (payload.action === "reset_password") {
      temporaryPassword = generateTemporaryPassword();

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

      await writeAuditLog(
        adminClient,
        user.id,
        "admin_reset_password",
        payload.userId,
        {
          email: updatedUser.user.email,
        },
        {
          email: updatedUser.user.email,
          must_change_password: true,
        },
      );

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
        },
        temporaryPassword,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (payload.action === "delete") {
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

      await writeAuditLog(
        adminClient,
        user.id,
        "admin_delete_user",
        payload.userId,
        {
          email: existingProfile?.email || existingUser.user.email,
          full_name: existingProfile?.full_name || existingUser.user.user_metadata?.full_name || null,
          role: existingProfile?.role || existingUser.user.app_metadata?.role || null,
          is_active: existingProfile?.is_active ?? null,
        },
        null,
      );

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(payload.userId);
      if (deleteError) {
        throw deleteError;
      }

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: payload.userId,
          email: existingProfile?.email || existingUser.user.email,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: managedUserId,
      email: payload.email,
      full_name: payload.fullName || payload.email,
      role: payload.role,
      is_active: true,
    });

    if (profileError) {
      throw profileError;
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: managedUserId,
        email: payload.email,
        role: payload.role,
      },
      temporaryPassword,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
