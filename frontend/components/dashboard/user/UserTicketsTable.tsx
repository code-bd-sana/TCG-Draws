"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Ticket } from "@/components/dashboard/TicketsTable";
import { Pagination } from "@/components/ui/Pagination";

interface UserTicketsTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export const UserTicketsTable: React.FC<UserTicketsTableProps> = ({
  tickets,
  onSelectTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.competitionName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "All") return true;
      if (statusFilter === "Live") return ticket.status === "live";
      if (statusFilter === "Won") return ticket.status === "drawn-won" || ticket.status === "instant-win";
      if (statusFilter === "Instant Win") return ticket.status === "instant-win";
      if (statusFilter === "Drawn (Lost)") return ticket.status === "drawn-lost";
      return true;
    });
  }, [tickets, searchTerm, statusFilter]);

  // Paginated tickets
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;
    const headers = ["Ticket ID", "Competition", "Purchase Date", "Price Paid", "Status"];
    const rows = filteredTickets.map((t) => [
      t.ticketId,
      `"${t.competitionName.replace(/"/g, '""')}"`,
      t.purchaseDate,
      t.pricePaid,
      t.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TCG_Draws_Tickets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="art-deco-card rounded-2xl p-5 sm:p-7 flex flex-col gap-6 shadow-xl">
      {/* Controls Bar: Search + Status Pills + Export CSV */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[rgba(212,175,55,0.15)]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by ticket # or competition..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input-obsidian w-full h-11 pl-10 pr-10 text-xs sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
          {["All", "Live", "Won", "Instant Win", "Drawn (Lost)"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === status
                  ? "btn-gold-metallic text-[#090A0E] shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          disabled={filteredTickets.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] hover:border-[#D4AF37] text-text-muted hover:text-[#D4AF37] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer self-start lg:self-auto disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table Content */}
      {filteredTickets.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#D4AF37] text-2xl">
            🎟️
          </div>
          <h4 className="font-heading font-black text-lg text-text-primary uppercase tracking-wide">
            No Tickets Found
          </h4>
          <p className="font-sans text-xs text-text-muted max-w-sm">
            {searchTerm || statusFilter !== "All"
              ? "No tickets match your active filter settings. Try adjusting your query or resetting filters."
              : "You haven't entered any live competitions yet. Explore available raffles to secure your draw numbers."}
          </p>
          {(searchTerm || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
              className="mt-2 btn-gold-metallic px-5 py-2 rounded-xl text-xs font-heading font-black uppercase text-[#090A0E] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[900px] flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 pt-2 px-3 border-b border-[rgba(212,175,55,0.15)] font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider bg-[#090A0E]/60 rounded-xl mb-2">
              <div className="col-span-2 pl-2">Ticket ID</div>
              <div className="col-span-4">Competition</div>
              <div className="col-span-2">Purchase Date</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right pr-2">Action</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col gap-1.5">
              {paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="grid grid-cols-12 gap-4 py-3.5 px-3 items-center border border-white/5 hover:border-[rgba(212,175,55,0.3)] bg-[#090A0E]/40 hover:bg-[#090A0E]/80 transition-all rounded-xl group"
                >
                  {/* Ticket ID */}
                  <div className="col-span-2 pl-2">
                    <span className="font-mono font-black text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] px-2.5 py-1 rounded-lg inline-block shadow-2xs">
                      {ticket.ticketId}
                    </span>
                  </div>

                  {/* Competition Name & Image */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-[#141720] border border-[rgba(212,175,55,0.2)] flex items-center justify-center shrink-0 overflow-hidden relative">
                      {ticket.raw?.raffle?.mainImage ? (
                        <Image
                          src={ticket.raw.raffle.mainImage}
                          alt={ticket.competitionName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs text-[#D4AF37]">🎟️</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading font-black text-xs sm:text-sm text-text-primary truncate group-hover:text-[#D4AF37] transition-colors">
                        {ticket.competitionName}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted truncate">
                        {ticket.raw?.raffle?.category || "Pokémon TCG"}
                      </span>
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div className="col-span-2 font-mono text-xs text-text-muted">
                    {ticket.purchaseDate}
                  </div>

                  {/* Price Paid */}
                  <div className="col-span-1 font-mono text-xs">
                    {ticket.pricePaid === "Admin Assigned" ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400 whitespace-nowrap">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[#F5E5C0] font-bold">
                        {ticket.raw?.raffle?.pricePerTicket
                          ? `£${Number(ticket.raw.raffle.pricePerTicket).toFixed(2)}`
                          : "Paid"}
                      </span>
                    )}
                  </div>

                  {/* Status Outcome Badge */}
                  <div className="col-span-2 flex justify-center">
                    {ticket.status === "live" && (
                      <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Draw
                      </span>
                    )}
                    {ticket.status === "instant-win" && (
                      <span className="px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        ⚡ Instant Win
                      </span>
                    )}
                    {ticket.status === "drawn-won" && (
                      <span className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        🏆 Winner!
                      </span>
                    )}
                    {ticket.status === "drawn-lost" && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-text-muted font-mono text-[10px] uppercase tracking-wider">
                        Drawn (Lost)
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="col-span-1 text-right pr-2">
                    <button
                      type="button"
                      onClick={() => onSelectTicket(ticket)}
                      className="px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#090A0E] text-[#D4AF37] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
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
  );
};
