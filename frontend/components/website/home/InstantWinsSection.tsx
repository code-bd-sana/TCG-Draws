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
    <section id="instant-wins" className="py-20 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)]">
      <div className="container-custom">

        {/* Section Header */}
        <SectionHeader
          badgeText="⚡ INSTANT WIN PRIZES NOW LIVE"
          headingText="Win Instantly. Every Day."
          paragraphText="Match allocated lucky ticket numbers immediately to claim instant Pokémon packs, mystery slabs, and grail drops."
        />

        {/* Filter Tabs Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-xl mx-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "font-heading font-semibold text-xs px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
              activeCategory === "all"
                ? "btn-gold-metallic border-transparent"
                : "btn-dark-metallic border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#D4AF37]"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={cn(
                "font-heading font-semibold text-xs px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none capitalize",
                activeCategory === category.slug
                  ? "btn-gold-metallic border-transparent"
                  : "btn-dark-metallic border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#D4AF37]"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Competitions Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A69B82] gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
            <p className="font-sans font-medium text-sm">Loading Instant Wins...</p>
          </div>
        ) : filteredDraws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} variant="instant" />
            ))}
          </div>
        ) : (
          <div className="text-center text-[#A69B82] py-10 font-sans text-sm">
            No instant win competitions found in this category.
          </div>
        )}

        {/* View All Button */}
        <div className="mt-12 text-center">
          <a
            href="/live-raffles"
            className="btn-dark-metallic inline-flex items-center justify-center font-heading font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl border border-[rgba(212,175,55,0.3)] text-[#D4AF37] hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
          >
            View All Competitions &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
