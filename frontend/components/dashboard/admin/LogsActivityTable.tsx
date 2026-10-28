"use client";

import React, { useState, useEffect } from "react";
import { useAdminLogs } from "../../../hooks/useAdminHooks";
import { format } from "date-fns";
import { LogData } from "../../../services/admin.service";
import LogsStatsCards from "./LogsStatsCards";
import LogDetailsModal from "./LogDetailsModal";

export default function LogsActivityTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [selectedLog, setSelectedLog] = useState<LogData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, refetch } = useAdminLogs({
    page,
    limit,
    search,
    filter: activeFilter,
  });

  const logs = data?.logs || [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 0;

  const filters = ["All", "User Actions", "Admin Actions", "System Events", "Errors"];

  const handleRowClick = (log: LogData) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
      case "Failed":
        return "bg-rose-500/10 border border-rose-500/30 text-rose-400";
      default:
        return "bg-neutral-800 border border-neutral-700 text-neutral-400";
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Actor Name", "Actor Type", "Description", "IP Address", "Status"];
    const rows = logs.map((log) => [
      log.timestamp ? format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss") : "",
      log.actor.name,
      log.actor.type,
      log.description,
      log.ip,
      log.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tcg_draws_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn font-sans">
      {/* 4 Art-Deco KPI Cards */}
      <LogsStatsCards logs={logs} totalLogs={totalItems} isLoading={isLoading} />

      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-4 pt-2">
        {/* Row 1: Instant Search + Refresh & Export Actions */}
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search audit trail by actor, description, or IP..."
              className="input-obsidian w-full h-10 pl-10 pr-9 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
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
              title="Refresh audit stream"
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
              disabled={logs.length === 0}
              className="btn-dark-metallic h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
              title="Export filtered audit logs to CSV"
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

        {/* Row 2: Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-[#090A0E] font-black shadow-lg shadow-primary/20 border border-primary"
                    : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-medium"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table in Luxury Art-Deco Card */}
      <div className="art-deco-card rounded-card overflow-hidden shadow-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-accent-bg/40">
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[18%]">
                  Timestamp
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[20%]">
                  Actor
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[34%]">
                  Action Description
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[14%] text-center">
                  IP Address
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[14%] text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 w-28 bg-elevated rounded" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-elevated shrink-0" />
                        <div className="h-4 w-24 bg-elevated rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 w-80 bg-elevated rounded" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-4 w-24 bg-elevated rounded mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="h-6 w-16 bg-elevated rounded-full ml-auto" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rose-400 font-sans text-xs font-semibold">
                    Failed to load audit logs from server. Please refresh the stream.
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-text-muted font-sans text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <p className="font-heading font-bold text-sm text-text-primary">
                        No Audit Logs Found
                      </p>
                      <p className="text-xs text-text-muted">
                        {search
                          ? `No activity logs match search keyword "${search}".`
                          : `No activity logs recorded under filter "${activeFilter}".`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === "Success";
                  return (
                    <tr
                      key={log.id}
                      onClick={() => handleRowClick(log)}
                      className="hover:bg-accent-bg/30 transition-colors group cursor-pointer"
                    >
                      {/* Timestamp */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-text-muted">
                          {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0">
                            <span className="font-heading font-black text-xs text-text-brand">
                              {log.actor.initials}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-heading font-black text-xs text-text-primary truncate group-hover:text-text-brand transition-colors">
                              {log.actor.name}
                            </span>
                            <span className="font-mono text-[10px] text-text-muted uppercase">
                              {log.actor.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Description */}
                      <td className="py-4 px-6">
                        <span className="font-sans font-medium text-xs text-text-primary leading-relaxed line-clamp-2">
                          {log.description}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface border border-border font-mono text-[11px] text-text-muted">
                          {log.ip}
                        </span>
                      </td>

                      {/* Status & Action */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider font-bold ${getStatusStyle(
                              log.status
                            )}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-emerald-400" : "bg-rose-400"}`} />
                            {log.status}
                          </span>

                          <button
                            onClick={() => handleRowClick(log)}
                            className="btn-dark-metallic h-7 px-2.5 rounded-lg font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            title="Inspect event details"
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

        {/* Footer Meta & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/60 bg-accent-bg/20">
          <div className="text-xs text-text-muted font-sans">
            Showing <span className="font-bold text-text-primary">{logs.length}</span> of{" "}
            <span className="font-bold text-text-primary">{totalItems}</span> audit entries
          </div>

          {!isLoading && !isError && logs.length > 0 && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Previous
              </button>

              <span className="font-mono text-xs text-text-muted px-2">
                Page <span className="font-bold text-text-primary">{page}</span> of{" "}
                <span className="font-bold text-text-primary">{totalPages}</span>
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Draggable Log Details Modal */}
      <LogDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedLog(null);
        }}
        log={selectedLog}
      />
    </div>
  );
}
