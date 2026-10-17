"use client";

import React from "react";
import {
  CompetitionDetails,
  RecipientUser,
  InstantWinItem,
} from "../../../../services/admin-ticket-assignment.service";

interface AccountingSummaryProps {
  competition: CompetitionDetails;
  recipient: RecipientUser | null;
  mode: "specific" | "random";
  selectedNumbers: number[];
  randomQuantity: number;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function AccountingSummary({
  competition,
  recipient,
  mode,
  selectedNumbers,
  randomQuantity,
  adminNotes,
  onAdminNotesChange,
  onSubmit,
  isSubmitting,
}: AccountingSummaryProps) {
  const ticketCount =
    mode === "specific" ? selectedNumbers.length : randomQuantity;
  const unitPrice = competition.pricePerTicket;
  const totalFinancialValue = ticketCount * unitPrice;

  // Identify any selected numbers that will trigger an instant win
  const triggeredInstantWins = React.useMemo(() => {
    if (mode !== "specific") return [];
    const wins: InstantWinItem[] = [];
    selectedNumbers.forEach((num) => {
      const match = competition.instantWins.find(
        (iw) => iw.ticketNumber === num && !iw.isClaimed,
      );
      if (match) wins.push(match);
    });
    return wins;
  }, [mode, selectedNumbers, competition.instantWins]);

  const isValid =
    Boolean(competition) &&
    Boolean(recipient) &&
    ticketCount > 0 &&
    ticketCount <= competition.remainingTickets;

  return (
    <div className="bg-surface border-2 border-primary/30 rounded-card p-5 sm:p-7 flex flex-col gap-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-4">
        <div>
          <h4 className="font-heading font-black text-sm uppercase tracking-wide text-text-primary flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-mono">
              4
            </span>
            Financial Accounting &amp; Assignment Breakdown
          </h4>
          <p className="font-sans text-xs text-text-muted">
            All manual allocations are treated as fully paid entries and automatically credit the host wallet.
          </p>
        </div>
      </div>

      {/* Instant Win Warning Banner */}
      {triggeredInstantWins.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-start gap-3 shadow-xs animate-fadeIn">
          <span className="text-2xl mt-0.5">⚡</span>
          <div className="flex flex-col gap-1 text-xs font-sans">
            <strong className="font-heading font-black text-sm uppercase tracking-wide text-amber-500">
              Instant Win Prize Alert!
            </strong>
            <p>
              Your selection contains <strong>{triggeredInstantWins.length}</strong> ticket(s) matching unclaimed instant wins. These prizes will be automatically awarded to {recipient?.name || "the recipient"}:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[11px]">
              {triggeredInstantWins.map((w) => (
                <li key={w.id}>
                  Ticket #{w.ticketNumber}: <strong>{w.prizeName}</strong>
                  {w.rrpValue ? ` (RRP £${w.rrpValue.toFixed(2)})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Accounting Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-elevated/40 border border-border rounded-xl p-4">
        <div className="flex flex-col">
          <span className="font-sans text-[11px] text-text-muted uppercase font-bold">
            Recipient
          </span>
          <span className="font-heading font-black text-sm text-text-primary truncate">
            {recipient ? recipient.name : "—"}
          </span>
          <span className="font-sans text-[11px] text-text-muted truncate">
            {recipient ? recipient.email : "Select a recipient"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-sans text-[11px] text-text-muted uppercase font-bold">
            Competition
          </span>
          <span className="font-heading font-black text-sm text-text-primary truncate">
            {competition.title}
          </span>
          <span className="font-sans text-[11px] text-text-muted">
            Host: {competition.host.ownerName}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-sans text-[11px] text-text-muted uppercase font-bold">
            Tickets &amp; Unit Price
          </span>
          <span className="font-heading font-black text-sm text-text-primary">
            {ticketCount} Ticket{ticketCount === 1 ? "" : "s"}
          </span>
          <span className="font-sans text-[11px] text-text-muted">
            @ £{unitPrice.toFixed(2)} each
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-sans text-[11px] text-text-muted uppercase font-bold">
            Total Financial Value
          </span>
          <span className="font-heading font-black text-xl text-primary">
            £{totalFinancialValue.toFixed(2)}
          </span>
          <span className="font-sans text-[10px] text-emerald-600 font-bold">
            COMPLETED (Admin Manual)
          </span>
        </div>
      </div>

      {/* Host Balance Statement */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-primary">
        <span className="text-xl">💳</span>
        <div className="flex-1">
          <strong className="text-primary font-bold">Host Wallet Crediting: </strong>
          <span>
            Upon assignment, exactly <strong>£{totalFinancialValue.toFixed(2)}</strong> will be credited directly to <strong>{competition.host.ownerName}&apos;s</strong> wallet balance to ensure 100% financial consistency.
          </span>
        </div>
      </div>

      {/* Admin Notes Field */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span>Admin Allocation Notes / Reason (Optional)</span>
          <span className="text-[11px] font-normal lowercase">e.g. Giveaway prize, VIP loyalty reward</span>
        </label>
        <input
          type="text"
          value={adminNotes}
          onChange={(e) => onAdminNotesChange(e.target.value)}
          placeholder="Reason for allocation (e.g. Official Discord streamer giveaway winner)"
          className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-sans"
        />
      </div>

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
        {!recipient && (
          <span className="text-xs text-amber-500 font-sans self-center">
            ⚠️ Please select a recipient user before continuing.
          </span>
        )}
        {recipient && ticketCount === 0 && (
          <span className="text-xs text-amber-500 font-sans self-center">
            ⚠️ Please select at least 1 ticket to assign.
          </span>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="px-8 py-3 rounded-xl bg-primary text-black font-heading font-black text-xs uppercase tracking-wider hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Processing Allocation...
            </>
          ) : (
            <>Assign {ticketCount} Tickets Now →</>
          )}
        </button>
      </div>
    </div>
  );
}
