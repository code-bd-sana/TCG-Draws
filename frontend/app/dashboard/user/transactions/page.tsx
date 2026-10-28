"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMyTransactionsQuery } from "../../../../hooks/useTicketHooks";
import { Pagination } from "@/components/ui/Pagination";
import {
  UserTransactionStatsCards,
  TransactionItem,
} from "@/components/dashboard/user/UserTransactionStatsCards";
import { UserTransactionReceiptModal } from "@/components/dashboard/user/UserTransactionReceiptModal";

export default function UserTransactionsPage() {
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected receipt modal
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { data: rawTransactions, isLoading, isError, refetch } = useMyTransactionsQuery();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const transactions: TransactionItem[] = useMemo(() => {
    return (rawTransactions || []).map((t: any) => ({
      id: t.id,
      transactionId: t.transactionId || `#TRN-${t.id.slice(0, 8).toUpperCase()}`,
      orderNumber: t.orderNumber || t.gatewayTransactionId,
      date: t.date ? format(new Date(t.date), "dd MMM yyyy, HH:mm") : "N/A",
      rawDate: t.date,
      description: t.description || "Ticket Purchase Allocation",
      amount: t.amount || "£0.00",
      rawAmount: parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0,
      paymentMethod: t.paymentMethod || t.paymentGateway || "CASHFLOWS",
      status: (t.status || "completed").toLowerCase(),
      ticketsCount: t.ticketsCount || 0,
    }));
  }, [rawTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesFilter = filter === "all" ? true : t.status === filter;

      const query = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        query === ""
          ? true
          : t.transactionId.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.paymentMethod.toLowerCase().includes(query) ||
            (t.orderNumber && t.orderNumber.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, debouncedSearch]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const completedCount = transactions.filter((t) => t.status === "completed").length;
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const failedCount = transactions.filter((t) => t.status === "failed").length;

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ["Transaction ID", "Date", "Description", "Amount", "Payment Gateway", "Status"];
    const rows = filteredTransactions.map((t) => [
      t.transactionId,
      `"${t.date}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMethod,
      t.status.toUpperCase(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TCG_Draws_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction statement exported as CSV");
  };

  const handleOpenReceipt = (transaction: TransactionItem) => {
    setSelectedTransaction(transaction);
    setIsReceiptOpen(true);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="relative flex flex-col gap-8 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn min-h-screen">
      {/* Ambient Art-Deco Lighting Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb Navigation & Real-time Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(212,175,55,0.15)] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted">
          <Link href="/dashboard/user" className="hover:text-[#D4AF37] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-text-muted">User</span>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-[#D4AF37]">Transactions</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Settlement Ledger Active</span>
          </div>

          <button
            onClick={() => {
              refetch();
              toast.success("Transaction records updated");
            }}
            className="p-1.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#141720] text-text-muted hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer"
            title="Refresh Transactions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
            Audit Trail &amp; Proof of Payment
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-tight mt-1">
            Transaction History
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Review all completed ticket acquisitions, official payment receipts, and gateway settlements.
          </p>
        </div>

        <Link href="/dashboard/user/competitions">
          <button className="btn-gold-metallic px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
            <span>Browse Competitions</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Pending Settlement Alert Banner */}
      {pendingCount > 0 && (
        <div className="art-deco-card p-4 sm:p-5 rounded-2xl border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-[#141720] to-[#090A0E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shrink-0">
              ⏳
            </div>
            <div>
              <h3 className="text-xs font-heading font-black uppercase text-[#F5E5C0]">
                {pendingCount} Order{pendingCount === 1 ? "" : "s"} Awaiting Settlement
              </h3>
              <p className="text-[11px] text-text-muted">
                Complete payment checkout in My Tickets before allocated competition numbers expire.
              </p>
            </div>
          </div>
          <Link href="/dashboard/user/tickets">
            <button className="btn-gold-metallic px-4 py-2 rounded-xl text-xs font-heading font-black uppercase tracking-wider text-[#090A0E] shrink-0 cursor-pointer shadow-sm">
              Settle Pending Orders →
            </button>
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      <UserTransactionStatsCards transactions={transactions} isLoading={isLoading} />

      {/* Controls Bar: Search + Status Pills + Export CSV */}
      <div className="art-deco-card p-5 sm:p-6 rounded-2xl flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by transaction ID, description, or gateway..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-obsidian w-full h-11 pl-10 pr-10 text-xs sm:text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-[rgba(212,175,55,0.15)]">
            <button
              onClick={() => {
                setFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                filter === "all"
                  ? "btn-gold-metallic text-[#090A0E] shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => {
                setFilter("completed");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                filter === "completed"
                  ? "bg-emerald-500 text-[#090A0E] font-black shadow-sm"
                  : "text-text-muted hover:text-emerald-400"
              }`}
            >
              ✓ Completed ({completedCount})
            </button>
            <button
              onClick={() => {
                setFilter("pending");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                filter === "pending"
                  ? "bg-amber-500 text-[#090A0E] font-black shadow-sm"
                  : "text-text-muted hover:text-amber-400"
              }`}
            >
              ⏳ Pending ({pendingCount})
            </button>
            <button
              onClick={() => {
                setFilter("failed");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                filter === "failed"
                  ? "bg-rose-500 text-[#090A0E] font-black shadow-sm"
                  : "text-text-muted hover:text-rose-400"
              }`}
            >
              ✕ Failed ({failedCount})
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] hover:border-[#D4AF37] text-text-muted hover:text-[#D4AF37] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer self-start lg:self-auto disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="art-deco-card rounded-2xl p-5 sm:p-7 flex flex-col gap-6 shadow-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="font-heading font-bold text-xs uppercase tracking-widest text-[#D4AF37] animate-pulse">
              Synchronizing Transaction Ledger...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-sans text-xs">
            Failed to load transaction records. Please refresh the page.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#D4AF37] text-2xl">
              🧾
            </div>
            <h4 className="font-heading font-black text-lg text-text-primary uppercase tracking-wide">
              No Transactions Found
            </h4>
            <p className="font-sans text-xs text-text-muted max-w-sm">
              {searchInput || filter !== "all"
                ? "No transactions match your current search or status filter. Try resetting your query."
                : "When you enter live competitions, your official invoices and payment receipts will be audited here."}
            </p>
            {(searchInput || filter !== "all") && (
              <button
                onClick={handleClearFilters}
                className="mt-2 btn-gold-metallic px-5 py-2 rounded-xl text-xs font-heading font-black uppercase text-[#090A0E] cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[920px] flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 pt-2 px-3 border-b border-[rgba(212,175,55,0.15)] font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider bg-[#090A0E]/60 rounded-xl mb-2">
                <div className="col-span-2 pl-2">Transaction ID</div>
                <div className="col-span-2">Date &amp; Time</div>
                <div className="col-span-4">Description / Allocation</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-2 text-center">Payment Gateway</div>
                <div className="col-span-1 text-right pr-2">Receipt</div>
              </div>

              {/* Table Body Rows */}
              <div className="flex flex-col gap-1.5">
                {paginatedTransactions.map((tx) => {
                  const isCompleted = tx.status === "completed";
                  const isPending = tx.status === "pending";
                  const isFailed = tx.status === "failed";
                  const isAdminManual = tx.paymentMethod === "ADMIN_MANUAL";

                  return (
                    <div
                      key={tx.id}
                      onClick={() => handleOpenReceipt(tx)}
                      className="grid grid-cols-12 gap-4 py-3.5 px-3 items-center border border-white/5 hover:border-[rgba(212,175,55,0.3)] bg-[#090A0E]/40 hover:bg-[#090A0E]/80 transition-all rounded-xl cursor-pointer group"
                    >
                      {/* Transaction ID */}
                      <div className="col-span-2 pl-2">
                        <span className="font-mono font-black text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] px-2.5 py-1 rounded-lg inline-block shadow-2xs group-hover:border-[#D4AF37] transition-colors">
                          {tx.transactionId}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="col-span-2 font-mono text-xs text-text-muted">
                        {tx.date}
                      </div>

                      {/* Description / Allocation */}
                      <div className="col-span-4 min-w-0 pr-3">
                        <span className="font-heading font-black text-xs sm:text-sm text-text-primary truncate block group-hover:text-[#F5E5C0] transition-colors">
                          {tx.description}
                        </span>
                        {tx.ticketsCount > 0 && (
                          <span className="text-[10px] font-mono text-[#D4AF37]">
                            {tx.ticketsCount} tickets confirmed
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="col-span-1 font-heading font-black text-sm text-[#D4AF37]">
                        {tx.amount}
                      </div>

                      {/* Payment Method / Gateway */}
                      <div className="col-span-2 text-center font-mono text-xs">
                        {isAdminManual ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/35 text-purple-300">
                            🛡️ Admin Manual
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-text-primary uppercase">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>

                      {/* Status / Receipt Action */}
                      <div className="col-span-1 flex items-center justify-end pr-2 gap-2">
                        {isCompleted && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Completed" />
                        )}
                        {isPending && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Pending" />
                        )}
                        {isFailed && (
                          <span className="w-2 h-2 rounded-full bg-rose-400" title="Failed" />
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReceipt(tx);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#090A0E] text-[#D4AF37] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-[rgba(212,175,55,0.15)] flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Draggable Transaction Receipt Modal */}
      <UserTransactionReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}
