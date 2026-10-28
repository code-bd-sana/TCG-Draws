"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HostData } from "../../../services/admin.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

export type HostApplicationData = Partial<HostData> & {
  id: string;
  email: string;
  brandName?: string;
  businessName?: string;
  bio?: string | null;
  contact?: string;
  phone?: string | null;
  address?: string | null;
  payoutMethod?: string;
  social?: string;
  isVerified?: boolean;
  avatarUrl?: string | null;
  [key: string]: any;
};

interface ReviewHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HostApplicationData | null;
  onApprove?: (hostId: string) => void;
  isApproveLoading?: boolean;
  onReject?: (hostId: string) => void;
  isRejectLoading?: boolean;
}

export default function ReviewHostModal({ 
  isOpen, 
  onClose, 
  data, 
  onApprove, 
  isApproveLoading,
  onReject,
  isRejectLoading
}: ReviewHostModalProps) {
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const handleClose = () => {
    setShowConfirmReject(false);
    setShowImageLightbox(false);
    onClose();
  };

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: data?.id,
    onClose: handleClose,
  });

  if (!isOpen || !data) return null;

  const businessName = data.businessName || (data as any).brandName || "Registered Host";
  const email = data.email || "No email";
  const bio = data.bio || (data as any).description || null;
  const avatarUrl = data.avatarUrl || (data as any).logo || null;
  const contactName = [data.firstName, data.lastName].filter(Boolean).join(" ") || (data as any).contact || null;
  const phone = data.phone || (data as any).contact || null;
  const address = data.address || null;
  const location = data.location || null;
  const slug = data.slug || null;
  const isVerified = Boolean(data.isVerified);
  const isBlocked = Boolean(data.isBlocked);
  const isEmailVerified = Boolean(data.isEmailVerified);
  const plan = data.plan || "Free";
  const rafflesCount = typeof data.raffles === "number" ? data.raffles : 0;
  const revenue = typeof data.revenue === "number" ? data.revenue : typeof data.walletBalance === "number" ? data.walletBalance : 0;
  const createdAtFormatted = data.createdAt 
    ? new Date(data.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />
      
      {/* Draggable Main Modal */}
      <div 
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[95vw] sm:w-[92vw] max-w-[760px] max-h-[90vh] bg-surface border border-border rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging 
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing" 
            : "shadow-card"
        }`}
      >
        
        {/* Modal Header - Drag Bar */}
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
                Host Operator Audit &amp; Details
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
              onClick={handleClose}
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
          
          {/* Top Hero: Brand Banner & Identity */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-b from-elevated to-surface border border-border-medium p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              
              {/* Host Logo / Avatar */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-primary/40 bg-surface flex items-center justify-center overflow-hidden shadow-card">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={businessName} 
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => setShowImageLightbox(true)}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-b from-[#2A2315] to-[#12151F] flex items-center justify-center">
                      <span className="font-heading font-black text-2xl text-text-brand">
                        {businessName.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setShowImageLightbox(true)}
                    className="absolute -bottom-1 -right-1 bg-primary text-[#090A0E] p-1 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                    title="Zoom brand logo"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Identity & Status */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-black text-lg sm:text-xl text-text-primary truncate">
                    {businessName}
                  </h3>
                  {slug && (
                    <Link
                      href={`/hosts/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-text-brand hover:underline bg-accent-bg px-2.5 py-0.5 rounded-full border border-primary/20"
                      title="Open host public store page"
                    >
                      <span>@{slug}</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </Link>
                  )}
                </div>

                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {/* Verification Status */}
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Verified Operator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Pending Approval
                    </span>
                  )}

                  {/* Account Status */}
                  {isBlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  )}

                  {/* Email verification */}
                  {isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-sans font-semibold text-[10px]">
                      ✓ Email Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-sans font-semibold text-[10px]">
                      ! Email Unconfirmed
                    </span>
                  )}

                  {/* Plan Badge */}
                  <span className="px-2.5 py-0.5 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-heading font-black text-[10px] uppercase tracking-wider">
                    Plan: {plan}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 1: Platform Metrics (4-Column) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 text-center shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Active Draws</span>
              <span className="font-heading font-black text-xl text-text-primary">{rafflesCount}</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 text-center shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Wallet Balance</span>
              <span className="font-heading font-black text-xl text-text-brand">£{revenue.toFixed(2)}</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 text-center shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Operator Tier</span>
              <span className="font-heading font-bold text-xs text-text-brand truncate mt-1">{plan}</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col gap-1 text-center shadow-xs">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Registered</span>
              <span className="font-sans font-semibold text-xs text-text-primary mt-1">{createdAtFormatted}</span>
            </div>
          </div>

          {/* Section 2: Business Bio & Description */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              Business Bio &amp; About
            </span>

            <div className="bg-elevated/40 border border-border rounded-xl p-4 font-sans text-xs text-text-primary leading-relaxed relative">
              {bio ? (
                <p className="whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="italic text-text-muted">No business bio has been submitted by this host operator yet.</p>
              )}
            </div>
          </div>

          {/* Section 3: Contact Person & Operator Details */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>
              Contact Person &amp; Operator Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Contact Representative */}
              <div className="bg-elevated/40 border border-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Representative Name</span>
                <span className="font-heading font-bold text-xs text-text-primary">
                  {contactName || "Not specified"}
                </span>
              </div>

              {/* Email Address */}
              <div className="bg-elevated/40 border border-border rounded-xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Email Address</span>
                  <button
                    onClick={() => copyToClipboard(email, "Email")}
                    className="text-[10px] text-text-brand hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <a href={`mailto:${email}`} className="font-sans font-semibold text-xs text-text-primary hover:text-text-brand hover:underline truncate">
                  {email}
                </a>
              </div>

              {/* Direct Phone */}
              <div className="bg-elevated/40 border border-border rounded-xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Phone Number</span>
                  {phone && (
                    <button
                      onClick={() => copyToClipboard(phone, "Phone")}
                      className="text-[10px] text-text-brand hover:underline cursor-pointer"
                    >
                      Copy
                    </button>
                  )}
                </div>
                {phone ? (
                  <a href={`tel:${phone}`} className="font-sans font-semibold text-xs text-text-primary hover:text-text-brand hover:underline">
                    {phone}
                  </a>
                ) : (
                  <span className="font-sans text-xs text-text-muted">Not provided</span>
                )}
              </div>

              {/* Location */}
              <div className="bg-elevated/40 border border-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">City &amp; Country</span>
                <span className="font-sans font-semibold text-xs text-text-primary">
                  {location || "United Kingdom"}
                </span>
              </div>

              {/* Operating / Business Address */}
              <div className="bg-elevated/40 border border-border rounded-xl p-3.5 flex flex-col gap-1 md:col-span-2">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Registered Address</span>
                <span className="font-sans font-semibold text-xs text-text-primary">
                  {address || "No physical business address specified."}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Recent Raffles preview (if any) */}
          {data.recentRaffles && data.recentRaffles.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Recent Competitions ({data.recentRaffles.length})
              </span>
              <div className="border border-border rounded-xl overflow-hidden bg-elevated/40">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-surface border-b border-divider text-[10px] uppercase font-bold text-text-muted">
                    <tr>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Sold / Total</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRaffles.map((raffle: any) => (
                      <tr key={raffle.id} className="border-b border-divider/60 last:border-b-0">
                        <td className="py-2.5 px-3 font-semibold text-text-primary max-w-[200px] truncate">
                          {raffle.title}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-bg text-text-brand border border-primary/20">
                            {raffle.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-text-muted font-medium">
                          {raffle.ticketsSold} / {raffle.totalTickets}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-text-primary">
                          £{Number(raffle.pricePerTicket || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rejection confirmation warning banner */}
          {showConfirmReject && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-xs text-rose-400 uppercase tracking-wider">
                    Confirm Host Rejection
                  </span>
                  <p className="font-sans text-xs text-text-muted mt-0.5">
                    Rejecting this host application will remove their merchant privileges and reset their role to standard Client. Are you sure you want to proceed?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmReject(false)}
                  disabled={isRejectLoading}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-text-muted font-sans text-xs font-semibold hover:bg-elevated transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onReject && onReject(data.id)}
                  disabled={isRejectLoading}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isRejectLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-divider bg-elevated/70 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <span className="font-mono">ID: {data.id.substring(0, 12)}...</span>
            <button
              onClick={() => copyToClipboard(data.id, "Host ID")}
              className="text-text-brand hover:underline cursor-pointer font-sans"
            >
              Copy ID
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* If NOT yet verified, show Approve & Reject buttons */}
            {!isVerified && onApprove && (
              <button 
                onClick={() => onApprove(data.id)}
                disabled={isApproveLoading || isRejectLoading}
                className="btn-gold-metallic flex-1 sm:flex-initial h-10 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 text-[#090A0E]"
              >
                {isApproveLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Approve Host
                  </>
                )}
              </button>
            )}

            {!isVerified && onReject && !showConfirmReject && (
              <button 
                onClick={() => setShowConfirmReject(true)}
                disabled={isApproveLoading || isRejectLoading}
                className="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}

            <button 
              onClick={handleClose}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Full Logo Lightbox Modal */}
      {showImageLightbox && avatarUrl && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-lg max-h-[80vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="bg-surface p-3 rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[70vh]">
              <img 
                src={avatarUrl} 
                alt={`${businessName} full logo`} 
                className="max-w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between w-full px-2 text-white">
              <span className="font-heading font-bold text-sm truncate">{businessName} — Brand Logo</span>
              <button
                type="button"
                onClick={() => setShowImageLightbox(false)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
