"use client";

import React, { useState } from "react";
import { useAdminAssignmentHistory } from "../../../../hooks/useAdminTicketAssignment";
import { format } from "date-fns";

export default function AssignmentHistoryTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  const { data, isLoading, isError } = useAdminAssignmentHistory({
    page,
    limit,
    search,
  });

  const items = data?.items || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fadeIn">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by recipient, transaction ID, or competition..."
            className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-sans"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="absolute right-12 top-2.5 text-xs text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1.5 px-3 py-1 rounded-lg bg-surface border border-border hover:bg-elevated text-xs font-bold text-text-secondary cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="font-sans text-xs text-text-muted">
            Total Records: <strong className="text-text-primary font-mono">{total}</strong>
          </span>
        </div>
      </div>

      {/* History Table */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden overflow-x-auto shadow-card">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-xs text-text-muted">Loading assignment history...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-500 font-sans">
            Failed to load assignment history records.
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-muted font-sans flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">📋</span>
            <p className="font-heading font-bold text-sm text-text-primary">
              No Manual Assignments Found
            </p>
            <p className="text-text-muted max-w-sm">
              When tickets are manually issued from the admin dashboard, audit records will be listed here.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1050px] text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-elevated font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-5 w-[14%]">DATE &amp; TIME</th>
                <th className="py-3.5 px-5 w-[18%]">TRANSACTION / ORDER ID</th>
                <th className="py-3.5 px-5 w-[18%]">RECIPIENT</th>
                <th className="py-3.5 px-5 w-[18%]">COMPETITION</th>
                <th className="py-3.5 px-5 w-[14%]">ASSIGNED TICKETS</th>
                <th className="py-3.5 px-5 w-[10%] text-center">VALUE</th>
                <th className="py-3.5 px-5 w-[8%] text-center">CHANNEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider font-sans text-xs">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-elevated/40 transition-colors"
                >
                  {/* Date */}
                  <td className="py-4 px-5 text-text-muted">
                    {item.date
                      ? format(new Date(item.date), "dd MMM yyyy, HH:mm")
                      : "—"}
                  </td>

                  {/* Transaction ID */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-xs text-text-brand truncate max-w-[180px]" title={item.transactionId}>
                        {item.transactionId}
                      </span>
                      {item.adminNotes && (
                        <span className="text-[11px] text-text-muted italic truncate max-w-[180px]" title={item.adminNotes}>
                          &quot;{item.adminNotes}&quot;
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Recipient */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-elevated border border-border flex items-center justify-center font-bold text-[10px] text-primary shrink-0 overflow-hidden">
                        {item.recipient.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.recipient.avatarUrl}
                            alt={item.recipient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.recipient.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-heading font-bold text-xs text-text-primary truncate">
                          {item.recipient.name}
                        </span>
                        <span className="font-sans text-[11px] text-text-muted truncate">
                          {item.recipient.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Competition */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-elevated border border-border overflow-hidden shrink-0">
                        {item.competition.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.competition.mainImage}
                            alt={item.competition.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            🃏
                          </div>
                        )}
                      </div>
                      <span className="font-heading font-bold text-xs text-text-primary truncate">
                        {item.competition.title}
                      </span>
                    </div>
                  </td>

                  {/* Assigned Numbers */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.assignedNumbers.slice(0, 4).map((num) => (
                          <span
                            key={num}
                            className="font-mono text-[10px] font-bold bg-elevated border border-border px-1.5 py-0.5 rounded-sm"
                          >
                            #{num}
                          </span>
                        ))}
                        {item.assignedNumbers.length > 4 && (
                          <span className="text-[10px] text-text-muted font-bold">
                            +{item.assignedNumbers.length - 4} more
                          </span>
                        )}
                      </div>
                      {item.instantWins && item.instantWins.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                          ⚡ Won {item.instantWins.length} Instant Win(s)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Value */}
                  <td className="py-4 px-5 text-center">
                    <span className="font-heading font-black text-xs text-primary">
                      £{item.totalValue.toFixed(2)}
                    </span>
                  </td>

                  {/* Channel Badge */}
                  <td className="py-4 px-5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 whitespace-nowrap shadow-2xs">
                      🛡️ ADMIN MANUAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-divider flex items-center justify-between text-xs text-text-muted">
            <span>
              Page {page} of {totalPages} ({total} total allocations)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-elevated border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-elevated border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
