import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          UrbanWear
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/products">Shop</Link>
          <Link href="/products?category=Men">Men</Link>
          <Link href="/products?category=Women">Women</Link>
          <Link href="/products?category=Streetwear">Streetwear</Link>
          <Link href="/products?category=Accessories">Accessories</Link>
          <Link href="/admin/login" className={styles.adminLink}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
