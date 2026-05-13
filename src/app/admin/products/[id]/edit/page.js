"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { ACCESS_TOKEN_KEY } from "@/lib/authStorage";
import styles from "./edit.module.css";

function bearerHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [description, setDescription] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [variantsJson, setVariantsJson] = useState("[]");

  useEffect(() => {
    if (!id) return;
    const t = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : "";
    if (!t) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/admin/products/${id}/edit`)}`);
      return;
    }
    setToken(t);
    let cancelled = false;
    (async () => {
      const me = await fetch("/api/auth/me", { headers: bearerHeaders(t) });
      const meJson = await me.json().catch(() => ({}));
      if (!me.ok || meJson.user?.role !== "admin") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        router.replace("/admin/login");
        return;
      }
      const res = await fetch(`/api/admin/products/${id}`, { headers: bearerHeaders(t) });
      if (cancelled) return;
      if (res.status === 404) {
        setError("Product not found");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Could not load product");
        setLoading(false);
        return;
      }
      const p = await res.json();
      setName(p.name ?? "");
      setSlug(p.slug ?? "");
      setCategory(PRODUCT_CATEGORIES.includes(p.category) ? p.category : PRODUCT_CATEGORIES[0]);
      setPrice(String(p.price ?? ""));
      setDiscount(String(p.discount ?? "0"));
      setDescription(p.description ?? "");
      setImagesText(Array.isArray(p.images) ? p.images.join("\n") : "");
      setVariantsJson(JSON.stringify(p.variants ?? [], null, 2));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSavedMsg("");
    let variants;
    try {
      variants = JSON.parse(variantsJson);
    } catch {
      setError("Variants must be valid JSON");
      return;
    }
    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        price: Number(price),
        discount: Number(discount),
        description,
        images,
        variants,
      };
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { ...bearerHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      setSavedMsg("Changes saved.");
      if (data.slug && data.slug !== slug) {
        setSlug(data.slug);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading…</p>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error}</p>
        <Link href="/admin/products" className={styles.back}>
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link href="/admin/products" className={styles.back}>
          ← Products
        </Link>
        {id ? (
          <Link href={`/products/${encodeURIComponent(slug)}`} className={styles.live} target="_blank" rel="noreferrer">
            View on storefront
          </Link>
        ) : null}
      </div>

      <h1 className={styles.title}>Edit product</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Slug (URL)</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Price (USD)</span>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label className={styles.field}>
            <span>Discount %</span>
            <input type="number" min="0" max="100" step="1" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
          </label>
        </div>

        <label className={styles.field}>
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
        </label>

        <label className={styles.field}>
          <span>Image URLs (one per line)</span>
          <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={4} placeholder="https://..." />
        </label>

        <label className={styles.field}>
          <span>Variants (JSON)</span>
          <textarea
            value={variantsJson}
            onChange={(e) => setVariantsJson(e.target.value)}
            rows={8}
            spellCheck={false}
            className={styles.mono}
          />
        </label>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {savedMsg ? (
          <p className={styles.success} role="status">
            {savedMsg}
          </p>
        ) : null}

        <button type="submit" className={styles.btn} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
