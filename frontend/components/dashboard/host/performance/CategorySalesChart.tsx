"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PerformanceCategorySales } from "../../../../types/host-dashboard.types";

interface Props {
  data: PerformanceCategorySales[];
}

export default function CategorySalesChart({ data = [] }: Props) {
  // Use forest green & warm sage harmonious colors for pie chart
  const updatedData = data.map((d, i) => ({
    ...d,
    color: d.color || (i === 0 ? "#0b4d35" : i === 1 ? "#15803d" : i === 2 ? "#8cb34a" : "#dc2626")
  }));

  return (
    <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col h-[380px] shadow-card">
      <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight mb-6">
        Sales by Category
      </h3>
      
      <div className="flex-1 w-full flex items-center justify-between">
        
        {/* Pie Chart */}
        <div className="relative w-1/2 h-[200px] flex items-center justify-center -ml-[20px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={updatedData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {updatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#FFFFFF", 
                  borderColor: "#E2EADF", 
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  color: "#0e1e17",
                  fontFamily: "Inter"
                }}
                itemStyle={{ color: "#0b4d35", fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 flex-1 pl-6">
          {updatedData.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="font-heading font-bold text-xs text-text-primary">
                  {item.name}
                </span>
              </div>
              <span className="font-heading font-black text-xs text-text-brand">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
