import React, { useState, useEffect } from "react";
import { HostDrawItem } from "../../../../types/host-dashboard.types";

interface Props {
  draw: HostDrawItem;
  isOpen: boolean;
  isDrawing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DrawConfirmationModal({ draw, isOpen, isDrawing, onClose, onConfirm }: Props) {
  const [loadingText, setLoadingText] = useState("Mixing Tickets...");
  const [randomNumber, setRandomNumber] = useState("00000");

  useEffect(() => {
    if (isDrawing) {
      const texts = ["Mixing Tickets...", "Generating Random Seed...", "Selecting Winner...", "Verifying Result..."];
      let i = 0;
      const textInterval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 800);
      
      const numInterval = setInterval(() => {
        setRandomNumber(Math.floor(10000 + Math.random() * 90000).toString());
      }, 50);

      return () => {
        clearInterval(textInterval);
        clearInterval(numInterval);
      };
    }
  }, [isDrawing]);

  if (!isOpen) return null;

  if (isDrawing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          {/* Glowing spinning ring with numbers inside */}
          <div className="relative flex items-center justify-center w-[160px] h-[160px] mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" style={{ animationDuration: '0.8s' }}></div>
            <div className="absolute inset-2 rounded-full shadow-lg"></div>
            {/* Random changing number */}
            <span className="font-heading font-black text-3xl text-text-brand tracking-widest tabular-nums z-10">
              {randomNumber}
            </span>
          </div>

          <h2 className="font-heading font-black text-2xl text-text-primary mb-3 text-center uppercase tracking-tight animate-pulse">
            DRAW IN PROGRESS
          </h2>
          
          <p className="font-sans font-bold text-sm text-text-brand text-center w-[280px] h-[24px]">
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-card p-8 w-full max-w-[480px] flex flex-col items-center shadow-card animate-in zoom-in-95 duration-200">
        
        <div className="w-14 h-14 rounded-2xl bg-accent-bg border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-xs">
          {/* Trophy icon */}
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
          </svg>
        </div>

        <h2 className="font-heading font-black text-xl text-text-primary mb-2 text-center uppercase tracking-tight">
          Confirm Random Draw
        </h2>
        
        <p className="font-sans text-sm text-text-muted text-center mb-8 leading-relaxed">
          This will randomly select 1 winner from <span className="text-text-brand font-bold">{draw.verifiedEntries}</span> verified entries for <strong>{draw.name}</strong>. This action cannot be undone.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={onConfirm}
            disabled={isDrawing}
            className="btn-glossy-red w-full h-[46px] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <span>Confirm &amp; Draw Winner</span>
          </button>
          
          <button 
            onClick={onClose}
            disabled={isDrawing}
            className="w-full h-[46px] bg-elevated border border-border hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
