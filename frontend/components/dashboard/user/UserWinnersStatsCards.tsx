"use client";

import React from "react";
import { UserWinner } from "@/services/user.service";

interface UserWinnersStatsCardsProps {
  winners: UserWinner[];
  isLoading?: boolean;
}

export const UserWinnersStatsCards: React.FC<UserWinnersStatsCardsProps> = ({
  winners,
  isLoading,
}) => {
  const totalWins = winners.length;
  const instantWins = winners.filter((w) => w.winType === "INSTANT_WIN").length;
  const mainDrawWins = winners.filter((w) => w.winType === "MAIN_DRAW").length;

  const totalPrizeValue = winners.reduce((sum, w) => {
    return sum + (Number(w.rrpValue) || 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Total Won Prizes */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Total Won Prizes
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0V5.625c0-.621-.504-1.125-1.125-1.125h-4.25c-.621 0-1.125.504-1.125 1.125v8.625m6.5 0h-6.5" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-[#D4AF37]">
              {totalWins}
            </span>
          )}
          <span className="text-[11px] font-mono text-[#F5E5C0]">lifetime claims</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Prizes claimed across all competitions
        </p>
      </div>

      {/* 2. Instant Wins */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Instant Wins
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-amber-400">
              {instantWins}
            </span>
          )}
          <span className="text-[11px] font-mono text-amber-400/80">ticket matches</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Matched instantly on ticket allocation
        </p>
      </div>

      {/* 3. Main Draw Victories */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Main Draw Victories
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-emerald-400">
              {mainDrawWins}
            </span>
          )}
          <span className="text-[11px] font-mono text-emerald-400/80">grand prizes</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Verified winners in official draws
        </p>
      </div>

      {/* 4. Total Prize Value */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Total Prize Value
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-text-primary">
              £{totalPrizeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
          <span className="text-[11px] font-mono text-purple-400">est. value</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Cumulative market valuation of won prizes
        </p>
      </div>
    </div>
  );
};
