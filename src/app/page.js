import Link from "next/link";
import { getHomeCatalog } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { latestCollection, trending, offers } = await getHomeCatalog();

  const heroProducts = Array.isArray(latestCollection?.products)
    ? latestCollection.products.filter(Boolean).slice(0, 4)
    : [];

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>New season</p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            {latestCollection?.name ?? "UrbanWear"}
          </h1>
          <p className={styles.heroLead}>
            {latestCollection?.season
              ? `${latestCollection.season} — curated looks, sharp silhouettes, monochrome energy.`
              : "Trend-led pieces, variant-perfect fits, and a storefront built for speed."}
          </p>
          <div className={styles.heroCtas}>
            <Link className={styles.btnPrimary} href="/products">
              Shop all
            </Link>
            <Link className={styles.btnGhost} href="/products?category=Streetwear">
              Streetwear
            </Link>
          </div>
        </div>
        <div className={styles.heroGrid} aria-label="Featured from latest collection">
          {heroProducts.length ? (
            heroProducts.map((p) => <ProductCard key={String(p._id)} product={p} />)
          ) : (
            <div className={styles.emptyHero}>
              <p>No collection yet.</p>
              <p className={styles.emptyHint}>
                Add products as an admin, then group them in a Collection — or browse the shop once inventory
                exists.
              </p>
              <Link href="/products" className={styles.btnPrimary}>
                Go to shop
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="cat-heading">
        <div className={styles.sectionHead}>
          <h2 id="cat-heading" className={styles.h2}>
            Categories
          </h2>
          <p className={styles.muted}>Filter the catalog by department.</p>
        </div>
        <div className={styles.catRow}>
          {["Men", "Women", "Streetwear", "Accessories"].map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className={styles.catCard}>
              <span className={styles.catName}>{c}</span>
              <span className={styles.catArrow} aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="trend-heading">
        <div className={styles.sectionHead}>
          <h2 id="trend-heading" className={styles.h2}>
            Trending outfits
          </h2>
          <Link href="/products" className={styles.linkAll}>
            View all
          </Link>
        </div>
        <div className={styles.grid}>
          {trending.length ? (
            trending.map((p) => <ProductCard key={String(p._id)} product={p} />)
          ) : (
            <p className={styles.muted}>Products will appear here once added.</p>
          )}
        </div>
      </section>

      <section className={styles.sectionMuted} aria-labelledby="offers-heading">
        <div className={styles.sectionHead}>
          <h2 id="offers-heading" className={styles.h2}>
            Seasonal offers
          </h2>
          <p className={styles.muted}>Markdowns across selected variants.</p>
        </div>
        <div className={styles.grid}>
          {offers.length ? (
            offers.map((p) => <ProductCard key={String(p._id)} product={p} />)
          ) : (
            <p className={styles.muted}>No active discounts yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
