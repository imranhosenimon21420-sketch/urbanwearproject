import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { connectDB } from "@/lib/mongodb";
import { effectivePrice } from "@/lib/pricing";
import { productLookupFilter } from "@/lib/productLookup";
import Product from "@/models/Product";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";

function MediaImage({ src, alt, priority }) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={styles.heroImg} loading={priority ? "eager" : "lazy"} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={1500}
      className={styles.heroImg}
      priority={Boolean(priority)}
      sizes="(max-width: 900px) 100vw, 55vw"
    />
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const p = await Product.findOne(productLookupFilter(slug)).select("name").lean();
  return { title: p ? `${p.name} · UrbanWear` : "Product · UrbanWear" };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne(productLookupFilter(slug)).lean();
  if (!product) notFound();

  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images.map(String)
      : ["/placeholder-product.svg"];

  const sale = effectivePrice(product.price, product.discount ?? 0);

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .select("name slug price discount images category variants")
    .lean();

  const sizes = [...new Set((product.variants ?? []).map((v) => v.size))];
  const colors = [...new Set((product.variants ?? []).map((v) => v.color))];

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span aria-hidden> / </span>
        <Link href="/products">Shop</Link>
        <span aria-hidden> / </span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </div>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainShot}>
            <MediaImage src={images[0]} alt={product.name} priority />
          </div>
          {images.length > 1 ? (
            <ul className={styles.thumbs} aria-label="Product images">
              {images.slice(1, 6).map((src, idx) => (
                <li key={`${src}-${idx}`}>
                  <MediaImage src={src} alt="" priority={false} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.panel}>
          <p className={styles.cat}>{product.category}</p>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.priceRow}>
            {(product.discount ?? 0) > 0 ? (
              <>
                <span className={styles.price}>${sale.toFixed(2)}</span>
                <span className={styles.was}>${Number(product.price).toFixed(2)}</span>
                <span className={styles.badge}>{product.discount}% off</span>
              </>
            ) : (
              <span className={styles.price}>${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          <div className={styles.pickers}>
            <div>
              <p className={styles.label}>Sizes in stock</p>
              <ul className={styles.chips}>
                {sizes.length ? (
                  sizes.map((s) => (
                    <li key={s} className={styles.chip}>
                      {s}
                    </li>
                  ))
                ) : (
                  <li className={styles.muted}>No variants yet</li>
                )}
              </ul>
            </div>
            <div>
              <p className={styles.label}>Colors</p>
              <ul className={styles.chips}>
                {colors.length ? (
                  colors.map((c) => (
                    <li key={c} className={styles.chip}>
                      {c}
                    </li>
                  ))
                ) : (
                  <li className={styles.muted}>—</li>
                )}
              </ul>
            </div>
          </div>

          <p className={styles.note}>
            Guests can browse; cart and checkout unlock for signed-in customers (APIs wired next).
          </p>

          <div className={styles.desc}>
            <h2 className={styles.h2}>Details</h2>
            <p className={styles.body}>{product.description || "No description provided."}</p>
          </div>

          <div className={styles.stock}>
            <h2 className={styles.h2}>Availability by variant</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(product.variants ?? []).map((v, i) => (
                    <tr key={`${v.size}-${v.color}-${i}`}>
                      <td>{v.size}</td>
                      <td>{v.color}</td>
                      <td>{v.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {related.length ? (
        <section className={styles.related} aria-labelledby="rel-heading">
          <h2 id="rel-heading" className={styles.relatedTitle}>
            More in {product.category}
          </h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <ProductCard key={String(p._id)} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
