"use client";

import React from "react";

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
  if (!isOpen) return null;

  const actionText = isBlocked ? "Unblock" : "Block";
  const actionColor = isBlocked ? "text-[#15803D]" : "text-[#DC2626]";
  const buttonBg = isBlocked ? "bg-[#DCFCE7] hover:bg-[#BBF7D0] border-[#BBF7D0]" : "btn-glossy-red text-white";
  const buttonText = isBlocked ? "text-[#15803D] font-bold" : "text-white font-bold";

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            Confirm Security Action
          </h2>
          <button 
            onClick={!isLoading ? onClose : undefined}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 mb-6">
          <p className="font-sans text-xs text-text-muted leading-relaxed font-semibold">
            Are you sure you want to <strong className={`${actionColor} font-black uppercase`}>{actionText}</strong> this user account?
          </p>
          <div className="bg-elevated border border-border-medium rounded-xl p-4">
            <span className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider block mb-1">User Identifier:</span>
            <span className="font-heading font-bold text-sm text-text-primary break-all">{userIdentifier}</span>
          </div>
          {isBlocked ? (
            <p className="font-sans text-xs text-text-muted">
              Unblocking will immediately restore their access to ticket purchases and account logins.
            </p>
          ) : (
            <p className="font-sans text-xs text-text-muted">
              Blocking will immediately prevent them from logging in and placing raffle entries.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
            className={`flex-1 h-11 rounded-xl border font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md active:scale-98 ${buttonBg} ${buttonText}`}
          >
            {isLoading ? "Processing..." : `Yes, ${actionText}`}
          </button>
        </div>

      </div>
    </>
  );
}
