"use client";

import React from "react";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

export default function SubscriptionStatsCards() {
  const { data: stats, isLoading, isError } = useAdminSubscriptionStats();

  const getPlanData = (planName: string) => {
    return (
      stats?.planDistribution?.find(
        (p) => p.name.toLowerCase() === planName.toLowerCase()
      ) || { value: 0, percentage: "0%" }
    );
  };

  const premiumPlan = getPlanData("Premium");
  const proPlan = getPlanData("Pro");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-sans text-xs font-semibold flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <span>Failed to load subscription metrics. Please refresh the page.</span>
      </div>
    );
  }

  const cards = [
    {
      title: "Monthly Recurring Revenue",
      value: `£${stats?.mrr?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"}`,
      subtitle: "Predictable automated billing",
      badge: "Active MRR",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v8.25m0-8.25h16.5m0 0v.75a.75.75 0 0 0 .75.75h.75m0 0v8.25m0 0a60.08 60.08 0 0 1-16.5 0m16.5 0h.75m-17.25 0h-.75M6.75 10.5h10.5M6.75 13.5h7.5" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Total Active Subscribers",
      value: (stats?.totalActive ?? 0).toLocaleString(),
      subtitle: "Paying host merchants",
      badge: "Active Accounts",
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Pro Tier Memberships",
      value: proPlan.value.toLocaleString(),
      subtitle: `${proPlan.percentage} of total subscriber base`,
      badge: "Pro Plan",
      badgeType: "cyan",
      icon: (
        <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      glowColor: "group-hover:border-sky-500/40",
    },
    {
      title: "Premium Tier Memberships",
      value: premiumPlan.value.toLocaleString(),
      subtitle: `${premiumPlan.percentage} of total subscriber base`,
      badge: "Enterprise",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`art-deco-card rounded-card p-6 flex flex-col justify-between shadow-card transition-all duration-300 hover:-translate-y-0.5 group ${card.glowColor}`}
        >
          {/* Card Top: Title & Icon */}
          <div className="flex items-start justify-between gap-3">
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              {card.title}
            </span>
            <div className="w-10 h-10 rounded-xl bg-elevated border border-border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
              {card.icon}
            </div>
          </div>

          {/* Card Middle: Big Value */}
          <div className="flex flex-col gap-1 mt-3">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none tracking-tight">
              {card.value}
            </span>
            <span className="font-sans text-xs text-text-muted font-medium mt-1">
              {card.subtitle}
            </span>
          </div>

          {/* Card Bottom: Badge */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-divider">
            {card.badgeType === "gold" && (
              <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] tracking-wide uppercase">
                {card.badge}
              </span>
            )}
            {card.badgeType === "emerald" && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {card.badge}
              </span>
            )}
            {card.badgeType === "cyan" && (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-sans font-bold text-[10px] tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                {card.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
