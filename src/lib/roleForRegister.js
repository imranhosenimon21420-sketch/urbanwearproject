const ADMIN_EMAILS = "admin@gmail.com";

/** @param {string} email */
export function roleForNewUser(email) {
  const raw = ADMIN_EMAILS;
  const allow = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  return allow.has(email.toLowerCase()) ? "admin" : "user";
}
