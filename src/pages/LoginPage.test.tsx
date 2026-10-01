import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithOtp, toastError, toastSuccess } = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { signInWithOtp, signInWithPassword: vi.fn() } },
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ session: null, role: null, loading: false }),
}));

vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

import LoginPage, { NOT_ACTIVATED_MESSAGE } from "./LoginPage";

function requestMagicLink(email: string) {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Email Me a Magic Link" }));
}

beforeEach(() => {
  signInWithOtp.mockReset();
  toastError.mockReset();
  toastSuccess.mockReset();
});

describe("LoginPage magic link", () => {
  it("never creates accounts from the sign-in page", async () => {
    signInWithOtp.mockResolvedValue({ data: {}, error: null });

    requestMagicLink("staff@firm.com");

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "staff@firm.com", options: expect.objectContaining({ shouldCreateUser: false }) }),
    );
  });

  it("explains how to get in when the account is not active yet", async () => {
    signInWithOtp.mockResolvedValue({
      data: {},
      error: { code: "signup_disabled", message: "Signups not allowed for this instance" },
    });

    requestMagicLink("invited.person@firm.com");

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(NOT_ACTIVATED_MESSAGE));
  });
});
