"use client";

import React from "react";
import { useAdminUsersStats } from "../../../hooks/useAdminHooks";

export default function UsersStatsCards() {
  const { data: stats, isLoading, isError } = useAdminUsersStats();

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

  if (isError || !stats) {
    return (
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-sans text-xs font-semibold flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <span>Failed to load user account metrics. Please refresh the page.</span>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Registered Users",
      value: stats.totalUsers.toLocaleString(),
      subtitle: "Verified platform players",
      badge: "All-Time Database",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "New Users This Month",
      value: stats.newThisMonth.toLocaleString(),
      subtitle: "New registrations",
      badge: "Current Month",
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.765Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Active Players",
      value: stats.activeUsers.toLocaleString(),
      subtitle: "In good standing",
      badge: `${stats.activePercentage}% Active`,
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Blocked Accounts",
      value: stats.blockedUsers.toLocaleString(),
      subtitle: "Access restricted",
      badge: `${stats.blockedPercentage}% Blocked`,
      badgeType: "rose",
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      ),
      glowColor: "group-hover:border-rose-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
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
            {card.badgeType === "rose" && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-sans font-bold text-[10px] tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {card.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
