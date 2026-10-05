"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { raffleService, RecentWinner } from '@/services/raffle.service';

/**
 * Recent Winners section — premium light-themed winner cards.
 */
export default function WinnersSection() {
  const [winners, setWinners] = useState<RecentWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    raffleService.getRecentWinners()
      .then(data => setWinners(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || winners.length === 0) return null;

  return (
    <section id="recent-winners" className="py-20 bg-white border-t border-[#EFF4ED]">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#dc2626] block mb-2">Community Wins</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0b4d35]">Recent Winners</h2>
          <p className="font-sans text-sm text-[#5e766c] mt-3 max-w-md mx-auto leading-relaxed">
            Real golfers, real premium prizes. See our most recent lucky winners and their verified prize deliveries.
          </p>
        </div>

        {/* Winners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="group bg-[#F8FAF6] border border-[#0b4d35]/12 rounded-[20px] p-6 flex flex-col justify-between hover:border-[#0b4d35]/35 hover:shadow-xl hover:shadow-emerald-900/8 transition-all duration-300"
            >
              {/* Avatar + Status */}
              <div className="flex items-center justify-between mb-5">
                {winner.avatarUrl ? (
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#0b4d35]/15 shadow-sm">
                    <Image src={winner.avatarUrl} alt={winner.name} fill unoptimized sizes="48px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#0b4d35]/10 border border-[#0b4d35]/15 flex items-center justify-center font-serif font-black text-[#0b4d35] text-sm shadow-sm">
                    {winner.initials}
                  </div>
                )}

                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[9px] font-black text-emerald-700 tracking-wide uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.75 3.75 0 0 1 21 12Z" />
                  </svg>
                  {winner.statusText}
                </span>
              </div>

              {/* Name + Location */}
              <h3 className="font-serif font-black text-base text-[#0b4d35] mb-0.5">{winner.name}</h3>
              <p className="font-sans text-[11px] text-[#5e766c] mb-4">{winner.location}</p>

              {/* Divider */}
              <div className="h-px bg-[#EFF4ED] my-3" />

              {/* Prize */}
              <div className="mb-4">
                <span className="text-[9px] text-[#5e766c] uppercase tracking-wider font-bold block mb-1">Prize Won</span>
                <span className="font-serif font-bold text-sm text-[#0b4d35] line-clamp-2">{winner.prizeWon}</span>
              </div>

              {/* Timestamp */}
              <p className="font-sans text-[10px] text-[#5e766c] italic mt-auto">
                {formatDistanceToNow(new Date(winner.whenWon), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
