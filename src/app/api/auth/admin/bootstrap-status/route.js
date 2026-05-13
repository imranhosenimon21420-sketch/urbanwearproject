import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const adminCount = await User.countDocuments({ role: "admin" });
  return NextResponse.json({
    available: adminCount === 0,
    reason: adminCount === 0 ? "ready" : "already_has_admin",
  });
}
