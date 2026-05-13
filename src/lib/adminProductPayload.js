import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";

function normalizeVariants(variants) {
  if (!Array.isArray(variants)) {
    return { ok: false, message: "variants must be an array" };
  }
  const normalizedVariants = [];
  for (const v of variants) {
    const size = typeof v.size === "string" ? v.size.trim() : "";
    const color = typeof v.color === "string" ? v.color.trim() : "";
    const stock = Number(v.stock);
    if (!size || !color) return { ok: false, message: "each variant needs size and color" };
    if (!Number.isFinite(stock) || stock < 0) {
      return { ok: false, message: "variant stock must be a non-negative number" };
    }
    normalizedVariants.push({ size, color, stock });
  }
  return { ok: true, variants: normalizedVariants };
}

/**
 * @param {Record<string, unknown>} body
 */
export function normalizeProductCreateBody(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = body.category;
  const price = Number(body.price);
  const discount = body.discount != null ? Number(body.discount) : 0;
  const description = typeof body.description === "string" ? body.description : "";
  const images = Array.isArray(body.images) ? body.images.filter((u) => typeof u === "string") : [];
  const variants = Array.isArray(body.variants) ? body.variants : [];

  if (!name) return { ok: false, message: "name is required" };
  if (!PRODUCT_CATEGORIES.includes(category)) {
    return { ok: false, message: `category must be one of: ${PRODUCT_CATEGORIES.join(", ")}` };
  }
  if (!Number.isFinite(price) || price < 0) return { ok: false, message: "price must be a non-negative number" };
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return { ok: false, message: "discount must be between 0 and 100" };
  }

  const vRes = normalizeVariants(variants);
  if (!vRes.ok) return vRes;

  let slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug.trim()) : slugify(name);
  if (!slug) slug = `item-${Date.now()}`;

  return {
    ok: true,
    data: {
      name,
      slug,
      category,
      price,
      discount,
      description,
      images,
      variants: vRes.variants,
    },
  };
}

/**
 * Partial update: only keys present on `body` are validated and returned.
 * @param {Record<string, unknown>} body
 */
export function normalizeProductPatchBody(body) {
  /** @type {Record<string, unknown>} */
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return { ok: false, message: "name cannot be empty" };
    updates.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(body, "slug")) {
    const raw = typeof body.slug === "string" ? body.slug.trim() : "";
    let slug = raw ? slugify(raw) : "";
    if (!slug) return { ok: false, message: "slug cannot be empty" };
    updates.slug = slug;
  }

  if (Object.prototype.hasOwnProperty.call(body, "category")) {
    const category = body.category;
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return { ok: false, message: `category must be one of: ${PRODUCT_CATEGORIES.join(", ")}` };
    }
    updates.category = category;
  }

  if (Object.prototype.hasOwnProperty.call(body, "price")) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return { ok: false, message: "price must be a non-negative number" };
    updates.price = price;
  }

  if (Object.prototype.hasOwnProperty.call(body, "discount")) {
    const discount = Number(body.discount);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      return { ok: false, message: "discount must be between 0 and 100" };
    }
    updates.discount = discount;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    updates.description = typeof body.description === "string" ? body.description : "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "images")) {
    const images = Array.isArray(body.images) ? body.images.filter((u) => typeof u === "string") : [];
    updates.images = images;
  }

  if (Object.prototype.hasOwnProperty.call(body, "variants")) {
    const vRes = normalizeVariants(body.variants);
    if (!vRes.ok) return vRes;
    updates.variants = vRes.variants;
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, message: "No valid fields to update" };
  }

  return { ok: true, updates };
}
