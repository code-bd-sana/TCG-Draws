"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDraggableModal } from "@/hooks/useDraggableModal";
import { Ticket } from "@/components/dashboard/TicketsTable";

interface UserTicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  allTickets?: Ticket[];
}

export const UserTicketDetailsModal: React.FC<UserTicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticket,
  allTickets = [],
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    modalRef,
    position,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: ticket?.id,
    onClose,
  });

  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  // Calculate live countdown timer
  useEffect(() => {
    if (!isOpen || !ticket || !ticket.raw?.raffle?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(ticket.raw.raffle.endDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isOpen, ticket]);

  if (!isOpen || !ticket || !ticket.raw) return null;

  const raffle = ticket.raw.raffle;
  const transaction = ticket.raw.transaction;
  const winners = ticket.raw.winners || [];
  const isWon = ticket.status === "drawn-won" || ticket.status === "instant-win";
  const isInstant = ticket.status === "instant-win";
  const isLive = ticket.status === "live";

  // Filter all tickets owned in this raffle
  const siblingTickets = allTickets.filter(
    (t) => t.raw?.raffle?.id === raffle?.id
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-2xl max-h-[92vh] art-deco-card rounded-2xl z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow ${
          isDragging
            ? "shadow-2xl ring-2 ring-[#D4AF37]/50 select-none cursor-grabbing"
            : "shadow-2xl border border-[rgba(212,175,55,0.35)]"
        }`}
      >
        {/* Top Gold Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent pointer-events-none" />

        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.15)] bg-[#090A0E]/80 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-[#090A0E]" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {/* Grip Icon */}
            <div className="p-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors shrink-0" title="Drag to move">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-heading font-black tracking-widest uppercase text-[#D4AF37]">
                  Verified Ticket Certificate
                </span>
                {isMoved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPosition();
                    }}
                    className="text-[9px] font-mono uppercase text-[#D4AF37] hover:underline tracking-wider cursor-pointer px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                    title="Double-click header or click to re-center"
                  >
                    (Reset)
                  </button>
                )}
              </div>
              <h2 className="text-base font-heading font-black text-text-primary uppercase tracking-wide truncate max-w-[320px] sm:max-w-[420px]">
                Ticket {ticket.ticketId}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#1C202B] border border-transparent hover:border-[rgba(212,175,55,0.2)] transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Main Hero Card Banner */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[rgba(212,175,55,0.25)] bg-[#090A0E] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-stretch">
            {/* Raffle Thumbnail */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#141720] flex-shrink-0 border border-[rgba(212,175,55,0.2)]">
              <Image
                src={raffle?.mainImage || "/coming-soon-hero.jpg"}
                alt={ticket.competitionName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Information */}
            <div className="flex flex-col justify-between flex-1 min-w-0 w-full">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black uppercase tracking-wider bg-[#141720] border border-[rgba(212,175,55,0.25)] text-[#F5E5C0]">
                    {raffle?.category || "Pokémon TCG"}
                  </span>

                  {isLive && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Draw Active
                    </span>
                  )}
                  {isInstant && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-400 uppercase font-bold">
                      ⚡ Instant Win Victory!
                    </span>
                  )}
                  {ticket.status === "drawn-won" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 uppercase font-bold">
                      🏆 Main Draw Winner!
                    </span>
                  )}
                  {ticket.status === "drawn-lost" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-text-muted uppercase">
                      Drawn (No Win)
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-black text-base sm:text-lg text-text-primary line-clamp-2">
                  {ticket.competitionName}
                </h3>
              </div>

              {/* Host & Price Tag */}
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(212,175,55,0.1)] text-xs font-mono">
                <span className="text-text-muted">
                  Host: <strong className="text-[#F5E5C0]">{raffle?.host?.businessName || "TCG Draws"}</strong>
                </span>
                <span className="text-[#D4AF37] font-bold">
                  {raffle?.pricePerTicket ? `£${Number(raffle.pricePerTicket).toFixed(2)}/tkt` : ticket.pricePaid}
                </span>
              </div>
            </div>
          </div>

          {/* Winning Outcome Banner (If Won) */}
          {isWon && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#D4AF37]/10 to-emerald-500/15 border border-[#D4AF37]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-xl shrink-0">
                  🏆
                </div>
                <div>
                  <h4 className="text-xs font-heading font-black uppercase text-[#F5E5C0]">
                    Congratulations! Winning Ticket
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    This ticket won: <strong className="text-emerald-400">{winners[0]?.prizeName || raffle?.prizeName || "Grand Prize"}</strong>
                  </p>
                </div>
              </div>
              <Link href="/dashboard/user/winners">
                <button className="btn-gold-metallic px-3.5 py-1.5 rounded-lg text-[10px] font-heading font-black uppercase cursor-pointer whitespace-nowrap text-[#090A0E]">
                  Claim Prize
                </button>
              </Link>
            </div>
          )}

          {/* Ticket ID & Countdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ticket Certificate Card */}
            <div className="p-4 rounded-xl bg-[#090A0E]/80 border border-[rgba(212,175,55,0.2)] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                Selected Ticket Number
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-mono font-black text-[#D4AF37] tracking-wider">
                  {ticket.ticketId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(ticket.ticketId, "Ticket Number")}
                  className="px-2.5 py-1 rounded-lg bg-[#141720] border border-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] text-xs font-mono text-[#F5E5C0] transition-colors cursor-pointer"
                >
                  {copiedKey === "Ticket Number" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                Purchased on <strong className="text-text-primary">{ticket.purchaseDate}</strong>
              </p>
            </div>

            {/* Countdown / Draw Time Card */}
            <div className="p-4 rounded-xl bg-[#090A0E]/80 border border-[rgba(212,175,55,0.2)] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                Draw Countdown / Status
              </span>
              {isLive ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center px-2 py-1 rounded bg-[#141720] border border-white/5 min-w-[36px]">
                    <span className="text-sm font-mono font-bold text-text-primary">{timeLeft.d}</span>
                    <span className="text-[8px] font-mono text-text-muted uppercase">days</span>
                  </div>
                  <span className="text-[#D4AF37] font-bold">:</span>
                  <div className="flex flex-col items-center px-2 py-1 rounded bg-[#141720] border border-white/5 min-w-[36px]">
                    <span className="text-sm font-mono font-bold text-text-primary">{timeLeft.h}</span>
                    <span className="text-[8px] font-mono text-text-muted uppercase">hrs</span>
                  </div>
                  <span className="text-[#D4AF37] font-bold">:</span>
                  <div className="flex flex-col items-center px-2 py-1 rounded bg-[#141720] border border-white/5 min-w-[36px]">
                    <span className="text-sm font-mono font-bold text-text-primary">{timeLeft.m}</span>
                    <span className="text-[8px] font-mono text-text-muted uppercase">min</span>
                  </div>
                  <span className="text-[#D4AF37] font-bold">:</span>
                  <div className="flex flex-col items-center px-2 py-1 rounded bg-[#141720] border border-white/5 min-w-[36px]">
                    <span className="text-sm font-mono font-bold text-[#D4AF37]">{timeLeft.s}</span>
                    <span className="text-[8px] font-mono text-text-muted uppercase">sec</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-text-primary font-mono text-sm pt-1">
                  <span>Draw completed on</span>
                  <span className="text-[#F5E5C0]">
                    {raffle?.endDate ? format(new Date(raffle.endDate), "dd MMM yyyy") : "N/A"}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-text-muted">
                {raffle?.guaranteedDraw ? "100% Guaranteed Draw" : "Standard Draw Terms"}
              </p>
            </div>
          </div>

          {/* Sibling Tickets in this Competition */}
          {siblingTickets.length > 1 && (
            <div className="p-4 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold uppercase tracking-wider text-[#D4AF37]">
                  All Your Entries in This Draw ({siblingTickets.length} Tickets)
                </span>
                <span className="font-mono text-text-muted text-[11px]">
                  Higher Win Odds
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {siblingTickets.map((sib) => {
                  const isCurrent = sib.id === ticket.id;
                  return (
                    <span
                      key={sib.id}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        isCurrent
                          ? "bg-[#D4AF37] text-[#090A0E] shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                          : "bg-[#141720] border border-white/10 text-text-muted"
                      }`}
                    >
                      {sib.ticketId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transaction Metadata Breakdown */}
          <div className="p-4 rounded-xl bg-[#090A0E]/50 border border-white/5 space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-text-muted">
              Order & Transaction Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">Transaction ID</span>
                <span className="font-mono font-medium text-text-primary truncate block">
                  {transaction?.id ? `#${transaction.id.slice(0, 12)}` : "Verified System Entry"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">Payment Method</span>
                <span className="font-mono font-medium text-text-primary">
                  {transaction?.paymentGateway || "Stripe Checkout"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">Payment Status</span>
                <span className="font-mono font-medium text-emerald-400">
                  {ticket.pricePaid === "Admin Assigned" ? "Admin Manual" : "Paid & Confirmed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[rgba(212,175,55,0.15)] bg-[#090A0E]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] text-text-muted hover:text-text-primary hover:bg-[#1C202B] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close Overview
          </button>

          {raffle?.slug && (
            <Link
              href={`/live-raffles/${raffle.slug}`}
              className="w-full sm:w-auto"
            >
              <button className="btn-gold-metallic w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all">
                <span>View Competition Page</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
