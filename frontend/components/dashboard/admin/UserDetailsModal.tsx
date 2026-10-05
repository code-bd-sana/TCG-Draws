"use client";

import React from "react";
import { format } from "date-fns";
import { User } from "../../../services/admin.service";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const getInitials = () => {
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[560px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 lg:p-8 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            User Account Details
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Card Section */}
        <div className="flex items-center gap-4 p-4 bg-elevated border border-border-medium rounded-xl mb-6">
          <div className="w-14 h-14 rounded-full bg-accent-bg border-2 border-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="font-sans font-bold text-xl text-text-brand tracking-wider">
              {getInitials()}
            </span>
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <h3 className="font-heading font-bold text-base text-text-primary truncate">
              {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "No Name Provided"}
            </h3>
            <span className="font-sans font-semibold text-xs text-text-muted truncate">{user.email}</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-sans font-bold text-[9px] uppercase tracking-wider">
                {user.role}
              </span>
              {user.isEmailVerified ? (
                <span className="px-2.5 py-0.5 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[9px] uppercase tracking-wider">
                  Email Verified
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-sans font-bold text-[9px] uppercase tracking-wider">
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1 shadow-xs">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Tickets Purchased</span>
            <span className="font-heading font-black text-2xl text-text-primary">{user.ticketsCount}</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1 shadow-xs">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Total Spent</span>
            <span className="font-heading font-black text-2xl text-text-brand">£{user.totalSpent.toFixed(2)}</span>
          </div>
        </div>

        {/* Info list */}
        <div className="flex flex-col gap-3 font-sans text-xs border-t border-divider pt-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold">Joined Date</span>
            <span className="text-text-primary font-semibold">{format(new Date(user.createdAt), "dd MMMM yyyy HH:mm")}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold">Phone Number</span>
            <span className="text-text-primary font-semibold">{user.phone || "Not provided"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold">Location</span>
            <span className="text-text-primary font-semibold">{user.location || "Not provided"}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-text-muted font-bold shrink-0">Address</span>
            <span className="text-text-primary font-semibold text-right max-w-[280px] line-clamp-3">{user.address || "Not provided"}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-text-muted font-bold">Status</span>
            <span>
              {user.isBlocked ? (
                <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-bold text-[10px] uppercase tracking-wider">Blocked / Suspended</span>
              ) : (
                <span className="px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-bold text-[10px] uppercase tracking-wider">Active / Operational</span>
              )}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center mt-2">
          <button 
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-elevated border border-border-medium hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>

      </div>
    </>
  );
}
