"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ACCESS_TOKEN_KEY } from "@/lib/authStorage";
import styles from "./admin-products.module.css";

function bearerHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(24);

  const load = useCallback(
    async (pageNum, t) => {
      const res = await fetch(`/api/admin/products?page=${pageNum}&limit=${limit}`, {
        headers: bearerHeaders(t),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        router.replace("/admin/login?next=/admin/products");
        return;
      }
      if (!res.ok) {
        setError("Could not load products");
        return;
      }
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
      setError("");
    },
    [limit, router]
  );

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : "";
    if (!t) {
      router.replace("/admin/login?next=/admin/products");
      return;
    }
    setToken(t);
    (async () => {
      setLoading(true);
      try {
        const me = await fetch("/api/auth/me", { headers: bearerHeaders(t) });
        if (!me.ok) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          router.replace("/admin/login?next=/admin/products");
          return;
        }
        const meData = await me.json();
        if (meData.user?.role !== "admin") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          router.replace("/admin/login?next=/admin/products");
          return;
        }
        await load(1, t);
      } finally {
        setLoading(false);
      }
    })();
  }, [load, router]);

  const pages = Math.max(1, Math.ceil(total / limit));

  if (loading && !items.length) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Products</h1>
        <p className={styles.lead}>Select a product to edit name, pricing, media, variants, and URL slug.</p>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {items.length ? (
        <ul className={styles.list}>
          {items.map((p) => (
            <li key={String(p._id)} className={styles.row}>
              <div className={styles.rowMain}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.meta}>
                  {p.category} · ${Number(p.price).toFixed(2)}
                  {p.discount ? ` · ${p.discount}% off` : ""}
                </span>
                <code className={styles.slug}>{p.slug}</code>
              </div>
              <div className={styles.actions}>
                <Link href={`/products/${encodeURIComponent(p.slug)}`} className={styles.link} target="_blank" rel="noreferrer">
                  View live
                </Link>
                <Link href={`/admin/products/${String(p._id)}/edit`} className={styles.edit}>
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p>No products yet.</p>
          <p className={styles.muted}>Create items with POST /api/admin/products using your admin token.</p>
        </div>
      )}

      {pages > 1 && token ? (
        <nav className={styles.pager} aria-label="Pagination">
          <button
            type="button"
            className={page <= 1 ? styles.pageDisabled : styles.pageBtn}
            disabled={page <= 1}
            onClick={() => load(page - 1, token)}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {pages}
          </span>
          <button
            type="button"
            className={page >= pages ? styles.pageDisabled : styles.pageBtn}
            disabled={page >= pages}
            onClick={() => load(page + 1, token)}
          >
            Next →
          </button>
        </nav>
      ) : null}
    </div>
  );
}
