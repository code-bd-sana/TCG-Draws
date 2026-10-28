"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Winner } from "../../../services/winner.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface WinnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner | null;
  onVerify?: (winner: Winner) => void;
}

export default function WinnerDetailsModal({
  isOpen,
  onClose,
  winner,
  onVerify,
}: WinnerDetailsModalProps) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: winner?.id,
    onClose,
  });

  if (!isOpen || !winner) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const name = `${winner.user?.firstName || ""} ${winner.user?.lastName || ""}`.trim() || winner.user?.email || "Unknown Winner";
  const initials = name.substring(0, 2).toUpperCase();

  const formattedDrawDate = winner.createdAt
    ? format(new Date(winner.createdAt), "dd MMM yyyy 'at' HH:mm")
    : "N/A";

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
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[620px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : "shadow-2xl border border-primary/30"
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
            <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
              Winner Audit &amp; Claim Inspection
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
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Winner Hero Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface to-elevated border border-primary/20 p-5 shadow-inner">
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {winner.user?.avatarUrl ? (
                  <img
                    src={winner.user.avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-heading font-black text-lg text-text-brand">
                    {initials}
                  </span>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-lg text-text-primary truncate">
                    {name}
                  </h3>
                  {winner.verificationStatus === "VERIFIED" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      Verified Claim
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      Pending Verification
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
                  <span className="font-mono text-text-primary/90">{winner.user?.email || "No email available"}</span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/50 text-xs">
                  <span className="text-text-muted">User Record:</span>
                  <span className="font-mono text-[11px] text-text-primary truncate max-w-[200px]">
                    {winner.userId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(winner.userId, "User ID")}
                    className="text-[10px] font-sans font-bold text-text-brand hover:underline cursor-pointer"
                  >
                    {copiedLabel === "User ID" ? "Copied!" : "Copy ID"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Ticket Number
              </span>
              <span className="font-mono font-black text-sm text-text-brand">
                #{winner.ticket?.ticketNumber ?? "N/A"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Win Type
              </span>
              <span className="font-heading font-black text-xs text-text-primary">
                {winner.winType === "INSTANT_WIN" ? "Instant Win" : "Main Draw"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Verification
              </span>
              <span className={`font-sans font-black text-xs ${winner.verificationStatus === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}`}>
                {winner.verificationStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Delivery Status
              </span>
              <span className={`font-sans font-black text-xs ${winner.deliveryStatus === "DELIVERED" ? "text-emerald-400" : "text-text-muted"}`}>
                {winner.deliveryStatus}
              </span>
            </div>
          </div>

          {/* Competition & Prize Overview */}
          <div className="space-y-3 rounded-xl border border-border bg-surface/80 p-4">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary block">
              Draw Information
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">Prize Won</span>
                <span className="font-heading font-bold text-text-brand">{winner.prizeName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">Competition</span>
                <span className="font-sans font-semibold text-text-primary truncate max-w-[280px]">
                  {winner.raffle?.title || "Unknown Raffle"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">Draw Completed</span>
                <span className="font-sans text-text-muted">{formattedDrawDate}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-text-muted">Tracking Reference</span>
                {winner.trackingNumber ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-primary">{winner.trackingNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(winner.trackingNumber!, "Tracking Number")}
                      className="text-[10px] font-sans font-bold text-text-brand hover:underline cursor-pointer"
                    >
                      {copiedLabel === "Tracking Number" ? "Copied" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <span className="text-text-muted italic text-[11px]">Not assigned yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <div className="text-[11px] font-mono text-text-muted truncate max-w-[220px]">
            Claim ID: {winner.id}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>

            {winner.verificationStatus === "PENDING" && onVerify && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerify(winner);
                }}
                className="btn-gold-metallic h-9 px-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Verify Claim</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
