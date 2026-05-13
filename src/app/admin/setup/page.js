"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACCESS_TOKEN_KEY } from "@/lib/authStorage";
import loginStyles from "../login/login.module.css";
import styles from "./setup.module.css";

export default function AdminSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState({ loading: true, available: false, reason: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/admin/bootstrap-status");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setStatus({
          loading: false,
          available: Boolean(data.available),
          reason: typeof data.reason === "string" ? data.reason : "",
        });
      } catch {
        if (!cancelled) setStatus({ loading: false, available: false, reason: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          bootstrapSecret,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Setup failed");
        return;
      }
      if (data.token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
      }
      router.replace("/admin/products");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (status.loading) {
    return (
      <div className={loginStyles.page}>
        <div className={loginStyles.card}>
          <p className={loginStyles.lead}>Checking setup…</p>
        </div>
      </div>
    );
  }

  if (status.reason === "not_configured") {
    return (
      <div className={loginStyles.page}>
        <div className={loginStyles.card}>
          <h1 className={loginStyles.title}>First administrator</h1>
          <p className={loginStyles.lead}>
            Add <code className={loginStyles.code}>ADMIN_BOOTSTRAP_SECRET</code> to <code className={loginStyles.code}>.env.local</code>{" "}
            (any long random string), restart the dev server, then open this page again.
          </p>
          <Link href="/admin/login" className={styles.back}>
            ← Admin sign-in
          </Link>
        </div>
      </div>
    );
  }

  if (!status.available) {
    return (
      <div className={loginStyles.page}>
        <div className={loginStyles.card}>
          <h1 className={loginStyles.title}>First administrator</h1>
          <p className={loginStyles.lead}>
            An admin account already exists. Use sign-in, or add further admins via{" "}
            <code className={loginStyles.code}>ADMIN_EMAILS</code> on registration.
          </p>
          <Link href="/admin/login" className={styles.back}>
            ← Admin sign-in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={loginStyles.page}>
      <div className={loginStyles.card}>
        <h1 className={loginStyles.title}>Create first administrator</h1>
        <p className={loginStyles.lead}>
          One-time setup. Enter the same value you set as <code className={loginStyles.code}>ADMIN_BOOTSTRAP_SECRET</code>{" "}
          in <code className={loginStyles.code}>.env.local</code>. Remove or change that secret after onboarding if you
          like.
        </p>
        <form className={loginStyles.form} onSubmit={onSubmit}>
          <label className={loginStyles.field}>
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className={loginStyles.field}>
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <label className={loginStyles.field}>
            <span>Display name (optional)</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Administrator" />
          </label>
          <label className={`${loginStyles.field} ${styles.secretField}`}>
            <span>Bootstrap secret</span>
            <input
              type="password"
              autoComplete="off"
              value={bootstrapSecret}
              onChange={(e) => setBootstrapSecret(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className={loginStyles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={loginStyles.btn} disabled={submitting}>
            {submitting ? "Creating…" : "Create admin & continue"}
          </button>
        </form>
        <p className={styles.footer}>
          <Link href="/admin/login">Already have an account? Sign in</Link>
        </p>
      </div>
    </div>
  );
}
