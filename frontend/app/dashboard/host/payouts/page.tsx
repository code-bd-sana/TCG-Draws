"use client";

import React, { useState } from "react";
import PayoutMetricsCards from "../../../../components/dashboard/host/payouts/PayoutMetricsCards";
import PayoutHistoryTable from "../../../../components/dashboard/host/payouts/PayoutHistoryTable";
import RequestWithdrawalModal from "../../../../components/dashboard/host/payouts/RequestWithdrawalModal";
import { useHostWalletStats, useHostWithdrawalHistory } from "../../../../hooks/useHostWalletHooks";

export default function PayoutsAndEarningsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: walletStats, isLoading: isLoadingStats } = useHostWalletStats();
  const { data: historyData, isLoading: isLoadingHistory } = useHostWithdrawalHistory();

  const metrics = {
    availableBalance: walletStats?.availableBalance ?? 0,
    pendingClearance: walletStats?.pendingClearance ?? 0,
    totalLifetimeEarnings: walletStats?.totalLifetimeEarnings ?? 0,
    totalFeesPaid: walletStats?.totalFeesPaid ?? 0,
  };

  const history = historyData || [];

  return (
    <div className="flex-1 w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-[24px] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Banner & Request Withdrawal Header */}
      <div className="w-full bg-accent-bg border border-primary/30 rounded-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <span className="font-heading font-black text-sm text-text-primary uppercase tracking-tight">
              Platform Fee &amp; Withdrawal Policy
            </span>
          </div>
          <p className="font-sans text-xs text-text-muted pl-7">
            Every withdrawal deducts your tier platform fee (<strong className="text-text-primary">{walletStats?.commissionRate ?? 15}%</strong>). Net payouts are transferred directly to your UK bank account.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-glossy-red h-[42px] px-6 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {isLoadingStats ? (
        <div className="p-8 text-center text-text-muted font-sans text-sm bg-surface border border-border rounded-card animate-pulse shadow-card">
          Loading wallet metrics...
        </div>
      ) : (
        <PayoutMetricsCards metrics={metrics} />
      )}

      {/* History Table */}
      {isLoadingHistory ? (
        <div className="p-8 text-center text-text-muted font-sans text-sm bg-surface border border-border rounded-card animate-pulse shadow-card">
          Loading withdrawal transaction records...
        </div>
      ) : (
        <PayoutHistoryTable history={history} />
      )}

      {/* Withdrawal Modal */}
      <RequestWithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBalance={metrics.availableBalance}
        commissionRate={walletStats?.commissionRate ?? 15}
      />

    </div>
  );
}
