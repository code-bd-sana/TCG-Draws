"use client";

import React, { useState } from "react";
import { Winner, winnerService } from "../../../services/winner.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface VerifyWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner | null;
}

export default function VerifyWinnerModal({ isOpen, onClose, winner }: VerifyWinnerModalProps) {
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(true);

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

  const mutation = useMutation({
    mutationFn: () => winnerService.verifyWinner(winner!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWinners"] });
      queryClient.invalidateQueries({ queryKey: ["adminWinnersStats"] });
      toast.success("Winner claim successfully verified and confirmed!");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to verify winner claim");
    },
  });

  if (!isOpen || !winner) return null;

  const name = `${winner.user?.firstName || ""} ${winner.user?.lastName || ""}`.trim() || winner.user?.email || "Unknown Winner";
  const initials = name.substring(0, 2).toUpperCase();

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
              Verify &amp; Publish Winner
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
            disabled={mutation.isPending}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Winner Hero Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface to-elevated border border-primary/20 p-4 sm:p-5 shadow-inner">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {winner.user?.avatarUrl ? (
                  <img
                    src={winner.user.avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-heading font-black text-sm text-text-brand">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-base text-text-primary truncate">
                    {name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                    Pending Verification
                  </span>
                </div>
                <p className="font-mono text-xs text-text-muted truncate mt-0.5">
                  {winner.user?.email || "No email available"}
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs text-text-muted">
                  <span className="text-text-muted">User ID:</span>
                  <span className="font-mono text-[11px] text-text-primary truncate">{winner.userId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Draw & Prize Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Prize Claimed
              </span>
              <span className="font-heading font-black text-sm text-text-brand truncate">
                {winner.prizeName}
              </span>
              <span className="font-sans text-[11px] text-text-muted">
                {winner.winType === "INSTANT_WIN" ? "⚡ Instant Win Drop" : "🏆 Main Draw Win"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Winning Ticket
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-accent-bg border border-primary/30 font-mono font-black text-xs text-text-brand">
                  #{winner.ticket?.ticketNumber ?? "N/A"}
                </span>
                <span className="font-sans text-[11px] text-text-muted">
                  Provably Fair Draw
                </span>
              </div>
            </div>
          </div>

          {/* Competition Info */}
          <div className="p-3.5 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
            <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
              Competition Title
            </span>
            <span className="font-sans font-semibold text-xs text-text-primary">
              {winner.raffle?.title || "Unknown Raffle"}
            </span>
          </div>

          {/* Verification Checklist */}
          <div className="rounded-xl border border-primary/20 bg-surface/80 p-4 space-y-2.5">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Verification Audit Confirmation
            </span>
            <ul className="space-y-1.5 text-xs text-text-muted font-sans pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Ticket assignment verified against transaction ledger
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Winner account KYC &amp; fair-play checks confirmed
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Locks claim status and triggers dispatch notification
              </li>
            </ul>
          </div>

          {/* Public Leaderboard Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface/90 border border-border shadow-inner">
            <div className="flex flex-col gap-0.5 pr-3">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                Publish to Public Winners Gallery
              </span>
              <span className="font-sans text-[11px] text-text-muted">
                Display this winner on the platform public leaderboard and winners showcase.
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsPublishing(!isPublishing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublishing ? "bg-primary" : "bg-neutral-700"
              }`}
              role="switch"
              aria-checked={isPublishing}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublishing ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-gold-metallic h-9 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {mutation.isPending ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying Claim...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Confirm &amp; Publish Winner</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
