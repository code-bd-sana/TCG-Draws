"use client";

import React from "react";
import { useAdminUsersStats } from "../../../hooks/useAdminHooks";

export default function UsersStatsCards() {
  const { data: stats, isLoading, isError } = useAdminUsersStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-card h-[120px] shadow-card" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return <div className="text-[#DC2626] font-bold text-xs">Failed to load statistics.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      
      {/* Total Users */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Registered Users
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {stats.totalUsers.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-text-brand">All time</span>
            </div>
          </div>
        </div>
      </div>

      {/* New This Month */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          New Users This Month
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {stats.newThisMonth.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">This month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Active Players
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {stats.activeUsers.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">{stats.activePercentage}% active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Blocked Accounts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {stats.blockedUsers.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-[#DC2626]">{stats.blockedPercentage}% blocked</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
