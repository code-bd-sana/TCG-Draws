"use client";

import React, { useState } from "react";
import FreePostalEntryModal from "./FreePostalEntryModal";
import { cn } from "../../../lib/utils";

interface FreePostalEntryButtonProps {
  raffleTitle?: string;
  variant?: "badge" | "button" | "card";
  className?: string;
}

export default function FreePostalEntryButton({
  raffleTitle,
  variant = "badge",
  className,
}: FreePostalEntryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "badge" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-xs shadow-xs hover:bg-elevated transition-all cursor-pointer select-none",
            className
          )}
        >
          <span className="text-sm">✉️</span>
          <span>Free Postal Entry</span>
        </button>
      )}

      {variant === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full h-11 px-4 rounded-xl bg-elevated border border-border-medium hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs",
            className
          )}
        >
          <span className="text-sm">✉️</span>
          <span>Enter for Free by Post</span>
        </button>
      )}

      {variant === "card" && (
        <div
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full bg-surface border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-elevated transition-all shadow-card group",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center text-xl shrink-0">
              ✉️
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-text-primary group-hover:text-text-brand transition-colors">
                Free Postal Entry Route (UK Law)
              </h4>
              <p className="font-sans text-[11px] text-text-muted">
                Equal free entry available on an unenclosed postcard.
              </p>
            </div>
          </div>
          <span className="font-sans font-bold text-xs text-text-brand underline group-hover:translate-x-0.5 transition-transform shrink-0">
            View Rules &rarr;
          </span>
        </div>
      )}

      <FreePostalEntryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        raffleTitle={raffleTitle}
      />
    </>
  );
}
