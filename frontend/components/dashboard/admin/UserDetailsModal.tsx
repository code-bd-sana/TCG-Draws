"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { User } from "../../../services/admin.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onToggleBlock?: (user: User) => void;
}

export default function UserDetailsModal({ 
  isOpen, 
  onClose, 
  user,
  onToggleBlock 
}: UserDetailsModalProps) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: user?.id,
    onClose,
  });

  if (!isOpen || !user) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  const fullName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim() 
    : "No Name Provided";

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
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[600px] max-h-[90vh] bg-surface border border-border rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
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
              User Profile & Audit
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

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-7 flex flex-col gap-6 select-text">
          
          {/* User Hero Banner */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-b from-elevated to-surface border border-border-medium p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Avatar */}
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary shrink-0 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-linear-to-b from-[#2A2315] to-[#12151F] border-2 border-primary flex items-center justify-center shrink-0 shadow-md">
                  <span className="font-heading font-black text-xl text-text-brand tracking-wider">
                    {getInitials()}
                  </span>
                </div>
              )}

              {/* Identity & Badges */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-text-primary truncate">
                    {fullName}
                  </h3>
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                      Unverified
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-heading font-black text-[9px] uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>

                {/* Email with copy button */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-sans text-xs text-text-muted truncate">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.email, "Email")}
                    className="text-text-muted hover:text-text-brand transition-colors p-0.5 cursor-pointer"
                    title="Copy Email"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                  </button>
                </div>

                {/* ID with copy button */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-text-muted/70">
                    ID: {user.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.id, "User ID")}
                    className="text-text-muted hover:text-text-brand transition-colors p-0.5 cursor-pointer"
                    title="Copy User ID"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Metric Cards (3-Column) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
                Total Spent
              </span>
              <span className="font-heading font-black text-xl text-text-brand">
                £{(user.totalSpent || 0).toFixed(2)}
              </span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
                Tickets Bought
              </span>
              <span className="font-heading font-black text-xl text-text-primary">
                {user.ticketsCount || 0}
              </span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
                Account Status
              </span>
              <span className="font-heading font-bold text-sm">
                {user.isBlocked ? (
                  <span className="text-rose-400 uppercase tracking-wide">Blocked</span>
                ) : (
                  <span className="text-emerald-400 uppercase tracking-wide">Active</span>
                )}
              </span>
            </div>
          </div>

          {/* Detailed Info Card */}
          <div className="bg-elevated/40 border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-3 font-sans text-xs">
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-divider">
              <span className="text-text-muted font-bold">Registered Date</span>
              <span className="text-text-primary font-semibold text-right">
                {format(new Date(user.createdAt), "dd MMMM yyyy • HH:mm")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-divider">
              <span className="text-text-muted font-bold">Phone Number</span>
              <span className="text-text-primary font-semibold text-right">
                {user.phone || "Not specified"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-divider">
              <span className="text-text-muted font-bold">City / Location</span>
              <span className="text-text-primary font-semibold text-right">
                {user.location || "Not specified"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <span className="text-text-muted font-bold shrink-0">Shipping / Postal Address</span>
              <span className="text-text-primary font-semibold text-right max-w-[280px] line-clamp-3">
                {user.address || "No address on file"}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onToggleBlock && (
              <button
                type="button"
                onClick={() => onToggleBlock(user)}
                className={`w-full sm:flex-1 h-11 rounded-xl border font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  user.isBlocked
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                }`}
              >
                {user.isBlocked ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <span>Unblock Account</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Block Account</span>
                  </>
                )}
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-full sm:flex-1 h-11 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Close Details
            </button>
          </div>

        </div>

      </div>
    </>
  );
}
