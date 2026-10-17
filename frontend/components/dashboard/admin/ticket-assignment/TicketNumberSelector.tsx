"use client";

import React, { useState, useMemo } from "react";
import {
  CompetitionDetails,
  InstantWinItem,
  SoldTicketItem,
} from "../../../../services/admin-ticket-assignment.service";

interface TicketNumberSelectorProps {
  competition: CompetitionDetails;
  mode: "specific" | "random";
  onModeChange: (mode: "specific" | "random") => void;
  selectedNumbers: number[];
  onSelectedNumbersChange: (numbers: number[]) => void;
  randomQuantity: number;
  onRandomQuantityChange: (qty: number) => void;
}

export default function TicketNumberSelector({
  competition,
  mode,
  onModeChange,
  selectedNumbers,
  onSelectedNumbersChange,
  randomQuantity,
  onRandomQuantityChange,
}: TicketNumberSelectorProps) {
  const [manualInput, setManualInput] = useState("");
  const [gridFilter, setGridFilter] = useState<
    "all" | "available" | "instant_wins" | "sold"
  >("all");
  const [gridPage, setGridPage] = useState(1);
  const pageSize = 120; // 120 tiles per page for silky smooth rendering

  // Create fast lookup maps
  const soldMap = useMemo(() => {
    const map = new Map<number, SoldTicketItem>();
    competition.soldTickets.forEach((t) => {
      map.set(t.ticketNumber, t);
    });
    return map;
  }, [competition.soldTickets]);

  const instantWinMap = useMemo(() => {
    const map = new Map<number, InstantWinItem>();
    competition.instantWins.forEach((iw) => {
      map.set(iw.ticketNumber, iw);
    });
    return map;
  }, [competition.instantWins]);

  // Handle parsing manual input
  const handleApplyManualInput = () => {
    if (!manualInput.trim()) return;

    const parts = manualInput.split(/[,\s]+/).filter(Boolean);
    const parsedNums: number[] = [];
    const errors: string[] = [];

    parts.forEach((p) => {
      const n = parseInt(p.replace(/#/g, ""), 10);
      if (isNaN(n) || n < 1 || n > competition.totalTickets) {
        errors.push(`Invalid ticket number: ${p}`);
      } else if (soldMap.has(n)) {
        errors.push(`Ticket #${n} is already sold`);
      } else {
        parsedNums.push(n);
      }
    });

    if (parsedNums.length > 0) {
      const combined = Array.from(new Set([...selectedNumbers, ...parsedNums]));
      onSelectedNumbersChange(combined.sort((a, b) => a - b));
      setManualInput("");
    }
  };

  const handleTileClick = (num: number) => {
    if (soldMap.has(num)) return; // Sold tickets cannot be selected

    if (selectedNumbers.includes(num)) {
      onSelectedNumbersChange(selectedNumbers.filter((n) => n !== num));
    } else {
      onSelectedNumbersChange([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleRemoveNumber = (num: number) => {
    onSelectedNumbersChange(selectedNumbers.filter((n) => n !== num));
  };

  const handleClearAll = () => {
    onSelectedNumbersChange([]);
  };

  // Generate tiles array based on filter
  const filteredTicketNumbers = useMemo(() => {
    const total = competition.totalTickets;
    const nums: number[] = [];

    for (let i = 1; i <= total; i++) {
      const isSold = soldMap.has(i);
      const isInstantWin = instantWinMap.has(i);

      if (gridFilter === "available" && isSold) continue;
      if (gridFilter === "sold" && !isSold) continue;
      if (gridFilter === "instant_wins" && !isInstantWin) continue;

      nums.push(i);
    }
    return nums;
  }, [competition.totalTickets, soldMap, instantWinMap, gridFilter]);

  const totalPages = Math.ceil(filteredTicketNumbers.length / pageSize) || 1;
  const currentPagedNumbers = useMemo(() => {
    const start = (gridPage - 1) * pageSize;
    return filteredTicketNumbers.slice(start, start + pageSize);
  }, [filteredTicketNumbers, gridPage, pageSize]);

  // Calculations
  const effectiveCount =
    mode === "specific" ? selectedNumbers.length : randomQuantity;
  const totalPrice = effectiveCount * competition.pricePerTicket;

  return (
    <div className="bg-surface border border-border rounded-card p-4 sm:p-6 flex flex-col gap-5 shadow-card">
      {/* Header and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-4">
        <div>
          <label className="font-heading font-black text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-mono">
              2
            </span>
            Ticket Number Selection
          </label>
          <p className="font-sans text-xs text-text-muted mt-0.5">
            Pick specific ticket numbers from the visual grid or allocate a random quantity.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-xl bg-elevated p-1 border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onModeChange("specific")}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === "specific"
                ? "bg-primary text-black font-black shadow-xs"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Mode A: Specific Numbers
          </button>
          <button
            type="button"
            onClick={() => onModeChange("random")}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === "random"
                ? "bg-primary text-black font-black shadow-xs"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Mode B: Random Quantity
          </button>
        </div>
      </div>

      {/* MODE A: SPECIFIC NUMBERS */}
      {mode === "specific" ? (
        <div className="flex flex-col gap-4">
          {/* Direct Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyManualInput();
                  }
                }}
                placeholder="Type or paste comma-separated numbers (e.g. 5, 12, 42)"
                className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyManualInput}
              disabled={!manualInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-black font-heading font-black text-xs uppercase tracking-wider hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Add Numbers
            </button>
          </div>

          {/* Grid Filter Tabs & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "all", label: "Show All" },
                { id: "available", label: "Available Only" },
                { id: "instant_wins", label: "Instant Wins Only" },
                { id: "sold", label: "Sold Only" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setGridFilter(f.id as any);
                    setGridPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase transition-all cursor-pointer ${
                    gridFilter === f.id
                      ? "bg-primary text-black"
                      : "bg-elevated border border-border text-text-muted hover:text-text-primary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-sans text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-elevated border border-border" />
                Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-primary border border-primary" />
                Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/30 border border-amber-500" />
                ⚡ Instant Win
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-elevated/40 border border-border line-through opacity-50" />
                Sold
              </span>
            </div>
          </div>

          {/* Interactive Tiles Grid */}
          <div className="bg-elevated/30 border border-border rounded-xl p-3 sm:p-4">
            {currentPagedNumbers.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                No tickets match the current filter.
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {currentPagedNumbers.map((num) => {
                  const isSold = soldMap.has(num);
                  const soldInfo = soldMap.get(num);
                  const isInstantWin = instantWinMap.has(num);
                  const instantWin = instantWinMap.get(num);
                  const isSelected = selectedNumbers.includes(num);

                  if (isSold) {
                    return (
                      <div
                        key={num}
                        title={`Sold to: ${soldInfo?.buyerName} (${soldInfo?.buyerEmail})`}
                        className="h-10 rounded-lg bg-surface/40 border border-border text-text-muted/40 font-mono text-xs flex flex-col items-center justify-center line-through cursor-not-allowed select-none group relative"
                      >
                        <span className="text-[10px]">#{num}</span>
                        {isInstantWin && (
                          <span className="text-[9px] text-amber-500/60 no-underline">
                            ⚡
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleTileClick(num)}
                      title={
                        isInstantWin
                          ? `⚡ Instant Win: ${instantWin?.prizeName}`
                          : `Ticket #${num}`
                      }
                      className={`h-10 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer select-none relative ${
                        isSelected
                          ? "bg-primary text-black border-2 border-primary shadow-md scale-105 z-10"
                          : isInstantWin
                          ? "bg-surface border-2 border-amber-500 text-amber-500 hover:bg-amber-500/20"
                          : "bg-surface border border-border text-text-primary hover:border-primary/60 hover:bg-elevated"
                      }`}
                    >
                      <span className="text-[11px]">#{num}</span>
                      {isSelected ? (
                        <span className="text-[8px] font-black uppercase">✓</span>
                      ) : isInstantWin ? (
                        <span className="text-[9px]">⚡</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border text-xs text-text-muted">
                <span>
                  Showing {(gridPage - 1) * pageSize + 1} -{" "}
                  {Math.min(gridPage * pageSize, filteredTicketNumbers.length)} of{" "}
                  {filteredTicketNumbers.length} tickets
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setGridPage((p) => Math.max(1, p - 1))}
                    disabled={gridPage === 1}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-elevated disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <span className="px-2 font-mono font-bold text-text-primary">
                    {gridPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGridPage((p) => Math.min(totalPages, p + 1))}
                    disabled={gridPage === totalPages}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-elevated disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MODE B: RANDOM QUANTITY */
        <div className="flex flex-col gap-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="font-heading font-black text-xs uppercase tracking-wider text-text-muted">
              Select Random Quantity:
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onRandomQuantityChange(Math.max(1, randomQuantity - 1))}
                className="w-10 h-10 rounded-xl bg-elevated border border-border hover:bg-surface text-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={competition.remainingTickets}
                value={randomQuantity}
                onChange={(e) =>
                  onRandomQuantityChange(
                    Math.max(
                      1,
                      Math.min(
                        competition.remainingTickets,
                        parseInt(e.target.value, 10) || 1,
                      ),
                    ),
                  )
                }
                className="w-24 text-center bg-elevated border border-border rounded-xl py-2 font-mono font-bold text-base text-text-primary focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() =>
                  onRandomQuantityChange(
                    Math.min(competition.remainingTickets, randomQuantity + 1),
                  )
                }
                className="w-10 h-10 rounded-xl bg-elevated border border-border hover:bg-surface text-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Presets (+1, +5, +10, +25, +50) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans text-xs text-text-muted font-bold mr-1">
              Presets:
            </span>
            {[1, 5, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  onRandomQuantityChange(
                    Math.min(competition.remainingTickets, preset),
                  )
                }
                disabled={preset > competition.remainingTickets}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  randomQuantity === preset
                    ? "bg-primary text-black border-primary shadow-xs"
                    : "bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-primary/50"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                +{preset}
              </button>
            ))}
          </div>

          <p className="font-sans text-xs text-text-muted">
            The server will automatically select {randomQuantity} available numbers
            at random upon submission without collisions.
          </p>
        </div>
      )}

      {/* Selected Numbers Chip Bar */}
      <div className="bg-elevated border border-border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-xs text-text-muted font-bold uppercase">
              Selected:
            </span>
            <span className="font-mono font-black text-sm text-text-brand bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
              {effectiveCount} Ticket{effectiveCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-sans text-xs text-text-muted font-bold uppercase">
              Financial Value:
            </span>
            <span className="font-heading font-black text-sm text-primary">
              £{totalPrice.toFixed(2)}
            </span>
          </div>

          {mode === "specific" && selectedNumbers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap max-h-16 overflow-y-auto pr-1">
              {selectedNumbers.slice(0, 15).map((num) => (
                <span
                  key={num}
                  className="font-mono text-[11px] font-bold bg-surface border border-primary/30 text-text-primary px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                >
                  #{num}
                  <button
                    type="button"
                    onClick={() => handleRemoveNumber(num)}
                    className="text-text-muted hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedNumbers.length > 15 && (
                <span className="text-[11px] font-sans text-text-muted">
                  +{selectedNumbers.length - 15} more
                </span>
              )}
            </div>
          )}
        </div>

        {mode === "specific" && selectedNumbers.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-heading font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer shrink-0"
          >
            Clear Selection ✕
          </button>
        )}
      </div>
    </div>
  );
}
