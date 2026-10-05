"use client";

import React from "react";
import { PerformanceDemographic } from "../../../../types/host-dashboard.types";

interface Props {
  data: PerformanceDemographic[];
}

export default function DemographicsList({ data = [] }: Props) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col flex-1 shadow-card">
      <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight mb-6">
        Entrant Demographics
      </h3>
      
      <div className="flex flex-col gap-5">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-bold text-text-primary">
                {item.region}
              </span>
              <span className="font-sans font-bold text-text-brand">
                {item.percentage}%
              </span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-elevated h-2 rounded-full overflow-hidden border border-border-medium">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
