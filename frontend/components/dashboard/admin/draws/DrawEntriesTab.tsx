"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Raffle, raffleService } from "../../../../services/raffle.service";
import { format } from "date-fns";

interface DrawEntriesTabProps {
  draw?: Raffle;
}

export default function DrawEntriesTab({ draw }: DrawEntriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['raffleSoldTickets', draw?.id],
    queryFn: () => (draw?.id ? raffleService.getSoldTickets(draw.id) : Promise.resolve([])),
    enabled: !!draw?.id,
  });

  const ticketsSold = draw?.ticketsSold ?? tickets.length;
  const totalTickets = draw?.totalTickets || 0;

  const filteredEntries = tickets.filter((entry: any) => {
    const q = searchQuery.toLowerCase();
    const tNum = `#${entry.ticketNumber}`.toLowerCase();
    const buyer = (entry.buyerName || '').toLowerCase();
    const email = (entry.userEmail || '').toLowerCase();
    return buyer.includes(q) || tNum.includes(q) || email.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
            Ticket Entry Pool
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-xs">
            {ticketsSold} / {totalTickets} Sold
          </span>
        </div>

        <div className="relative w-full sm:w-[280px]">
          <svg className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search buyer name or ticket #..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 bg-elevated border border-border-medium rounded-xl pl-10 pr-3 font-sans text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="py-12 text-center text-text-muted font-sans text-xs animate-pulse">
          Loading ticket entries...
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-elevated border border-dashed border-border-medium rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🎫</span>
          <h4 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider">No Tickets Sold Yet</h4>
          <p className="font-sans text-xs text-text-muted max-w-[360px]">
            No participants have purchased tickets for this competition draw yet. Check back once sales open.
          </p>
        </div>
      ) : (
        <div className="w-full bg-surface border border-border rounded-xl overflow-hidden shadow-xs overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-elevated">
                <th className="py-3.5 px-5 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">TICKET #</th>
                <th className="py-3.5 px-5 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[35%]">BUYER DETAILS</th>
                <th className="py-3.5 px-5 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center">QTY</th>
                <th className="py-3.5 px-5 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%] text-center">PURCHASED</th>
                <th className="py-3.5 px-5 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-sans text-text-muted">
                    No matching entrant found for "{searchQuery}"
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry: any, i: number) => {
                  const buyerName = entry.buyerName || entry.userName || "Entrant";
                  const initials = (buyerName || "U")
                    .split(" ")
                    .filter(Boolean)
                    .map((w: string) => w[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "E";
                  
                  let formattedDate = "N/A";
                  if (entry.createdAt) {
                    try {
                      formattedDate = format(new Date(entry.createdAt), "dd MMM yyyy HH:mm");
                    } catch (e) {
                      formattedDate = String(entry.createdAt);
                    }
                  }

                  const isWinner = entry.winStatus && entry.winStatus !== 'Regular Entry';

                  return (
                    <tr key={entry.id} className={`${i !== paginatedEntries.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/50 transition-colors`}>
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-xs text-text-brand bg-accent-bg px-2 py-0.5 rounded-md border border-primary/20">
                          #{entry.ticketNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
                            <span className="font-sans font-bold text-xs text-text-brand">{initials}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-sans font-semibold text-xs text-text-primary">{buyerName}</span>
                            <span className="font-sans text-[11px] text-text-muted">{entry.userEmail || "No email"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="font-sans font-bold text-xs text-text-primary">1</span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="font-sans text-xs text-text-muted">{formattedDate}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className={`px-2.5 py-1 rounded-full border font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs ${
                          isWinner 
                            ? 'border-[#FEF08A] bg-[#FEF9C3] text-[#854D0E]' 
                            : 'border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]'
                        }`}>
                          {entry.winStatus || 'Verified'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-1 pt-1 font-sans text-xs">
        <span className="text-text-muted">
          Showing {paginatedEntries.length} of {filteredEntries.length} entries for {draw?.title || "Competition"}
        </span>
        <div className="flex items-center gap-3 font-semibold">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-border-medium font-normal">Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="text-text-brand hover:text-primary-hover transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
