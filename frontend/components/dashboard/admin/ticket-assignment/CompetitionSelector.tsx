"use client";

import React, { useState } from "react";
import { CompetitionItem } from "../../../../services/admin-ticket-assignment.service";

interface CompetitionSelectorProps {
  competitions: CompetitionItem[];
  selectedCompetition: CompetitionItem | null;
  onSelectCompetition: (competition: CompetitionItem) => void;
  isLoading?: boolean;
}

export default function CompetitionSelector({
  competitions,
  selectedCompetition,
  onSelectCompetition,
  isLoading,
}: CompetitionSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCompetitions = competitions.filter((comp) => {
    const term = search.toLowerCase();
    return (
      comp.title.toLowerCase().includes(term) ||
      (comp.slug && comp.slug.toLowerCase().includes(term)) ||
      comp.host.ownerName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="font-heading font-black text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-mono">
            1
          </span>
          Select Live Competition
        </label>
        {selectedCompetition && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-heading font-bold text-text-brand hover:text-primary transition-colors cursor-pointer"
          >
            {isOpen ? "Close Selector ▲" : "Change Competition ▼"}
          </button>
        )}
      </div>

      {/* Selected Competition Display Card */}
      {selectedCompetition && !isOpen && (
        <div className="bg-surface border-2 border-primary/40 rounded-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-card relative overflow-hidden animate-fadeIn">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-20 h-20 rounded-xl bg-elevated border border-border shrink-0 overflow-hidden relative shadow-xs">
              {selectedCompetition.mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedCompetition.mainImage}
                  alt={selectedCompetition.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  🃏
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                  Live
                </span>
                {selectedCompetition.instantWinCounts.total > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    ⚡ {selectedCompetition.instantWinCounts.available} /{" "}
                    {selectedCompetition.instantWinCounts.total} Instant Wins Available
                  </span>
                )}
              </div>
              <h3 className="font-heading font-black text-base sm:text-lg text-text-primary truncate">
                {selectedCompetition.title}
              </h3>
              <p className="font-sans text-xs text-text-muted">
                Host: <strong className="text-text-secondary">{selectedCompetition.host.ownerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto md:border-l border-divider md:pl-6">
            <div className="flex flex-col">
              <span className="font-sans text-[11px] text-text-muted uppercase font-bold">
                Ticket Price
              </span>
              <span className="font-heading font-black text-lg text-primary">
                £{selectedCompetition.pricePerTicket.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col min-w-[140px] w-full sm:w-auto">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-sans text-[11px] text-text-muted font-bold">
                  Sold / Remaining
                </span>
                <span className="font-mono font-bold text-text-primary text-[11px]">
                  {selectedCompetition.ticketsSold} / {selectedCompetition.totalTickets}
                </span>
              </div>
              <div className="w-full bg-elevated rounded-full h-2 overflow-hidden border border-border">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedCompetition.ticketsSold / selectedCompetition.totalTickets) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5">
                {selectedCompetition.remainingTickets} available
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-elevated border border-border hover:bg-surface text-text-secondary hover:text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              Switch
            </button>
          </div>
        </div>
      )}

      {/* Dropdown / Search Selector */}
      {(!selectedCompetition || isOpen) && (
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 flex flex-col gap-3 shadow-card animate-fadeIn">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active competition by title or host..."
              className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-text-muted font-sans flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading live competitions...
            </div>
          ) : filteredCompetitions.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted font-sans">
              No active competitions match &quot;{search}&quot;.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredCompetitions.map((comp) => {
                const isSelected = selectedCompetition?.id === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      onSelectCompetition(comp);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-xs"
                        : "bg-elevated/40 border-border hover:border-primary/50 hover:bg-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden shrink-0 relative">
                        {comp.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={comp.mainImage}
                            alt={comp.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🃏
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-heading font-black text-xs text-text-primary truncate">
                          {comp.title}
                        </span>
                        <span className="font-sans text-[11px] text-text-muted">
                          Host: {comp.host.ownerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-xs text-primary">
                          £{comp.pricePerTicket.toFixed(2)}
                        </span>
                        <span className="font-sans text-[10px] text-text-muted">
                          {comp.remainingTickets} left
                        </span>
                      </div>
                      {comp.instantWinCounts.total > 0 && (
                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold">
                          ⚡ {comp.instantWinCounts.available} IW
                        </span>
                      )}
                      <span className="text-xs text-text-brand font-bold">
                        {isSelected ? "Selected ✓" : "Select →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
