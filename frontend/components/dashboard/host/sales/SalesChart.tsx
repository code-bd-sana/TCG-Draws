"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { HostSalesChartDataPoint } from "../../../../types/host-dashboard.types";

interface Props {
  data: HostSalesChartDataPoint[];
}

export default function SalesChart({ data }: Props) {
  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
            Revenue Overview
          </h3>
          <p className="font-sans text-xs text-text-muted">
            Ticket sales across all active competitions over time.
          </p>
        </div>
        <select className="bg-elevated border border-border-medium rounded-xl px-3 py-2 font-sans font-bold text-xs text-text-primary outline-none hover:border-primary transition-all cursor-pointer">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0b4d35" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0b4d35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EADF" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#5e766c", fontSize: 12, fontFamily: "Inter", fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#5e766c", fontSize: 12, fontFamily: "Inter", fontWeight: 500 }}
              tickFormatter={(val) => `£${val}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#FFFFFF", 
                border: "1px solid #E2EADF",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontFamily: "Inter"
              }}
              itemStyle={{ color: "#0e1e17", fontWeight: "bold" }}
              labelStyle={{ color: "#0b4d35", fontWeight: "bold", marginBottom: "4px" }}
              formatter={(value: any) => [`£${value}`, "Revenue"]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0b4d35" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
