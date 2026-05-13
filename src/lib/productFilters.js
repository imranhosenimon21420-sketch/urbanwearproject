import { PRODUCT_CATEGORIES } from "@/lib/constants";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {URLSearchParams} searchParams
 */
export function buildProductMongoFilter(searchParams) {
  /** @type {Record<string, unknown>} */
  const filter = {};

  const category = searchParams.get("category");
  if (category && PRODUCT_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  const size = searchParams.get("size")?.trim();
  const color = searchParams.get("color")?.trim();

  if (size && color) {
    filter.variants = {
      $elemMatch: {
        size: new RegExp(`^${escapeRegex(size)}$`, "i"),
        color: new RegExp(`^${escapeRegex(color)}$`, "i"),
      },
    };
  } else if (size) {
    filter.variants = {
      $elemMatch: { size: new RegExp(`^${escapeRegex(size)}$`, "i") },
    };
  } else if (color) {
    filter.variants = {
      $elemMatch: { color: new RegExp(`^${escapeRegex(color)}$`, "i") },
    };
  }

  const minRaw = searchParams.get("minPrice");
  const maxRaw = searchParams.get("maxPrice");
  const minPrice = minRaw !== null && minRaw !== "" ? Number(minRaw) : null;
  const maxPrice = maxRaw !== null && maxRaw !== "" ? Number(maxRaw) : null;

  if (minPrice !== null && !Number.isNaN(minPrice)) {
    filter.price = { ...(typeof filter.price === "object" && filter.price ? filter.price : {}), $gte: minPrice };
  }
  if (maxPrice !== null && !Number.isNaN(maxPrice)) {
    filter.price = { ...(typeof filter.price === "object" && filter.price ? filter.price : {}), $lte: maxPrice };
  }

  return filter;
}

/**
 * @param {URLSearchParams} searchParams
 */
export function parsePagination(searchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit")) || 12));
  return { page, limit, skip: (page - 1) * limit };
}
