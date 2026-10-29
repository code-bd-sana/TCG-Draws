"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { raffleService, RecentWinner } from '@/services/raffle.service';

/**
 * Recent Winners section — luxury dark-themed winner cards with gold accents.
 * Only displays verified winners from the real database.
 * If no winners exist yet, this section remains hidden.
 */
export default function WinnersSection() {
  const [winners, setWinners] = useState<RecentWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    raffleService.getRecentWinners()
      .then(data => {
        if (data && data.length > 0) {
          setWinners(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Strict check: No fake data. If no real winners exist, do not render.
  if (loading || winners.length === 0) {
    return null;
  }

  return (
    <section id="recent-winners" className="relative py-24 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[300px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-8 border-b border-[rgba(212,175,55,0.15)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-heading font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                Community Hall of Fame
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] uppercase tracking-tight">
              Recent Grail Winners
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-2 max-w-xl leading-relaxed">
              Real collectors, genuine PSA 10 slabs. Every winner is verified on stream with tracked, insured next-day Royal Mail courier delivery.
            </p>
          </div>

          <Link
            href="/winners"
            className="btn-gold-metallic px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <span>View All Winners</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Real Winners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {winners.slice(0, 4).map((winner) => (
            <div
              key={winner.id}
              className="art-deco-card rounded-3xl p-6 flex flex-col justify-between group hover:border-[#D4AF37]/50 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.18)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Corner gold flare */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

              {/* Avatar + Status */}
              <div className="flex items-center justify-between mb-5">
                {winner.avatarUrl ? (
                  <div className="relative w-13 h-13 rounded-2xl overflow-hidden border border-[rgba(212,175,55,0.4)] shadow-md">
                    <Image src={winner.avatarUrl} alt={winner.name} fill unoptimized sizes="52px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-[#141722] border border-[rgba(212,175,55,0.4)] flex items-center justify-center font-heading font-black text-[#D4AF37] text-base shadow-inner group-hover:border-[#D4AF37] transition-colors">
                    {winner.initials}
                  </div>
                )}

                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {winner.statusText}
                </span>
              </div>

              {/* Name + Location */}
              <div className="mb-4">
                <h3 className="font-heading font-black text-lg text-[#F4EBD9] group-hover:text-[#D4AF37] transition-colors">
                  {winner.name}
                </h3>
                {winner.location && (
                  <p className="font-mono text-[11px] text-[#A69B82] mt-0.5">
                    📍 {winner.location}
                  </p>
                )}
              </div>

              {/* Prize Details Box */}
              <div className="bg-[#090A0E]/70 border border-[rgba(212,175,55,0.2)] rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#A69B82] uppercase tracking-wider font-mono font-bold">
                    Prize Won
                  </span>
                  <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
                    ✦ VERIFIED
                  </span>
                </div>
                <span className="font-heading font-bold text-sm text-[#F4EBD9] line-clamp-2 leading-snug">
                  {winner.prizeWon}
                </span>
              </div>

              {/* Bottom Timestamp & Verification */}
              <div className="pt-3 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between text-[11px] font-mono text-[#A69B82]">
                <span className="text-emerald-400 font-bold">✓ Insured Courier</span>
                {winner.whenWon && (
                  <span className="italic text-[#A69B82]/80">
                    {formatDistanceToNow(new Date(winner.whenWon), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
