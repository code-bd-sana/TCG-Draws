"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

const COLORS = [
  "#D4AF37", // Primary Metallic Gold
  "#F5E5C0", // Bright Light Gold
  "#8C6D2D", // Antique Bronze Gold
  "#38BDF8", // Sky Blue Accent
  "#10B981", // Emerald
  "#64748B", // Slate
];

export default function PlanDistributionChart() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const chartData = useMemo(() => {
    if (!stats || !stats.planDistribution) return [];

    return stats.planDistribution.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));
  }, [stats]);

  const totalSubscriptions = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [chartData]);

  return (
    <div className="art-deco-card rounded-card p-5 sm:p-6 flex flex-col w-full self-start shadow-card border border-border">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-divider mb-5">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
            Plan Distribution
          </span>
          <span className="font-sans text-xs text-text-muted">
            Host merchant tier allocations
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-heading font-black text-[10px] uppercase tracking-wider">
          {totalSubscriptions} Total
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-xs text-text-muted">Loading tier analytics...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] gap-2 text-center p-6">
          <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xs text-text-primary">No subscriptions recorded</span>
          <span className="font-sans text-[11px] text-text-muted">Active memberships will appear here.</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          
          {/* Donut Chart Container */}
          <div className="w-full h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface border border-primary/40 rounded-xl px-3 py-2 shadow-2xl font-sans text-xs flex flex-col gap-0.5">
                          <span className="font-heading font-bold text-text-primary">{data.name}</span>
                          <span className="text-text-brand font-black">{data.value} Subscribers ({data.percentage})</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading font-black text-2xl text-text-primary leading-none">
                {totalSubscriptions}
              </span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted mt-0.5">
                Plans
              </span>
            </div>
          </div>

          {/* Breakdown Legend Section */}
          <div className="w-full flex flex-col gap-2.5 pt-4 border-t border-divider">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-elevated/40 border border-border-medium hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-heading font-bold text-xs text-text-primary truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-heading font-black text-xs text-text-brand">
                    {item.value}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface border border-border font-sans font-semibold text-[10px] text-text-muted">
                    {item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
