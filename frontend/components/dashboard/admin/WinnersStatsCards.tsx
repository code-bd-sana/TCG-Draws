"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { winnerService } from "../../../services/winner.service";

export default function WinnersStatsCards() {
  
  // We can optimize this by requesting an aggregation endpoint, but for now we rely on the pagination meta.
  const { data: allWinners } = useQuery({
    queryKey: ["adminWinnersStats", "All"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1 }),
  });

  const { data: pendingVerifications } = useQuery({
    queryKey: ["adminWinnersStats", "Pending Verification"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1, verificationStatus: "PENDING" }),
  });

  const { data: pendingDeliveries } = useQuery({
    queryKey: ["adminWinnersStats", "Pending Delivery"],
    queryFn: () => winnerService.getAdminWinners({ limit: 1, status: "PENDING" }),
  });

  const totalCount = allWinners?.meta?.total || 0;
  const pendingVerifyCount = pendingVerifications?.meta?.total || 0;
  const pendingDeliveryCount = pendingDeliveries?.meta?.total || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* Total Winners */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Platform Winners
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">{totalCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-text-brand">All-Time Draws</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verification */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Pending Verifications
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">{pendingVerifyCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full border border-[#FDE68A] bg-[#FEF3C7] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-[#D97706]">Needs Audit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prizes Pending Delivery */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Prizes Pending Delivery
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">{pendingDeliveryCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full border border-[#BBF7D0] bg-success-bg flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-success-text">Fulfillment Transit</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
