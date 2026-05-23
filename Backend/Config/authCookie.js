export const TOKEN_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "7d";

export const TOKEN_MAX_AGE =
  Number(process.env.JWT_COOKIE_MAX_AGE) ||
  7 * 24 * 60 * 60 * 1000;

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  secure:
    process.env.NODE_ENV === "production",
  maxAge: TOKEN_MAX_AGE,
  path: "/"
});
