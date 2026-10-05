"use client";

import React from "react";
import { PayoutHistoryItem } from "../../../../types/host-dashboard.types";
import { cn } from "../../../../lib/utils";

interface Props {
  history: PayoutHistoryItem[];
}

export default function PayoutHistoryTable({ history }: Props) {
  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-2 shadow-card">
      
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-divider flex flex-col gap-1 bg-surface">
        <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Recent Transactions
        </h3>
        <p className="font-sans text-xs text-text-muted">
          A record of all your processed and pending payout withdrawals.
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto min-h-[300px]">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-elevated/70">
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Gross Amount
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Fee Deducted
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Net Amount
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Method
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Reference ID
              </th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted font-sans text-sm">
                  No payout transactions recorded yet.
                </td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr 
                  key={item.id}
                  className={cn(
                    "group transition-colors hover:bg-elevated/60",
                    index !== history.length - 1 && "border-b border-divider"
                  )}
                >
                  <td className="py-5 px-6">
                    <span className="font-sans font-semibold text-xs text-text-muted">
                      {item.date}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-heading font-bold text-sm text-text-primary">
                      £{item.grossAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-heading font-bold text-sm text-[#dc2626]">
                      £{item.feeDeducted.toFixed(2)} ({item.feePercent}%)
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-heading font-bold text-sm text-text-brand">
                      £{item.netAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-sans font-medium text-xs text-text-primary">
                      {item.method}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex">
                      <span className={cn(
                        "inline-flex items-center px-3 py-0.5 rounded-full font-sans font-bold text-[11px] uppercase tracking-wide border",
                        item.status === "Paid" 
                          ? "bg-success-bg border-[#BBF7D0] text-success-text" 
                          : "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-sans font-medium text-xs text-text-muted font-mono">
                      {item.referenceId}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
