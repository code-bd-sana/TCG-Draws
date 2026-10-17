"use client";

import React from "react";
import {
  CompetitionDetails,
  RecipientUser,
  AssignTicketsResult,
} from "../../../../services/admin-ticket-assignment.service";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  competition: CompetitionDetails | null;
  recipient: RecipientUser | null;
  mode: "specific" | "random";
  selectedNumbers: number[];
  randomQuantity: number;
  adminNotes: string;
  isSubmitting: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  competition,
  recipient,
  mode,
  selectedNumbers,
  randomQuantity,
  adminNotes,
  isSubmitting,
}: ConfirmationModalProps) {
  if (!isOpen || !competition || !recipient) return null;

  const ticketCount =
    mode === "specific" ? selectedNumbers.length : randomQuantity;
  const totalAmount = ticketCount * competition.pricePerTicket;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 sm:p-7 flex flex-col gap-5 shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-divider pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                Confirm Ticket Allocation
              </h3>
              <p className="font-sans text-xs text-text-muted">
                Please review transaction and financial details before proceeding.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-muted hover:text-text-primary text-sm p-1 rounded-lg hover:bg-elevated cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Summary */}
        <div className="flex flex-col gap-3 font-sans text-xs bg-elevated/50 p-4 rounded-xl border border-border">
          <div className="flex justify-between items-center py-1 border-b border-divider">
            <span className="text-text-muted">Recipient Player:</span>
            <span className="font-bold text-text-primary">
              {recipient.name} ({recipient.email})
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-divider">
            <span className="text-text-muted">Competition:</span>
            <span className="font-bold text-text-primary truncate max-w-[240px]">
              {competition.title}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-divider">
            <span className="text-text-muted">Allocation Mode:</span>
            <span className="font-mono font-bold text-text-brand">
              {mode === "specific"
                ? `Specific (${selectedNumbers.length} numbers)`
                : `Random (${randomQuantity} tickets)`}
            </span>
          </div>

          {mode === "specific" && (
            <div className="flex justify-between items-start py-1 border-b border-divider">
              <span className="text-text-muted shrink-0">Assigned Numbers:</span>
              <span className="font-mono font-bold text-primary text-right max-w-[240px] truncate">
                {selectedNumbers.map((n) => `#${n}`).join(", ")}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-divider">
            <span className="text-text-muted">Total Financial Value:</span>
            <span className="font-heading font-black text-sm text-text-primary">
              £{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-divider">
            <span className="text-text-muted">Host Wallet Credited:</span>
            <span className="font-mono font-bold text-emerald-600">
              +£{totalAmount.toFixed(2)} to {competition.host.ownerName}
            </span>
          </div>

          {adminNotes && (
            <div className="flex justify-between items-center py-1">
              <span className="text-text-muted">Admin Reason:</span>
              <span className="font-sans text-text-primary italic truncate max-w-[240px]">
                {adminNotes}
              </span>
            </div>
          )}
        </div>

        {/* Warning notice */}
        <p className="font-sans text-[11px] text-text-muted leading-relaxed">
          ⚡ This will execute an atomic database transaction. Assigned tickets will immediately show in the user&apos;s ticket inventory and trigger any applicable instant win prizes.
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-elevated border border-border hover:bg-surface text-text-secondary hover:text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-black font-heading font-black text-xs uppercase tracking-wider hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Allocating...
              </>
            ) : (
              "Confirm & Assign Tickets"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AssignTicketsResult | null;
}

export function SuccessModal({ isOpen, onClose, result }: SuccessModalProps) {
  if (!isOpen || !result) return null;

  const { allocation } = result;
  const hasInstantWins =
    allocation.instantWinsClaimed && allocation.instantWinsClaimed.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border-2 border-primary/50 rounded-2xl max-w-lg w-full p-6 sm:p-7 flex flex-col gap-5 shadow-2xl animate-scaleUp">
        {/* Animated Celebration Banner if Instant Win Unlocked */}
        {hasInstantWins && (
          <div className="p-4 rounded-xl bg-linear-to-r from-amber-500/20 via-primary/20 to-amber-500/20 border-2 border-amber-500 text-center flex flex-col items-center gap-2 animate-pulse">
            <span className="text-3xl">🎉 ⚡ 🏆</span>
            <h3 className="font-heading font-black text-base uppercase tracking-tight text-amber-500">
              Instant Win Prize Unlocked!
            </h3>
            <p className="font-sans text-xs text-text-primary">
              The assigned tickets triggered{" "}
              <strong>{allocation.instantWinsClaimed.length}</strong> Instant Win
              claim(s):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              {allocation.instantWinsClaimed.map((iw) => (
                <span
                  key={iw.instantWinId}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-heading font-black text-xs uppercase shadow-xs"
                >
                  Ticket #{iw.ticketNumber}: {iw.prizeName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-2xl shrink-0">
            ✓
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
              Tickets Successfully Assigned!
            </h3>
            <p className="font-sans text-xs text-text-muted">
              Accounting updated, host wallet balance credited, and recipient notified.
            </p>
          </div>
        </div>

        {/* Allocation Details */}
        <div className="bg-elevated/60 border border-border rounded-xl p-4 flex flex-col gap-2.5 font-sans text-xs">
          <div className="flex justify-between py-1 border-b border-divider">
            <span className="text-text-muted">Recipient:</span>
            <span className="font-bold text-text-primary">
              {allocation.recipient.name} ({allocation.recipient.email})
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-divider">
            <span className="text-text-muted">Competition:</span>
            <span className="font-bold text-text-primary truncate max-w-[240px]">
              {allocation.raffleTitle}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-divider">
            <span className="text-text-muted">Transaction ID:</span>
            <span className="font-mono text-text-brand text-[11px]">
              {allocation.gatewayTransactionId}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-divider">
            <span className="text-text-muted">Total Credited:</span>
            <span className="font-mono font-bold text-emerald-600">
              £{allocation.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-text-muted">
              Assigned Tickets ({allocation.ticketNumbers.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {allocation.ticketNumbers.map((num) => (
                <span
                  key={num}
                  className="font-mono text-xs font-bold bg-surface border border-primary/30 text-primary px-2.5 py-0.5 rounded-lg"
                >
                  #{num}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-black font-heading font-black text-xs uppercase tracking-wider hover:bg-primary-hover transition-all cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
