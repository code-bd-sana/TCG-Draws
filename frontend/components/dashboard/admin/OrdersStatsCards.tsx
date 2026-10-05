"use client";

import React from "react";
import { useAdminOrdersStats } from "../../../hooks/useAdminHooks";

export default function OrdersStatsCards() {
  const { data: stats, isLoading } = useAdminOrdersStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      
      {/* Total Orders */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Platform Orders
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : stats?.totalOrders?.toLocaleString() || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-text-brand">Completed Purchases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Tickets Sold */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Tickets Sold
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : stats?.totalTicketsSold?.toLocaleString() || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">Raffle Entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Order Value */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Ticket Order Value
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : `£${stats?.totalOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">Gross Sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refunded Orders */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Refunded Ticket Orders
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : stats?.refundedOrders?.toLocaleString() || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-[#DC2626]">Refunded</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
