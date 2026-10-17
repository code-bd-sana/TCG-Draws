"use client";

import React from "react";
import { InstantWinItem } from "../../../../services/admin-ticket-assignment.service";

interface InstantWinVisualizerProps {
  instantWins: InstantWinItem[];
  selectedTicketNumbers: number[];
  onToggleTicketNumber: (num: number) => void;
}

export default function InstantWinVisualizer({
  instantWins,
  selectedTicketNumbers,
  onToggleTicketNumber,
}: InstantWinVisualizerProps) {
  if (!instantWins || instantWins.length === 0) {
    return null;
  }

  const availableWins = instantWins.filter((w) => !w.isClaimed);
  const claimedWins = instantWins.filter((w) => w.isClaimed);

  return (
    <div className="bg-surface border border-amber-500/30 rounded-card p-4 sm:p-5 flex flex-col gap-3 shadow-card bg-linear-to-r from-amber-500/5 to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <h4 className="font-heading font-black text-sm uppercase tracking-wide text-text-primary flex items-center gap-2">
              Instant Win Prize Tracker
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono font-bold">
                {availableWins.length} Available / {instantWins.length} Total
              </span>
            </h4>
            <p className="font-sans text-[11px] text-text-muted">
              Click any available prize to automatically add that ticket number to your assignment selection.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {instantWins.map((win) => {
          const isSelected = selectedTicketNumbers.includes(win.ticketNumber);
          const isAvailable = !win.isClaimed;

          return (
            <div
              key={win.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                win.isClaimed
                  ? "bg-elevated/40 border-border text-text-muted opacity-60"
                  : isSelected
                  ? "bg-amber-500/20 border-amber-500 shadow-xs"
                  : "bg-surface border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 cursor-pointer"
              }`}
              onClick={() => {
                if (isAvailable) {
                  onToggleTicketNumber(win.ticketNumber);
                }
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg border shrink-0 ${
                    win.isClaimed
                      ? "bg-elevated border-border text-text-muted line-through"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-600"
                  }`}
                >
                  #{win.ticketNumber}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold truncate text-[11px] text-text-primary">
                    {win.prizeName}
                  </span>
                  {win.rrpValue && (
                    <span className="font-sans text-[10px] text-text-muted">
                      RRP £{win.rrpValue.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {win.isClaimed ? (
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    Claimed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTicketNumber(win.ticketNumber);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-heading font-black uppercase transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-black shadow-xs"
                        : "bg-amber-500/15 text-amber-600 hover:bg-amber-500 hover:text-black border border-amber-500/30"
                    }`}
                  >
                    {isSelected ? "Selected ✓" : "+ Select"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
