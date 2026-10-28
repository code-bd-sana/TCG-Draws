"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../../services/admin.service";

export default function HostsStatsCards() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-hosts-stats'],
    queryFn: () => adminService.getHostStats(),
    staleTime: 60 * 1000,
  });

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
        <span>Failed to load host operator metrics. Please refresh the page.</span>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Registered Hosts",
      value: (stats?.totalHosts ?? 0).toLocaleString(),
      subtitle: "Platform partner merchants",
      badge: "All Operators",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm2.25-3h.008v.008H6.75v-.008Zm0 3h.008v.008H6.75v-.008Zm2.25-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm2.25-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Active Verified Hosts",
      value: (stats?.activeHosts ?? 0).toLocaleString(),
      subtitle: "Verified & selling live",
      badge: "Operational",
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Pending Approval",
      value: (stats?.pendingHosts ?? 0).toLocaleString(),
      subtitle: "Awaiting admin review",
      badge: (stats?.pendingHosts ?? 0) > 0 ? "Requires Review" : "Up to Date",
      badgeType: (stats?.pendingHosts ?? 0) > 0 ? "amber" : "emerald",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-amber-500/40",
    },
    {
      title: "Blocked / Suspended",
      value: (stats?.blockedHosts ?? 0).toLocaleString(),
      subtitle: "Access restricted",
      badge: "Suspended",
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
            {card.badgeType === "amber" && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
