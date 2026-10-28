"use client";

import React, { useState, useMemo } from "react";
import ConfirmPayoutModal, { AdminPayoutData } from "./ConfirmPayoutModal";
import { useAdminWithdrawals } from "../../../hooks/useAdminHooks";

interface WithdrawalsTableProps {
  withdrawals?: AdminPayoutData[];
  isLoading?: boolean;
}

export default function WithdrawalsTable({
  withdrawals: propWithdrawals,
  isLoading: propIsLoading,
}: WithdrawalsTableProps) {
  const { data: fetchedWithdrawals, isLoading: isQueryLoading, isFetching, refetch } = useAdminWithdrawals();

  const withdrawals: AdminPayoutData[] = propWithdrawals || fetchedWithdrawals || [];
  const isLoading = propIsLoading !== undefined ? propIsLoading : isQueryLoading;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutData | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "VIEW">("APPROVE");

  const handleAction = (payout: AdminPayoutData, type: "APPROVE" | "REJECT" | "VIEW") => {
    setSelectedPayout(payout);
    setActionType(type);
    setIsModalOpen(true);
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const s = w.status?.toUpperCase();
        if (statusFilter === "PENDING" && s !== "PENDING" && s !== "PROCESSING") return false;
        if (statusFilter === "APPROVED" && s !== "APPROVED" && s !== "COMPLETED" && s !== "PAID") return false;
        if (statusFilter === "REJECTED" && s !== "REJECTED" && s !== "FAILED") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchHost = (w.hostBusinessName || "").toLowerCase().includes(q);
        const matchEmail = (w.hostUserEmail || "").toLowerCase().includes(q);
        const matchId = (w.id || "").toLowerCase().includes(q);
        const matchMethod = (w.payoutMethod || "").toLowerCase().includes(q);
        if (!matchHost && !matchEmail && !matchId && !matchMethod) return false;
      }

      return true;
    });
  }, [withdrawals, statusFilter, searchQuery]);

  const handleExportCSV = () => {
    if (filteredWithdrawals.length === 0) return;

    const headers = [
      "Request ID",
      "Host Business",
      "Host Email",
      "Gross Amount (£)",
      "Platform Fee (£)",
      "Net Payout (£)",
      "Payment Method",
      "Status",
      "Request Date",
      "Admin Notes"
    ];

    const rows = filteredWithdrawals.map((w) => {
      const gross = w.amount || 0;
      const fee = w.feeAmount !== undefined ? w.feeAmount : gross * 0.15;
      const net = w.netAmount !== undefined ? w.netAmount : gross - fee;
      const date = w.createdAt ? new Date(w.createdAt).toISOString().slice(0, 10) : "N/A";

      return [
        w.id,
        w.hostBusinessName || "Unknown Host",
        w.hostUserEmail || "N/A",
        gross.toFixed(2),
        fee.toFixed(2),
        net.toFixed(2),
        w.payoutMethod || "Bank Transfer",
        w.status,
        date,
        w.adminNotes || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tcg_draws_payouts_${statusFilter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase() || "";
    switch (s) {
      case "APPROVED":
      case "COMPLETED":
      case "PAID":
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
      case "PENDING":
      case "PROCESSING":
        return "bg-amber-500/10 border border-amber-500/30 text-amber-400";
      case "REJECTED":
      case "FAILED":
        return "bg-rose-500/10 border border-rose-500/30 text-rose-400";
      default:
        return "bg-neutral-800 border border-neutral-700 text-neutral-400";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-2">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Instant Search Bar */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by host business, email, ref ID, or payment method..."
            className="input-obsidian w-full h-10 pl-10 pr-9 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action buttons: Refresh + Export CSV */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-dark-metallic h-10 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            title="Refresh withdrawals list"
          >
            <svg
              className={`w-4 h-4 text-text-muted ${isFetching ? "animate-spin text-text-brand" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary hidden sm:inline">
              Refresh
            </span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredWithdrawals.length === 0}
            className="btn-dark-metallic h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
            title="Export filtered withdrawals to CSV"
          >
            <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
              Export CSV
            </span>
          </button>
        </div>
      </div>

      {/* Row 2: Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(
          [
            { id: "ALL", label: "All Requests", count: withdrawals.length },
            { id: "PENDING", label: "Pending Approval", count: withdrawals.filter((w) => w.status?.toUpperCase() === "PENDING" || w.status?.toUpperCase() === "PROCESSING").length },
            { id: "APPROVED", label: "Approved / Settled", count: withdrawals.filter((w) => w.status?.toUpperCase() === "APPROVED" || w.status?.toUpperCase() === "COMPLETED" || w.status?.toUpperCase() === "PAID").length },
            { id: "REJECTED", label: "Rejected", count: withdrawals.filter((w) => w.status?.toUpperCase() === "REJECTED" || w.status?.toUpperCase() === "FAILED").length },
          ] as const
        ).map((filter) => {
          const isActive = statusFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary text-[#090A0E] font-black shadow-lg shadow-primary/20 border border-primary"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-medium"
              }`}
            >
              <span>{filter.label}</span>
              <span className={`text-[10px] font-mono font-bold ${isActive ? "text-[#090A0E]" : "text-text-muted"}`}>
                ({filter.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Table in Luxury Art-Deco Card */}
      <div className="art-deco-card rounded-card overflow-hidden shadow-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-border/80 bg-accent-bg/40">
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[22%]">
                  Host Business
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center w-[12%]">
                  Requested Gross
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center w-[11%]">
                  Platform Fee
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center w-[12%]">
                  Net Payout
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center w-[12%]">
                  Method
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center w-[11%]">
                  Request Date
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center w-[10%]">
                  Status
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-right w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin w-6 h-6 text-text-brand" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider">
                        Loading host withdrawal requests...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                        No withdrawal requests found
                      </span>
                      <p className="text-xs text-text-muted">
                        Try adjusting your search criteria or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((payout) => {
                  const grossAmount = payout.amount || 0;
                  const feeAmount = payout.feeAmount !== undefined ? payout.feeAmount : grossAmount * 0.15;
                  const netAmount = payout.netAmount !== undefined ? payout.netAmount : grossAmount * 0.85;
                  const dateStr = payout.createdAt
                    ? new Date(payout.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";
                  const isPending = payout.status?.toUpperCase() === "PENDING";

                  return (
                    <tr
                      key={payout.id}
                      className="hover:bg-accent-bg/30 transition-colors group cursor-pointer"
                      onClick={() => handleAction(payout, "VIEW")}
                    >
                      {/* Host Business */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0">
                            <span className="font-heading font-black text-xs text-text-brand">
                              {(payout.hostBusinessName || "H").slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-heading font-black text-xs text-text-primary truncate group-hover:text-text-brand transition-colors">
                              {payout.hostBusinessName || "Unknown Host"}
                            </span>
                            <span className="font-mono text-[11px] text-text-muted truncate">
                              {payout.hostUserEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="py-4 px-4 text-center font-heading font-bold text-xs text-text-primary">
                        £{grossAmount.toFixed(2)}
                      </td>

                      {/* Fee Amount */}
                      <td className="py-4 px-4 text-center font-heading font-bold text-xs text-rose-400">
                        -£{feeAmount.toFixed(2)}
                      </td>

                      {/* Net Amount */}
                      <td className="py-4 px-4 text-center font-heading font-black text-xs text-text-brand">
                        £{netAmount.toFixed(2)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface border border-border font-mono text-[11px] text-text-muted">
                          {payout.payoutMethod || "Bank Transfer"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-center font-sans font-medium text-xs text-text-muted">
                        {dateStr}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider font-bold ${getStatusStyle(
                            payout.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPending ? "bg-amber-400 animate-pulse" : "bg-current"
                            }`}
                          />
                          {payout.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleAction(payout, "APPROVE")}
                                className="btn-gold-metallic h-7 px-2.5 rounded-lg font-heading font-black text-[10px] uppercase tracking-wider shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                                title="Approve Payout"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(payout, "REJECT")}
                                className="h-7 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}

                          <button
                            onClick={() => handleAction(payout, "VIEW")}
                            className="btn-dark-metallic h-7 px-2.5 rounded-lg font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            title="View Payout Audit & Details"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Meta Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-accent-bg/20">
          <div className="text-xs text-text-muted font-sans">
            Showing <span className="font-bold text-text-primary">{filteredWithdrawals.length}</span> of{" "}
            <span className="font-bold text-text-primary">{withdrawals.length}</span> total payout requests
          </div>
        </div>
      </div>

      {/* Draggable Payout Inspection & Approval Modal */}
      <ConfirmPayoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payout={selectedPayout}
        actionType={actionType}
      />
    </div>
  );
}
