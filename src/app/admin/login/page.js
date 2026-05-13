"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ACCESS_TOKEN_KEY } from "@/lib/authStorage";
import styles from "./login.module.css";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/products";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapOpen, setBootstrapOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/admin/bootstrap-status");
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data.available) setBootstrapOpen(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Sign-in failed");
        return;
      }
      if (data.token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
      }
      const dest = nextPath.startsWith("/admin") ? nextPath : "/admin/products";
      router.replace(dest);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Administrator sign-in</h1>
        <p className={styles.lead}>
          Sign in with an existing admin account. New admins can also be created via{" "}
          <code className={styles.code}>ADMIN_EMAILS</code> at registration.
        </p>
        {bootstrapOpen ? (
          <p className={styles.setupHint}>
            <Link href="/admin/setup">No admin yet? Create the first administrator →</Link>
          </p>
        ) : null}
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.lead}>Loading…</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
