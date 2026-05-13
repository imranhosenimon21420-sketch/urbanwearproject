import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { productLookupFilter } from "@/lib/productLookup";
import Product from "@/models/Product";

export async function GET(_request, context) {
  const params = await context.params;
  const slug = params?.slug;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  await connectDB();

  const doc = await Product.findOne(productLookupFilter(slug)).lean();
  if (!doc) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}
