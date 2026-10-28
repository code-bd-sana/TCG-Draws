"use client";

import React from "react";

interface WithdrawalsStatsCardsProps {
  withdrawals?: any[];
  isLoading?: boolean;
}

export default function WithdrawalsStatsCards({ withdrawals = [], isLoading }: WithdrawalsStatsCardsProps) {
  const pendingRequests = withdrawals.filter((w) => w.status === "PENDING" || w.status === "Pending");
  const pendingCount = pendingRequests.length;
  
  const totalPendingAmount = pendingRequests.reduce((acc, w) => acc + (w.amount || 0), 0);
  
  const totalCommissionEarned = withdrawals.reduce((acc, w) => {
    const fee = w.feeAmount !== undefined ? w.feeAmount : (w.amount || 0) * 0.15;
    return acc + fee;
  }, 0);

  const totalProcessedNet = withdrawals
    .filter((w) => w.status === "COMPLETED" || w.status === "APPROVED" || w.status === "Paid")
    .reduce((acc, w) => acc + (w.netAmount !== undefined ? w.netAmount : (w.amount || 0) * 0.85), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="art-deco-card rounded-card p-6 h-[140px] flex flex-col justify-between animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-elevated rounded" />
              <div className="w-10 h-10 rounded-xl bg-elevated" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-24 bg-elevated rounded" />
              <div className="h-3.5 w-32 bg-elevated rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Pending Payout Requests",
      value: pendingCount.toString(),
      subtitle: "Requests awaiting approval",
      badge: pendingCount > 0 ? `${pendingCount} Needs Action` : "Queue Clear",
      badgeType: pendingCount > 0 ? "amber" : "emerald",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-amber-500/40",
    },
    {
      title: "Gross Pending Volume",
      value: `£${totalPendingAmount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Unprocessed withdrawal capital",
      badge: "Gross Queue",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Platform Fees Retained",
      value: `£${totalCommissionEarned.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "15% platform commission cut",
      badge: "Treasury Revenue",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v8.25m0-8.25a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 23.25 6v8.25m-21 0a2.25 2.25 0 0 0 2.25 2.25h16.5a2.25 2.25 0 0 0 2.25-2.25m-21 0v3.75m21-3.75v3.75m0 0a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Processed Net Dispatched",
      value: `£${totalProcessedNet.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Net capital remitted to hosts",
      badge: "Settled Payouts",
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group ${card.glowColor}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              {card.title}
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
              {card.icon}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {card.value}
            </span>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">
                {card.subtitle}
              </span>

              {card.badgeType === "gold" && (
                <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                  {card.badge}
                </span>
              )}

              {card.badgeType === "emerald" && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                  {card.badge}
                </span>
              )}

              {card.badgeType === "amber" && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
