"use client";

import React, { useState, useEffect } from "react";
import SectionHeader from "../shared/SectionHeader";
import DrawCard from "../shared/DrawCard";
import { cn } from "../../../lib/utils";
import { raffleService } from "../../../services/raffle.service";
import { categoryService, Category } from "../../../services/category.service";
import { formatUkDate } from "../../../lib/uk-time";
import type { Draw } from "../../../types/draw.types";

/**
 * Instant Wins draws section with interactive client category filtering.
 */
export default function InstantWinsSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [draws, setDraws] = useState<Draw[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedCategories, fetchedDraws] = await Promise.all([
          categoryService.getPublicCategories(),
          raffleService.getInstantWinRaffles(12)
        ]);

        setCategories(fetchedCategories);

        if (fetchedDraws.data && fetchedDraws.data.length > 0) {
          const mappedDraws: Draw[] = fetchedDraws.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            image: r.mainImage || '',
            ticketPrice: Number(r.pricePerTicket),
            totalTickets: r.totalTickets,
            soldTickets: r.ticketsSold,
            endDate: formatUkDate(r.endDate),
            rawEndDate: r.endDate,
            status: (r.status === 'ACTIVE' ? 'live' : 'ended') as "live" | "ended",
            category: r.category || 'general',
            slug: r.slug,
            worthPrice: r.mainPrizeValue ? Number(r.mainPrizeValue) : undefined,
            instantWinsCount: r._count?.instantWins || 0,
            isInstantWin: (r._count?.instantWins || 0) > 0,
          }));
          setDraws(mappedDraws);
        }
      } catch (error) {
        console.error("Failed to fetch instant win draws:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter draws
  const filteredDraws = activeCategory === "all"
    ? draws
    : draws.filter((draw) => {
        const cat = (draw.category || "").toLowerCase();
        const target = activeCategory.toLowerCase();
        return (
          cat === target ||
          cat.replace(/[^a-z0-9]+/g, "-") === target ||
          cat.replace(/[^a-z0-9]+/g, " ") === target.replace(/-/g, " ")
        );
      });

  return (
    <section id="instant-wins" className="relative py-24 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.07)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* Section Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151F] border border-amber-500/35 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-heading font-black uppercase tracking-[0.2em] text-amber-300">
              ⚡ LIVE INSTANT WIN VAULT
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] uppercase tracking-tight">
            Win Instantly. Every Day.
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-3 leading-relaxed">
            Match allocated lucky ticket numbers immediately upon checkout to claim instant Pokémon packs, mystery slabs, and cash drops before the main draw.
          </p>
        </div>

        {/* Filter Tabs Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12 max-w-xl mx-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "font-heading font-bold text-xs px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none uppercase tracking-wider",
              activeCategory === "all"
                ? "btn-gold-metallic border-transparent shadow-md"
                : "btn-dark-metallic border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#F4EBD9]"
            )}
          >
            All Vaults
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={cn(
                "font-heading font-bold text-xs px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none uppercase tracking-wider",
                activeCategory === category.slug
                  ? "btn-gold-metallic border-transparent shadow-md"
                  : "btn-dark-metallic border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#F4EBD9]"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Competitions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="art-deco-card rounded-2xl h-[420px] p-6 animate-pulse flex flex-col justify-between">
                <div className="w-full h-[180px] bg-white/5 rounded-xl mb-4" />
                <div className="h-5 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2 mb-6" />
                <div className="h-10 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredDraws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} variant="instant" />
            ))}
          </div>
        ) : (
          <div className="art-deco-card rounded-3xl p-10 text-center max-w-md mx-auto">
            <span className="text-3xl mb-3 block">⚡</span>
            <h3 className="font-heading font-black text-lg text-[#F4EBD9] mb-1.5 uppercase">No instant wins active</h3>
            <p className="font-sans text-xs text-[#A69B82]">New instant win drops are added regularly. Check back shortly!</p>
          </div>
        )}

        {/* Informational Instant Win Banner */}
        <div className="mt-14 art-deco-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <h4 className="font-heading font-black text-base text-[#F4EBD9] uppercase tracking-wide">
                Instant Automatic Prize Claims
              </h4>
              <p className="font-sans text-xs text-[#A69B82] mt-1 leading-relaxed max-w-xl">
                When you enter any Instant Win competition, our engine cross-references your ticket allocation with pre-seeded winning numbers. Winners are credited to player balances instantly!
              </p>
            </div>
          </div>

          <a
            href="/live-raffles"
            className="btn-gold-metallic shrink-0 px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Explore All Draws &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
