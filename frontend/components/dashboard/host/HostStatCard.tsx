import React from "react";
import { HostDashboardStat } from "../../../types/host-dashboard.types";
import { cn } from "../../../lib/utils";

interface HostStatCardProps {
  stat: HostDashboardStat;
}

export default function HostStatCard({ stat }: HostStatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-5 md:p-6 flex flex-col justify-between h-[120px] w-full shadow-card hover:border-border-medium transition-all duration-200">
      <div className="w-full">
        <p className="font-sans font-bold text-[11px] leading-tight tracking-wider uppercase text-text-muted">
          {stat.label}
        </p>
      </div>
      <div className="w-full flex items-end justify-between mt-auto gap-2">
        <div className="flex items-center">
          <p className="font-heading font-black text-2xl md:text-3xl leading-none text-text-primary tracking-tight">
            {stat.value}
          </p>
        </div>
        {stat.change && (
          <div className={cn(
            "rounded-full px-2.5 py-1 flex items-center gap-1 border shrink-0",
            stat.trend === "up" ? "bg-success-bg border-[#BBF7D0] text-success-text" : "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]"
          )}>
            <span className="font-sans font-bold text-[10px] leading-none tracking-wide uppercase">
              {stat.change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
