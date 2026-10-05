"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { hostWalletService } from "../../../services/host-wallet.service";

interface HostRevenueChartProps {
  totalRevenue?: number;
}

export default function HostRevenueChart({ totalRevenue }: HostRevenueChartProps) {
  const [timeframe, setTimeframe] = useState("1M");

  const { data: perfData, isLoading } = useQuery({
    queryKey: ['hostPerformanceAnalytics', timeframe],
    queryFn: () => hostWalletService.getPerformanceAnalytics(timeframe),
  });

  const chartData = perfData?.revenueTrend || [];

  const displayRevenue = totalRevenue !== undefined 
    ? `£${Number(totalRevenue).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "£0.00";

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col h-full min-h-[362px] shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Earnings Overview
        </h2>
        
        {/* Time filters */}
        <div className="flex gap-1.5">
          {["7D", "1M", "3M", "1Y"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeframe(filter)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
                timeframe === filter
                  ? "bg-accent-bg border border-primary text-text-brand shadow-xs"
                  : "bg-elevated border border-border text-text-muted hover:text-text-primary hover:bg-surface"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <p className="font-heading font-black text-3xl md:text-4xl text-text-primary tracking-tight">
          {displayRevenue}
        </p>
        <div className="bg-success-bg border border-[#BBF7D0] rounded-full px-2.5 py-1 flex items-center justify-center">
          <p className="font-sans font-bold text-[11px] text-success-text uppercase tracking-wide">
            ▲ Live
          </p>
        </div>
      </div>

      <div className="flex-1 w-full pt-5 relative min-h-[200px]">
        {isLoading ? (
          <div className="w-full h-full min-h-[180px] flex items-center justify-center text-text-muted font-sans text-xs animate-pulse">
            Loading earnings trend...
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full min-h-[180px] flex items-center justify-center text-text-muted font-sans text-xs">
            No sales recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHostRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0b4d35" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0b4d35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#5e766c", fontSize: 11, fontFamily: "sans-serif" }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#5e766c", fontSize: 11, fontFamily: "sans-serif" }}
                tickFormatter={(val) => `£${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              <Tooltip
                cursor={{ stroke: "#E2EADF", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{ 
                  backgroundColor: "#FFFFFF", 
                  borderColor: "#E2EADF", 
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontFamily: "sans-serif"
                }}
                itemStyle={{ color: "#0b4d35", fontWeight: "bold" }}
                formatter={(value: any) => [
                  `£${Number(value || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                  "Earnings"
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0b4d35" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorHostRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
