"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Raffle } from "@/services/raffle.service";
import { useDraggableModal } from "@/hooks/useDraggableModal";

interface CompetitionQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: Raffle | null;
}

export const CompetitionQuickViewModal: React.FC<CompetitionQuickViewModalProps> = ({
  isOpen,
  onClose,
  raffle,
}) => {
  const {
    modalRef,
    position,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: raffle?.id,
    onClose,
  });

  if (!isOpen || !raffle) return null;

  const now = new Date();
  const startDate = new Date(raffle.startDate);
  const endDate = new Date(raffle.endDate);
  const isLive = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  const timeDiff = endDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((timeDiff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((timeDiff / (1000 * 60)) % 60));
  const countdownText = isPast
    ? "Competition Ended"
    : `${days}d ${hours}h ${minutes}m remaining`;

  const ticketsSold = raffle.ticketsSold || 0;
  const totalTickets = raffle.totalTickets || 1;
  const ticketsRemaining = Math.max(0, totalTickets - ticketsSold);
  const progressPercentage = Math.min(
    100,
    Math.round((ticketsSold / totalTickets) * 100)
  );

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

        {/* Drag Handle / Header */}
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
                  Competition Overview
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
                {raffle.title}
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Main Hero Image */}
          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-[rgba(212,175,55,0.25)] bg-[#090A0E] group">
            <Image
              src={raffle.mainImage || "/coming-soon-hero.jpg"}
              alt={raffle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-transparent" />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider bg-[#090A0E]/85 backdrop-blur-md border border-[rgba(212,175,55,0.3)] text-[#F5E5C0]">
                {raffle.category || "Pokémon TCG"}
              </span>
              {isLive ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Now
                </span>
              ) : isPast ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider bg-rose-500/20 backdrop-blur-md border border-rose-500/40 text-rose-400">
                  Ended
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-400">
                  Upcoming
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              <div className="px-3.5 py-1.5 rounded-full bg-[#090A0E]/90 backdrop-blur-md border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <span className="text-xs font-mono font-black text-[#D4AF37]">
                  £{Number(raffle.pricePerTicket).toFixed(2)}
                  <span className="text-[10px] text-text-muted font-sans font-normal ml-1">/ ticket</span>
                </span>
              </div>
            </div>

            {/* Bottom Host & Countdown Info */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Hosted by</p>
                <p className="text-sm font-heading font-bold text-text-primary flex items-center gap-1.5">
                  {raffle.host?.businessName || raffle.host?.user?.firstName || "TCG Verified Host"}
                  <svg className="w-4 h-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#090A0E]/90 border border-[rgba(212,175,55,0.2)] text-xs font-mono text-[#F5E5C0]">
                  <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {countdownText}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Ticket Price</span>
              <span className="text-lg font-heading font-black text-[#D4AF37]">
                £{Number(raffle.pricePerTicket).toFixed(2)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Tickets Sold</span>
              <span className="text-lg font-heading font-black text-text-primary">
                {ticketsSold} <span className="text-xs font-normal text-text-muted">/ {totalTickets}</span>
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Remaining</span>
              <span className="text-lg font-heading font-black text-[#F5E5C0]">
                {ticketsRemaining}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Est. Value</span>
              <span className="text-lg font-heading font-black text-emerald-400">
                {raffle.mainPrizeValue ? `£${Number(raffle.mainPrizeValue).toLocaleString()}` : "Grail Item"}
              </span>
            </div>
          </div>

          {/* Ticket Sellout Progress Bar */}
          <div className="p-4 rounded-xl bg-[#090A0E]/80 border border-[rgba(212,175,55,0.2)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-heading font-bold uppercase tracking-wider text-text-primary">
                Competition Allocation
              </span>
              <span className="font-mono font-bold text-[#D4AF37]">{progressPercentage}% Sold</span>
            </div>
            <div className="w-full h-2.5 bg-[#1C202B] rounded-full overflow-hidden border border-[rgba(212,175,55,0.15)] p-[1px]">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#997A35] via-[#D4AF37] to-[#F5E5C0]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted font-mono pt-1">
              <span>{ticketsSold} claimed</span>
              <span>{ticketsRemaining} remaining</span>
            </div>
          </div>

          {/* Description & Rules */}
          {raffle.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#D4AF37]">
                About This Competition
              </h4>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-4 bg-[#090A0E]/50 p-3.5 rounded-xl border border-white/5">
                {raffle.description}
              </p>
            </div>
          )}

          {/* Guarantees & Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#090A0E]/50 border border-[rgba(212,175,55,0.1)]">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-text-primary text-[11px] font-medium">
                {raffle.guaranteedDraw ? "Guaranteed Draw Regardless of Sales" : "Standard Draw Terms"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#090A0E]/50 border border-[rgba(212,175,55,0.1)]">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <span className="text-text-primary text-[11px] font-medium">
                Cryptographically Verified Draw
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[rgba(212,175,55,0.15)] bg-[#090A0E]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] text-text-muted hover:text-text-primary hover:bg-[#1C202B] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close Overview
          </button>

          {isLive ? (
            <Link
              href={`/live-raffles/${raffle.slug}`}
              className="w-full sm:w-auto"
            >
              <button className="btn-gold-metallic w-full sm:w-auto px-8 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all">
                <span>Enter Draw Now</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </Link>
          ) : (
            <button
              disabled
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1C202B] border border-white/10 text-text-muted font-heading font-bold text-xs uppercase tracking-wider opacity-60 cursor-not-allowed"
            >
              Draw Not Live
            </button>
          )}
        </div>
      </div>
    </>
  );
};
