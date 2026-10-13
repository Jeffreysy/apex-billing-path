/**
 * AuthProvider (2026-10-13): a token refresh / tab-refocus re-auth for the SAME user must not flip the
 * full-app `loading` state (that unmounted every page and re-fired every query). A different user or a
 * sign-out still reloads.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";

const h = vi.hoisted(() => ({
  listener: null as null | ((event: string, session: any) => void),
  profileCalls: 0,
}));

const session = (id: string, token = "t1") => ({ access_token: token, user: { id, user_metadata: {} } });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: session("u1") } }),
      onAuthStateChange: (cb: any) => {
        h.listener = cb;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    rpc: () => Promise.resolve({ data: "admin" }),
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => {
            h.profileCalls += 1;
            return Promise.resolve({ data: { id: "u1", role: "admin" }, error: null });
          },
        }),
      }),
    }),
  },
}));

import { AuthProvider, useAuth } from "./AuthProvider";

const seen: boolean[] = [];
function Probe() {
  const { loading, session: s } = useAuth();
  seen.push(loading);
  return <span data-testid="state">{loading ? "loading" : `ready:${s?.access_token}`}</span>;
}

describe("AuthProvider", () => {
  it("keeps the app mounted on TOKEN_REFRESHED / same-user SIGNED_IN, reloads on a user change", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("ready:t1"));
    const profileCallsAfterLoad = h.profileCalls;
    seen.length = 0;

    await act(async () => { h.listener!("TOKEN_REFRESHED", session("u1", "t2")); });
    await act(async () => { h.listener!("SIGNED_IN", session("u1", "t3")); }); // supabase-js on tab refocus
    expect(screen.getByTestId("state").textContent).toBe("ready:t3");
    expect(seen).not.toContain(true); // never showed the full-app loader
    expect(h.profileCalls).toBe(profileCallsAfterLoad); // no profile/role re-fetch storm

    await act(async () => { h.listener!("SIGNED_IN", session("u2", "t4")); });
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("ready:t4"));
    expect(seen).toContain(true); // a different user does reload
  });
});
