"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ticket } from "./TicketsTable";
import { formatUkDateTime } from "../../lib/uk-time";

interface CompetitionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  allTickets?: Ticket[];
}

export default function CompetitionDetailsModal({
  isOpen,
  onClose,
  ticket,
  allTickets = [],
}: CompetitionDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
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

  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({ d: 0, h: 0, m: 0, s: 0 });

  // Update countdown timer
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

  if (!isOpen || !ticket || !ticket.raw || !mounted) return null;

  const raffle = ticket.raw.raffle;
  
  // Aggregate data for this specific raffle
  const myRaffleTickets = allTickets.filter(t => t.raw?.raffle?.id === raffle.id);
  const ticketNumbers = myRaffleTickets.map(t => t.ticketId);
  const ticketsEntered = myRaffleTickets.length;
  const amountPaid = (Number(raffle.pricePerTicket) || 0) * ticketsEntered;
  const purchaseDate = myRaffleTickets[0]?.purchaseDate || ticket.purchaseDate;
  
  const soldPercent = raffle.totalTickets > 0 ? Math.min(Math.round((raffle.ticketsSold / raffle.totalTickets) * 100), 100) : 0;
  const remainingTickets = Math.max(raffle.totalTickets - raffle.ticketsSold, 0);
  const winChance = raffle.totalTickets > 0 ? ((ticketsEntered / raffle.totalTickets) * 100).toFixed(1) : "0";

  const hostName = raffle.host?.businessName || (raffle.host?.user ? `${raffle.host.user.firstName} ${raffle.host.user.lastName}` : "Fairway Draws Host");

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-surface border border-border rounded-card w-full max-w-[880px] max-h-[90vh] overflow-y-auto shadow-card flex flex-col relative z-[10000] animate-fadeIn custom-scrollbar">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 lg:px-7 border-b border-divider sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight line-clamp-1 max-w-[260px] sm:max-w-md">
                {raffle.title}
              </h2>
              <span className="font-sans text-xs text-text-muted">
                {ticket.ticketId} • Hosted by <strong className="text-text-primary font-semibold">{hostName}</strong>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs ${
              raffle.status === 'ACTIVE' 
                ? 'border border-primary/30 bg-accent-bg text-text-brand' 
                : 'border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]'
            }`}>
              {raffle.status === 'ACTIVE' ? 'Live Draw' : raffle.status}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row p-6 lg:p-7 gap-6">
          
          {/* Left Column (Competition Info) */}
          <div className="flex-1 flex flex-col gap-5">
            
            {/* Prize Card */}
            <div className="bg-elevated border border-border-medium rounded-xl p-5 flex items-start gap-4 shadow-xs">
              <div className="w-14 h-14 rounded-xl bg-surface border border-border-medium flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                 {raffle.mainImage ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={raffle.mainImage} alt={raffle.title} className="w-full h-full object-cover" />
                 ) : (
                  <svg className="w-6 h-6 text-text-brand" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                    <circle cx="50" cy="50" r="30" />
                    <circle cx="50" cy="50" r="15" />
                  </svg>
                 )}
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Prize Details</span>
                <h3 className="font-heading font-bold text-base text-text-primary mb-1">
                  {raffle.prizeName || raffle.title}
                </h3>
                <p className="font-sans text-xs text-text-muted leading-relaxed line-clamp-2">
                  {raffle.description || `Enter for a chance to win the ${raffle.title}.`}
                </p>
              </div>
            </div>

            {/* Draw Countdown */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-divider">
                <span className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider">Draw Countdown</span>
                <span className="font-sans text-xs text-text-muted font-semibold">End Date (UK): {formatUkDateTime(raffle.endDate)}</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: timeLeft.d, label: "DAYS" },
                  { value: timeLeft.h, label: "HOURS" },
                  { value: timeLeft.m, label: "MINUTES" },
                  { value: timeLeft.s, label: "SECONDS" }
                ].map((time) => (
                  <div key={time.label} className="bg-accent-bg border border-primary/30 rounded-xl py-3 flex flex-col items-center justify-center gap-0.5 shadow-xs">
                    <span className="font-heading font-black text-2xl text-text-brand leading-none">{time.value.toString().padStart(2, '0')}</span>
                    <span className="font-sans text-[9px] font-bold text-text-muted uppercase tracking-wider">{time.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Sales Progress */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider">Ticket Sales Progress</span>
                <span className="font-sans text-xs font-bold text-text-brand">{soldPercent}% sold</span>
              </div>
              <div className="w-full h-2.5 bg-elevated border border-border-medium rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${soldPercent}%` }} />
              </div>
              <div className="flex justify-between items-center font-sans text-xs text-text-muted font-semibold">
                <span>{raffle.ticketsSold} sold</span>
                <span>{remainingTickets} remaining of {raffle.totalTickets}</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                "Certified Random Draw", 
                "Fully Insured Shipping", 
                "Premium Golf Gear", 
                `Price per Ticket: £${Number(raffle.pricePerTicket).toFixed(2)}`
              ].map((feature) => (
                <div key={feature} className="bg-elevated border border-border-medium rounded-xl p-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-sans text-xs font-semibold text-text-secondary truncate">{feature}</span>
                </div>
              ))}
            </div>

            {/* Draw Rules */}
            <div className="bg-accent-bg border border-primary/30 rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">Draw Rules & Details</span>
              </div>
              <p className="font-sans text-xs text-text-secondary leading-relaxed pl-6">
                Winner selected via certified random draw. All ticket holders notified within 24h of draw. Prize shipped to UK addresses only.
              </p>
            </div>
          </div>

          {/* Right Column (My Entry Details) */}
          <div className="w-full md:w-[310px] shrink-0 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-divider pt-6 md:pt-0 md:pl-6">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight px-1">
              My Entry Details
            </h3>
            
            {/* Entry Summary Card */}
            <div className="bg-elevated border border-border-medium rounded-xl p-5 flex flex-col gap-4 shadow-xs relative">
              <div className="flex justify-between items-center">
                <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Tickets Entered</span>
                <span className="font-heading font-black text-xl text-text-primary">{ticketsEntered}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Paid</span>
                <span className="font-heading font-black text-base text-text-brand">£{amountPaid.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Purchased On</span>
                <span className="font-sans text-xs font-semibold text-text-primary">{purchaseDate}</span>
              </div>
              
              <div className="pt-3 border-t border-border-medium">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Winning Odds</span>
                  <span className="font-sans font-bold text-xs text-text-brand">{winChance}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-medium">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(Number(winChance), 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Ticket Numbers */}
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">
                Your Purchased Ticket Numbers
              </span>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {ticketNumbers.map((num) => (
                  <div key={num} className="bg-accent-bg border border-primary/20 rounded-lg px-3 py-1.5 flex items-center justify-center shadow-xs">
                    <span className="font-mono font-bold text-xs text-text-brand">{num}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status / Luck Box */}
            <div className="bg-surface border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center gap-1.5 shadow-xs">
              {ticket.status === 'drawn-won' || ticket.status === 'instant-win' ? (
                <>
                  <span className="text-2xl mb-1">🎉</span>
                  <span className="font-heading font-black text-base text-text-brand uppercase tracking-tight">Winner Declared!</span>
                  <p className="font-sans text-xs text-text-muted">
                    Congratulations! You won a prize from this draw!
                  </p>
                </>
              ) : ticket.status === 'drawn-lost' ? (
                <>
                  <span className="text-2xl mb-1">🤝</span>
                  <span className="font-heading font-bold text-sm text-text-primary uppercase">Draw Ended</span>
                  <p className="font-sans text-xs text-text-muted">
                    This draw has concluded. Thanks for participating!
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl mb-1">🍀</span>
                  <span className="font-heading font-bold text-sm text-text-primary uppercase">Good Luck!</span>
                  <p className="font-sans text-xs text-text-muted">
                    We&apos;ll notify you the moment results are announced.
                  </p>
                </>
              )}
            </div>

            {/* Action Button */}
            <button 
              onClick={onClose}
              className="w-full mt-auto h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
