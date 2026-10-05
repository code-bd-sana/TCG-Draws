"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "../../../lib/utils";
import { raffleService, PublicHostPreviewStats } from "../../../services/raffle.service";

const BULLETS = [
  "Set your own ticket price & batch limits",
  "Secure escrow-protected next-day payouts",
  "Direct exposure to our active collector community",
  "Transparent and competitive 10% platform commission",
];

/**
 * Host CTA section — luxury dark split layout with benefits + dashboard preview card.
 */
export default function FinalCtaSection() {
  const [stats, setStats] = useState<PublicHostPreviewStats>({
    activeDraws: 0,
    ticketsSold: 0,
    totalEarned: 0,
    targetPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    raffleService.getPublicHostPreviewStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="host-info" className="py-20 bg-[#090A0E] border-t border-[rgba(212,175,55,0.15)]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* LEFT — Host Info */}
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-7 shadow-sm">
              ⚡ For Card Shops &amp; Breakers
            </span>

            <h2 className="font-heading text-[38px] sm:text-[48px] font-black leading-[0.95] text-[#F4EBD9] uppercase mb-5">
              RUN YOUR OWN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">
                POKÉMON DRAWS
              </span>
            </h2>

            <p className="font-sans text-base text-[#A69B82] leading-relaxed mb-8 max-w-md">
              Monetize high-end inventory, host live pack breaks, or launch slab competitions as an established card shop or streamer. We handle payment processing, UK compliance, and live winner selection.
            </p>

            {/* Bullets */}
            <ul className="flex flex-col gap-3.5 mb-10 w-full">
              {BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3 font-sans text-sm text-[#F4EBD9]">
                  <div className="w-5 h-5 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-[#D4AF37]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/host/register"
                className="btn-gold-metallic px-8 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg cursor-pointer"
              >
                ⚡ Start Hosting
              </Link>
              <Link
                href="/pricing"
                className="btn-dark-metallic px-8 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider border border-[rgba(212,175,55,0.3)] text-[#F4EBD9] hover:border-[#D4AF37] transition-all duration-200 cursor-pointer"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* RIGHT — Dashboard Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px] art-deco-card rounded-[24px] p-7 shadow-2xl transition-all duration-300">

              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[rgba(212,175,55,0.2)] mb-6">
                <div>
                  <h3 className="font-heading font-black text-sm text-[#F4EBD9] uppercase tracking-wider">Breaker Dashboard</h3>
                  <p className="font-sans text-[10px] text-[#A69B82] mt-0.5">Live platform metrics</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] bg-[rgba(212,175,55,0.12)] px-2.5 py-1.5 rounded-full border border-[rgba(212,175,55,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Live Vault
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3.5 mb-6">
                {[
                  { value: isLoading ? "..." : stats.activeDraws, label: "Active Draws" },
                  { value: isLoading ? "..." : stats.ticketsSold.toLocaleString('en-GB'), label: "Tickets Sold" },
                  { value: isLoading ? "..." : formatCurrency(stats.totalEarned, 0), label: "Total Earned" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#0C0E14] border border-[rgba(212,175,55,0.2)] rounded-xl p-3.5 text-center">
                    <span className="font-heading text-lg font-black text-[#D4AF37] block">{s.value}</span>
                    <span className="font-sans text-[9px] text-[#A69B82] font-semibold uppercase tracking-wider mt-0.5 block">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="pt-5 border-t border-[rgba(212,175,55,0.2)]">
                <div className="flex justify-between items-center text-xs text-[#A69B82] mb-3 font-semibold">
                  <span>Capacity Allocation</span>
                  <span className="text-[#D4AF37] font-black">{isLoading ? "..." : `${stats.targetPercent}%`}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0C0E14] rounded-full overflow-hidden border border-[rgba(212,175,55,0.2)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5E5C0] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    style={{ width: `${isLoading ? 0 : stats.targetPercent}%` }}
                  />
                </div>
                <p className="font-sans text-[10px] text-[#A69B82] mt-2.5">
                  {isLoading ? "Loading capacity metrics..." : `${stats.targetPercent}% of draw capacity reached across live card breaks!`}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
