import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { buildProductMongoFilter, parsePagination } from "@/lib/productFilters";
import Product from "@/models/Product";

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const filter = buildProductMongoFilter(searchParams);
  const { page, limit, skip } = parsePagination(searchParams);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name slug price discount images category variants createdAt")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({
    page,
    limit,
    total,
    items,
  });
}
