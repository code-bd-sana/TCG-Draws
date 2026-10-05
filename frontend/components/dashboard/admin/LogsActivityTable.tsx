"use client";

import React, { useState } from "react";
import { useAdminLogs } from "../../../hooks/useAdminHooks";
import { format } from "date-fns";

export default function LogsActivityTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useAdminLogs({
    page,
    limit,
    search,
    filter: activeFilter,
  });

  const logs = data?.logs || [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 0;

  const filters = ["All", "User Actions", "Admin Actions", "System Events", "Errors"];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Success":
        return "border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-bold shadow-xs";
      case "Failed":
        return "border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-bold shadow-xs";
      default:
        return "border-border bg-elevated text-text-muted font-bold shadow-xs";
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Actor Name", "Actor Type", "Description", "IP Address", "Status"];
    const rows = logs.map(log => [
      log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : "",
      log.actor.name,
      log.actor.type,
      log.description,
      log.ip,
      log.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-2 animate-fadeIn font-sans">
      
      {/* Top Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 shrink-0 no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-primary text-white shadow-xs border border-primary"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-[320px]">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search logs by keyword..." 
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full h-9 bg-elevated border border-border-medium rounded-xl pl-4 pr-10 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors font-sans"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden overflow-x-auto shadow-card">
        <table className="w-full min-w-[1050px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-elevated">
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">TIMESTAMP</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%]">ACTOR</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[35%]">ACTION DESCRIPTION</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">IP ADDRESS</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-divider last:border-b-0 animate-pulse">
                  <td className="py-5 px-6">
                    <div className="h-4 w-28 bg-elevated rounded" />
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-elevated shrink-0" />
                      <div className="h-4 w-24 bg-elevated rounded" />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-80 bg-elevated rounded" />
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-24 bg-elevated rounded" />
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="h-6 w-14 bg-elevated rounded-full ml-auto" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#DC2626] font-sans text-xs font-bold">
                  Failed to load logs. Please try again.
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-muted font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">📋</span>
                    <p className="font-heading font-bold text-sm text-text-primary">No Audit Logs Found</p>
                    <p className="font-sans text-xs text-text-muted">
                      {search ? `No activity logs match search keyword "${search}".` : `No activity logs recorded under filter "${activeFilter}".`}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={log.id} className={`${i !== logs.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/40 transition-colors`}>
                  <td className="py-4 px-6">
                    <span className="font-mono font-semibold text-xs text-text-muted">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="font-sans font-bold text-[10px] text-text-brand">{log.actor.initials}</span>
                      </div>
                      <span className="font-heading font-bold text-xs text-text-primary truncate max-w-[150px]" title={log.actor.name}>
                        {log.actor.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-sans font-semibold text-xs text-text-muted leading-relaxed">{log.description}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono font-semibold text-xs text-text-muted">{log.ip}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-3 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider whitespace-nowrap ${getStatusStyle(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-elevated border-t border-divider">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Audit Logs
            </button>
            <span className="font-sans text-xs text-text-muted font-semibold">
              {logs.length > 0 ? (
                <>Showing <span className="text-text-primary font-bold">{logs.length}</span> of <span className="text-text-primary font-bold">{totalItems}</span> log entries</>
              ) : (
                "0 log entries"
              )}
            </span>
          </div>
          
          {/* Pagination Controls - Only shown when logs.length > 0 AND totalPages > 1 */}
          {!isLoading && !isError && logs.length > 0 && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 h-8 rounded-lg border border-border bg-surface hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Prev
              </button>
              <span className="font-sans font-bold text-xs text-text-muted px-2">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 h-8 rounded-lg border border-border bg-surface hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
