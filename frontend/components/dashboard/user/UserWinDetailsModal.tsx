"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { UserWinner } from "../../../services/user.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface UserWinDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  win: UserWinner | null;
}

export default function UserWinDetailsModal({
  isOpen,
  onClose,
  win,
}: UserWinDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: win?.id,
    onClose,
  });

  if (!isOpen || !win) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isInstant = win.winType === "INSTANT_WIN";
  const drawDate = win.createdAt
    ? format(new Date(win.createdAt), "dd MMM yyyy 'at' HH:mm")
    : "N/A";

  const isDelivered = win.deliveryStatus === "DELIVERED";
  const isShipped = win.deliveryStatus === "SHIPPED";

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
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[560px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
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
              {isInstant ? "⚡ Instant Win Prize Details" : "🏆 Competition Victory Prize"}
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Winner Hero Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface to-elevated border border-primary/30 p-4 shadow-inner flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface border border-primary/40 shrink-0 shadow-md">
              <Image
                src={
                  win.prizeImage ||
                  win.raffle?.mainImage ||
                  "https://placehold.co/400x300/12151F/D4AF37?text=TCG+Prize"
                }
                alt={win.prizeName}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                <span className="font-heading font-black text-base text-text-primary truncate">
                  {win.prizeName}
                </span>
                {isInstant ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                    ⚡ Instant Win
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[9px] uppercase tracking-wider">
                    🏆 Main Draw Win
                  </span>
                )}
              </div>

              <p className="font-sans text-xs text-text-muted truncate">
                {win.raffle?.title}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 pt-2 border-t border-border/50 text-xs text-text-muted">
                <span>Hosted by:</span>
                <span className="font-sans font-bold text-text-brand">
                  {win.raffle?.hostBusinessName || "Verified Host"}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1 text-center">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Winning Ticket
              </span>
              <span className="font-mono font-black text-sm text-text-brand">
                #{win.ticketNumber}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1 text-center">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Estimated Value
              </span>
              <span className="font-heading font-black text-sm text-text-primary">
                {win.rrpValue ? `£${Number(win.rrpValue).toFixed(2)}` : "Exclusive"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1 text-center">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Draw Type
              </span>
              <span className="font-heading font-black text-xs text-text-primary">
                {isInstant ? "Instant Drop" : "Main Draw"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1 text-center">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Fulfillment
              </span>
              <span
                className={`font-sans font-black text-xs ${
                  isDelivered ? "text-emerald-400" : isShipped ? "text-blue-400" : "text-amber-400"
                }`}
              >
                {isDelivered ? "Delivered" : isShipped ? "Shipped" : "Processing"}
              </span>
            </div>
          </div>

          {/* Draw Date & Tracking Section */}
          <div className="rounded-xl border border-border bg-surface/80 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-text-muted font-bold">Winning Recorded:</span>
              <span className="font-mono text-text-primary font-bold">{drawDate}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-text-muted font-bold">Courier Tracking:</span>
              {win.trackingNumber ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-primary font-bold">{win.trackingNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(win.trackingNumber!, "Tracking Reference")}
                    className="text-[10px] font-bold text-text-brand hover:underline cursor-pointer"
                  >
                    {copiedKey === "Tracking Reference" ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : (
                <span className="text-text-muted italic text-[11px]">
                  {isDelivered ? "Delivered via in-person or direct dispatch" : "Pending host dispatch"}
                </span>
              )}
            </div>
          </div>

          {/* Verification Audit Note */}
          <div className="rounded-xl border border-primary/20 bg-accent-bg/20 p-3.5 flex items-start gap-3">
            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div className="text-xs text-text-muted leading-relaxed">
              <span className="font-heading font-black text-xs text-text-primary uppercase block mb-0.5">
                Provably Fair Winning Verification
              </span>
              This prize claim was verified and validated against the transparent smart draw ledger. Host will dispatch directly to your saved shipping address.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <Link
            href={`/live-raffles/${win.raffle?.slug || win.raffle?.id}`}
            onClick={onClose}
            className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>View Competition</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="btn-gold-metallic h-9 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
}
