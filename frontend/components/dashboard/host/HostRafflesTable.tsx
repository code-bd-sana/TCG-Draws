"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useHostRaffles, useDeleteRaffle, useDrawWinner } from "../../../hooks/useRaffleHooks";
import { useMySubscription } from "../../../hooks/useSubscriptionHooks";
import { cn } from "../../../lib/utils";
import { Pagination } from "../../ui/Pagination";
import { toast } from "sonner";
import ConfirmDeleteRaffleModal, { RaffleDeleteTarget } from "../shared/ConfirmDeleteRaffleModal";
import ViewSoldTicketsModal from "../shared/ViewSoldTicketsModal";
import { formatUkDateTime } from "../../../lib/uk-time";

const filters = ["All", "Live", "Pending Review", "Ended", "Drafts"];

export default function HostRafflesTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCompForDelete, setSelectedCompForDelete] = useState<RaffleDeleteTarget | null>(null);
  const [viewingTicketsRaffle, setViewingTicketsRaffle] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: mySub } = useMySubscription();
  const planName = (mySub?.plan?.name || "").toLowerCase();
  const commissionRate = planName.includes("premium") || planName.includes("pro") ? 10 : 15;

  const { data: response, isLoading } = useHostRaffles({ page, limit: 10, status: activeFilter });
  const raffles = response?.data || [];
  const meta = response?.meta;
  const deleteMutation = useDeleteRaffle();
  const drawWinnerMutation = useDrawWinner();

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleConfirmDelete = async () => {
    if (!selectedCompForDelete) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedCompForDelete.id);
      toast.success("Competition deleted successfully");
      setSelectedCompForDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete competition");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={cn(
                "h-[36px] px-4 rounded-full border transition-all flex items-center justify-center font-sans font-bold text-xs tracking-wide cursor-pointer",
                activeFilter === filter
                  ? "bg-accent-bg border-primary text-text-brand shadow-xs"
                  : "bg-elevated border-border text-text-muted hover:text-text-primary hover:bg-surface"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <Link 
          href="/dashboard/host/create"
          className="btn-glossy-red h-[42px] px-5 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all shadow-md active:scale-98"
        >
          <span>+ Create Competition</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col shadow-card">
        {/* Table Header */}
        <div className="grid grid-cols-5 items-center px-6 h-12 border-b border-divider bg-elevated/70">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
              Competition Name
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
              Tickets Sold
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
              Total Raised
            </span>
          </div>
          <div>
            <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
              Status
            </span>
          </div>
          <div className="hidden md:block text-right">
            <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
              Draw Date
            </span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {isLoading && (
            <div className="flex flex-col w-full animate-in fade-in duration-300">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-5 items-center px-6 min-h-[72px] py-3.5 border-b border-divider last:border-b-0 bg-surface">
                  {/* Raffle Name */}
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-3 pr-4">
                    <div className="w-3 h-3 shrink-0 bg-elevated rounded-sm animate-pulse"></div>
                    <div className="h-4 w-36 bg-elevated rounded animate-pulse"></div>
                  </div>
                  
                  {/* Tickets Sold */}
                  <div className="hidden sm:block">
                    <div className="h-4 w-20 bg-elevated rounded animate-pulse"></div>
                  </div>
                  
                  {/* Raised */}
                  <div className="hidden sm:block">
                    <div className="h-4 w-16 bg-elevated rounded animate-pulse"></div>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <div className="h-5 w-16 bg-elevated rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Ends */}
                  <div className="hidden md:flex justify-end">
                    <div className="h-4 w-24 bg-elevated rounded animate-pulse ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && raffles.map((raffle: any) => {
            const isExpanded = expandedId === raffle.id;
            return (
              <div key={raffle.id} className="flex flex-col border-b border-divider last:border-b-0">
                {/* Main Row */}
                <div
                  onClick={() => toggleRow(raffle.id)}
                  className="grid grid-cols-5 items-center px-6 min-h-[72px] py-3.5 cursor-pointer hover:bg-elevated/60 transition-colors bg-surface"
                >
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-3 min-w-0 pr-4">
                    <svg
                      className={cn(
                        "w-3.5 h-3.5 shrink-0 text-text-muted transition-transform duration-200",
                        isExpanded ? "rotate-180 text-primary" : "rotate-0"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                    <span className="font-heading font-bold text-sm text-text-primary truncate">
                      {raffle.title}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block">
                    <span className="font-sans font-semibold text-xs text-text-muted">
                      {raffle.ticketsSold} / {raffle.totalTickets}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block">
                    <span className="font-heading font-bold text-sm text-text-brand">
                      £{(Number(raffle.pricePerTicket) * raffle.ticketsSold).toFixed(2)}
                    </span>
                  </div>
                  
                  <div>
                    <div className={cn(
                      "inline-flex h-[24px] px-3 items-center justify-center rounded-full border text-[11px] font-bold uppercase tracking-wide",
                      raffle.status === "ACTIVE" && "bg-success-bg border-[#BBF7D0] text-success-text",
                      raffle.status === "ENDED" && "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]",
                      raffle.status === "DRAFT" && "bg-elevated border-border text-text-muted",
                      raffle.status === "PENDING_APPROVAL" && "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]",
                      raffle.status === "CANCELLED" && "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]"
                    )}>
                      <span>
                        {raffle.status === "ACTIVE"
                          ? (raffle.startDate && new Date(raffle.startDate) > new Date()
                            ? "Upcoming (Scheduled)"
                            : "Live")
                          : raffle.status === "PENDING_APPROVAL"
                            ? "Pending Review"
                            : raffle.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex justify-end min-w-0">
                    <span className="font-sans font-medium text-xs text-text-muted truncate">
                      {formatUkDateTime(raffle.endDate)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="w-full bg-bg border-t border-divider px-6 py-8 flex flex-col md:flex-row gap-8 md:gap-16">
                    {/* Gross Revenue */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
                        Gross Revenue
                      </span>
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-2xl text-text-primary">
                          £{(Number(raffle.pricePerTicket) * raffle.ticketsSold).toFixed(2)}
                        </span>
                        <span className="font-sans font-medium text-[11px] text-text-muted mt-0.5">
                          {raffle.ticketsSold} tickets × £{Number(raffle.pricePerTicket).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Platform Fee */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
                        Platform Fee
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-black text-2xl text-[#dc2626]">
                          - £{((Number(raffle.pricePerTicket) * raffle.ticketsSold) * (commissionRate / 100)).toFixed(2)}
                        </span>
                        <div className="h-6 px-2.5 bg-accent-bg border border-primary/30 rounded-full flex items-center justify-center">
                          <span className="font-sans font-bold text-[10px] text-text-brand uppercase">
                            {commissionRate}% Platform Fee
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block w-px bg-divider shrink-0 self-stretch" />

                    {/* Your Earnings */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
                        Your Net Earnings
                      </span>
                      <div className="flex flex-col relative w-full">
                        <span className="font-heading font-black text-2xl text-text-brand">
                          £{((Number(raffle.pricePerTicket) * raffle.ticketsSold) * ((100 - commissionRate) / 100)).toFixed(2)}
                        </span>
                        <span className="font-sans font-medium text-[11px] text-text-muted mt-0.5">
                          Paid out directly on completion
                        </span>
                        
                        {/* Action buttons */}
                        <div className="mt-5 md:absolute md:bottom-0 md:right-0 md:mt-0 flex flex-wrap gap-3 items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingTicketsRaffle(raffle);
                            }}
                            className="font-sans font-bold text-xs uppercase px-3 py-2 bg-elevated text-text-primary border border-border hover:bg-surface rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <span>🎟️</span>
                            <span>View Entries ({raffle.ticketsSold})</span>
                          </button>
                          {raffle.status === "ACTIVE" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to run the draw now?")) {
                                  setDrawingId(raffle.id);
                                  try {
                                    await new Promise(res => setTimeout(res, 3000));
                                    await drawWinnerMutation.mutateAsync(raffle.id);
                                    toast.success("Draw completed successfully!");
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.message || "Failed to run draw");
                                  } finally {
                                    setDrawingId(null);
                                  }
                                }
                              }}
                              disabled={drawingId === raffle.id}
                              className="btn-glossy-red font-sans font-bold text-xs uppercase px-4 py-2 text-white rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {drawingId === raffle.id ? "Drawing..." : "Run Draw Now"}
                            </button>
                          )}
                          {raffle.status === "ENDED" && (
                            <Link
                              href="/dashboard/host/winners"
                              onClick={(e) => e.stopPropagation()}
                              className="font-sans font-bold text-xs uppercase px-4 py-2 bg-accent-bg text-text-brand border border-primary/30 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xs"
                            >
                              View Winners
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/host/competitions/${raffle.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-sans font-bold text-xs uppercase tracking-wider text-text-brand hover:text-primary-hover transition-colors px-2 py-1"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompForDelete(raffle);
                            }}
                            disabled={deleteMutation.isPending || isDeleting}
                            className="font-sans font-bold text-xs uppercase tracking-wider text-[#dc2626] hover:text-[#b91c1c] transition-colors px-2 py-1 cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {!isLoading && raffles?.length === 0 && (
            <div className="p-12 text-center text-text-muted font-sans text-sm bg-surface">
              No competitions found matching criteria.
            </div>
          )}
        </div>
      </div>

      {/* Pagination component */}
      {!isLoading && meta && (meta.totalPages || meta.lastPage || 1) > 1 && (
        <Pagination 
          currentPage={meta.page}
          totalPages={meta.totalPages || meta.lastPage || 1}
          onPageChange={setPage}
        />
      )}

      {selectedCompForDelete && (
        <ConfirmDeleteRaffleModal
          isOpen={!!selectedCompForDelete}
          onClose={() => setSelectedCompForDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          raffle={selectedCompForDelete}
        />
      )}

      {viewingTicketsRaffle && (
        <ViewSoldTicketsModal
          isOpen={!!viewingTicketsRaffle}
          onClose={() => setViewingTicketsRaffle(null)}
          raffle={viewingTicketsRaffle}
        />
      )}
    </div>
  );
}
