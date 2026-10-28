"use client";

import React from "react";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

interface ConfirmBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isBlocked: boolean;
  userIdentifier: string; // email, name or ID to display
}

export default function ConfirmBlockModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  isBlocked,
  userIdentifier
}: ConfirmBlockModalProps) {
  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: `${userIdentifier}-${isBlocked}`,
    onClose: !isLoading ? onClose : undefined,
  });

  if (!isOpen) return null;

  const actionText = isBlocked ? "Unblock" : "Block";
  const actionColor = isBlocked ? "text-emerald-400" : "text-rose-400";
  const buttonBg = isBlocked 
    ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm" 
    : "bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/40 shadow-md";

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      {/* Draggable Modal Window */}
      <div 
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[92vw] max-w-[460px] max-h-[90vh] bg-surface border border-border rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
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
            <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
              Confirm Security Action
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
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-surface cursor-pointer disabled:opacity-50"
              disabled={isLoading}
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
          
          {/* Action Badge & Notice */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isBlocked 
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}>
              {isBlocked ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-black text-base sm:text-lg text-text-primary">
                {isBlocked ? "Unblock Account Access" : "Block User Account"}
              </h3>
              <p className="font-sans text-xs text-text-muted leading-relaxed font-medium">
                Are you sure you want to <strong className={`${actionColor} font-black uppercase`}>{actionText}</strong> this account?
              </p>
            </div>
          </div>

          {/* User Identifier Card */}
          <div className="bg-elevated border border-border-medium rounded-xl p-3.5 sm:p-4">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block mb-1">
              User Identifier / Email
            </span>
            <span className="font-heading font-bold text-xs sm:text-sm text-text-primary break-all">
              {userIdentifier}
            </span>
          </div>

          {/* Impact Description */}
          <div className="p-3.5 rounded-xl bg-surface border border-border font-sans text-xs text-text-muted leading-relaxed">
            {isBlocked ? (
              <span>
                Unblocking will immediately restore player privileges, allowing ticket checkout, participation in live draws, and account sign-in.
              </span>
            ) : (
              <span>
                Blocking will immediately terminate active sessions, restrict sign-in access, and prevent ticket entries across all competitions.
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-11 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md active:scale-98 ${buttonBg}`}
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>{isLoading ? "Processing..." : `Confirm ${actionText}`}</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
