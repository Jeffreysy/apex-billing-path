import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { verifyOtp, updateUser, toastError, authState } = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  updateUser: vi.fn(),
  toastError: vi.fn(),
  authState: {
    session: null as object | null,
    user: null as { email: string } | null,
    loading: false,
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { verifyOtp, updateUser } },
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => authState,
}));

vi.mock("sonner", () => ({
  toast: { error: toastError, success: vi.fn() },
}));

import AuthConfirmPage, { EXPIRED_LINK_MESSAGE } from "./AuthConfirmPage";

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/auth/confirm" element={<AuthConfirmPage />} />
        <Route path="/home" element={<div>Home landing</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function signIn() {
  authState.session = { access_token: "token" };
  authState.user = { email: "new.hire@firm.com" };
}

beforeEach(() => {
  authState.session = null;
  authState.user = null;
  authState.loading = false;
  verifyOtp.mockReset();
  updateUser.mockReset();
  toastError.mockReset();
});

afterEach(() => {
  window.location.hash = "";
});

describe("AuthConfirmPage", () => {
  it("waits for a click before redeeming an invite token, then asks for a password", async () => {
    verifyOtp.mockImplementation(async () => {
      signIn();
      return { data: {}, error: null };
    });

    renderAt("/auth/confirm?token_hash=abc123&type=invite");

    expect(screen.getByText("Welcome to LexCollect")).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Accept Invite" }));

    expect(await screen.findByText("Choose your password")).toBeInTheDocument();
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "abc123", type: "invite" });
    expect(screen.getByDisplayValue("new.hire@firm.com")).toBeInTheDocument();
  });

  it("explains an expired or already-used link", async () => {
    verifyOtp.mockResolvedValue({
      data: {},
      error: { code: "otp_expired", message: "Email link is invalid or has expired" },
    });

    renderAt("/auth/confirm?token_hash=used&type=invite");
    fireEvent.click(screen.getByRole("button", { name: "Accept Invite" }));

    expect(await screen.findByText(EXPIRED_LINK_MESSAGE)).toBeInTheDocument();
  });

  it("shows the expiry message when Supabase redirects back with an error", () => {
    window.location.hash = "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired";

    renderAt("/auth/confirm");

    expect(screen.getByText(EXPIRED_LINK_MESSAGE)).toBeInTheDocument();
  });

  it("rejects a link with no token and no session", () => {
    renderAt("/auth/confirm");

    expect(screen.getByText("Link unavailable")).toBeInTheDocument();
  });

  it("saves the password, clears the reset flag, and continues into the app", async () => {
    signIn();
    updateUser.mockResolvedValue({ data: {}, error: null });

    renderAt("/auth/confirm");

    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "s3cure-pass" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Password & Continue" }));
    expect(toastError).toHaveBeenCalledWith("Passwords do not match");
    expect(updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "s3cure-pass" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Password & Continue" }));

    expect(await screen.findByText("Home landing")).toBeInTheDocument();
    expect(updateUser).toHaveBeenCalledWith({
      password: "s3cure-pass",
      data: { must_change_password: false },
    });
  });

  it("sends magic-link sign-ins straight into the app", async () => {
    verifyOtp.mockImplementation(async () => {
      signIn();
      return { data: {}, error: null };
    });

    renderAt("/auth/confirm?token_hash=xyz&type=magiclink");
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(screen.getByText("Home landing")).toBeInTheDocument());
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "xyz", type: "magiclink" });
  });
});
