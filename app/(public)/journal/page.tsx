"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/landing/Footer"
import { Reveal } from "@/components/shared/Reveal"
import {
  JOURNAL_ARTICLES,
  JOURNAL_CATEGORIES,
  type JournalArticle,
  type JournalCategory,
} from "@/config/journal-content"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const FILTERS: Array<"All" | JournalCategory> = ["All", ...JOURNAL_CATEGORIES]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function ArticleCard({
  article,
  index,
  featured,
}: {
  article: JournalArticle
  index: number
  featured: boolean
}) {
  const reduced = useReducedMotion()

  return (
    <motion.article
      layout
      initial={reduced ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0 }}
      whileInView={
        reduced ? undefined : { clipPath: "inset(0 0 0% 0)", opacity: 1 }
      }
      viewport={{ once: true, margin: "-4% 0px" }}
      transition={{ duration: 1.0, ease: LUXURY_EASE, delay: (index % 4) * 0.1 }}
      className={featured ? "md:col-span-2" : ""}
    >
      <a
        href="/packages"
        className={[
          "group relative block overflow-hidden rounded-[2rem]",
          featured ? "min-h-[55vh]" : "min-h-[42vh]",
        ].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
          <div className="mb-4 flex items-center gap-3 font-headline text-[10px] uppercase tracking-[0.28em] text-gold-soft">
            <span>{article.category}</span>
            <span className="h-1 w-1 rounded-full bg-gold-soft/50" />
            <span className="text-white/50">{article.readTime}</span>
          </div>
          <h2
            style={{ fontFamily: "var(--font-headline)" }}
            className={[
              "font-light leading-tight text-white",
              featured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl",
            ].join(" ")}
          >
            {article.title}
          </h2>
          <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-white/70">
            {article.excerpt}
          </p>
          <div className="mt-5 flex items-center gap-3 font-headline text-[10px] uppercase tracking-[0.24em] text-white/60">
            <span>{formatDate(article.date)}</span>
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-gold/40 group-hover:bg-gold group-hover:text-gold-ink">
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  )
}

export default function JournalPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All")

  const filtered = React.useMemo(
    () =>
      filter === "All"
        ? JOURNAL_ARTICLES
        : JOURNAL_ARTICLES.filter((a) => a.category === filter),
    [filter],
  )

  return (
    <main className="min-h-screen bg-stitch-background text-stitch-on-background">
      <Navbar />

      <section className="section-ambient-warm relative overflow-hidden border-b border-white/[0.04] pb-16 pt-32 md:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.07),transparent_55%)]" />
        <div className="relative mx-auto max-w-screen-xl px-6 md:px-10">
          <Reveal as="div" y={24}>
            <span className="font-headline text-[9px] uppercase tracking-[0.45em] text-gold">
              The Journal
            </span>
            <h1
              style={{ fontFamily: "var(--font-headline)" }}
              className="mt-6 max-w-3xl text-[clamp(3rem,7vw,7rem)] font-light leading-[1.03] tracking-[-0.02em] text-ink"
            >
              Notes from{" "}
              <span className="inline-block pb-1 italic text-gold/85">the open road.</span>
            </h1>
            <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-ink-muted md:text-lg">
              Field stories, route guides, and the quiet philosophy of slow travel, written by the
              people who live it.
            </p>
          </Reveal>

          {/* Filter tabs */}
          <div className="mt-12 flex flex-wrap gap-3">
            {FILTERS.map((f) => {
              const active = f === filter
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={[
                    "rounded-full border px-5 py-2.5 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/[0.08] text-ink-muted/70 hover:border-white/15 hover:text-ink",
                  ].join(" ")}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-[clamp(4rem,8vw,8rem)]">
        <div className="mx-auto max-w-screen-xl px-6 md:px-10">
          <motion.div layout className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                featured={filter === "All" && index === 0}
              />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <p className="py-24 text-center font-body text-ink-muted">
              No stories in this category yet.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
