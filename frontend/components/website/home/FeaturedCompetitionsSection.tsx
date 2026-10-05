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
    <section id="live-draws" className="py-20 bg-white border-t border-[#EFF4ED]">
      <div className="container-custom">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#dc2626] block mb-2">⛳ Live Now</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0b4d35]">Featured Competitions</h2>
            <p className="font-sans text-sm text-[#5e766c] mt-2 max-w-md">
              Browse all featured competitions hosted by verified golf clubs &amp; brands.
            </p>
          </div>
          <Link
            href="/live-raffles"
            className="shrink-0 px-6 py-3 bg-[#0b4d35] hover:bg-[#073826] text-white font-sans text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-200 shadow-md hover:shadow-lg self-start sm:self-auto"
          >
            See All Competitions →
          </Link>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#5e766c]">
            <div className="animate-spin h-10 w-10 border-4 border-[#0b4d35] border-t-transparent rounded-full" />
            <p className="font-sans text-sm font-medium">Loading competitions…</p>
          </div>
        ) : draws.length > 0 ? (
          <div className="relative group">
            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#0b4d35]/20 shadow-lg text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
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
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#0b4d35]/20 shadow-lg text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#F8FAF6] border border-dashed border-[#0b4d35]/20 rounded-[20px] max-w-md mx-auto">
            <div className="text-4xl mb-4">🏌️</div>
            <h3 className="font-serif font-black text-lg text-[#0b4d35] mb-2">No Live Competitions Yet</h3>
            <p className="font-sans text-sm text-[#5e766c]">New draws are dropping soon. Join the VIP waitlist to be first.</p>
          </div>
        )}

      </div>
    </section>
  );
}
