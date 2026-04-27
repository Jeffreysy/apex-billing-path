import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import FilevineCleanupPanel from "@/components/FilevineCleanupPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { KeyRound, Mail, Shield, UserCog, Users, TriangleAlert, Building2, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ALL_USER_ROLES, type UserRole } from "@/lib/auth";

type ManagedUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string | null;
  last_sign_in_at: string | null;
};

type SystemSettings = {
  privacy_warning: string | null;
  collections_notice: string | null;
  legal_notice: string | null;
  security_notice: string | null;
  support_email: string | null;
};

const EMPTY_SETTINGS: SystemSettings = {
  privacy_warning: "",
  collections_notice: "",
  legal_notice: "",
  security_notice: "",
  support_email: "",
};

type CreatedUserResult = {
  email: string;
  fullName: string;
  role: UserRole;
  temporaryPassword: string;
};

type InviteMode = "create" | "invite";

const ROLE_PRESETS: Array<{ label: string; role: UserRole; description: string }> = [
  { label: "Leadership", role: "admin", description: "Full operational oversight across LexCollect." },
  { label: "Collections", role: "billing_clerk", description: "Collections dashboards, call queue, and escalations." },
  { label: "Legal", role: "attorney", description: "Legal queue visibility and legal dashboard access." },
  { label: "Read Only", role: "read_only", description: "Client lookup and reporting without write actions." },
];

const formatAuthError = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errorRecord = error as Record<string, unknown>;
  const parts = [
    typeof errorRecord.code === "string" ? `code=${errorRecord.code}` : null,
    typeof errorRecord.status === "number" ? `status=${errorRecord.status}` : null,
    typeof errorRecord.message === "string" ? errorRecord.message : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : fallback;
};

