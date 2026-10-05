"use client";

import React from "react";
import SalesMetricsCards from "../../../../components/dashboard/host/sales/SalesMetricsCards";
import SalesChart from "../../../../components/dashboard/host/sales/SalesChart";
import SalesBreakdownTable from "../../../../components/dashboard/host/sales/SalesBreakdownTable";
import { useHostSalesAnalytics } from "../../../../hooks/useHostWalletHooks";

export default function CompetitionSalesPage() {
  const { data: salesData, isLoading, error } = useHostSalesAnalytics();

  if (isLoading) {
    return (
      <div className="flex-1 w-full px-5 lg:px-10 py-6 lg:py-8 flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-surface rounded-lg" />
          <div className="h-4 w-96 bg-surface rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface border border-border rounded-card" />
          ))}
        </div>
        <div className="h-80 bg-surface border border-border rounded-card" />
        <div className="h-64 bg-surface border border-border rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full px-5 lg:px-10 py-6 lg:py-8 flex flex-col items-center justify-center text-center gap-3">
        <p className="font-sans font-bold text-sm text-red-500">Failed to load sales analytics data.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-5 lg:px-10 py-6 lg:py-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Competition Sales
        </h1>
        <p className="font-sans text-xs md:text-sm text-text-muted">
          Monitor your gross revenue, net payouts, ticket sales, and individual competition performance.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <SalesMetricsCards metrics={salesData?.metrics} />

      {/* Sales Trend Chart */}
      <SalesChart data={salesData?.chartData || []} />

      {/* Competition Breakdown Table */}
      <SalesBreakdownTable
        raffles={salesData?.raffles || []}
        netPercentage={salesData?.netPercentage ?? salesData?.metrics?.netPercentage ?? 85}
      />
    </div>
  );
}
