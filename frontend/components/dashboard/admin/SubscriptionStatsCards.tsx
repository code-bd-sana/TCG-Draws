"use client";

import React from "react";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

export default function SubscriptionStatsCards() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const getPlanData = (planName: string) => {
    return stats?.planDistribution?.find(p => p.name.toLowerCase() === planName.toLowerCase()) || { value: 0, percentage: "0%" };
  };

  const premiumPlan = getPlanData("Premium");
  const proPlan = getPlanData("Pro");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* Premium Subscribers */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Premium Tier Subscribers
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : premiumPlan.value}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">{premiumPlan.percentage} of total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Subscribers */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Pro Tier Subscribers
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : proPlan.value}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">{proPlan.percentage} of total</span>
            </div>
          </div>
        </div>
      </div>

      {/* MRR */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Monthly Recurring Revenue (MRR)
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : `£${stats?.mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-text-brand">Active Subscriptions</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
