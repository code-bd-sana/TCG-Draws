"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useDraggableModal } from "@/hooks/useDraggableModal";
import { TransactionItem } from "./UserTransactionStatsCards";

interface UserTransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
}

export const UserTransactionReceiptModal: React.FC<UserTransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: transaction?.id,
    onClose,
  });

  if (!isOpen || !transaction) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isCompleted = transaction.status === "completed";
  const isPending = transaction.status === "pending";
  const isFailed = transaction.status === "failed";
  const isAdminManual = transaction.paymentMethod === "ADMIN_MANUAL";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-lg max-h-[92vh] art-deco-card rounded-2xl z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow ${
          isDragging
            ? "shadow-2xl ring-2 ring-[#D4AF37]/50 select-none cursor-grabbing"
            : "shadow-2xl border border-[rgba(212,175,55,0.35)]"
        }`}
      >
        {/* Top Gold Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent pointer-events-none" />

        {/* Drag Handle Header */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.15)] bg-[#090A0E]/80 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-[#090A0E]" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="p-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors shrink-0" title="Drag to move">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-heading font-black tracking-widest uppercase text-[#D4AF37]">
                  Official Ledger Receipt
                </span>
                {isMoved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPosition();
                    }}
                    className="text-[9px] font-mono uppercase text-[#D4AF37] hover:underline tracking-wider cursor-pointer px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                    title="Double-click header or click to re-center"
                  >
                    (Reset)
                  </button>
                )}
              </div>
              <h2 className="text-base font-heading font-black text-text-primary uppercase tracking-wide truncate max-w-[280px] sm:max-w-[360px]">
                {transaction.transactionId}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#1C202B] border border-transparent hover:border-[rgba(212,175,55,0.2)] transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Main Receipt Highlight Card */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-[#090A0E] to-[#141720] border border-[rgba(212,175,55,0.25)] space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />

            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block">
              Total Amount
            </span>

            <div className="text-3xl sm:text-4xl font-heading font-black text-[#D4AF37] tracking-tight">
              {transaction.amount}
            </div>

            <div className="pt-2 flex justify-center">
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ✓ Paid &amp; Confirmed
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/40 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  ⏳ Awaiting Settlement
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-rose-500/15 border border-rose-500/40 text-rose-400">
                  ✕ Payment Failed
                </span>
              )}
              {!isCompleted && !isPending && !isFailed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/5 border border-white/10 text-text-muted">
                  {transaction.status}
                </span>
              )}
            </div>
          </div>

          {/* Receipt Key Metadata Grid */}
          <div className="p-4 rounded-xl bg-[#090A0E]/70 border border-[rgba(212,175,55,0.15)] space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#D4AF37]">
              Transaction Details
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="font-mono text-text-muted">Transaction ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#F5E5C0]">{transaction.transactionId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(transaction.transactionId, "Transaction ID")}
                    className="text-[10px] font-mono text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    {copiedKey === "Transaction ID" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {transaction.orderNumber && (
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="font-mono text-text-muted">Gateway Order Ref:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-text-primary truncate max-w-[200px]">
                      {transaction.orderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transaction.orderNumber || "", "Order Reference")}
                      className="text-[10px] font-mono text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      {copiedKey === "Order Reference" ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="font-mono text-text-muted">Date &amp; Time:</span>
                <span className="font-mono text-text-primary">{transaction.date}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="font-mono text-text-muted">Payment Gateway:</span>
                <span className="font-mono font-bold text-text-primary uppercase">
                  {isAdminManual ? "🛡️ Admin Assigned" : transaction.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="font-mono text-text-muted">Allocation Tickets:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {transaction.ticketsCount > 0 ? `${transaction.ticketsCount} entries issued` : "Single Item Entry"}
                </span>
              </div>
            </div>
          </div>

          {/* Description Breakdown */}
          <div className="p-4 rounded-xl bg-[#090A0E]/50 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
              Purchased Competitions &amp; Items
            </span>
            <p className="text-xs font-mono text-[#F5E5C0] leading-relaxed">
              {transaction.description}
            </p>
          </div>

          {/* Verification Assurance */}
          <div className="p-3.5 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <p className="text-[11px] text-text-muted leading-tight">
              Cryptographically verified by TCG Draws. Ticket draw numbers are locked and registered in the immutable ledger.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[rgba(212,175,55,0.15)] bg-[#090A0E]/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] text-text-muted hover:text-text-primary hover:bg-[#1C202B] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.2-.42-2.4-.57-3.62M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Print Receipt
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
