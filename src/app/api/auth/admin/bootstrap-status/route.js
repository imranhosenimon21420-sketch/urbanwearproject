import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const configured = Boolean(process.env.ADMIN_BOOTSTRAP_SECRET?.trim());
  if (!configured) {
    return NextResponse.json({ available: false, reason: "not_configured" });
  }

  await connectDB();
  const adminCount = await User.countDocuments({ role: "admin" });
  return NextResponse.json({
    available: adminCount === 0,
    reason: adminCount === 0 ? "ready" : "already_has_admin",
  });
}
