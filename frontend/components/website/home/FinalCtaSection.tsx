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

          {/* RIGHT — Host Portal Dashboard Mini-Widget Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] art-deco-card rounded-3xl p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(212,175,55,0.2)] transition-all duration-300 relative overflow-hidden group">
              {/* Corner gold flare */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-bl-full pointer-events-none" />

              {/* Header: Verified Host Portal */}
              <div className="flex items-center justify-between pb-5 border-b border-[rgba(212,175,55,0.2)] mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C160E] to-[#12151F] border border-[#D4AF37]/40 flex items-center justify-center font-heading font-black text-sm text-[#D4AF37] shadow-inner">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading font-black text-sm text-[#F4EBD9] uppercase tracking-wide">
                        Host Portal Dashboard
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      ● Real-time Metrics
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#D4AF37] bg-[rgba(212,175,55,0.12)] px-3 py-1.5 rounded-full border border-[rgba(212,175,55,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* 3 Real KPI Metric Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#0C0E14] border border-[rgba(212,175,55,0.2)] rounded-2xl p-3.5 text-center flex flex-col justify-between">
                  <span className="font-mono text-[9px] text-[#A69B82] uppercase tracking-wider font-bold block mb-1">
                    Live Draws
                  </span>
                  <span className="font-heading text-lg sm:text-xl font-black text-[#F4EBD9]">
                    {isLoading ? "..." : stats.activeDraws}
                  </span>
                  <span className="text-[9px] font-mono text-text-muted mt-1">Platform</span>
                </div>

                <div className="bg-[#0C0E14] border border-[rgba(212,175,55,0.2)] rounded-2xl p-3.5 text-center flex flex-col justify-between">
                  <span className="font-mono text-[9px] text-[#A69B82] uppercase tracking-wider font-bold block mb-1">
                    Tickets Sold
                  </span>
                  <span className="font-heading text-lg sm:text-xl font-black text-[#D4AF37]">
                    {isLoading ? "..." : stats.ticketsSold.toLocaleString('en-GB')}
                  </span>
                  <span className="text-[9px] font-mono text-text-muted mt-1">Total Entries</span>
                </div>

                <div className="bg-[#0C0E14] border border-[rgba(212,175,55,0.2)] rounded-2xl p-3.5 text-center flex flex-col justify-between">
                  <span className="font-mono text-[9px] text-[#A69B82] uppercase tracking-wider font-bold block mb-1">
                    Total Volume
                  </span>
                  <span className="font-heading text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                    {isLoading ? "..." : formatCurrency(stats.totalEarned, 0)}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 mt-1">Escrow Synced</span>
                </div>
              </div>

              {/* Verified Platform Architecture Features */}
              <div className="bg-[#0C0E14]/80 border border-[rgba(212,175,55,0.18)] rounded-2xl p-4 mb-6">
                <span className="font-mono text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider block mb-2.5">
                  Host Operating Features
                </span>
                <div className="flex flex-col gap-2 font-mono text-[11px] text-[#C8BFAD]">
                  <div className="flex items-center justify-between">
                    <span>✓ Automated Ticket Accounting</span>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Next-Day Escrow Payouts</span>
                    <span className="text-emerald-400 font-bold">Guaranteed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Random.org Draw Automation</span>
                    <span className="text-emerald-400 font-bold">Integrated</span>
                  </div>
                </div>
              </div>

              {/* Progress & Payout Status */}
              <div className="pt-4 border-t border-[rgba(212,175,55,0.2)]">
                <div className="flex justify-between items-center text-xs text-[#A69B82] mb-2 font-mono">
                  <span>Draw Capacity Fill Rate</span>
                  <span className="text-[#D4AF37] font-black">{isLoading ? "..." : `${stats.targetPercent}%`}</span>
                </div>
                <div className="w-full h-2 bg-[#0C0E14] rounded-full overflow-hidden border border-[rgba(212,175,55,0.2)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#B39042] via-[#D4AF37] to-[#FFF0D4] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                    style={{ width: `${isLoading ? 0 : Math.max(stats.targetPercent, 0)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-[#A69B82]">
                  <span className="flex items-center gap-1.5 text-[#F4EBD9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Automated Bank Settlement
                  </span>
                  <span className="text-[#D4AF37] font-bold">10% Platform Fee</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
