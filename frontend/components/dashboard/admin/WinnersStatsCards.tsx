"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { winnerService } from "../../../services/winner.service";

export default function WinnersStatsCards() {
  const { data: allWinners, isLoading: loadingAll } = useQuery({
    queryKey: ["adminWinnersStats", "All"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1 }),
  });

  const { data: pendingVerifications, isLoading: loadingVerify } = useQuery({
    queryKey: ["adminWinnersStats", "Pending Verification"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1, verificationStatus: "PENDING" }),
  });

  const { data: pendingDeliveries, isLoading: loadingDelivery } = useQuery({
    queryKey: ["adminWinnersStats", "Pending Delivery"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1, status: "PENDING" }),
  });

  const { data: instantWinners, isLoading: loadingInstant } = useQuery({
    queryKey: ["adminWinnersStats", "Instant Win"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1, winType: "INSTANT_WIN" }),
  });

  const isLoading = loadingAll || loadingVerify || loadingDelivery || loadingInstant;

  const totalCount = allWinners?.meta?.total || 0;
  const pendingVerifyCount = pendingVerifications?.meta?.total || 0;
  const pendingDeliveryCount = pendingDeliveries?.meta?.total || 0;
  const instantWinCount = instantWinners?.meta?.total || 0;

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
      title: "Total Platform Winners",
      value: totalCount.toLocaleString(),
      subtitle: "All verified & historical winners",
      badge: "All-Time Draws",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.496 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492c.981.142 1.953.316 2.916.52a6.003 6.003 0 0 1-5.405 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Pending Verifications",
      value: pendingVerifyCount.toLocaleString(),
      subtitle: "Claims awaiting admin audit",
      badge: pendingVerifyCount > 0 ? "Action Required" : "All Clear",
      badgeType: pendingVerifyCount > 0 ? "amber" : "emerald",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      ),
      glowColor: "group-hover:border-amber-500/40",
    },
    {
      title: "Prizes in Fulfillment",
      value: pendingDeliveryCount.toLocaleString(),
      subtitle: "Dispatched or pending shipping",
      badge: "Fulfillment Pipeline",
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5A2.25 2.25 0 0 0 12 2.25H4.5A2.25 2.25 0 0 0 2.25 4.5v9.75m14.25-6.75h3.69" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Instant Win Champions",
      value: instantWinCount.toLocaleString(),
      subtitle: "Instant ticket prize drops",
      badge: "Instant Drops",
      badgeType: "purple",
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
      glowColor: "group-hover:border-purple-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div 
          key={idx}
          className={`art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group ${card.glowColor}`}
        >
          {/* Top row: Title & Icon */}
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              {card.title}
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
              {card.icon}
            </div>
          </div>

          {/* Bottom row: Value & Badge */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
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

              {card.badgeType === "purple" && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-sans font-bold text-[10px] uppercase tracking-wider">
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
