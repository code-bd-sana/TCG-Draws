"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { PerformanceRevenueDataPoint } from "../../../../types/host-dashboard.types";

interface Props {
  data: PerformanceRevenueDataPoint[];
}

export default function RevenueTrendChart({ data = [] }: Props) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col h-[380px] shadow-card">
      <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight mb-6">
        Revenue Trend
      </h3>
      
      <div className="flex-1 w-full relative -ml-[15px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenuePerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#A69B82", fontSize: 12, fontFamily: "Inter", fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#A69B82", fontSize: 12, fontFamily: "Inter", fontWeight: 500 }}
              tickFormatter={(val) => `£${val / 1000}k`}
              dx={-10}
            />
            <Tooltip
              cursor={{ stroke: "rgba(212, 175, 55, 0.4)", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{ 
                backgroundColor: "#12151F", 
                borderColor: "rgba(212, 175, 55, 0.3)", 
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
                color: "#F4EBD9",
                fontFamily: "Inter"
              }}
              itemStyle={{ color: "#D4AF37", fontWeight: "bold" }}
              formatter={(value: any) => [`£${value}`, "Revenue"]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#D4AF37" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenuePerf)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
