"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

const COLORS = [
  "#0b4d35", // Deep Forest Green
  "#15803D", // Vibrant Green
  "#8CB34A", // Light Sage
  "#D97706", // Amber
  "#64748B", // Slate
];

export default function PlanDistributionChart() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const chartData = useMemo(() => {
    if (!stats || !stats.planDistribution) return [];

    return stats.planDistribution.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));
  }, [stats]);

  return (
    <div className="bg-surface border border-border rounded-card p-4 sm:p-6 flex flex-col w-full self-start shadow-card">
      <span className="font-heading font-black text-base text-text-primary uppercase tracking-tight mb-4 sm:mb-6">
        Plan Distribution
      </span>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <span className="font-sans text-xs text-text-muted">Loading chart data...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <span className="font-sans text-xs text-text-muted">No active subscriptions found.</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-6">

          {/* Chart Container */}
          <div className="w-full sm:flex-1 h-[180px] sm:h-[220px] relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Section */}
          <div className="w-full sm:w-[150px] flex flex-wrap sm:flex-col items-center sm:items-start justify-center gap-2.5 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-divider">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-elevated/60 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none border border-border-medium/40 sm:border-none shadow-xs sm:shadow-none min-w-[120px] sm:min-w-0"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
{/* overflow section */}

                <div className="flex items-baseline gap-1.5 flex-1 overflow-hidden">
                  <span className="font-heading font-bold text-xs text-text-primary truncate max-w-[65px]" title={item.name}>
                    {item.name}
                  </span>
                  <span className="font-heading font-black text-xs text-text-primary ml-auto">
                    {item.value}
                  </span>
                  <span className="font-sans text-[11px] text-text-muted">
                    ({item.percentage})
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
