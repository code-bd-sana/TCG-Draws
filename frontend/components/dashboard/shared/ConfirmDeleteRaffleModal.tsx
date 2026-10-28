"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

export interface RaffleDeleteTarget {
  id: string;
  title: string;
  category?: string;
  ticketsSold?: number;
  totalTickets?: number;
  host?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
}

interface ConfirmDeleteRaffleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  raffle: RaffleDeleteTarget | null;
}

export default function ConfirmDeleteRaffleModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  raffle,
}: ConfirmDeleteRaffleModalProps) {
  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: raffle?.id,
    onClose: !isLoading ? onClose : undefined,
  });

  if (typeof window === "undefined" || !isOpen || !raffle) return null;

  const hostName = raffle.host?.user?.firstName
    ? `${raffle.host.user.firstName} ${raffle.host.user.lastName || ""}`.trim()
    : null;
  const hostEmail = raffle.host?.user?.email || null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Draggable Modal Box */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[92vw] max-w-[480px] max-h-[90vh] bg-surface border border-border rounded-card z-10 animate-fadeIn overflow-hidden flex flex-col font-sans transition-shadow ${
          isDragging
            ? "shadow-2xl ring-2 ring-rose-500/40 select-none cursor-grabbing"
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
                Delete Competition
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
              onClick={!isLoading ? onClose : undefined}
              disabled={isLoading}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-surface disabled:opacity-50 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-7 flex flex-col gap-5 select-text">
          {/* Warning Icon Badge & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-xs">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-black text-base sm:text-lg text-text-primary uppercase tracking-tight">
                Permanent Removal
              </h3>
              <p className="font-sans text-xs text-text-muted leading-relaxed">
                Are you sure you want to delete this competition? This action <span className="text-rose-400 font-bold">cannot be undone</span>.
              </p>
            </div>
          </div>

          {/* Competition Details Preview Card */}
          <div className="bg-elevated/40 border border-border-medium rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Target Competition
              </span>
              {raffle.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand text-[10px] font-sans font-bold uppercase">
                  {raffle.category}
                </span>
              )}
            </div>

            <h4 className="font-heading font-bold text-sm text-text-primary line-clamp-2 leading-snug">
              {raffle.title}
            </h4>

            {/* Host & Ticket Sales Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-divider text-xs">
              <div>
                <span className="text-text-muted text-[10px] uppercase font-sans font-bold block">Host Merchant</span>
                <span className="font-heading font-semibold text-xs text-text-primary truncate block mt-0.5">
                  {hostName || hostEmail || "Unknown"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-text-muted text-[10px] uppercase font-sans font-bold block">Tickets Sold</span>
                <span className="font-heading font-black text-xs text-text-brand mt-0.5 block">
                  {raffle.ticketsSold || 0} / {raffle.totalTickets || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Note */}
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs font-sans text-text-muted leading-relaxed">
            Removing this competition will erase its entry database, ticket numbers, and audit record permanently from the public catalogue.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/40 font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>{isLoading ? "Deleting..." : "Delete Permanently"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
