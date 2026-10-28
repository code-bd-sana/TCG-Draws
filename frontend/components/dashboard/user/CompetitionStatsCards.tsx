"use client";

import React from "react";
import { Raffle } from "@/services/raffle.service";

interface CompetitionStatsCardsProps {
  raffles: Raffle[];
  totalCount?: number;
  isLoading?: boolean;
}

export const CompetitionStatsCards: React.FC<CompetitionStatsCardsProps> = ({
  raffles,
  totalCount,
  isLoading,
}) => {
  const now = new Date();

  // Compute metrics from current page/list of raffles
  const activeCount = totalCount !== undefined ? totalCount : raffles.filter((r) => {
    const end = new Date(r.endDate);
    const start = new Date(r.startDate);
    return start <= now && end >= now;
  }).length;

  const endingSoonCount = raffles.filter((r) => {
    const end = new Date(r.endDate);
    const hoursLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 48;
  }).length;

  const guaranteedCount = raffles.filter((r) => r.guaranteedDraw).length;

  const lowestPrice = raffles.length > 0
    ? Math.min(...raffles.map((r) => Number(r.pricePerTicket) || 0))
    : 0.99;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Active Competitions */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Live Competitions
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-text-primary">
              {activeCount}
            </span>
          )}
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Now
          </span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Open for immediate ticket entries
        </p>
      </div>

      {/* 2. Lowest Entry */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Entry From
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-20 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-[#D4AF37]">
              £{lowestPrice > 0 ? lowestPrice.toFixed(2) : "0.99"}
            </span>
          )}
          <span className="text-[11px] font-mono text-[#F5E5C0]">per ticket</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Affordable low-tier ticket draws
        </p>
      </div>

      {/* 3. Ending Soon */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Ending Soon (48h)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-amber-400">
              {endingSoonCount}
            </span>
          )}
          <span className="text-[11px] font-mono text-amber-400/80">closing fast</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Final allocation countdown
        </p>
      </div>

      {/* 4. Guaranteed Draws */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Guaranteed Draws
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-indigo-300">
              {guaranteedCount || "100%"}
            </span>
          )}
          <span className="text-[11px] font-mono text-indigo-400">verified</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Draws take place regardless of sellout
        </p>
      </div>
    </div>
  );
};
