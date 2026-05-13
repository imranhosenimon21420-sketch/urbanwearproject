import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { normalizeProductPatchBody } from "@/lib/adminProductPayload";
import { getAuthUser } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

function requireAdmin(request) {
  const auth = getAuthUser(request);
  if (!auth || auth.role !== "admin") {
    return null;
  }
  return auth;
}

export async function GET(request, context) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = await context.params;
  const id = params?.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  await connectDB();
  const doc = await Product.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function PATCH(request, context) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = await context.params;
  const id = params?.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = normalizeProductPatchBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  await connectDB();

  const updates = parsed.updates;
  const slugRequested = Object.prototype.hasOwnProperty.call(updates, "slug");
  let slugValue = slugRequested ? updates.slug : undefined;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const $set = { ...updates };
    if (slugRequested && slugValue !== undefined) {
      $set.slug = slugValue;
    }

    try {
      const doc = await Product.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();
      if (!doc) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(doc);
    } catch (err) {
      if (err?.code === 11000 && slugRequested) {
        slugValue = `${String(updates.slug)}-${Date.now().toString(36)}`;
        continue;
      }
      return NextResponse.json({ error: "Could not update product" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not allocate unique slug" }, { status: 500 });
}
