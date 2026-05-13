import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { connectDB } from "@/lib/mongodb";
import { buildProductMongoFilter, parsePagination } from "@/lib/productFilters";
import { searchParamsToURLSearchParams } from "@/lib/searchParamsToURLSearchParams";
import Product from "@/models/Product";
import styles from "./products.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop · UrbanWear",
  description: "Browse UrbanWear with category, size, color, and price filters.",
};

function buildQueryString(sp, overrides = {}) {
  const next = new URLSearchParams(sp.toString());
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null || v === "") next.delete(k);
    else next.set(k, String(v));
  }
  const q = next.toString();
  return q ? `?${q}` : "";
}

export default async function ProductsPage({ searchParams }) {
  const raw = await searchParams;
  const sp = searchParamsToURLSearchParams(raw);
  await connectDB();

  const filter = buildProductMongoFilter(sp);
  const { page, limit, skip } = parsePagination(sp);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name slug price discount images category variants createdAt")
      .lean(),
    Product.countDocuments(filter),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Shop</h1>
        <p className={styles.lead}>API-backed catalog with filters aligned to the UrbanWear SRS.</p>
      </div>

      <form className={styles.filters} method="get" action="/products">
        <label className={styles.field}>
          <span>Category</span>
          <select name="category" defaultValue={sp.get("category") || ""}>
            <option value="">All</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Size</span>
          <input name="size" type="text" placeholder="e.g. M" defaultValue={sp.get("size") || ""} />
        </label>

        <label className={styles.field}>
          <span>Color</span>
          <input name="color" type="text" placeholder="e.g. Black" defaultValue={sp.get("color") || ""} />
        </label>

        <label className={styles.field}>
          <span>Min price</span>
          <input name="minPrice" type="number" min="0" step="1" defaultValue={sp.get("minPrice") || ""} />
        </label>

        <label className={styles.field}>
          <span>Max price</span>
          <input name="maxPrice" type="number" min="0" step="1" defaultValue={sp.get("maxPrice") || ""} />
        </label>

        <div className={styles.filterActions}>
          <button type="submit" className={styles.btn}>
            Apply
          </button>
          <Link href="/products" className={styles.reset}>
            Reset
          </Link>
        </div>
      </form>

      <p className={styles.meta}>
        {total} result{total === 1 ? "" : "s"} · page {page} of {pages}
      </p>

      {items.length ? (
        <div className={styles.grid}>
          {items.map((p) => (
            <ProductCard key={String(p._id)} product={p} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No products match these filters yet.</p>
          <p className={styles.muted}>
            Create inventory via <code className={styles.code}>POST /api/admin/products</code> (admin JWT), then
            refresh.
          </p>
        </div>
      )}

      {pages > 1 ? (
        <nav className={styles.pager} aria-label="Pagination">
          {page > 1 ? (
            <Link className={styles.pageLink} href={`/products${buildQueryString(sp, { page: page - 1 })}`}>
              ← Previous
            </Link>
          ) : (
            <span className={styles.pageDisabled}>← Previous</span>
          )}
          {page < pages ? (
            <Link className={styles.pageLink} href={`/products${buildQueryString(sp, { page: page + 1 })}`}>
              Next →
            </Link>
          ) : (
            <span className={styles.pageDisabled}>Next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
