"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAllSubscriptionsAdmin } from "@/hooks/useSubscriptionHooks";
import { Pagination } from "../../ui/Pagination";
import SubscriptionDetailsModal from "./SubscriptionDetailsModal";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SubscriptionTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useAllSubscriptionsAdmin({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
  });

  const subs = data?.subscriptions || [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const startIndex = (page - 1) * limit;

  // Client-side status filtering if needed
  const filteredSubs = useMemo(() => {
    if (activeFilter === "All") return subs;
    return subs.filter((s: any) => {
      const status = (s.status || "").toUpperCase();
      if (activeFilter === "Active") return status === "ACTIVE";
      if (activeFilter === "Past Due") return status === "PAST_DUE" || status === "PAST DUE";
      if (activeFilter === "Cancelled") return status === "CANCELLED";
      if (activeFilter === "Expired") return status === "EXPIRED";
      return true;
    });
  }, [subs, activeFilter]);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleExportCSV = () => {
    if (filteredSubs.length === 0) {
      toast.info("No subscription records available to export.");
      return;
    }

    const headers = [
      "Subscription ID",
      "Host Operator",
      "Email",
      "Plan Name",
      "Price (£)",
      "Start Date",
      "Renewal Date",
      "Transaction ID",
      "Payment Status",
      "Subscription Status"
    ];

    const rows = filteredSubs.map((sub: any) => [
      sub.id,
      sub.host?.businessName || (sub.host?.user?.firstName ? `${sub.host.user.firstName} ${sub.host.user.lastName || ''}`.trim() : 'N/A'),
      sub.host?.user?.email || sub.host?.email || 'N/A',
      sub.plan?.name || "Standard",
      sub.plan?.price ?? "0",
      sub.startDate || sub.createdAt,
      sub.endDate || "N/A",
      sub.transaction?.gatewayTransactionId || sub.transaction?.id || "N/A",
      sub.transaction?.status || "COMPLETED",
      sub.status || "ACTIVE"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tcg_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscription directory exported as CSV");
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case "Past Due":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Past Due
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Cancelled
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
            {status}
          </span>
        );
    }
  };

  const getPlanPill = (plan: string) => {
    return (
      <span className="px-2.5 py-0.5 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-heading font-black text-[10px] uppercase tracking-wider shadow-xs">
        {plan}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-5 w-full">
        
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface border border-border rounded-card p-4 shadow-card">
          
          {/* Left: Search Bar & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 flex-wrap">
            
            {/* Search Input */}
            <div className="relative flex items-center h-10 w-full sm:w-[320px] bg-elevated border border-border-medium rounded-xl px-3 focus-within:border-primary focus-within:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all">
              <svg 
                className="w-4 h-4 text-text-muted shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search host, email or plan..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-text-primary text-xs placeholder:text-text-muted/60 w-full ml-2 font-sans font-semibold"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-text-muted hover:text-text-primary p-1 rounded transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-elevated border border-border rounded-xl overflow-x-auto no-scrollbar">
              {(["All", "Active", "Past Due", "Cancelled", "Expired"] as const).map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-primary text-[#090A0E] shadow-sm font-black' 
                        : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
                    }`}
                  >
                    {filter === "Active" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-emerald-400'}`} />
                    )}
                    {filter === "Past Due" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-amber-400'}`} />
                    )}
                    {filter === "Cancelled" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-rose-400'}`} />
                    )}
                    <span>{filter}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh subscriptions"
              className="h-10 w-10 rounded-xl bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-brand flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${isFetching ? 'animate-spin text-text-brand' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              disabled={filteredSubs.length === 0}
              className="btn-dark-metallic h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                Export Directory
              </span>
            </button>
          </div>

        </div>

        {/* Table Container */}
        <div className="art-deco-card rounded-card overflow-hidden shadow-card border border-border w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-divider bg-elevated/70">
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[26%]">
                    Host Operator
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Plan
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[16%]">
                    Purchase Date
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[16%]">
                    Next Renewal
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[18%]">
                    Payment &amp; Ref
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Status
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[10%] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-elevated shrink-0" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-elevated rounded" />
                            <div className="h-3 w-24 bg-elevated rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center"><div className="h-6 w-16 bg-elevated rounded-full mx-auto" /></td>
                      <td className="py-4 px-6"><div className="h-4 w-24 bg-elevated rounded" /></td>
                      <td className="py-4 px-6"><div className="h-4 w-24 bg-elevated rounded" /></td>
                      <td className="py-4 px-6"><div className="h-4 w-28 bg-elevated rounded" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-6 w-16 bg-elevated rounded-full mx-auto" /></td>
                      <td className="py-4 px-6 text-right"><div className="h-6 w-12 bg-elevated rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-elevated border border-border flex items-center justify-center text-text-muted">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                          </svg>
                        </div>
                        <span className="font-heading font-bold text-sm text-text-primary">
                          No matching subscriptions found
                        </span>
                        <p className="font-sans text-xs text-text-muted max-w-sm">
                          {search || activeFilter !== "All"
                            ? "Try adjusting your search keywords or resetting filters."
                            : "There are currently no active host subscriptions recorded."}
                        </p>
                        {(search || activeFilter !== "All") && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setActiveFilter("All");
                            }}
                            className="mt-2 px-4 py-2 rounded-xl bg-elevated border border-border hover:border-primary/40 text-text-brand text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub: any) => {
                    const hostName =
                      sub.host?.businessName ||
                      (sub.host?.user?.firstName
                        ? `${sub.host.user.firstName} ${sub.host.user.lastName || ""}`.trim()
                        : "Unknown Host");

                    const initials = hostName.substring(0, 2).toUpperCase();
                    const endDate = sub.endDate ? new Date(sub.endDate) : null;
                    const startDate = sub.startDate || sub.createdAt ? new Date(sub.startDate || sub.createdAt) : null;

                    const formattedStartDate = startDate && !isNaN(startDate.getTime())
                      ? format(startDate, "dd MMM yyyy")
                      : "N/A";

                    const formattedEndDate = endDate && !isNaN(endDate.getTime())
                      ? format(endDate, "dd MMM yyyy")
                      : "N/A";

                    const displayStatus =
                      sub.status === "ACTIVE"
                        ? "Active"
                        : sub.status === "CANCELLED"
                        ? "Cancelled"
                        : sub.status === "EXPIRED"
                        ? "Expired"
                        : "Past Due";

                    const tx = sub.transaction;

                    return (
                      <tr 
                        key={sub.id} 
                        className="hover:bg-elevated/40 transition-colors group"
                      >
                        {/* Host Operator */}
                        <td className="py-4 px-6">
                          <div 
                            onClick={() => setSelectedSub(sub)}
                            className="flex items-center gap-3.5 cursor-pointer group/item w-fit"
                            title="Click to audit subscription details"
                          >
                            <div className="w-10 h-10 rounded-xl bg-linear-to-b from-[#2A2315] to-[#12151F] border border-primary/40 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                              <span className="font-heading font-black text-xs text-text-brand tracking-wider">
                                {initials}
                              </span>
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="font-heading font-bold text-xs sm:text-sm text-text-primary truncate group-hover/item:text-text-brand transition-colors">
                                {hostName}
                              </span>
                              <span className="font-sans text-[11px] text-text-muted truncate">
                                {sub.host?.user?.email || sub.host?.email || "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-6 text-center">
                          {getPlanPill(sub.plan?.name || "Free")}
                        </td>

                        {/* Purchase Date */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-sans font-semibold text-xs text-text-primary">
                              {formattedStartDate}
                            </span>
                            {startDate && !isNaN(startDate.getTime()) && (
                              <span className="font-sans text-[10px] text-text-muted">
                                {format(startDate, "HH:mm")}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Next Renewal */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-sans font-semibold text-xs text-text-primary">
                              {formattedEndDate}
                            </span>
                            <span className="font-sans text-[10px] text-text-muted">
                              Auto-recurring
                            </span>
                          </div>
                        </td>

                        {/* Payment & Ref */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-black text-xs sm:text-sm text-text-brand">
                                £{Number(sub.plan?.price ?? 0).toFixed(2)}
                              </span>
                              <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase">
                                {tx?.status || "COMPLETED"}
                              </span>
                            </div>
                            {(tx?.gatewayTransactionId || tx?.id) && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-text-muted/70 truncate max-w-[140px]">
                                  {tx?.gatewayTransactionId || tx?.id}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(tx?.gatewayTransactionId || tx?.id, "Transaction Ref")}
                                  className="text-text-muted hover:text-text-brand transition-colors p-0.5 cursor-pointer"
                                  title="Copy Ref"
                                >
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          {getStatusPill(displayStatus)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="h-8 px-2.5 rounded-lg bg-surface border border-border hover:border-primary/50 text-text-muted hover:text-text-brand hover:bg-elevated transition-all inline-flex items-center gap-1.5 text-xs font-sans font-semibold cursor-pointer shadow-xs"
                            title="Audit Subscription & Billing"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <span className="hidden sm:inline text-[11px]">Audit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-divider bg-elevated/40">
            <span className="font-sans text-xs text-text-muted">
              Showing <strong className="text-text-primary">{filteredSubs.length}</strong> of{" "}
              <strong className="text-text-primary">{totalItems}</strong> subscription records
            </span>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </div>

      </div>

      {/* Subscription Details Audit Modal (Draggable) */}
      <SubscriptionDetailsModal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        subscription={selectedSub}
      />
    </>
  );
}
