"use client";

import React from "react";
import WithdrawalsStatsCards from "../../../../components/dashboard/admin/WithdrawalsStatsCards";
import WithdrawalsTable from "../../../../components/dashboard/admin/WithdrawalsTable";
import { useAdminWithdrawals } from "../../../../hooks/useAdminHooks";

export default function AdminWithdrawalsClient() {
  const { data: withdrawals, isLoading } = useAdminWithdrawals();

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Host Payout & Withdrawal Requests
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Review host payout requests, verify bank account details, and process net transfers after the platform commission fee deduction.
        </p>
      </div>
      
      <WithdrawalsStatsCards withdrawals={withdrawals} isLoading={isLoading} />
      <WithdrawalsTable withdrawals={withdrawals} isLoading={isLoading} />
    </div>
  );
}
