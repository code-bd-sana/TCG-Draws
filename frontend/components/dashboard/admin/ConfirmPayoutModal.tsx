"use client";

import React, { useEffect, useState } from "react";
import { useUpdateWithdrawalStatusMutation } from "../../../hooks/useAdminHooks";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

export interface AdminPayoutData {
  id: string;
  hostId: string;
  hostBusinessName: string;
  hostUserEmail: string;
  hostUserName: string;
  amount: number; // Gross amount requested
  feeAmount: number; // 15% platform fee
  netAmount: number; // 85% net payout
  status: string;
  payoutMethod: string;
  payoutDetails: any;
  adminNotes?: string;
  createdAt: string;
}

interface ConfirmPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: AdminPayoutData | null;
  actionType: "APPROVE" | "REJECT" | "VIEW";
}

export default function ConfirmPayoutModal({
  isOpen,
  onClose,
  payout,
  actionType,
}: ConfirmPayoutModalProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const updateStatusMutation = useUpdateWithdrawalStatusMutation();

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: payout?.id || actionType,
    onClose,
  });

  useEffect(() => {
    if (payout) {
      setAdminNotes(payout.adminNotes || "");
    }
  }, [payout, isOpen]);

  if (!isOpen || !payout) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const grossAmount = payout.amount || 0;
  const feeAmount = payout.feeAmount !== undefined ? payout.feeAmount : grossAmount * 0.15;
  const netAmount = payout.netAmount !== undefined ? payout.netAmount : grossAmount - feeAmount;
  const feePercent = grossAmount > 0 && payout.feeAmount !== undefined
    ? Math.round((payout.feeAmount / grossAmount) * 100)
    : 15;

  const handleConfirm = (newStatus: "APPROVED" | "COMPLETED" | "REJECTED") => {
    updateStatusMutation.mutate(
      {
        id: payout.id,
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            newStatus === "APPROVED" || newStatus === "COMPLETED"
              ? `Payout of £${netAmount.toFixed(2)} approved successfully`
              : "Withdrawal request rejected and refunded to host wallet"
          );
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update payout status");
        },
      }
    );
  };

  const isPending = payout.status.toUpperCase() === "PENDING";

  const renderPayoutAccountInfo = () => {
    const details = payout.payoutDetails || {};
    if (payout.payoutMethod === "PAYPAL") {
      return (
        <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
          <span className="text-text-muted font-bold">PayPal Account Email:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-text-primary font-bold">{details.paypalEmail || "Not provided"}</span>
            {details.paypalEmail && (
              <button
                type="button"
                onClick={() => handleCopy(details.paypalEmail, "PayPal Email")}
                className="text-[10px] font-bold text-text-brand hover:underline cursor-pointer"
              >
                {copiedKey === "PayPal Email" ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span className="text-text-muted font-bold">Account Holder:</span>
          <span className="font-sans font-bold text-text-primary">{details.accountHolderName || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span className="text-text-muted font-bold">Bank Name:</span>
          <span className="font-sans font-bold text-text-primary">{details.bankName || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span className="text-text-muted font-bold">Account Number / IBAN:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-text-brand">{details.accountNumber || "N/A"}</span>
            {details.accountNumber && (
              <button
                type="button"
                onClick={() => handleCopy(details.accountNumber, "Account Number")}
                className="text-[10px] font-bold text-text-brand hover:underline cursor-pointer"
              >
                {copiedKey === "Account Number" ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
        {details.sortCode && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/40">
            <span className="text-text-muted font-bold">Sort Code / Routing:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-text-primary">{details.sortCode}</span>
              <button
                type="button"
                onClick={() => handleCopy(details.sortCode, "Sort Code")}
                className="text-[10px] font-bold text-text-brand hover:underline cursor-pointer"
              >
                {copiedKey === "Sort Code" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[580px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : actionType === "REJECT"
            ? "shadow-2xl border border-rose-500/30"
            : "shadow-2xl border border-primary/30"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            actionType === "REJECT"
              ? isDragging ? "bg-rose-500/20" : "bg-rose-500/10"
              : isDragging ? "bg-accent-bg/70" : "bg-accent-bg/40"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className={`w-4 h-4 shrink-0 ${actionType === "REJECT" ? "text-rose-400" : "text-text-muted opacity-70"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <h2 className={`font-heading font-black text-sm sm:text-base uppercase tracking-tight truncate ${actionType === "REJECT" ? "text-rose-400" : "text-text-primary"}`}>
              {actionType === "APPROVE"
                ? "Confirm Payout Approval"
                : actionType === "REJECT"
                ? "Reject Withdrawal Request"
                : "Payout Audit & Details"}
            </h2>
            {isMoved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPosition();
                }}
                className="text-[10px] font-mono text-text-brand hover:underline cursor-pointer ml-1.5 shrink-0 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
                title="Reset to center"
              >
                (Reset)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Host Info Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface to-elevated border border-primary/20 p-4 shadow-inner">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block mb-1">
              Host Operator
            </span>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-black text-base text-text-primary truncate">
                  {payout.hostBusinessName}
                </span>
                <span className="font-mono text-xs text-text-muted truncate">
                  {payout.hostUserEmail}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-surface border border-border font-mono text-xs text-text-muted">
                Ref: {payout.id.slice(0, 10)}...
              </span>
            </div>
          </div>

          {/* 3-Tier Financial Breakdown */}
          <div className="rounded-xl border border-primary/30 bg-surface/80 p-4 space-y-2.5 shadow-sm">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary block">
              Financial &amp; Commission Settlement
            </span>

            <div className="flex justify-between items-center text-xs font-sans py-1 border-b border-border/40">
              <span className="text-text-muted font-semibold">Gross Requested Amount:</span>
              <span className="font-heading font-bold text-sm text-text-primary">
                £{grossAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-sans py-1 border-b border-border/40 text-rose-400">
              <span className="font-semibold">Platform Commission Fee ({feePercent}%):</span>
              <span className="font-heading font-bold text-sm">
                -£{feeAmount.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs font-sans">
              <div className="flex flex-col">
                <span className="font-heading font-black text-xs text-text-brand uppercase tracking-wider">
                  Net Dispatched to Host
                </span>
                <span className="text-[10px] text-text-muted">Amount to transfer via {payout.payoutMethod || "Bank"}</span>
              </div>
              <span className="font-heading font-black text-xl text-text-brand">
                £{netAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bank / Payment Coordinates */}
          <div className="rounded-xl border border-border bg-surface/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                Destination Coordinates
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
                {payout.payoutMethod || "Bank Transfer"}
              </span>
            </div>
            {renderPayoutAccountInfo()}
          </div>

          {/* Host Note */}
          {payout.payoutDetails?.notes && (
            <div className="rounded-xl border border-border bg-surface/60 p-3.5">
              <span className="font-sans font-bold text-[10px] text-text-brand uppercase tracking-wider block mb-1">
                Host Withdrawal Reference Note
              </span>
              <p className="font-sans text-xs text-text-primary whitespace-pre-wrap">
                {payout.payoutDetails.notes}
              </p>
            </div>
          )}

          {/* Admin Notes Section */}
          {actionType === "VIEW" ? (
            <div className="rounded-xl border border-border bg-surface/60 p-3.5">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                Admin Notes / Transaction Audit
              </span>
              <p className="font-sans text-xs text-text-primary whitespace-pre-wrap">
                {payout.adminNotes || "No admin notes recorded for this request."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Admin Notes &amp; Bank Ref (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Bank transfer ref #TX-98421 or explanation for rejection"
                rows={2}
                className="input-obsidian w-full p-3 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
            className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {actionType === "VIEW" ? "Close" : "Cancel"}
          </button>

          <div className="flex items-center gap-2">
            {actionType === "APPROVE" && (
              <button
                type="button"
                onClick={() => handleConfirm("APPROVED")}
                disabled={updateStatusMutation.isPending}
                className="btn-gold-metallic h-9 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>Approve &amp; Remit £{netAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            )}

            {actionType === "REJECT" && (
              <button
                type="button"
                onClick={() => handleConfirm("REJECTED")}
                disabled={updateStatusMutation.isPending}
                className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection &amp; Refund</span>
                )}
              </button>
            )}

            {actionType === "VIEW" && isPending && (
              <>
                <button
                  type="button"
                  onClick={() => handleConfirm("REJECTED")}
                  disabled={updateStatusMutation.isPending}
                  className="h-9 px-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm("APPROVED")}
                  disabled={updateStatusMutation.isPending}
                  className="btn-gold-metallic h-9 px-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Approve £{netAmount.toFixed(2)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
