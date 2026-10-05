"use client";

import React, { useState } from "react";
import RevenueTrendChart from "../../../../components/dashboard/host/performance/RevenueTrendChart";
import CategorySalesChart from "../../../../components/dashboard/host/performance/CategorySalesChart";
import TopRafflesList from "../../../../components/dashboard/host/performance/TopRafflesList";
import DemographicsList from "../../../../components/dashboard/host/performance/DemographicsList";
import { useHostPerformanceAnalytics } from "../../../../hooks/useHostWalletHooks";
import { cn } from "../../../../lib/utils";

const TIMEFRAMES = ["7D", "1M", "3M", "1Y"];

export default function PerformanceStatsPage() {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  const { data: perfData, isLoading, error } = useHostPerformanceAnalytics(activeTimeframe);

  if (isLoading) {
    return (
      <div className="flex-1 w-full px-5 lg:px-10 py-6 lg:py-8 flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-surface rounded-lg" />
          <div className="h-10 w-48 bg-surface rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[380px] bg-surface border border-border rounded-card" />
          <div className="lg:col-span-1 h-[380px] bg-surface border border-border rounded-card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[280px] bg-surface border border-border rounded-card" />
          <div className="h-[280px] bg-surface border border-border rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full px-5 lg:px-10 py-6 lg:py-8 flex flex-col items-center justify-center text-center gap-3">
        <p className="font-sans font-bold text-sm text-red-500">Failed to load performance analytics data.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-5 lg:px-10 py-6 lg:py-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header & Timeframe Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
            Performance Analytics
          </h1>
          <p className="font-sans text-xs md:text-sm text-text-muted">
            Track competition revenue trends, category breakdowns, and entrant demographics.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border-medium w-fit select-none">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={cn(
                "h-8 px-3 rounded-lg flex items-center justify-center font-heading font-bold text-xs transition-all cursor-pointer",
                activeTimeframe === tf
                  ? "bg-surface text-text-brand border border-border shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Revenue Trend & Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={perfData?.revenueTrend || []} />
        </div>
        <div className="lg:col-span-1">
          <CategorySalesChart data={perfData?.categorySales || []} />
        </div>
      </div>

      {/* Bottom Row: Top Raffles & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRafflesList data={perfData?.topRaffles || []} />
        <DemographicsList data={perfData?.demographics || []} />
      </div>

    </div>
  );
}
