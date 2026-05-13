import { NextResponse } from "next/server";
import { normalizeProductCreateBody } from "@/lib/adminProductPayload";
import { getAuthUser } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 24));
  const skip = (page - 1) * limit;

  await connectDB();

  const [items, total] = await Promise.all([
    Product.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name slug price discount images category variants createdAt updatedAt description")
      .lean(),
    Product.countDocuments({}),
  ]);

  return NextResponse.json({
    page,
    limit,
    total,
    items,
  });
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = normalizeProductCreateBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  await connectDB();

  let slug = parsed.data.slug;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const product = await Product.create({ ...parsed.data, slug });
      return NextResponse.json(product.toObject(), { status: 201 });
    } catch (err) {
      if (err?.code === 11000) {
        slug = `${parsed.data.slug}-${Date.now().toString(36)}`;
        continue;
      }
      return NextResponse.json({ error: "Could not create product" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not allocate unique slug" }, { status: 500 });
}
