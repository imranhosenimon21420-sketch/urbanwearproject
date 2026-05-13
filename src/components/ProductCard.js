import Image from "next/image";
import Link from "next/link";
import { effectivePrice } from "@/lib/pricing";
import styles from "./ProductCard.module.css";

function ProductImage({ src, alt }) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={styles.image} loading="lazy" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={640}
      height={800}
      className={styles.image}
      sizes="(max-width: 900px) 50vw, 25vw"
    />
  );
}

/** @param {{ product: Record<string, unknown> }} props */
export default function ProductCard({ product }) {
  const href = `/products/${product.slug}`;
  const img = Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : "/placeholder-product.svg";
  const sale = effectivePrice(product.price, product.discount ?? 0);
  const name = String(product.name ?? "Product");

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.media} aria-label={name}>
        <ProductImage src={img} alt={name} />
      </Link>
      <div className={styles.meta}>
        <p className={styles.cat}>{product.category}</p>
        <Link href={href} className={styles.title}>
          {name}
        </Link>
        <div className={styles.prices}>
          {(product.discount ?? 0) > 0 ? (
            <>
              <span className={styles.sale}>${sale.toFixed(2)}</span>
              <span className={styles.was}>${Number(product.price).toFixed(2)}</span>
            </>
          ) : (
            <span className={styles.sale}>${Number(product.price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
