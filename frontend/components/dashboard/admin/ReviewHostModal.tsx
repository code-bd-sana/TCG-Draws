"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HostData } from "../../../services/admin.service";

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
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleClose = () => {
    setShowConfirmReject(false);
    setShowImageLightbox(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />
      
      {/* Main Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[720px] max-h-[92vh] bg-surface border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-8 border-b border-divider bg-elevated/70">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <div>
              <h2 className="font-heading font-black text-lg lg:text-xl text-text-primary uppercase tracking-tight">
                Host Operator Details
              </h2>
              <p className="font-sans text-[11px] text-text-muted">
                Review complete registration credentials, branding, and account status
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 lg:px-8 space-y-6 flex-1 custom-scrollbar">
          
          {/* Top Hero: Brand Banner & Identity */}
          <div className="bg-elevated border border-border-medium rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            {/* Host Logo / Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl border-2 border-primary/20 bg-surface flex items-center justify-center overflow-hidden shadow-card">
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
                  <div className="w-full h-full bg-accent-bg flex items-center justify-center">
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
                  className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="View full image"
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
                <h3 className="font-heading font-black text-xl text-text-primary truncate">
                  {businessName}
                </h3>
                {slug && (
                  <Link
                    href={`/hosts/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-text-brand hover:underline bg-accent-bg px-2.5 py-0.5 rounded-full border border-primary/20"
                    title="Open host public landing page"
                  >
                    <span>/hosts/{slug}</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {/* Verification Status */}
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Verified Operator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-sans font-bold text-[10px] uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Pending Approval
                  </span>
                )}

                {/* Account Status */}
                {isBlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                    Active
                  </span>
                )}

                {/* Email verification */}
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-sans font-semibold text-[10px]">
                    ✓ Email Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[10px]">
                    ! Email Unconfirmed
                  </span>
                )}

                {/* Plan Badge */}
                <span className="px-2.5 py-0.5 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                  Plan: {plan}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Business Bio & Description */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              Business Bio &amp; About
            </span>

            <div className="bg-elevated border border-border-medium rounded-xl p-4 font-sans text-xs text-text-primary leading-relaxed relative">
              {bio ? (
                <p className="whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="italic text-text-muted">No business bio has been submitted by this host operator yet.</p>
              )}
            </div>
          </div>

          {/* Section 2: Contact & Representative Information */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>
              Contact Person &amp; Operator Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Contact Representative */}
              <div className="bg-elevated border border-border-medium rounded-xl p-3.5 flex flex-col gap-1">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Representative Name</span>
                <span className="font-heading font-bold text-xs text-text-primary">
                  {contactName || "Not specified"}
                </span>
              </div>

              {/* Email Address */}
              <div className="bg-elevated border border-border-medium rounded-xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Email Address</span>
                  <button
                    onClick={() => copyToClipboard(email, "email")}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    {copiedText === "email" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <a href={`mailto:${email}`} className="font-sans font-semibold text-xs text-text-primary hover:text-text-brand hover:underline truncate">
                  {email}
                </a>
              </div>

              {/* Direct Phone */}
              <div className="bg-elevated border border-border-medium rounded-xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Phone Number</span>
                  {phone && (
                    <button
                      onClick={() => copyToClipboard(phone, "phone")}
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      {copiedText === "phone" ? "Copied!" : "Copy"}
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
              <div className="bg-elevated border border-border-medium rounded-xl p-3.5 flex flex-col gap-1">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">City &amp; Country</span>
                <span className="font-sans font-semibold text-xs text-text-primary">
                  {location || "United Kingdom"}
                </span>
              </div>

              {/* Operating / Business Address */}
              <div className="bg-elevated border border-border-medium rounded-xl p-3.5 flex flex-col gap-1 md:col-span-2">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Registered Address</span>
                <span className="font-sans font-semibold text-xs text-text-primary">
                  {address || "No physical business address specified."}
                </span>
              </div>

            </div>
          </div>

          {/* Section 3: Platform Metrics & Subscription */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              Platform Metrics &amp; Account History
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-elevated border border-border-medium rounded-xl p-3 flex flex-col gap-1 text-center">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase">Active Draws</span>
                <span className="font-heading font-black text-base text-text-primary">{rafflesCount}</span>
              </div>

              <div className="bg-elevated border border-border-medium rounded-xl p-3 flex flex-col gap-1 text-center">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase">Wallet Balance</span>
                <span className="font-heading font-black text-base text-text-primary">£{revenue.toFixed(2)}</span>
              </div>

              <div className="bg-elevated border border-border-medium rounded-xl p-3 flex flex-col gap-1 text-center">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase">Operator Tier</span>
                <span className="font-heading font-bold text-xs text-text-brand truncate">{plan}</span>
              </div>

              <div className="bg-elevated border border-border-medium rounded-xl p-3 flex flex-col gap-1 text-center">
                <span className="font-sans font-bold text-[10px] text-text-muted uppercase">Registered</span>
                <span className="font-sans font-semibold text-xs text-text-primary">{createdAtFormatted}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Recent Raffles preview (if any) */}
          {data.recentRaffles && data.recentRaffles.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Recent Competitions ({data.recentRaffles.length})
              </span>
              <div className="border border-border-medium rounded-xl overflow-hidden bg-elevated">
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-bg text-text-brand">
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
            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-xs text-[#DC2626] uppercase tracking-wider">
                    Confirm Host Rejection
                  </span>
                  <p className="font-sans text-xs text-[#991B1B] mt-0.5">
                    Rejecting this host application will remove their host privileges and reset their role to standard Client. Are you sure you want to proceed?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmReject(false)}
                  disabled={isRejectLoading}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-sans text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onReject && onReject(data.id)}
                  disabled={isRejectLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#DC2626] text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#B91C1C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 lg:px-8 border-t border-divider bg-elevated/70 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <span className="font-mono">ID: {data.id.substring(0, 12)}...</span>
            <button
              onClick={() => copyToClipboard(data.id, "id")}
              className="text-primary hover:underline cursor-pointer font-sans"
            >
              {copiedText === "id" ? "Copied!" : "Copy ID"}
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* If NOT yet verified, show Approve & Reject buttons */}
            {!isVerified && onApprove && (
              <button 
                onClick={() => onApprove(data.id)}
                disabled={isApproveLoading || isRejectLoading}
                className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isApproveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                className="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-[#FECACA] bg-[#FEE2E2] hover:bg-[#FCA5A5]/30 text-[#DC2626] font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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
