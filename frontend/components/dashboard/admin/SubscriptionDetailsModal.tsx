"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any | null;
}

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
}: SubscriptionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: subscription?.id,
    onClose,
  });

  if (!isOpen || !subscription) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hostName =
    subscription.host?.businessName ||
    (subscription.host?.user?.firstName
      ? `${subscription.host.user.firstName} ${subscription.host.user.lastName || ""}`.trim()
      : "Unknown Host");

  const hostEmail = subscription.host?.user?.email || subscription.host?.email || "N/A";
  const initials = hostName.substring(0, 2).toUpperCase();

  const startDate = subscription.startDate || subscription.createdAt;
  const endDate = subscription.endDate;

  const formattedStartDate = startDate
    ? format(new Date(startDate), "dd MMMM yyyy • HH:mm")
    : "N/A";

  const formattedRenewalDate = endDate
    ? format(new Date(endDate), "dd MMMM yyyy")
    : "N/A";

  const displayStatus =
    subscription.status === "ACTIVE"
      ? "Active"
      : subscription.status === "CANCELLED"
      ? "Cancelled"
      : subscription.status === "EXPIRED"
      ? "Expired"
      : "Past Due";

  const tx = subscription.transaction;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[620px] max-h-[90vh] bg-surface border border-border rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : "shadow-card"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-accent-bg/40 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-accent-bg/70" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="w-4 h-4 text-text-muted opacity-70 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <div className="flex items-center gap-2 truncate">
              <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
                Subscription &amp; Billing Audit
              </h2>
              {isMoved && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetPosition();
                  }}
                  className="text-[10px] text-text-brand hover:underline font-semibold ml-1 cursor-pointer shrink-0"
                >
                  (Reset)
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isMoved && (
              <button
                type="button"
                onClick={resetPosition}
                title="Reset window to center"
                className="p-1 rounded text-text-muted hover:text-text-brand hover:bg-surface transition-colors cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-surface cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-7 flex flex-col gap-6 select-text">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-b from-elevated to-surface border border-border-medium p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-[#2A2315] to-[#12151F] border-2 border-primary/40 flex items-center justify-center shrink-0 shadow-md">
                <span className="font-heading font-black text-xl text-text-brand">
                  {initials}
                </span>
              </div>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-base sm:text-lg text-text-primary truncate">
                    {hostName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-heading font-black text-[10px] uppercase tracking-wider">
                    {subscription.plan?.name || "Standard Plan"}
                  </span>
                  {displayStatus === "Active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {displayStatus}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-sans text-xs text-text-muted truncate">
                    {hostEmail}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(hostEmail, "Host Email")}
                    className="text-text-muted hover:text-text-brand transition-colors p-0.5 cursor-pointer"
                    title="Copy Email"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Recurring Metrics (3-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
                Plan Price
              </span>
              <span className="font-heading font-black text-xl text-text-brand">
                £{subscription.plan?.price ?? "0.00"}{" "}
                <span className="text-xs font-sans text-text-muted font-normal">/mo</span>
              </span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
                Billing Cycle
              </span>
              <span className="font-heading font-bold text-sm text-text-primary mt-1">
                Automated Monthly
              </span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
                Next Renewal
              </span>
              <span className="font-heading font-bold text-sm text-text-primary mt-1">
                {formattedRenewalDate}
              </span>
            </div>
          </div>

          {/* Detailed Audit Section */}
          <div className="bg-elevated/40 border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-3 font-sans text-xs">
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-divider">
              <span className="text-text-muted font-bold">Subscription ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-text-primary font-semibold truncate max-w-[220px]">
                  {subscription.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(subscription.id, "Subscription ID")}
                  className="text-text-muted hover:text-text-brand cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-divider">
              <span className="text-text-muted font-bold">Subscription Start</span>
              <span className="text-text-primary font-semibold text-right">
                {formattedStartDate}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-divider">
              <span className="text-text-muted font-bold">Transaction Reference</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-text-primary font-semibold truncate max-w-[220px]">
                  {tx?.gatewayTransactionId || tx?.id || "Direct Platform Record"}
                </span>
                {(tx?.gatewayTransactionId || tx?.id) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        tx?.gatewayTransactionId || tx?.id,
                        "Transaction Ref"
                      )
                    }
                    className="text-text-muted hover:text-text-brand cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-text-muted font-bold">Payment Status</span>
              <span className="font-sans font-bold text-emerald-400 uppercase tracking-wide">
                {tx?.status || "COMPLETED"}
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center pt-2">
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