const SettingsPage = () => {
  const location = useLocation();
  const { user, profile, role, mustChangePassword } = useAuth();
  const isAdmin = role === "admin" || role === "partner";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("read_only");
  const [inviteMode, setInviteMode] = useState<InviteMode>("create");
  const [inviting, setInviting] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUserResult | null>(null);
  const [resetResult, setResetResult] = useState<CreatedUserResult | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(EMPTY_SETTINGS);
  const [loadingSystemSettings, setLoadingSystemSettings] = useState(false);
  const [savingSystemSettings, setSavingSystemSettings] = useState(false);

  // LawPay firm_settings state
  const [lawpaySettings, setLawpaySettings] = useState({
    id: null as string | null,
    lawpay_enabled: false,
    lawpay_operating_url: "",
    lawpay_trust_url: "",
    lawpay_default_account: "operating" as "operating" | "trust",
  });
  const [loadingLawpay, setLoadingLawpay] = useState(false);
  const [savingLawpay, setSavingLawpay] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const loadFirmSettings = async () => {
      setLoadingLawpay(true);
      const { data, error } = await supabase
        .from("firm_settings")
        .select("id, lawpay_enabled, lawpay_operating_url, lawpay_trust_url, lawpay_default_account")
        .limit(1)
        .maybeSingle();
      setLoadingLawpay(false);
      if (error) {
        toast.error(error.message || "Unable to load LawPay settings");
        return;
      }
      if (data) {
        setLawpaySettings({
          id: data.id,
          lawpay_enabled: !!data.lawpay_enabled,
          lawpay_operating_url: data.lawpay_operating_url || "",
          lawpay_trust_url: data.lawpay_trust_url || "",
          lawpay_default_account: (data.lawpay_default_account as "operating" | "trust") || "operating",
        });
      }
    };
    void loadFirmSettings();
  }, [isAdmin]);

  const handleSaveLawpaySettings = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lawpaySettings.id) {
      toast.error("Firm settings row missing — contact support");
      return;
    }
    setSavingLawpay(true);
    const { error } = await supabase
      .from("firm_settings")
      .update({
        lawpay_enabled: lawpaySettings.lawpay_enabled,
        lawpay_operating_url: lawpaySettings.lawpay_operating_url.trim() || null,
        lawpay_trust_url: lawpaySettings.lawpay_trust_url.trim() || null,
        lawpay_default_account: lawpaySettings.lawpay_default_account,
      })
      .eq("id", lawpaySettings.id);
    setSavingLawpay(false);
    if (error) {
      toast.error(error.message || "Unable to save LawPay settings");
      return;
    }
    toast.success("LawPay settings saved");
  };

  useEffect(() => {
    if (!isAdmin) return;

    void loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoadingUsers(true);
    setLoadingSystemSettings(true);

    const sb = supabase as any;
    const [usersResult, settingsResult] = await Promise.all([
      sb.rpc("admin_list_user_access"),
      sb.rpc("admin_get_system_settings"),
    ]);

    setLoadingUsers(false);
    setLoadingSystemSettings(false);

    if (usersResult.error) {
      toast.error(usersResult.error.message || "Unable to load users");
    } else {
      setManagedUsers(usersResult.data || []);
    }

    if (settingsResult.error) {
      toast.error(settingsResult.error.message || "Unable to load system settings");
    } else if (settingsResult.data) {
      setSystemSettings({
        privacy_warning: settingsResult.data.privacy_warning || "",
        collections_notice: settingsResult.data.collections_notice || "",
        legal_notice: settingsResult.data.legal_notice || "",
        security_notice: settingsResult.data.security_notice || "",
        support_email: settingsResult.data.support_email || "",
      });
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!password || password.length < 8) {
      toast.error("Use a password with at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: {
        ...(user?.user_metadata || {}),
        must_change_password: false,
      },
    });
    setSavingPassword(false);

    if (error) {
      toast.error(error.message || "Unable to update password");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
  };

  const handleResetEmail = async () => {
    if (!user?.email) {
      toast.error("No email found for this account");
      return;
    }

    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setSendingReset(false);

    if (error) {
      console.error("Recovery email error", {
        email: user.email,
        redirectTo: `${window.location.origin}/login`,
        error,
      });
      toast.error(formatAuthError(error, "Unable to send reset email"));
      return;
    }

    toast.success("Password reset email sent");
  };

  const handleInviteUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteEmail) {
      toast.error("Enter an email address");
      return;
    }

    setInviting(true);
    const { data, error } = await supabase.functions.invoke("admin-user-management", {
      body: {
        action: inviteMode,
        email: inviteEmail,
        fullName: inviteFullName,
        role: inviteRole,
      },
    });
    setInviting(false);

    if (error) {
      const details = typeof (error as any)?.context?.json === "function" ? await (error as any).context.json().catch(() => null) : null;
      toast.error(details?.error || error.message || "Unable to invite user");
      return;
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      toast.error(String(data.error));
      return;
    }

    if (inviteMode === "create") {
      const temporaryPassword =
        data && typeof data === "object" && "temporaryPassword" in data && typeof data.temporaryPassword === "string"
          ? data.temporaryPassword
          : "";

      setCreatedUser({
        email: inviteEmail,
        fullName: inviteFullName || inviteEmail,
        role: inviteRole,
        temporaryPassword,
      });
      toast.success("User created successfully");
    } else {
      setCreatedUser(null);
      toast.success("Invite email sent successfully");
    }

    setInviteEmail("");
    setInviteFullName("");
    setInviteRole("read_only");
    void loadAdminData();
  };

  const handleManagedUserChange = (userId: string, updates: Partial<ManagedUser>) => {
    setManagedUsers((current) =>
      current.map((entry) => (entry.id === userId ? { ...entry, ...updates } : entry)),
    );
  };

  const handleResetManagedUserPassword = async (managedUser: ManagedUser) => {
    setResettingUserId(managedUser.id);
    const { data, error } = await supabase.functions.invoke("admin-user-management", {
      body: {
        action: "reset_password",
        userId: managedUser.id,
      },
    });
    setResettingUserId(null);

    if (error) {
      const details = typeof (error as any)?.context?.json === "function" ? await (error as any).context.json().catch(() => null) : null;
      toast.error(details?.error || error.message || "Unable to reset password");
      return;
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      toast.error(String(data.error));
      return;
    }

    const temporaryPassword =
      data && typeof data === "object" && "temporaryPassword" in data && typeof data.temporaryPassword === "string"
        ? data.temporaryPassword
        : "";

    setResetResult({
      email: managedUser.email || "No email on file",
      fullName: managedUser.full_name || managedUser.email || "User",
      role: managedUser.role,
      temporaryPassword,
    });

    toast.success("Temporary password reset successfully");
    void loadAdminData();
  };

  const handleResendInvite = async (managedUser: ManagedUser) => {
    setResendingUserId(managedUser.id);
    const { data, error } = await supabase.functions.invoke("admin-user-management", {
      body: {
        action: "resend_invite",
        userId: managedUser.id,
        redirectTo: window.location.origin,
      },
    });
    setResendingUserId(null);

    if (error) {
      const details = typeof (error as any)?.context?.json === "function" ? await (error as any).context.json().catch(() => null) : null;
      toast.error(details?.error || error.message || "Unable to resend invite");
      return;
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      toast.error(String(data.error));
      return;
    }

    const message = data && typeof data === "object" && "message" in data
      ? String(data.message)
      : "Invite email sent to " + (managedUser.email || "user");

    toast.success(message);
  };

  const handleSaveUser = async (managedUser: ManagedUser) => {
    setSavingUserId(managedUser.id);
    const sb = supabase as any;
    const { error } = await sb.rpc("admin_update_user_access", {
      p_user_id: managedUser.id,
      p_role: managedUser.role,
      p_is_active: managedUser.is_active,
      p_full_name: managedUser.full_name,
    });
    setSavingUserId(null);

    if (error) {
      toast.error(error.message || "Unable to update user access");
      return;
    }

    toast.success("User access updated");
    void loadAdminData();
  };

  const handleDeleteUser = async (managedUser: ManagedUser) => {
    const displayName = managedUser.full_name || managedUser.email || "this user";
    const confirmed = window.confirm(`Delete ${displayName}? This removes their login access from Supabase and LexCollect.`);
    if (!confirmed) {
      return;
    }

    setDeletingUserId(managedUser.id);
    const { data, error } = await supabase.functions.invoke("admin-user-management", {
      body: {
        action: "delete",
        userId: managedUser.id,
      },
    });
    setDeletingUserId(null);

    if (error) {
      const details = typeof (error as any)?.context?.json === "function" ? await (error as any).context.json().catch(() => null) : null;
      toast.error(details?.error || error.message || "Unable to delete user");
      return;
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      toast.error(String(data.error));
      return;
    }

    toast.success("User deleted successfully");
    setResetResult(null);
    void loadAdminData();
  };

  const handleSaveSystemSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingSystemSettings(true);
    const sb = supabase as any;
    const { error } = await sb.rpc("admin_update_system_settings", {
      p_privacy_warning: systemSettings.privacy_warning || "",
      p_collections_notice: systemSettings.collections_notice || "",
      p_legal_notice: systemSettings.legal_notice || "",
      p_security_notice: systemSettings.security_notice || "",
      p_support_email: systemSettings.support_email || "",
    });
    setSavingSystemSettings(false);

    if (error) {
      toast.error(error.message || "Unable to save system settings");
      return;
    }

    toast.success("System settings updated");
  };

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage account security, user access, and internal system notices from one place.
          </p>
        </div>

        {(mustChangePassword || location.state?.forcePasswordReset) && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-950">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Password update required</AlertTitle>
            <AlertDescription>
              This account is using a temporary password. Update it below before returning to the rest of the platform.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? "grid-cols-5" : "grid-cols-1"} max-w-3xl`}>
            <TabsTrigger value="account">Account</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">User Access</TabsTrigger>}
            {isAdmin && <TabsTrigger value="lawpay">LawPay</TabsTrigger>}
            {isAdmin && <TabsTrigger value="privacy">Privacy & Notices</TabsTrigger>}
            {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserCog className="h-5 w-5" />
                    Account
                  </CardTitle>
                  <CardDescription>
                    Your signed-in profile and access level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="mt-1 font-medium">{profile?.full_name || "No name on file"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="mt-1 font-medium">{user?.email || profile?.email || "No email on file"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                    <div className="mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {role ? role.replace("_", " ") : "No role assigned"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    <div className="mt-2">
                      <Badge variant={profile?.is_active === false ? "destructive" : "default"}>
                        {profile?.is_active === false ? "Inactive" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <KeyRound className="h-5 w-5" />
                      Reset Your Password
                    </CardTitle>
                    <CardDescription>
                      Update the password for your current signed-in account. Temporary-password users will unlock the rest of the platform after saving.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Enter a new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter the new password"
                        />
                      </div>
                      <Button type="submit" disabled={savingPassword}>
                        {savingPassword ? "Saving..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="h-5 w-5" />
                      Password Reset Email
                    </CardTitle>
                    <CardDescription>
                      Send a reset link to your signed-in email if you want to reset access by email instead.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Reset email will be sent to <span className="font-medium text-foreground">{user?.email || profile?.email || "your account email"}</span>.
                    </p>
                    <Button variant="outline" onClick={handleResetEmail} disabled={sendingReset}>
                      {sendingReset ? "Sending..." : "Send Reset Email"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Add User
                    </CardTitle>
                    <CardDescription>
                      Create a user directly with a temporary password or send a true email invite link.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className={`rounded-lg border p-3 text-left transition hover:border-primary ${
                          inviteMode === "create" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setInviteMode("create")}
                      >
                        <p className="font-medium">Create User</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Creates the account immediately and shows a temporary password.
                        </p>
                      </button>
                      <button
                        type="button"
                        className={`rounded-lg border p-3 text-left transition hover:border-primary ${
                          inviteMode === "invite" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setInviteMode("invite")}
                      >
                        <p className="font-medium">Send Invite Email</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sends an email invite link through Supabase Auth when email delivery is configured.
                        </p>
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {ROLE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className={`rounded-lg border p-3 text-left transition hover:border-primary ${
                            inviteRole === preset.role ? "border-primary bg-primary/5" : "border-border"
                          }`}
                          onClick={() => setInviteRole(preset.role)}
                        >
                          <p className="font-medium">{preset.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleInviteUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                          placeholder="user@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-name">Full name</Label>
                        <Input
                          id="invite-name"
                          value={inviteFullName}
                          onChange={(event) => setInviteFullName(event.target.value)}
                          placeholder="Team member name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_USER_ROLES.map((value) => (
                              <SelectItem key={value} value={value} className="capitalize">
                                {value.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={inviting}>
                        {inviting ? (inviteMode === "create" ? "Creating..." : "Sending...") : (inviteMode === "create" ? "Create User" : "Send Invite Email")}
                      </Button>
                    </form>

                    {createdUser && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                        <p className="font-medium">Temporary credentials ready</p>
                        <p className="mt-1">
                          Share these securely with {createdUser.fullName}. They can sign in immediately and should change the password from Settings after their first login.
                        </p>
                        <div className="mt-3 grid gap-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-800">Email</p>
                            <p className="font-medium">{createdUser.email}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-800">Role</p>
                            <p className="font-medium capitalize">{createdUser.role.replace("_", " ")}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-800">Temporary password</p>
                            <p className="font-mono font-medium">{createdUser.temporaryPassword}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {inviteMode === "invite" && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                        <p className="font-medium">Invite email mode</p>
                        <p className="mt-1">
                          This sends a Supabase invite link instead of showing a temporary password. If the user does not receive it, the issue is usually SMTP or Auth email configuration rather than the app form itself.
                        </p>
                      </div>
                    )}

                    {resetResult && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                        <p className="font-medium">Password reset ready</p>
                        <p className="mt-1">
                          Share this temporary password securely with {resetResult.fullName}. They will be sent to Settings and asked to replace it after signing in.
                        </p>
                        <div className="mt-3 grid gap-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-blue-800">Email</p>
                            <p className="font-medium">{resetResult.email}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-blue-800">Temporary password</p>
                            <p className="font-mono font-medium">{resetResult.temporaryPassword}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5" />
                      User Permissions
                    </CardTitle>
                    <CardDescription>
                      Control who can access which parts of the system by role and active status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingUsers ? (
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    ) : managedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No users found.</p>
                    ) : (
                      managedUsers.map((managedUser) => (
                        <div key={managedUser.id} className="rounded-lg border p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{managedUser.full_name || managedUser.email || "Unnamed user"}</p>
                              <p className="text-xs text-muted-foreground">{managedUser.email || "No email on file"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Last sign in: {managedUser.last_sign_in_at ? new Date(managedUser.last_sign_in_at).toLocaleString() : "Never"}
                              </p>
                            </div>
                            <Badge variant={managedUser.is_active ? "default" : "destructive"}>
                              {managedUser.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Full name</Label>
                              <Input
                                value={managedUser.full_name || ""}
                                onChange={(event) => handleManagedUserChange(managedUser.id, { full_name: event.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Select
                                value={managedUser.role}
                                onValueChange={(value) => handleManagedUserChange(managedUser.id, { role: value as UserRole })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ALL_USER_ROLES.map((value) => (
                                    <SelectItem key={value} value={value} className="capitalize">
                                      {value.replace("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={managedUser.is_active ? "active" : "inactive"}
                                onValueChange={(value) => handleManagedUserChange(managedUser.id, { is_active: value === "active" })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Button onClick={() => handleSaveUser(managedUser)} disabled={savingUserId === managedUser.id}>
                              {savingUserId === managedUser.id ? "Saving..." : "Save Access"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="ml-2"
                              onClick={() => handleResetManagedUserPassword(managedUser)}
                              disabled={resettingUserId === managedUser.id}
                            >
                              {resettingUserId === managedUser.id ? "Resetting..." : "Reset Password"}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              className="ml-2"
                              onClick={() => handleResendInvite(managedUser)}
                              disabled={resendingUserId === managedUser.id}
                            >
                              {resendingUserId === managedUser.id ? "Sending..." : "Resend Invite Email"}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className="ml-2"
                              onClick={() => handleDeleteUser(managedUser)}
                              disabled={deletingUserId === managedUser.id}
                            >
                              {deletingUserId === managedUser.id ? "Deleting..." : "Delete User"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="lawpay" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    LawPay Payment Integration
                  </CardTitle>
                  <CardDescription>
                    Paste your LawPay Secure Payment Page URL(s). Collectors click "Take Payment" anywhere in
                    LexCollect and a pre-filled LawPay page opens in a new tab. When the charge posts, your
                    existing LawPay webhook auto-matches it back to the contract and updates balances —
                    card data never touches this server.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveLawpaySettings} className="space-y-5">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="text-sm font-medium">Enable LawPay Payments</p>
                        <p className="text-xs text-muted-foreground">
                          When off, the "Take Payment" button is disabled across LexCollect.
                        </p>
                      </div>
                      <Switch
                        checked={lawpaySettings.lawpay_enabled}
                        onCheckedChange={(checked) =>
                          setLawpaySettings((prev) => ({ ...prev, lawpay_enabled: checked }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lawpay-operating-url">Operating Account URL</Label>
                      <Input
                        id="lawpay-operating-url"
                        type="url"
                        value={lawpaySettings.lawpay_operating_url}
                        onChange={(event) =>
                          setLawpaySettings((prev) => ({ ...prev, lawpay_operating_url: event.target.value }))
                        }
                        placeholder="https://secure.lawpay.com/pages/your-firm/operating"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        LawPay → Settings → Payment Pages → copy the "Hosted Page URL" for your operating account.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lawpay-trust-url">Trust / IOLTA Account URL (optional)</Label>
                      <Input
                        id="lawpay-trust-url"
                        type="url"
                        value={lawpaySettings.lawpay_trust_url}
                        onChange={(event) =>
                          setLawpaySettings((prev) => ({ ...prev, lawpay_trust_url: event.target.value }))
                        }
                        placeholder="https://secure.lawpay.com/pages/your-firm/trust"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Used for retainer and advance-fee deposits that must land in IOLTA.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lawpay-default-account">Default Account</Label>
                      <Select
                        value={lawpaySettings.lawpay_default_account}
                        onValueChange={(value) =>
                          setLawpaySettings((prev) => ({
                            ...prev,
                            lawpay_default_account: value as "operating" | "trust",
                          }))
                        }
                      >
                        <SelectTrigger id="lawpay-default-account" className="max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operating">Operating</SelectItem>
                          <SelectItem value="trust">Trust / IOLTA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Webhook already wired</AlertTitle>
                      <AlertDescription className="text-xs">
                        Your <code className="font-mono">payment-received</code> edge function is deployed and
                        matches incoming LawPay charges by invoice number / case number / client name. You do
                        not need to change anything in the LawPay dashboard beyond copying the hosted page URL
                        above.
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-2">
                      <Button type="submit" disabled={savingLawpay || loadingLawpay}>
                        {savingLawpay ? "Saving..." : "Save LawPay Settings"}
                      </Button>
                      {loadingLawpay && <span className="text-xs text-muted-foreground">Loading...</span>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TriangleAlert className="h-5 w-5" />
                    Privacy & Internal Notices
                  </CardTitle>
                  <CardDescription>
                    Configure the internal warnings and guidance your team should see in admin settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSystemSettings} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Privacy warning</Label>
                      <Textarea
                        rows={3}
                        value={systemSettings.privacy_warning || ""}
                        onChange={(event) => setSystemSettings((current) => ({ ...current, privacy_warning: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Collections notice</Label>
                      <Textarea
                        rows={3}
                        value={systemSettings.collections_notice || ""}
                        onChange={(event) => setSystemSettings((current) => ({ ...current, collections_notice: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Legal notice</Label>
                      <Textarea
                        rows={3}
                        value={systemSettings.legal_notice || ""}
                        onChange={(event) => setSystemSettings((current) => ({ ...current, legal_notice: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Security notice</Label>
                      <Textarea
                        rows={3}
                        value={systemSettings.security_notice || ""}
                        onChange={(event) => setSystemSettings((current) => ({ ...current, security_notice: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Support email</Label>
                      <Input
                        type="email"
                        value={systemSettings.support_email || ""}
                        onChange={(event) => setSystemSettings((current) => ({ ...current, support_email: event.target.value }))}
                      />
                    </div>
                    <Button type="submit" disabled={savingSystemSettings || loadingSystemSettings}>
                      {savingSystemSettings ? "Saving..." : "Save Notices"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="system" className="space-y-6">
              <FilevineCleanupPanel />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    Admin Control Center
                  </CardTitle>
                  <CardDescription>
                    This section is reserved for higher-level controls like branding, workflow defaults, escalation policies, and additional platform governance tools.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  More admin controls can live here next, including role templates, queue ownership defaults, dashboard copy, and future workflow automation settings.
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
