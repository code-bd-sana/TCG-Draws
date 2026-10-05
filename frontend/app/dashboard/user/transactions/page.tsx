"use client";

import React, { useState } from "react";
import { useMyTransactionsQuery } from "../../../../hooks/useTicketHooks";
import { format } from "date-fns";

export default function UserTransactionsPage() {
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const { data: rawTransactions, isLoading, isError } = useMyTransactionsQuery();

  const transactions = (rawTransactions || []).map((t: any) => ({
    id: t.id,
    transactionId: t.transactionId || `#TRN-${t.id.slice(0, 8)}`,
    date: t.date ? format(new Date(t.date), "dd MMM yyyy, HH:mm") : "N/A",
    description: t.description || "Ticket Purchase",
    amount: t.amount || "£0.00",
    rawAmount: parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0,
    paymentMethod: t.paymentMethod || "CASHFLOWS",
    status: (t.status || "completed").toLowerCase(),
    ticketsCount: t.ticketsCount || 0,
  }));

  const filteredTransactions = transactions.filter((t: any) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const totalSpent = transactions
    .filter((t: any) => t.status === "completed")
    .reduce((sum: number, t: any) => sum + t.rawAmount, 0);

  const completedCount = transactions.filter((t: any) => t.status === "completed").length;
  const pendingCount = transactions.filter((t: any) => t.status === "pending").length;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Transaction History
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Review all ticket purchases, invoice receipts, and pending checkout logs.
        </p>
      </div>

      {/* Top Summary Card */}
      <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-card">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Completed Purchases
          </span>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-text-brand">
            £{totalSpent.toFixed(2)}
          </p>
          <span className="font-sans text-xs text-text-muted">
            {completedCount} successful transactions
          </span>
        </div>

        {pendingCount > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <strong className="font-bold">{pendingCount} order(s) awaiting payment.</strong>
              <div className="text-[11px] text-text-muted mt-0.5">
                Visit My Tickets to complete checkout before competitions sell out.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            filter === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface border border-border text-text-muted hover:text-text-primary"
          }`}
        >
          All ({transactions.length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            filter === "completed"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface border border-border text-text-muted hover:text-text-primary"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            filter === "pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-surface border border-border text-text-muted hover:text-text-primary"
          }`}
        >
          Pending Payment ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("failed")}
          className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            filter === "failed"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-surface border border-border text-text-muted hover:text-text-primary"
          }`}
        >
          Failed
        </button>
      </div>

      {/* Transactions Data Table */}
      <div className="w-full bg-surface border border-border rounded-card p-6 overflow-x-auto shadow-card">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-xs text-text-muted">Loading transaction records...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 font-sans text-sm">
            Failed to load transactions.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-text-muted font-sans text-xs flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🧾</span>
            <p className="font-heading font-bold text-sm text-text-primary">No transactions found</p>
            <p className="text-text-muted">When you enter competitions, your payment records will be listed here.</p>
          </div>
        ) : (
          <div className="min-w-[900px] flex flex-col">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-divider font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <div className="col-span-2 pl-4">Transaction ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-2 text-center">Payment Method</div>
              <div className="col-span-1 text-right pr-4">Status</div>
            </div>

            {/* Table Body Rows */}
            <div className="flex flex-col">
              {filteredTransactions.map((transaction: any, index: number) => (
                <div 
                  key={transaction.id} 
                  className={`grid grid-cols-12 gap-4 py-4 items-center font-sans border-b border-divider hover:bg-elevated/40 transition-colors ${index === filteredTransactions.length - 1 ? 'border-b-0' : ''}`}
                >
                  {/* Transaction ID */}
                  <div className="col-span-2 pl-4 font-mono font-bold text-xs text-text-brand truncate" title={transaction.transactionId}>
                    {transaction.transactionId}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 font-sans font-semibold text-xs text-text-muted">
                    {transaction.date}
                  </div>

                  {/* Description */}
                  <div className="col-span-4 font-heading font-bold text-xs text-text-primary truncate pr-4" title={transaction.description}>
                    {transaction.description}
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 font-heading font-black text-xs text-text-primary">
                    {transaction.amount}
                  </div>

                  {/* Payment Method */}
                  <div className="col-span-2 text-center font-sans font-semibold text-xs text-text-muted uppercase">
                    {transaction.paymentMethod}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-end pr-4">
                    {transaction.status === "completed" && (
                      <div className="px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] shadow-xs">
                        <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Completed</span>
                      </div>
                    )}
                    {transaction.status === "pending" && (
                      <div className="px-3 py-1 rounded-full border border-amber-300 bg-amber-100 dark:bg-amber-950/40 shadow-xs">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending</span>
                      </div>
                    )}
                    {transaction.status === "failed" && (
                      <div className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] shadow-xs">
                        <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider">Failed</span>
                      </div>
                    )}
                    {transaction.status !== "completed" && transaction.status !== "pending" && transaction.status !== "failed" && (
                      <div className="px-3 py-1 rounded-full border border-border bg-elevated shadow-xs">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{transaction.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
