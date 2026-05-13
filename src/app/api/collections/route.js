import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 12));

  const items = await Collection.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("name slug season products createdAt")
    .populate({ path: "products", select: "name slug price discount images category" })
    .lean();

  return NextResponse.json({ items });
}
