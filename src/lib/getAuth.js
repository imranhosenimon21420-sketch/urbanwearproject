import { verifyAccessToken } from "@/lib/auth";

export function getBearerToken(request) {
  const h = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

/** @returns {null | { sub: string; email: string; role: string }} */
export function getAccessTokenPayload(request) {
  const token = getBearerToken(request);
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/** @returns {null | { userId: string; email: string; role: string }} */
export function getAuthUser(request) {
  const p = getAccessTokenPayload(request);
  if (!p?.sub) return null;
  return { userId: p.sub, email: p.email, role: p.role };
}
