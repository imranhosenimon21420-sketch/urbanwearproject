import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAccessTokenPayload } from "@/lib/getAuth";
import User from "@/models/User";

export async function GET(request) {
  const payload = getAccessTokenPayload(request);
  if (!payload?.sub) {
    return NextResponse.json({ error: "Missing or invalid Authorization Bearer token" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(payload.sub);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
