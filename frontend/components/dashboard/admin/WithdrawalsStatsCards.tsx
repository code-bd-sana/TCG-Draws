"use client";

import React from "react";

interface WithdrawalsStatsCardsProps {
  withdrawals?: any[];
  isLoading?: boolean;
}

export default function WithdrawalsStatsCards({ withdrawals = [], isLoading }: WithdrawalsStatsCardsProps) {
  const pendingRequests = withdrawals.filter(w => w.status === 'PENDING' || w.status === 'Pending');
  const pendingCount = pendingRequests.length;
  
  const totalPendingAmount = pendingRequests.reduce((acc, w) => acc + (w.amount || 0), 0);
  
  const totalCommissionEarned = withdrawals.reduce((acc, w) => {
    const fee = w.feeAmount !== undefined ? w.feeAmount : (w.amount || 0) * 0.15;
    return acc + fee;
  }, 0);

  const totalProcessedNet = withdrawals
    .filter(w => w.status === 'COMPLETED' || w.status === 'APPROVED' || w.status === 'Paid')
    .reduce((acc, w) => acc + (w.netAmount !== undefined ? w.netAmount : (w.amount || 0) * 0.85), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-surface border border-border rounded-card p-6 h-28 animate-pulse shadow-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      
      {/* Pending Requests */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col justify-between shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Pending Payout Requests
        </span>
        <div className="flex flex-col gap-1 mt-2">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">{pendingCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-full border border-[#FDE68A] bg-[#FEF3C7] flex items-center justify-center">
              <span className="font-sans font-bold text-[10px] text-[#D97706]">
                {pendingCount > 0 ? `${pendingCount} Needs Action` : "All Processed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Pending Amount */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col justify-between shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Pending Amount
        </span>
        <div className="flex flex-col gap-1 mt-2">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            £{totalPendingAmount.toFixed(2)}
          </span>
          <span className="font-sans text-xs font-semibold text-text-muted mt-1">Gross requested payouts</span>
        </div>
      </div>

      {/* Platform Commission Earned */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col justify-between shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Platform Commission Earned
        </span>
        <div className="flex flex-col gap-1 mt-2">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-brand leading-none">
            £{totalCommissionEarned.toFixed(2)}
          </span>
          <span className="font-sans text-xs font-semibold text-text-muted mt-1">Platform revenue from payouts</span>
        </div>
      </div>

      {/* Total Processed Payouts */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col justify-between shadow-card">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Processed Net Payouts
        </span>
        <div className="flex flex-col gap-1 mt-2">
          <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
            £{totalProcessedNet.toFixed(2)}
          </span>
          <span className="font-sans text-xs font-semibold text-text-muted mt-1">Total transferred to hosts</span>
        </div>
      </div>

    </div>
  );
}
