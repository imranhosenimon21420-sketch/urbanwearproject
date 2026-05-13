import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Define JWT_SECRET in .env.local");
  }
  return secret;
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * @param {{ sub: string; email: string; role: "user" | "admin" }} payload
 */
export function signAccessToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertValidRegisterBody(body) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, message: "Valid email is required" };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }
  if (name.length < 1) {
    return { ok: false, message: "Name is required" };
  }
  return { ok: true, email, password, name };
}

export function assertValidLoginBody(body) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, message: "Valid email is required" };
  }
  if (!password) {
    return { ok: false, message: "Password is required" };
  }
  return { ok: true, email, password };
}
