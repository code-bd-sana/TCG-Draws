"use client";

import React, { useState } from "react";
import CompetitionDetailsModal from "./CompetitionDetailsModal";

export interface Ticket {
  id: string;
  ticketId: string;
  competitionName: string;
  purchaseDate: string;
  pricePaid: string;
  status: "live" | "drawn-won" | "drawn-lost" | "instant-win";
  raw?: any; // The raw backend ticket data for the modal
}

interface TicketsTableProps {
  tickets: Ticket[];
}

export default function TicketsTable({ tickets }: TicketsTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <>
      <div className="w-full bg-surface border border-border rounded-2xl p-5 sm:p-7 flex flex-col shadow-card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-divider">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm shadow-2xs">
              🎫
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-text-primary uppercase tracking-tight">
              All Purchased Tickets
            </h3>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-elevated border border-border-medium hover:bg-surface text-text-secondary hover:text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-0">
            <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Table/Grid */}
        {tickets.length === 0 ? (
          <div className="w-full py-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-accent-bg border border-primary/20 flex items-center justify-center text-2xl mb-1 shadow-2xs">
              🎟️
            </div>
            <p className="font-heading font-bold text-base text-text-primary">
              No Tickets Found
            </p>
            <p className="font-sans text-xs text-text-muted max-w-sm">
              You haven&apos;t entered any live competitions yet. Your entries and draw numbers will show up here.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px] flex flex-col">
              {/* Table Header Row */}
              <div className="grid grid-cols-12 gap-4 pb-3.5 pt-1 px-2 border-b border-border font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider bg-elevated/50 rounded-xl mb-1">
                <div className="col-span-2 pl-3">Ticket ID</div>
                <div className="col-span-4">Competition Name</div>
                <div className="col-span-2">Purchase Date</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-center">Result Status</div>
                <div className="col-span-1 text-right pr-3">Action</div>
              </div>

              {/* Table Body Rows */}
              <div className="flex flex-col">
                {tickets.map((ticket, index) => (
                  <div 
                    key={ticket.id} 
                    className={`grid grid-cols-12 gap-4 py-3.5 px-2 items-center font-sans border-b border-divider hover:bg-elevated/60 transition-colors rounded-xl ${index === tickets.length - 1 ? 'border-b-0' : ''}`}
                  >
                    {/* Ticket ID */}
                    <div className="col-span-2 pl-3">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg inline-block shadow-2xs">
                        {ticket.ticketId}
                      </span>
                    </div>

                    {/* Competition Name */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                        {ticket.raw?.raffle?.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ticket.raw.raffle.mainImage} alt={ticket.competitionName} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                            <circle cx="50" cy="50" r="30" />
                            <circle cx="50" cy="50" r="15" />
                          </svg>
                        )}
                      </div>
                      <span className="font-heading font-bold text-xs sm:text-sm text-text-primary truncate pr-2">
                        {ticket.competitionName}
                      </span>
                    </div>

                    {/* Purchase Date */}
                    <div className="col-span-2 font-sans font-semibold text-xs text-text-secondary">
                      {ticket.purchaseDate}
                    </div>

                    {/* Price Paid */}
                    <div className="col-span-1">
                      <span className="font-sans font-bold text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                        {ticket.pricePaid}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      {ticket.status === "live" && (
                        <div className="px-3 py-1 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-950 font-heading font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                          <span>Live</span>
                        </div>
                      )}
                      {ticket.status === "instant-win" && (
                        <div className="px-3 py-1 rounded-full border border-amber-400 bg-amber-200 text-amber-950 font-heading font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <span>⚡ Instant Win</span>
                        </div>
                      )}
                      {ticket.status === "drawn-won" && (
                        <div className="px-3 py-1 rounded-full border border-green-400 bg-green-200 text-green-950 font-heading font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <span>🏆 Drawn — Won</span>
                        </div>
                      )}
                      {ticket.status === "drawn-lost" && (
                        <div className="px-3 py-1 rounded-full border border-border-medium bg-elevated text-text-muted font-heading font-bold text-[10px] uppercase tracking-wider">
                          <span>Drawn — Lost</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 text-right pr-3">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="font-sans font-bold text-xs text-text-brand hover:text-primary-hover hover:underline transition-all whitespace-nowrap group flex items-center justify-end gap-1 w-full cursor-pointer focus:outline-none focus:ring-0"
                      >
                        View <span className="hidden sm:inline">Details</span>
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CompetitionDetailsModal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        ticket={selectedTicket} 
        allTickets={tickets}
      />
    </>
  );
}
