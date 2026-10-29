"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import DrawCard from "../shared/DrawCard";
import { cn } from "../../../lib/utils";
import { raffleService } from "../../../services/raffle.service";
import { categoryService, Category } from "../../../services/category.service";
import { formatUkDate } from "../../../lib/uk-time";
import type { Draw } from "../../../types/draw.types";

/**
 * Featured Competitions section with horizontal carousel, real category filters, and luxury nav arrows.
 */
export default function FeaturedCompetitionsSection() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [res, cats] = await Promise.all([
          raffleService.getPublicRaffles({ limit: 16, statusFilter: 'Live' }).catch(() => ({ data: [] })),
          categoryService.getPublicCategories().catch(() => []),
        ]);

        if (cats && cats.length > 0) {
          setCategories(cats);
        }

        if (res.data && res.data.length > 0) {
          setDraws(res.data.map(r => ({
            id: r.id, title: r.title, description: r.description,
            image: r.mainImage || '', ticketPrice: Number(r.pricePerTicket),
            totalTickets: r.totalTickets, soldTickets: r.ticketsSold,
            endDate: formatUkDate(r.endDate),
            rawEndDate: r.endDate,
            status: (r.status === 'ACTIVE' ? 'live' : 'ended') as 'live' | 'ended',
            category: r.category || 'general', slug: r.slug,
            worthPrice: r.mainPrizeValue ? Number(r.mainPrizeValue) : undefined,
            instantWinsCount: r._count?.instantWins || 0,
            isInstantWin: (r._count?.instantWins || 0) > 0,
          })));
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const hasInstantWins = useMemo(() => draws.some(d => d.isInstantWin || (d.instantWinsCount && d.instantWinsCount > 0)), [draws]);

  const filterTabs = useMemo(() => {
    const tabs: { id: string; label: string }[] = [{ id: "all", label: "All Competitions" }];
    if (hasInstantWins) {
      tabs.push({ id: "instant", label: "⚡ Instant Wins" });
    }
    categories.forEach(cat => {
      tabs.push({ id: cat.slug, label: cat.name });
    });
    return tabs;
  }, [categories, hasInstantWins]);

  const filteredDraws = useMemo(() => {
    if (selectedFilter === "all") return draws;
    if (selectedFilter === "instant") return draws.filter(d => d.isInstantWin || (d.instantWinsCount && d.instantWinsCount > 0));
    return draws.filter(d => {
      const cat = (d.category || "").toLowerCase();
      const target = selectedFilter.toLowerCase();
      return cat === target || cat.replace(/[^a-z0-9]+/g, "-") === target;
    });
  }, [draws, selectedFilter]);

  const scroll = (dir: 'left' | 'right') =>
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -380 : 380, behavior: 'smooth' });

  return (
    <section id="live-draws" className="relative py-24 bg-[#090A0E] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Ambient background radiance */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[rgba(212,175,55,0.15)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-heading font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                Live Showcase
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] uppercase tracking-tight">
              Featured Competitions
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-2 max-w-xl leading-relaxed">
              Browse authenticated Gem Mint slabs, sealed booster boxes, and rare collectibles with guaranteed live-streamed draws.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/live-raffles"
              className="btn-gold-metallic px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore All Live Draws</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Category Filter Bar (Only if multiple real categories exist) */}
        {filterTabs.length > 1 && (
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                    selectedFilter === tab.id
                      ? "btn-gold-metallic shadow-md"
                      : "btn-dark-metallic text-[#A69B82] hover:text-[#F4EBD9]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Carousel arrows */}
            {filteredDraws.length > 1 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="w-10 h-10 rounded-xl bg-[#12151F] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#181C28] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Previous draws"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-10 h-10 rounded-xl bg-[#12151F] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#181C28] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Next draws"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Carousel */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="art-deco-card rounded-2xl h-[380px] p-5 animate-pulse flex flex-col justify-between">
                <div className="w-full h-[180px] bg-white/5 rounded-xl mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2 mb-6" />
                <div className="h-10 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredDraws.length > 0 ? (
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            >
              {filteredDraws.map((draw) => (
                <div key={draw.id} className="snap-center shrink-0 w-[88vw] sm:w-[360px] lg:w-[380px]">
                  <DrawCard draw={draw} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0C0E14] border border-dashed border-[rgba(212,175,55,0.25)] rounded-2xl max-w-md mx-auto">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-heading font-black text-lg text-[#F4EBD9] mb-1.5 uppercase">No Competitions in this category</h3>
            <p className="font-sans text-xs text-[#A69B82] mb-4">Try selecting &apos;All Grails&apos; to view all live Pokémon competitions.</p>
            <button
              onClick={() => setSelectedFilter("all")}
              className="btn-gold-metallic px-5 py-2 text-xs rounded-xl font-heading font-black uppercase"
            >
              Show All Grails
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
