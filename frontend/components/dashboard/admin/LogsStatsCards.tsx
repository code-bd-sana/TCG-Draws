"use client";

import React from "react";
import { LogData } from "../../../services/admin.service";

interface LogsStatsCardsProps {
  logs: LogData[];
  totalLogs: number;
  isLoading: boolean;
}

export default function LogsStatsCards({ logs, totalLogs, isLoading }: LogsStatsCardsProps) {
  const adminEvents = logs.filter((l) => l.actor.type === "admin").length;
  const systemEvents = logs.filter((l) => l.actor.type === "system").length;
  const failedEvents = logs.filter((l) => l.status === "Failed").length;

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
      title: "Total Audit Records",
      value: totalLogs.toLocaleString(),
      subtitle: "Recorded ledger transactions",
      badge: "Immutable Trail",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Admin Authorizations",
      value: adminEvents.toLocaleString(),
      subtitle: "Privileged administrator actions",
      badge: "Operator Audits",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "System Telemetry Events",
      value: systemEvents.toLocaleString(),
      subtitle: "Automated cron & draw tasks",
      badge: "Engine Stream",
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Failed Operations",
      value: failedEvents.toLocaleString(),
      subtitle: "Exceptions or rejected actions",
      badge: failedEvents > 0 ? `${failedEvents} Alerts` : "Clean Health",
      badgeType: failedEvents > 0 ? "rose" : "emerald",
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
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

              {card.badgeType === "rose" && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-sans font-bold text-[10px] uppercase tracking-wider">
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
