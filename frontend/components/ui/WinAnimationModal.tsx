"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface WinPrizeItem {
  id?: string;
  title: string;
  ticketNumber: number;
  rrpValue?: number | null;
  prizeImage?: string | null;
}

interface WinAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => void | Promise<void>;
  prizes: WinPrizeItem[];
}

function FastRollingNumbers() {
  const [numbers, setNumbers] = useState(["0", "0", "0", "0"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNumbers([
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
      ]);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2 items-center justify-center font-heading text-[40px] text-[#D4AF37] blur-[0.5px] opacity-90">
      {numbers.map((num, i) => (
        <div key={i} className="w-[50px] text-center bg-[#181C28] rounded-xl py-2 border border-[rgba(212,175,55,0.35)] shadow-inner font-black">
          {num}
        </div>
      ))}
    </div>
  );
}

export default function WinAnimationModal({ isOpen, onClose, onClaim, prizes }: WinAnimationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<"rolling" | "revealed">("rolling");
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStage("rolling");
      // Simulate the slot machine / roller delay (e.g., 2.5 seconds)
      const timer = setTimeout(() => {
        setStage("revealed");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleClaimClick = async () => {
    if (onClaim) {
      try {
        setIsClaiming(true);
        await onClaim();
      } catch (err) {
        console.error("Failed to claim instant win:", err);
      } finally {
        setIsClaiming(false);
      }
    } else {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="relative bg-[#12151F] border border-[rgba(212,175,55,0.35)] p-1 rounded-[24px] shadow-[0_0_60px_rgba(212,175,55,0.25)] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-500 z-[10000]">
        
        {/* Animated Glowing Border Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#F4EBD9] to-[#996515] opacity-25 animate-[spin_4s_linear_infinite]" />
        
        <div className="relative bg-[#12151F] p-6 sm:p-8 rounded-[22px] flex flex-col items-center text-center z-10 h-full w-full">
          
          {/* Subtle Dismiss X Button */}
          <button
            onClick={onClose}
            disabled={isClaiming}
            aria-label="Close"
            className="absolute top-4 right-4 text-[#A69B82] hover:text-[#D4AF37] transition-colors p-1.5 rounded-full hover:bg-white/5 cursor-pointer z-20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.4)] flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(212,175,55,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#D4AF37]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] mb-1.5 tracking-wide uppercase">
            {stage === "rolling" ? "Checking Tickets..." : "Congratulations!"}
          </h2>
          
          <p className="font-sans text-[12px] sm:text-[13px] text-[#D4AF37] mb-6 uppercase tracking-[1.5px] font-bold">
            {stage === "rolling" ? "Locating Instant Wins" : `You won ${prizes.length} Instant Prize${prizes.length > 1 ? 's' : ''}!`}
          </p>

          {/* Roller / Prize Display */}
          <div className="w-full bg-[#090A0E] border border-[rgba(212,175,55,0.2)] rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden min-h-[120px] max-h-[160px] flex items-center justify-center">
            
            {/* The Slot Machine "Spinning" Effect */}
            {stage === "rolling" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <FastRollingNumbers />
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2.5 max-h-[140px] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500 fade-in py-1">
                {prizes.map((prize, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#181C28] border border-[rgba(212,175,55,0.25)] p-3 rounded-xl shadow-sm">
                    <div className="flex flex-col text-left">
                      <span className="font-heading font-bold text-[#F4EBD9] text-sm sm:text-base leading-snug">
                        {prize.title}
                      </span>
                      {prize.rrpValue ? (
                        <span className="font-sans text-[#D4AF37] text-[11px] font-semibold">
                          Value: £{prize.rrpValue.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    <span className="font-sans text-[#090A0E] bg-[#D4AF37] px-2.5 py-1 rounded-lg text-[11px] uppercase font-black tracking-wider shrink-0 ml-2 shadow-xs">
                      Ticket #{prize.ticketNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Inner shadow overlay for roller effect */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.8),inset_0_-20px_20px_-10px_rgba(0,0,0,0.8)]" />
          </div>

          <button 
            onClick={handleClaimClick}
            disabled={stage === "rolling" || isClaiming}
            className={`btn-gold-metallic w-full h-12 rounded-xl font-heading font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              stage === "rolling" || isClaiming
                ? "opacity-50 cursor-not-allowed"
                : "text-[#090A0E] shadow-[0_0_25px_rgba(212,175,55,0.35)] active:scale-98"
            }`}
          >
            {isClaiming ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#090A0E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Claiming Prize...</span>
              </>
            ) : (
              "Claim Prize"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
