import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  assertValidRegisterBody,
  hashPassword,
  signAccessToken,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import User from "@/models/User";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 15;

function secretsMatch(expected, provided) {
  if (typeof expected !== "string" || typeof provided !== "string") return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request) {
  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "First-time admin setup is not enabled. Set ADMIN_BOOTSTRAP_SECRET in .env.local." },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`auth:admin-bootstrap:${ip}`, {
    windowMs: WINDOW_MS,
    max: MAX_PER_WINDOW,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const providedSecret = typeof body.bootstrapSecret === "string" ? body.bootstrapSecret : "";
  if (!secretsMatch(expectedSecret, providedSecret)) {
    return NextResponse.json({ error: "Invalid setup secret" }, { status: 401 });
  }

  const nameRaw = typeof body.name === "string" ? body.name.trim() : "";
  const registerBody = {
    email: body.email,
    password: body.password,
    name: nameRaw || "Administrator",
  };

  const parsed = assertValidRegisterBody(registerBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  await connectDB();

  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount > 0) {
    return NextResponse.json(
      { error: "An administrator already exists. Use sign-in or invite admins another way." },
      { status: 403 }
    );
  }

  const passwordHash = await hashPassword(parsed.password);

  try {
    const user = await User.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      role: "admin",
    });

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "That email is already registered. Sign in, or use a different email for the first admin." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not create administrator" }, { status: 500 });
  }
}
