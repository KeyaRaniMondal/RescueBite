export const ACCESS_TOKEN_KEY = "rescuebite_access_token";
export const REFRESH_TOKEN_KEY = "rescuebite_refresh_token";

export type AuthRole = "ADMIN" | "PROVIDER" | "RECEIVER";

export type AuthUser = {
  userId: string;
  name: string;
  email: string;
  role: AuthRole;
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function base64UrlDecode(input: string): string {
  const base64 = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(base64);
  return decodeURIComponent(
    binary
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

/**
 * Decode the JWT access-token payload (userId, name, email, role).
 * Returns null when the token is missing or malformed.
 */
export function decodeAccessToken(
  token: string | null | undefined,
): AuthUser | null {
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as {
      userId?: string;
      name?: string;
      email?: string;
      role?: AuthRole;
    };
    if (!payload.userId || !payload.email || !payload.role) return null;
    return {
      userId: payload.userId,
      name: payload.name ?? "",
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/** The currently signed-in user, decoded from the stored access token. */
export function getStoredUser(): AuthUser | null {
  return decodeAccessToken(getAccessToken());
}

/**
 * Where to send a user right after signing in, based on the role in their
 * freshly issued access token. Providers must set up their business profile
 * first; everyone else goes to the homepage.
 */
export function getPostAuthPath(accessToken: string): string {
  return decodeAccessToken(accessToken)?.role === "PROVIDER"
    ? "/provider/profile"
    : "/";
}
