"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { raffleService } from "../../../services/raffle.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

export interface SoldTicket {
  id: string;
  ticketNumber: number;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  createdAt: string;
}

interface ManualWinnerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: {
    id: string;
    title: string;
    totalTickets: number;
    ticketsSold?: number;
    isAutoDraw?: boolean;
    slug?: string;
  };
  onSuccess?: () => void;
  isAdmin?: boolean;
}

export default function ManualWinnerSelectModal({
  isOpen,
  onClose,
  raffle,
  onSuccess,
  isAdmin = true,
}: ManualWinnerSelectModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"manual" | "random">("manual");
  const [ticketInput, setTicketInput] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<SoldTicket | null>(null);

  const [soldTickets, setSoldTickets] = useState<SoldTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [winnerResult, setWinnerResult] = useState<any | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: raffle?.id,
    onClose: !isSubmitting ? onClose : undefined,
  });

  // Fetch sold tickets when modal opens
  useEffect(() => {
    if (!isOpen || !raffle?.id) {
      setSoldTickets([]);
      setSelectedTicket(null);
      setTicketInput("");
      setErrorMessage(null);
      setWinnerResult(null);
      return;
    }

    let isMounted = true;
    setIsLoadingTickets(true);
    setErrorMessage(null);

    raffleService
      .getSoldTickets(raffle.id)
      .then((data) => {
        if (!isMounted) return;
        const mapped: SoldTicket[] = (data || []).map((t: any) => ({
          id: t.id,
          ticketNumber: Number(t.ticketNumber),
          userId: t.userId || t.user?.id || "",
          userName:
            t.userName ||
            t.buyerName ||
            (t.user
              ? `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim()
              : "Anonymous Player"),
          userEmail: t.userEmail || t.user?.email || "No email",
          avatarUrl: t.avatarUrl || t.user?.avatarUrl,
          createdAt: t.createdAt,
        }));
        setSoldTickets(mapped);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(
          err?.response?.data?.message || "Failed to fetch sold tickets."
        );
      })
      .finally(() => {
        if (isMounted) setIsLoadingTickets(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, raffle?.id]);

  if (typeof window === "undefined" || !isOpen || !raffle) return null;

  const filteredTickets = soldTickets.filter((t) => {
    if (!ticketSearch.trim()) return true;
    const q = ticketSearch.toLowerCase().trim();
    return (
      t.ticketNumber.toString().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q)
    );
  });

  const handleDrawWinner = async (winningTicketNum: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setWinnerResult(null);

    try {
      const data = await raffleService.adminDrawWinner(raffle.id, winningTicketNum);
      setWinnerResult(data);
      queryClient.invalidateQueries({ queryKey: ["adminRaffles"] });
      queryClient.invalidateQueries({ queryKey: ["adminAllRaffles"] });
      queryClient.invalidateQueries({ queryKey: ["raffleSoldTickets", raffle.id] });
      queryClient.invalidateQueries({ queryKey: ["raffleWinners", raffle.id] });
      queryClient.invalidateQueries({ queryKey: ["raffle", raffle.id] });
      queryClient.invalidateQueries({ queryKey: ["publicRaffles"] });
      queryClient.invalidateQueries({ queryKey: ["hostRaffles"] });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err.message || "An error occurred while drawing winner."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(ticketInput.trim(), 10);
    if (isNaN(num) || num <= 0) {
      setErrorMessage("Please enter or select a valid ticket number.");
      return;
    }
    handleDrawWinner(num);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] select-none">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Draggable Modal Window */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[620px] max-h-[90vh] bg-surface border border-border rounded-card z-10 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : "shadow-card"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-accent-bg/40 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-accent-bg/70" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="w-4 h-4 text-text-muted opacity-70 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <div className="flex items-center gap-2 truncate">
              <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
                Draw Winner Selection
              </h2>
              {isMoved && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetPosition();
                  }}
                  className="text-[10px] text-text-brand hover:underline font-semibold ml-1 cursor-pointer shrink-0"
                >
                  (Reset)
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isMoved && (
              <button
                type="button"
                onClick={resetPosition}
                title="Reset window to center"
                className="p-1 rounded text-text-muted hover:text-text-brand hover:bg-surface transition-colors cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-surface disabled:opacity-50 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-7 flex flex-col gap-5 select-text">
          {/* Competition Info Card */}
          <div className="bg-elevated/40 border border-border-medium rounded-xl p-4 flex flex-col gap-2">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Target Competition
            </span>
            <h4 className="font-heading font-black text-sm sm:text-base text-text-primary line-clamp-2">
              {raffle.title}
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-divider text-xs">
              <div>
                <span className="text-text-muted text-[10px] uppercase font-sans font-bold">Draw Engine</span>
                <span className="font-heading font-bold text-xs text-text-brand block mt-0.5">
                  {raffle.isAutoDraw ? "Automatic Provable Draw" : "Manual Winner Selection"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-text-muted text-[10px] uppercase font-sans font-bold">Sold Entries</span>
                <span className="font-heading font-black text-xs text-text-primary block mt-0.5">
                  {soldTickets.length || raffle.ticketsSold || 0} / {raffle.totalTickets}
                </span>
              </div>
            </div>
          </div>

          {/* Winner Success Announcement Card */}
          {winnerResult && (
            <div className="bg-emerald-500/15 border-2 border-emerald-500/40 rounded-xl p-5 flex flex-col items-center text-center gap-3 animate-scaleUp">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-xs">
                🏆
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base sm:text-lg text-emerald-400 uppercase tracking-tight">
                  Winner Confirmed!
                </span>
                <span className="font-sans text-xs text-text-muted mt-0.5">
                  Winning Ticket:{" "}
                  <strong className="text-text-brand font-black font-heading text-sm">
                    #{winnerResult.ticketNumber || ticketInput}
                  </strong>
                </span>
                {winnerResult.winner?.name && (
                  <span className="font-heading font-bold text-sm text-text-primary mt-1">
                    Winner: {winnerResult.winner.name} ({winnerResult.winner.email})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-gold-metallic px-6 py-2 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer mt-1"
              >
                Close &amp; Update Draw
              </button>
            </div>
          )}

          {/* Tab Selector */}
          {!winnerResult && (
            <>
              <div className="flex items-center gap-2 p-1 bg-elevated border border-border rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 py-2 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "manual"
                      ? "bg-primary text-[#090A0E] font-black shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Manual Ticket Entry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("random")}
                  className={`flex-1 py-2 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "random"
                      ? "bg-primary text-[#090A0E] font-black shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Sold Tickets Pool ({soldTickets.length})
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-sans text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: Manual Input */}
              {activeTab === "manual" && (
                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-xs text-text-muted uppercase tracking-wider">
                      Enter Drawn Winning Ticket Number
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 42"
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                      disabled={isSubmitting}
                      className="h-12 px-4 rounded-xl bg-elevated border border-border-medium focus:border-primary text-text-primary font-heading font-black text-base outline-none transition-all placeholder:text-text-muted/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !ticketInput.trim()}
                    className="btn-gold-metallic h-11 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Confirm &amp; Announce Winner</span>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Sold Tickets Pool */}
              {activeTab === "random" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Search ticket # or buyer name..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-elevated border border-border text-xs text-text-primary outline-none focus:border-primary w-full"
                    />
                  </div>

                  <div className="max-h-[220px] overflow-y-auto border border-border rounded-xl divide-y divide-divider bg-elevated/30">
                    {isLoadingTickets ? (
                      <div className="py-8 text-center text-text-muted text-xs animate-pulse font-sans">
                        Loading sold tickets...
                      </div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="py-8 text-center text-text-muted text-xs font-sans">
                        No sold tickets match search.
                      </div>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setTicketInput(ticket.ticketNumber.toString());
                          }}
                          className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors ${
                            selectedTicket?.id === ticket.id
                              ? "bg-primary/15 border-l-4 border-primary"
                              : "hover:bg-elevated"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-heading font-black text-text-brand text-xs px-2 py-0.5 rounded bg-surface border border-border">
                              #{ticket.ticketNumber}
                            </span>
                            <span className="font-heading font-bold text-text-primary">
                              {ticket.userName}
                            </span>
                          </div>
                          <span className="font-sans text-[11px] text-text-muted truncate max-w-[140px]">
                            {ticket.userEmail}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedTicket && (
                    <button
                      type="button"
                      onClick={() => handleDrawWinner(selectedTicket.ticketNumber)}
                      disabled={isSubmitting}
                      className="btn-gold-metallic h-11 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-1"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Select Ticket #{selectedTicket.ticketNumber} as Winner</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
