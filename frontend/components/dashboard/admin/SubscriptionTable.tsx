"use client";

import { useAllSubscriptionsAdmin } from "@/hooks/useSubscriptionHooks";
import React, { useState, useEffect } from "react";
import { Pagination } from "../../ui/Pagination";

export default function SubscriptionTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isFetching } = useAllSubscriptionsAdmin({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
  });

  const subs = data?.subscriptions || [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const startIndex = (page - 1) * limit;

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Active":
        return <span className="px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Active</span>;
      case "Past Due":
        return <span className="px-3 py-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Past Due</span>;
      case "Cancelled":
        return <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Cancelled</span>;
      case "Expired":
        return <span className="px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Expired</span>;
      default:
        return <span className="px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">{status}</span>;
    }
  };

  const getPlanPill = (plan: string) => {
    return (
      <span className="px-3 py-1 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
        {plan}
      </span>
    );
  };

  return (
    <div className="w-full bg-surface border border-border rounded-card shadow-card flex flex-col overflow-hidden">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-divider bg-elevated/40">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-xs">
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by host, email or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-text-primary text-xs placeholder:text-text-muted w-full ml-1 font-sans font-semibold"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-text-muted hover:text-text-primary text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
        {isFetching && !isLoading && (
          <span className="font-sans text-[11px] text-text-brand font-bold animate-pulse">
            Updating...
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-elevated">
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[25%]">HOST OPERATOR</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%]">PLAN</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">PURCHASE DATE</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">NEXT RENEWAL</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[17%]">PAYMENT</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted font-sans text-xs">
                  <span className="font-bold animate-pulse">Loading subscription records...</span>
                </td>
              </tr>
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted font-sans text-xs">
                  {debouncedSearch ? "No subscriptions match your search." : "No subscription records found."}
                </td>
              </tr>
            ) : (
              subs.map((sub: any, i: number) => {
                const hostName = sub.host?.businessName || (sub.host?.user?.firstName ? `${sub.host.user.firstName} ${sub.host.user.lastName || ''}`.trim() : 'Unknown Host');
                const initials = hostName.substring(0, 2).toUpperCase();
                const endDate = new Date(sub.endDate);
                const startDate = new Date(sub.startDate || sub.createdAt);
                const formattedDate = !isNaN(endDate.getTime())
                  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(endDate)
                  : 'N/A';
                const formattedStartDate = !isNaN(startDate.getTime())
                  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(startDate)
                  : 'N/A';
                const displayStatus = sub.status === 'ACTIVE' ? 'Active' : sub.status === 'CANCELLED' ? 'Cancelled' : sub.status === 'EXPIRED' ? 'Expired' : 'Past Due';
                const tx = sub.transaction;

                return (
                  <tr key={sub.id} className={`${i !== subs.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/40 transition-colors`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
                          <span className="font-sans font-bold text-xs text-text-brand">{initials}</span>
                        </div>
                        <span className="font-heading font-bold text-xs text-text-primary">{hostName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getPlanPill(sub.plan?.name || "Free")}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-sans font-semibold text-xs text-text-muted">{formattedStartDate}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-sans font-semibold text-xs text-text-muted">{formattedDate}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-xs text-text-primary">£{sub.plan?.price ?? '0'} - {tx?.status || 'COMPLETED'}</span>
                        {tx?.gatewayTransactionId && <span className="font-mono text-[11px] text-text-muted mt-0.5">{tx.gatewayTransactionId}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusPill(displayStatus)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-divider px-6 py-4 bg-surface">
          <div className="font-sans text-xs text-text-muted">
            Showing <span className="text-text-primary font-bold">{startIndex + 1}</span> to{" "}
            <span className="text-text-primary font-bold">{Math.min(startIndex + limit, totalItems)}</span> of{" "}
            <span className="text-text-primary font-bold">{totalItems}</span> subscriptions
            {totalPages > 1 && (
              <span> (Page <span className="text-text-brand font-bold">{page}</span> of {totalPages})</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="[&>div]:mt-0">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
