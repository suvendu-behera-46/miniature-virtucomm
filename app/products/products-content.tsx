"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

type ProductCard = { name: string; slug: string; price: string; tag: string; image: string | null; category: string | null; categorySlug: string | null };
type CategoryLink = { name: string; slug: string; description: string | null; productCount: number };

export function ProductsContent({
  products,
  categories,
  activeCategory,
  requestedSlug,
}: {
  products: ProductCard[];
  categories: CategoryLink[];
  activeCategory: CategoryLink | null;
  requestedSlug: string | null;
}) {
  const totalProducts = categories.reduce((total, category) => total + category.productCount, 0);

  return (
    <main className="min-h-screen bg-white/55 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <motion.div key={activeCategory?.slug ?? "all"} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">{activeCategory ? "Category" : "Custom creations"}</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">{activeCategory ? activeCategory.name : "Our miniature collections"}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          {activeCategory?.description ||
            (activeCategory
              ? `Browse our ${activeCategory.name.toLowerCase()} miniatures, each crafted from your photos with hand-finished detail.`
              : "Crafted from your 2D photos or 3D reference images with personalization, story-driven detailing, and premium finishing for every special moment.")}
        </p>
      </motion.div>

      {categories.length > 0 && (
        <nav aria-label="Product categories" className="-mx-6 mb-10 overflow-x-auto px-6 pb-2">
          <ul className="flex w-max gap-2 sm:mx-auto sm:w-auto sm:flex-wrap sm:justify-center">
            <li>
              <CategoryChip href="/products" active={!requestedSlug} label="All" count={totalProducts} />
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryChip href={`/products?category=${category.slug}`} active={activeCategory?.slug === category.slug} label={category.name} count={category.productCount} />
              </li>
            ))}
          </ul>
        </nav>
      )}

      {products.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          {requestedSlug ? (
            <>No products in this category yet. <Link href="/products" className="font-semibold text-cyan-700">See all products</Link></>
          ) : (
            <>New collections are coming soon. <Link href="/contact" className="font-semibold text-cyan-700">Tell us what you&apos;d like made.</Link></>
          )}
        </p>
      )}

      <div data-gsap-section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <motion.article
            key={product.slug}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
          >
            <Link href={`/product/${product.slug}`} aria-label={product.name}>
              {product.image && <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />}
            </Link>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {product.categorySlug && (
                  <Link
                    href={`/products?category=${product.categorySlug}`}
                    className="inline-flex rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700 transition hover:bg-cyan-200"
                  >
                    {product.category}
                  </Link>
                )}
                {product.tag !== product.category && (
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                    {product.tag}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                <Link href={`/product/${product.slug}`} className="hover:text-cyan-800">{product.name}</Link>
              </h2>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900">{product.price}</span>
                <Link href={`/product/${product.slug}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  View detail
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}

function CategoryChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-600 hover:text-cyan-800"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{count}</span>
    </Link>
  );
}
