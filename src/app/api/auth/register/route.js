import { NextResponse } from "next/server";
import {
  assertValidRegisterBody,
  hashPassword,
  signAccessToken,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import { roleForNewUser } from "@/lib/roleForRegister";
import User from "@/models/User";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 30;

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`auth:register:${ip}`, {
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

  const parsed = assertValidRegisterBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  await connectDB();

  const passwordHash = await hashPassword(parsed.password);

  try {
    const user = await User.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      role: roleForNewUser(parsed.email),
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
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
