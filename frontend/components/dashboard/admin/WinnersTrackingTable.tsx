"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Winner, winnerService } from "../../../services/winner.service";
import VerifyWinnerModal from "./VerifyWinnerModal";
import WinnerDetailsModal from "./WinnerDetailsModal";

export default function WinnersTrackingTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [winTypeFilter, setWinTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

  const queryClient = useQueryClient();

  const statusFilters = ["All", "Pending Verification", "Verified & Published", "Prize Delivered"];
  const winTypeFilters = ["All", "Main Draw", "Instant Win"];

  const getVerificationQuery = (filter: string) => {
    switch (filter) {
      case "Pending Verification":
        return "PENDING";
      case "Verified & Published":
        return "VERIFIED";
      default:
        return "All";
    }
  };

  const getDeliveryQuery = (filter: string) => {
    if (filter === "Prize Delivered") return "DELIVERED";
    return "All";
  };

  const getWinTypeQuery = (filter: string) => {
    switch (filter) {
      case "Main Draw":
        return "MAIN_DRAW";
      case "Instant Win":
        return "INSTANT_WIN";
      default:
        return "All";
    }
  };

  const { data: winnersResponse, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adminWinners", activeFilter, winTypeFilter, page],
    queryFn: () =>
      winnerService.getAdminWinners({
        page,
        limit,
        verificationStatus: getVerificationQuery(activeFilter),
        status: getDeliveryQuery(activeFilter),
        winType: getWinTypeQuery(winTypeFilter),
      }),
  });

  const rawWinners = winnersResponse?.data || [];
  const meta = winnersResponse?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  // Filter rawWinners by search query (client-side instant search)
  const filteredWinners = useMemo(() => {
    if (!searchQuery.trim()) return rawWinners;
    const q = searchQuery.toLowerCase().trim();
    return rawWinners.filter((w) => {
      const name = `${w.user?.firstName || ""} ${w.user?.lastName || ""}`.toLowerCase();
      const email = (w.user?.email || "").toLowerCase();
      const prize = (w.prizeName || "").toLowerCase();
      const raffle = (w.raffle?.title || "").toLowerCase();
      const ticket = String(w.ticket?.ticketNumber ?? "");
      return (
        name.includes(q) ||
        email.includes(q) ||
        prize.includes(q) ||
        raffle.includes(q) ||
        ticket.includes(q)
      );
    });
  }, [rawWinners, searchQuery]);

  const handleOpenVerify = (winner: Winner) => {
    setSelectedWinner(winner);
    setIsVerifyModalOpen(true);
  };

  const handleOpenDetails = (winner: Winner) => {
    setSelectedWinner(winner);
    setIsDetailsModalOpen(true);
  };

  const handleVerifyModalClose = () => {
    setIsVerifyModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["adminWinners"] });
  };

  const handleExportCSV = () => {
    if (filteredWinners.length === 0) return;

    const headers = [
      "ID",
      "Winner Name",
      "User Email",
      "Competition Won",
      "Win Type",
      "Ticket Number",
      "Prize Name",
      "Draw Date",
      "Verification Status",
      "Delivery Status",
      "Tracking Number"
    ];

    const rows = filteredWinners.map((winner: Winner) => {
      const name = `${winner.user?.firstName || ""} ${winner.user?.lastName || ""}`.trim() || "Unknown";
      const email = winner.user?.email || "N/A";
      const competition = winner.raffle?.title || "Unknown Raffle";
      const winType = winner.winType === "INSTANT_WIN" ? "Instant Win" : "Main Draw";
      const ticketNum = winner.ticket?.ticketNumber ?? "N/A";
      const prize = winner.prizeName || "N/A";
      const drawDate = winner.createdAt ? format(new Date(winner.createdAt), "dd MMM yyyy HH:mm") : "N/A";
      const verificationStatus = winner.verificationStatus || "N/A";
      const deliveryStatus = winner.deliveryStatus || "N/A";
      const trackingNumber = winner.trackingNumber || "N/A";

      return [
        winner.id,
        name,
        email,
        competition,
        winType,
        ticketNum,
        prize,
        drawDate,
        verificationStatus,
        deliveryStatus,
        trackingNumber
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const filterTag = activeFilter.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const winTypeTag = winTypeFilter.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `tcg_draws_winners_${filterTag}_${winTypeTag}_${new Date().toISOString().slice(0, 10)}.csv`);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-2">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search input + Actions */}
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
              placeholder="Search by winner, email, prize, raffle, or ticket #..."
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
              className="btn-dark-metallic h-10 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Refresh winners list"
              disabled={isFetching}
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
              disabled={filteredWinners.length === 0}
              className="btn-dark-metallic h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
              title="Export filtered winners to CSV"
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

        {/* Row 2: Status & WinType Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {statusFilters.map((filter) => {
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

          {/* Win Type Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            <span className="text-[11px] font-sans text-text-muted uppercase tracking-wider font-bold mr-1 hidden sm:inline">
              Type:
            </span>
            {winTypeFilters.map((filter) => {
              const isActive = winTypeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => {
                    setWinTypeFilter(filter);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-[#090A0E] font-black shadow-sm border border-primary"
                      : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-medium"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Container in Luxury Art-Deco Card */}
      <div className="art-deco-card rounded-card overflow-hidden shadow-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-accent-bg/40">
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[22%]">
                  Winner Profile
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[20%]">
                  Competition Won
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[10%] text-center">
                  Winning Ticket
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[11%] text-center">
                  Win Type
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[11%] text-center">
                  Draw Date
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[14%]">
                  Prize Title
                </th>
                <th className="py-4 px-4 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[12%] text-center">
                  Claim Status
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[10%] text-right">
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
                        Loading competition winners &amp; claims...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.496 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492c.981.142 1.953.316 2.916.52a6.003 6.003 0 0 1-5.405 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                      </svg>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                        No competition winners found
                      </span>
                      <p className="text-xs text-text-muted">
                        Try adjusting your search criteria or filter status.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWinners.map((winner) => {
                  const name = `${winner.user?.firstName || ""} ${winner.user?.lastName || ""}`.trim() || winner.user?.email || "Unknown Winner";
                  const initials = name.substring(0, 2).toUpperCase();

                  const formattedDate = winner.createdAt
                    ? format(new Date(winner.createdAt), "dd MMM yyyy")
                    : "N/A";

                  const isPending = winner.verificationStatus === "PENDING";
                  const isVerified = winner.verificationStatus === "VERIFIED";
                  const isDelivered = winner.deliveryStatus === "DELIVERED";

                  return (
                    <tr
                      key={winner.id}
                      className="hover:bg-accent-bg/30 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetails(winner)}
                    >
                      {/* Winner Profile */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            {winner.user?.avatarUrl ? (
                              <img
                                src={winner.user.avatarUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-heading font-black text-xs text-text-brand">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-heading font-black text-xs text-text-primary truncate group-hover:text-text-brand transition-colors">
                              {name}
                            </span>
                            <span className="font-mono text-[11px] text-text-muted truncate">
                              {winner.user?.email || "No email available"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Competition Won */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col min-w-0 max-w-[220px]">
                          <span className="font-sans font-semibold text-xs text-text-primary truncate">
                            {winner.raffle?.title || "Unknown Raffle"}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted truncate">
                            ID: {winner.raffleId.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Winning Ticket */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-accent-bg border border-primary/30 font-mono font-black text-xs text-text-brand shadow-xs">
                          #{winner.ticket?.ticketNumber ?? "N/A"}
                        </span>
                      </td>

                      {/* Win Type */}
                      <td className="py-4 px-4 text-center">
                        {winner.winType === "INSTANT_WIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            ⚡ Instant Win
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                            🏆 Main Draw
                          </span>
                        )}
                      </td>

                      {/* Draw Date */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-sans font-medium text-xs text-text-muted">
                          {formattedDate}
                        </span>
                      </td>

                      {/* Prize Title */}
                      <td className="py-4 px-4">
                        <span className="font-heading font-black text-xs text-text-primary truncate block max-w-[180px]">
                          {winner.prizeName}
                        </span>
                      </td>

                      {/* Claim Status */}
                      <td className="py-4 px-4 text-center">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Prize Delivered
                          </span>
                        ) : isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Verified
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending Audit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                            {winner.verificationStatus}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleOpenVerify(winner)}
                              className="btn-gold-metallic h-8 px-3 rounded-lg font-heading font-black text-[10px] uppercase tracking-wider shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                            >
                              Verify Claim
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenDetails(winner)}
                            className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                            title="Inspect winner audit details"
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

        {/* Pagination & Meta Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/60 bg-accent-bg/20">
          <div className="text-xs text-text-muted font-sans">
            Showing <span className="font-bold text-text-primary">{filteredWinners.length}</span> of{" "}
            <span className="font-bold text-text-primary">{meta.total}</span> total winners recorded
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Previous
              </button>

              <span className="px-2 font-mono text-xs text-text-muted">
                Page <span className="font-bold text-text-primary">{meta.page}</span> of{" "}
                <span className="font-bold text-text-primary">{meta.totalPages}</span>
              </span>

              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Draggable Verification Modal */}
      <VerifyWinnerModal
        isOpen={isVerifyModalOpen}
        onClose={handleVerifyModalClose}
        winner={selectedWinner}
      />

      {/* Draggable Winner Details / Inspection Modal */}
      <WinnerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        winner={selectedWinner}
        onVerify={(winner) => {
          setSelectedWinner(winner);
          setIsVerifyModalOpen(true);
        }}
      />
    </div>
  );
}
