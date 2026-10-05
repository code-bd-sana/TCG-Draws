"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { raffleService } from "../../../services/raffle.service";

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
              : "") ||
            "Entrant",
          userEmail: t.userEmail || t.user?.email || "N/A",
          avatarUrl: t.avatarUrl || t.user?.avatarUrl,
          createdAt: t.createdAt,
        }));
        setSoldTickets(mapped);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setErrorMessage(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load sold tickets for this competition."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTickets(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, raffle?.id]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const filteredTickets = soldTickets.filter((t) => {
    const query = ticketSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      t.ticketNumber.toString().includes(query) ||
      t.userName.toLowerCase().includes(query) ||
      t.userEmail.toLowerCase().includes(query)
    );
  });

  const handleSelectTicketFromList = (t: SoldTicket) => {
    setSelectedTicket(t);
    setTicketInput(t.ticketNumber.toString());
    setErrorMessage(null);
  };

  const handleDrawWinner = async (winningTicketNum?: number) => {
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
      setErrorMessage(err?.response?.data?.message || err.message || "An error occurred while drawing winner.");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[620px] bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card flex flex-col gap-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header Row */}
        <div className="flex items-start justify-between border-b border-divider pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h3 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
                Winner Selection
              </h3>
            </div>
            <p className="font-sans text-xs text-text-muted">
              {raffle.title}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Competition Info Badges */}
        <div className="grid grid-cols-2 gap-3 bg-elevated border border-border-medium p-3.5 rounded-xl text-xs">
          <div className="flex flex-col">
            <span className="text-text-muted text-[10px] uppercase font-sans font-bold">Draw Mode</span>
            <span className="font-heading font-bold text-xs text-text-brand mt-0.5">
              {raffle.isAutoDraw ? "Automatic Draw" : "Manual Winner Selection"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-text-muted text-[10px] uppercase font-sans font-bold">Total Sold Tickets</span>
            <span className="font-heading font-bold text-xs text-text-primary mt-0.5">
              {soldTickets.length || raffle.ticketsSold || 0} / {raffle.totalTickets}
            </span>
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-xs font-sans text-[#991B1B] flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Winner Result Success Screen */}
        {winnerResult ? (
          <div className="flex flex-col gap-4 bg-accent-bg border border-primary/30 rounded-xl p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-3xl mx-auto font-bold shadow-md">
              🎉
            </div>
            <div className="flex flex-col">
              <h4 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
                Main Winner Declared!
              </h4>
              <p className="font-sans text-xs text-text-brand mt-1 font-bold">
                Winning Ticket #{winnerResult.ticket?.ticketNumber || ticketInput}
              </p>
            </div>

            <div className="bg-surface border border-border p-4 rounded-xl text-left flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-divider">
                <span className="text-text-muted font-sans">Winner Name:</span>
                <span className="font-heading font-bold text-text-primary text-sm">
                  {winnerResult.user?.firstName
                    ? `${winnerResult.user.firstName} ${winnerResult.user.lastName || ''}`.trim()
                    : "Winner"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-divider">
                <span className="text-text-muted font-sans">Winner Email:</span>
                <span className="font-mono text-text-brand font-semibold">
                  {winnerResult.user?.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted font-sans">Prize Title:</span>
                <span className="font-heading font-bold text-text-primary">
                  {winnerResult.prizeName || raffle.title}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 cursor-pointer mt-2"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <>
            {/* Draw Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-elevated border border-border-medium rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manual");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-surface border border-border text-text-brand shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                🔍 Search Buyer & Ticket Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("random");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === "random"
                    ? "bg-surface border border-border text-text-brand shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                🎲 Certified Random Draw
              </button>
            </div>

            {/* Tab 1: Manual Search & Input */}
            {activeTab === "manual" && (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                {/* Search Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-bold text-text-primary">
                    Search Sold Tickets (by Ticket #, Name, or Email)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type ticket number, buyer name, or email to search..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-elevated border border-border-medium rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:border-primary outline-none transition-colors"
                    />
                    <svg className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                </div>

                {/* Sold Tickets Search Results Dropdown List */}
                <div className="flex flex-col gap-1 bg-elevated border border-border-medium rounded-xl p-2 max-h-[190px] overflow-y-auto">
                  {isLoadingTickets ? (
                    <div className="py-6 text-center text-xs text-text-muted font-sans">Loading sold tickets list...</div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="py-6 text-center text-xs text-text-muted font-sans">
                      {soldTickets.length === 0 ? "No tickets sold yet in this competition." : "No matching tickets found for your search."}
                    </div>
                  ) : (
                    filteredTickets.map((t) => {
                      const isSelected = ticketInput === t.ticketNumber.toString();
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTicketFromList(t)}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-accent-bg border border-primary text-text-brand"
                              : "bg-surface border border-border hover:border-border-medium text-text-primary"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-heading font-bold text-xs bg-accent-bg border border-primary/30 text-text-brand px-2 py-1 rounded-md">
                              Ticket #{t.ticketNumber}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-sans font-semibold text-xs text-text-primary">{t.userName}</span>
                              <span className="font-sans text-[11px] text-text-muted">{t.userEmail}</span>
                            </div>
                          </div>

                          <span className={`text-[11px] font-bold ${isSelected ? "text-text-brand" : "text-text-muted"}`}>
                            {isSelected ? "Selected ✓" : "Select"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Direct Number Input */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-divider">
                  <label className="font-sans text-xs font-bold text-text-primary">
                    Selected Winning Ticket Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={raffle.totalTickets}
                    placeholder="e.g. 42"
                    value={ticketInput}
                    onChange={(e) => {
                      setTicketInput(e.target.value);
                      setSelectedTicket(null);
                    }}
                    className="h-11 px-4 bg-elevated border border-border-medium rounded-xl font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-primary outline-none transition-colors"
                    required
                  />
                  {selectedTicket && (
                    <span className="font-sans text-[11px] text-text-brand flex items-center gap-1 mt-0.5">
                      ✓ Selected ticket #{selectedTicket.ticketNumber} belongs to <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !ticketInput}
                  className="w-full h-11 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer mt-1"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse font-bold">Validating & Setting Winner...</span>
                  ) : (
                    <span>Confirm & Declare Winner</span>
                  )}
                </button>
              </form>
            )}

            {/* Tab 2: Random Draw */}
            {activeTab === "random" && (
              <div className="flex flex-col gap-4 py-2">
                <p className="font-sans text-xs text-text-muted leading-relaxed bg-elevated border border-border-medium p-4 rounded-xl">
                  Clicking below will use the certified randomizer to instantly pick a winning ticket from all <strong>{soldTickets.length || raffle.ticketsSold || 0}</strong> sold tickets in this competition.
                </p>

                <button
                  type="button"
                  onClick={() => handleDrawWinner()}
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse font-bold">Running Certified Random Draw...</span>
                  ) : (
                    <span>🎲 Draw Random Winner Now</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
