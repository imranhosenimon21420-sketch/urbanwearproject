"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ACCESS_TOKEN_KEY } from "@/lib/authStorage";
import styles from "./admin-layout.module.css";

export default function AdminChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    setHasToken(Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)));
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (e.key === ACCESS_TOKEN_KEY || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname, refresh]);

  function signOut() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setHasToken(false);
    router.push("/admin/login");
    router.refresh();
  }

  const onLogin = pathname === "/admin/login";

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <Link href="/admin/products" className={styles.brand}>
          UrbanWear Admin
        </Link>
        <nav className={styles.nav} aria-label="Admin">
          <Link href="/">Storefront</Link>
          {hasToken && !onLogin ? (
            <>
              <Link href="/admin/products">Products</Link>
              <button type="button" className={styles.signOut} onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/admin/login">Sign in</Link>
          )}
        </nav>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
