import React from "react";
import { PayoutMetrics } from "../../../../types/host-dashboard.types";

interface Props {
  metrics: PayoutMetrics;
}

export default function PayoutMetricsCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Available Balance */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <h4 className="font-sans font-bold text-xs text-text-muted uppercase tracking-wider">
          Available Balance
        </h4>
        <div className="font-heading font-black text-3xl text-text-primary">
          £{metrics.availableBalance.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-brand">
          Ready to withdraw
        </p>
      </div>

      {/* Pending Clearance */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <h4 className="font-sans font-bold text-xs text-text-muted uppercase tracking-wider">
          Pending Clearance
        </h4>
        <div className="font-heading font-black text-3xl text-text-primary">
          £{metrics.pendingClearance.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-muted">
          Processing (3–5 business days)
        </p>
      </div>

      {/* Total Lifetime Earnings */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <h4 className="font-sans font-bold text-xs text-text-muted uppercase tracking-wider">
          Total Lifetime Earnings
        </h4>
        <div className="font-heading font-black text-3xl text-text-primary">
          £{metrics.totalLifetimeEarnings.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-muted">
          Across all completed competitions
        </p>
      </div>

      {/* Total Fees Paid */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
        <h4 className="font-sans font-bold text-xs text-text-muted uppercase tracking-wider">
          Total Fees Paid
        </h4>
        <div className="font-heading font-black text-3xl text-[#dc2626]">
          £{metrics.totalFeesPaid.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-muted">
          Standard platform commission
        </p>
      </div>

    </div>
  );
}
