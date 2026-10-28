"use client";

import React from "react";
import { Category } from "../../../services/category.service";

interface CategoryStatsCardsProps {
  categories: Category[];
  isLoading: boolean;
}

export default function CategoryStatsCards({ categories, isLoading }: CategoryStatsCardsProps) {
  const total = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = total - activeCount;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
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
      title: "Total Competition Categories",
      value: total.toLocaleString(),
      subtitle: "Catalog classifications",
      badge: "Platform Catalog",
      badgeType: "gold",
      icon: (
        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
      ),
      glowColor: "group-hover:border-primary/40",
    },
    {
      title: "Active Public Categories",
      value: activeCount.toLocaleString(),
      subtitle: "Visible on homepage & filters",
      badge: `${total > 0 ? Math.round((activeCount / total) * 100) : 0}% Active`,
      badgeType: "emerald",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
      glowColor: "group-hover:border-emerald-500/40",
    },
    {
      title: "Hidden / Draft Categories",
      value: inactiveCount.toLocaleString(),
      subtitle: "Unpublished from navigation",
      badge: inactiveCount > 0 ? `${inactiveCount} Hidden` : "All Visible",
      badgeType: inactiveCount > 0 ? "amber" : "emerald",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ),
      glowColor: "group-hover:border-amber-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
