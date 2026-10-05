"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../../services/admin.service";

export default function HostsStatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-hosts-stats'],
    queryFn: () => adminService.getHostStats(),
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* Total Hosts */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Registered Hosts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? '...' : stats?.totalHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-text-brand">All Operators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Hosts */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Active Verified Hosts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? '...' : stats?.activeHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approval Hosts */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Pending Approval
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-amber-500 leading-none">
            {isLoading ? '...' : stats?.pendingHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-[#D97706]">Requires Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Hosts */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Blocked / Suspended Hosts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? '...' : stats?.blockedHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-[#DC2626]">Suspended</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
