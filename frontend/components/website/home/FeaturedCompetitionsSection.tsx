"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SectionHeader from "../shared/SectionHeader";
import DrawCard from "../shared/DrawCard";
import { cn } from "../../../lib/utils";
import { raffleService } from "../../../services/raffle.service";
import { formatUkDate } from "../../../lib/uk-time";
import type { Draw } from "../../../types/draw.types";

/**
 * Featured Competitions section with horizontal carousel and nav arrows.
 */
export default function FeaturedCompetitionsSection() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDraws() {
      try {
        const res = await raffleService.getPublicRaffles({ limit: 10, statusFilter: 'Live' });
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
    fetchDraws();
  }, []);

  const scroll = (dir: 'left' | 'right') =>
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -370 : 370, behavior: 'smooth' });

  return (
    <section id="live-draws" className="py-20 bg-[#090A0E] border-t border-[rgba(212,175,55,0.15)]">
      <div className="container-custom">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">⚡ Live Now</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F4EBD9]">Featured Pokémon Competitions</h2>
            <p className="font-sans text-sm text-[#A69B82] mt-2 max-w-md">
              Browse authenticated PSA &amp; BGS slabs, sealed booster boxes, and ultra-rare vintage cards.
            </p>
          </div>
          <Link
            href="/live-raffles"
            className="btn-gold-metallic shrink-0 px-6 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider self-start sm:self-auto shadow-md"
          >
            See All Competitions &rarr;
          </Link>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#A69B82]">
            <div className="animate-spin h-10 w-10 border-4 border-[#D4AF37] border-t-transparent rounded-full" />
            <p className="font-sans text-sm font-medium">Loading live draws…</p>
          </div>
        ) : draws.length > 0 ? (
          <div className="relative group">
            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.3)] shadow-lg text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#1A1E2C] hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:outline-none cursor-pointer"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            >
              {draws.map((draw) => (
                <div key={draw.id} className="snap-center shrink-0 w-[85vw] sm:w-[360px] lg:w-[380px]">
                  <DrawCard draw={draw} />
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.3)] shadow-lg text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#1A1E2C] hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:outline-none cursor-pointer"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0C0E14] border border-dashed border-[rgba(212,175,55,0.25)] rounded-[20px] max-w-md mx-auto">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="font-heading font-black text-lg text-[#F4EBD9] mb-2">No Live Competitions Yet</h3>
            <p className="font-sans text-sm text-[#A69B82]">New Pokémon grails are dropping soon. Join the newsletter to be notified.</p>
          </div>
        )}

      </div>
    </section>
  );
}
