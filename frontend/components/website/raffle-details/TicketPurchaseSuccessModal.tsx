"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";

export interface InstantWinItem {
  id: string;
  ticketId: string;
  prizeName: string;
  ticketNumber?: number;
}

export interface TicketItem {
  id: string;
  ticketNumber: number;
}

export interface TicketPurchaseSuccessData {
  raffleTitle: string;
  tickets: TicketItem[];
  instantWins: InstantWinItem[];
  totalAmount?: number;
}

interface TicketPurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TicketPurchaseSuccessData | null;
}

export default function TicketPurchaseSuccessModal({
  isOpen,
  onClose,
  data,
}: TicketPurchaseSuccessModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !data || !mounted) return null;

  const { raffleTitle, tickets, instantWins } = data;
  const instantWinTicketIds = new Set(instantWins.map((iw) => iw.ticketId));
  const instantWinTicketNumbers = new Set(
    instantWins.map((iw) => iw.ticketNumber).filter((num): num is number => num !== undefined)
  );

  const handleGoToDashboard = () => {
    onClose();
    router.push("/dashboard/user/tickets");
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-[#12151F] border border-[rgba(212,175,55,0.35)] rounded-2xl w-full max-w-[560px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col z-[10000]">
        
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#B39042] via-[#D4AF37] to-[#F5E5C0]" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-[rgba(212,175,55,0.15)] bg-[#181C28]/80 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#090A0E] border border-[rgba(212,175,55,0.35)] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-[#F4EBD9] uppercase tracking-tight leading-tight">
                Tickets Allocated!
              </h2>
              <p className="font-sans text-xs text-[#A69B82] mt-0.5">
                {tickets.length} ticket(s) issued for <span className="text-[#D4AF37] font-bold">{raffleTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A69B82] hover:text-[#F4EBD9] hover:bg-[#181C28] transition-colors cursor-pointer select-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Scroll Area */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Instant Win Banner if user won any instant prize */}
          {instantWins.length > 0 && (
            <div className="bg-[#2A1E08] border border-[#D4AF37]/50 rounded-xl p-4 sm:p-5 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-heading font-black text-base text-[#D4AF37] uppercase tracking-wide">
                    INSTANT WIN PRIZE CLAIMED!
                  </h3>
                  <p className="font-sans text-xs text-[#A69B82] mt-0.5">
                    Congratulations! You instantly won {instantWins.length} prize(s) with your purchase!
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {instantWins.map((iw, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#12151F] border border-[rgba(212,175,55,0.2)] p-3 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-[#090A0E] bg-gradient-to-r from-[#D4AF37] to-[#B39042] px-2 py-0.5 rounded-md">
                        Ticket #{iw.ticketNumber || "WIN"}
                      </span>
                      <span className="font-heading font-bold text-xs text-[#F4EBD9]">
                        {iw.prizeName}
                      </span>
                    </div>
                    <span className="text-[10px] font-sans font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                      Instant Win Claimed
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 pt-3 border-t border-[rgba(212,175,55,0.2)] flex items-center gap-2 text-[11px] text-[#D4AF37] font-medium">
                <span>ℹ️</span>
                <span>Note: Your ticket(s) also remain 100% entered for the Main Competition Draw when the timer closes!</span>
              </div>
            </div>
          )}

          {/* Ticket Numbers Grid Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#D4AF37]">
                Your Instant Ticket Numbers ({tickets.length})
              </h3>
              <span className="font-mono text-[11px] text-[#A69B82]">
                Live in competition database
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[180px] overflow-y-auto p-1">
              {tickets.map((t) => {
                const isWinningTicket =
                  instantWinTicketIds.has(t.id) ||
                  (t.ticketNumber && instantWinTicketNumbers.has(t.ticketNumber));

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "py-2.5 px-3 rounded-xl font-mono font-bold text-sm text-center border transition-all flex items-center justify-center gap-1 select-none",
                      isWinningTicket
                        ? "bg-[#2A1E08] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)] animate-bounce"
                        : "bg-[#181C28] border-[rgba(212,175,55,0.2)] text-[#F4EBD9]"
                    )}
                  >
                    {isWinningTicket && <span>🏆</span>}
                    <span>#{t.ticketNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Notice Box */}
          <div className="bg-[#090A0E] border border-[rgba(212,175,55,0.2)] rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
            <p className="font-sans text-xs text-[#A69B82] leading-normal">
              Want to see all your active and past tickets anytime? Access your personal ticket ledger in your <strong className="text-[#F4EBD9]">Dashboard &gt; My Tickets</strong> page.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-7 border-t border-[rgba(212,175,55,0.15)] bg-[#181C28]/80 flex flex-col sm:flex-row gap-3 items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-dark-metallic w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[rgba(212,175,55,0.3)] text-[#F4EBD9] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer select-none"
          >
            Keep Browsing Competitions
          </button>

          <button
            type="button"
            onClick={handleGoToDashboard}
            className="btn-gold-metallic w-full sm:w-auto px-6 py-2.5 rounded-xl text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <span>View Tickets in Dashboard</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
