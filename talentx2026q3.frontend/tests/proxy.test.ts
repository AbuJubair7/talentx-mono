import { resolveGuestRedirect } from "@/lib/auth/guest-guard";
import { UserRole } from "@/types/auth";

function makeToken(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

const guestToken = makeToken({
  sub: "user-1",
  role: UserRole.Guest,
  exp: Math.floor(Date.now() / 1000) + 600,
});

const talentToken = makeToken({
  sub: "user-2",
  role: UserRole.Talent,
  exp: Math.floor(Date.now() / 1000) + 600,
});

const expiredGuestToken = makeToken({
  sub: "user-1",
  role: UserRole.Guest,
  exp: Math.floor(Date.now() / 1000) - 60,
});

describe("guest lock-in proxy", () => {
  it("passes through requests without a session cookie", () => {
    expect(resolveGuestRedirect("/jobs", "", undefined)).toBeNull();
  });

  it("redirects a Guest session on a public page to the change-password flow", () => {
    expect(resolveGuestRedirect("/jobs", "", guestToken)).toBe(
      "/change-password?source=verification"
    );
  });

  it("redirects a Guest session on the home page", () => {
    expect(resolveGuestRedirect("/", "", guestToken)).toBe(
      "/change-password?source=verification"
    );
  });

  it("redirects a Guest session on a job detail page", () => {
    expect(resolveGuestRedirect("/jobs/job-123", "", guestToken)).toBe(
      "/change-password?source=verification"
    );
  });

  it("stamps source=verification when a Guest hits /change-password bare", () => {
    expect(resolveGuestRedirect("/change-password", "", guestToken)).toBe(
      "/change-password?source=verification"
    );
  });

  it("lets a Guest through when source=verification is already set", () => {
    expect(
      resolveGuestRedirect("/change-password", "?source=verification", guestToken)
    ).toBeNull();
  });

  it("lets a Guest through on allowed auth paths", () => {
    for (const path of ["/login", "/forgot-password", "/reset-password", "/api/auth/refresh"]) {
      expect(resolveGuestRedirect(path, "", guestToken)).toBeNull();
    }
  });

  it("lets non-Guest sessions browse freely", () => {
    for (const path of ["/", "/jobs", "/dashboard"]) {
      expect(resolveGuestRedirect(path, "", talentToken)).toBeNull();
    }
  });

  it("ignores expired tokens (lets the refresh flow take over)", () => {
    expect(resolveGuestRedirect("/jobs", "", expiredGuestToken)).toBeNull();
  });

  it("ignores malformed tokens", () => {
    expect(resolveGuestRedirect("/jobs", "", "not-a-jwt")).toBeNull();
  });
});
