"use client";

import React from "react";

interface UserTicketStatsCardsProps {
  totalOwned: number;
  activeTickets: number;
  wonTickets: number;
  unpaidOrdersCount: number;
  onViewUnpaid?: () => void;
}

export const UserTicketStatsCards: React.FC<UserTicketStatsCardsProps> = ({
  totalOwned,
  activeTickets,
  wonTickets,
  unpaidOrdersCount,
  onViewUnpaid,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Confirmed Tickets */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Confirmed Tickets
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-heading font-black text-text-primary">
            {totalOwned}
          </span>
          <span className="text-[11px] font-mono text-emerald-400">allocated entries</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Verified lifetime raffle numbers
        </p>
      </div>

      {/* 2. Live Draw Tickets */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Live Draw Entries
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-heading font-black text-[#D4AF37]">
            {activeTickets}
          </span>
          <span className="text-[11px] font-mono text-[#F5E5C0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Awaiting draw
          </span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          In active rotation for upcoming draws
        </p>
      </div>

      {/* 3. Winning Entries */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Winning Entries
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0V5.625c0-.621-.504-1.125-1.125-1.125h-4.25c-.621 0-1.125.504-1.125 1.125v8.625m6.5 0h-6.5" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-heading font-black text-amber-400">
            {wonTickets}
          </span>
          <span className="text-[11px] font-mono text-amber-400/80">prizes claimed</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Instant wins and main draw victories
        </p>
      </div>

      {/* 4. Pending Checkout Orders */}
      <div
        onClick={unpaidOrdersCount > 0 ? onViewUnpaid : undefined}
        className={`art-deco-card p-5 rounded-2xl relative overflow-hidden group transition-all ${
          unpaidOrdersCount > 0
            ? "border-amber-500/40 hover:border-amber-400 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            : ""
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Unpaid Orders
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              unpaidOrdersCount > 0
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                : "bg-white/5 border border-white/10 text-text-muted"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl lg:text-3xl font-heading font-black ${
              unpaidOrdersCount > 0 ? "text-amber-400" : "text-text-primary"
            }`}
          >
            {unpaidOrdersCount}
          </span>
          <span
            className={`text-[11px] font-mono ${
              unpaidOrdersCount > 0 ? "text-amber-400" : "text-text-muted"
            }`}
          >
            {unpaidOrdersCount > 0 ? "action needed" : "all settled"}
          </span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          {unpaidOrdersCount > 0
            ? "Click to review and complete checkout"
            : "No pending checkout transactions"}
        </p>
      </div>
    </div>
  );
};
