"use client";

import React from "react";

export interface TransactionItem {
  id: string;
  transactionId: string;
  orderNumber?: string;
  date: string;
  rawDate?: string;
  description: string;
  amount: string;
  rawAmount: number;
  paymentMethod: string;
  status: string;
  ticketsCount: number;
}

interface UserTransactionStatsCardsProps {
  transactions: TransactionItem[];
  isLoading?: boolean;
}

export const UserTransactionStatsCards: React.FC<UserTransactionStatsCardsProps> = ({
  transactions,
  isLoading,
}) => {
  const completed = transactions.filter((t) => t.status === "completed");
  const totalSpent = completed.reduce((sum, t) => sum + t.rawAmount, 0);
  const completedCount = completed.length;
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const totalTickets = completed.reduce((sum, t) => sum + t.ticketsCount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Total Completed Spending */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Total Completed Spend
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-[#D4AF37]">
              £{totalSpent.toFixed(2)}
            </span>
          )}
          <span className="text-[11px] font-mono text-[#F5E5C0]">GBP</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Lifetime ticket purchases settled
        </p>
      </div>

      {/* 2. Successful Transactions */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Successful Orders
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-emerald-400">
              {completedCount}
            </span>
          )}
          <span className="text-[11px] font-mono text-emerald-400/80">paid receipts</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Cryptographically confirmed payments
        </p>
      </div>

      {/* 3. Pending Checkout */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Pending Orders
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
              {pendingCount}
            </span>
          )}
          <span className="text-[11px] font-mono text-amber-400/80">awaiting settlement</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Reserved allocations awaiting payment
        </p>
      </div>

      {/* 4. Total Tickets Purchased */}
      <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Tickets Purchased
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ) : (
            <span className="text-2xl lg:text-3xl font-heading font-black text-indigo-300">
              {totalTickets}
            </span>
          )}
          <span className="text-[11px] font-mono text-indigo-400">entries</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Draw numbers issued through payment
        </p>
      </div>
    </div>
  );
};
