"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatUkDateTime, formatUkDate, getUkTimezoneAbbr } from "../../../lib/uk-time";

export interface ReviewCompetitionData {
  id: string;
  title: string;
  slug?: string | null;
  category?: string | null;
  description?: string | null;
  mainImage?: string | null;
  prizeName?: string | null;
  mainPrizeValue?: number | string | null;
  pricePerTicket: number | string;
  totalTickets: number;
  ticketsSold?: number;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  isAutoDraw?: boolean;
  autoDrawDate?: boolean;
  autoDrawSoldOut?: boolean;
  minTickets?: number | null;
  maxTickets?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  host?: {
    id: string;
    userId?: string;
    businessName: string;
    slug?: string | null;
    bio?: string | null;
    phone?: string | null;
    address?: string | null;
    isVerified?: boolean;
    createdAt?: string | Date;
    user?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      email: string;
      avatar?: string | null;
      phone?: string | null;
      address?: string | null;
      createdAt?: string | Date;
      isEmailVerified?: boolean;
    };
    subscriptions?: Array<{
      status: string;
      startDate: string | Date;
      endDate: string | Date;
      plan?: {
        name: string;
        price?: number | string;
      };
    }>;
    _count?: {
      raffles?: number;
    };
  };
  instantWins?: Array<{
    id: string;
    ticketNumber: number;
    prizeName: string;
    rrpValue?: number | string | null;
    image?: string | null;
    isClaimed?: boolean;
  }>;
  _count?: {
    instantWins?: number;
  };
}

interface ReviewCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: ReviewCompetitionData | null;
  onApprove: (id: string) => void;
  isApproving: boolean;
  onReject: (id: string, title: string) => void;
}

export default function ReviewCompetitionModal({
  isOpen,
  onClose,
  competition,
  onApprove,
  isApproving,
  onReject,
}: ReviewCompetitionModalProps) {
  const [activeTab, setActiveTab] = useState<"raffle" | "host">("raffle");
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showImageLightbox) {
          setShowImageLightbox(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showImageLightbox, onClose]);

  // Reset tab to "raffle" whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("raffle");
      setShowImageLightbox(false);
      setCopiedText(null);
    }
  }, [isOpen, competition?.id]);

  if (!isOpen || !competition) return null;

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const ticketPrice = Number(competition.pricePerTicket) || 0;
  const totalTickets = Number(competition.totalTickets) || 0;
  const maxPotentialRevenue = ticketPrice * totalTickets;
  const prizeValue = competition.mainPrizeValue ? Number(competition.mainPrizeValue) : null;
  const currentTz = getUkTimezoneAbbr(competition.startDate || new Date());

  const hostUser = competition.host?.user;
  const hostName = competition.host?.businessName || "Registered Host";
  const contactPerson = [hostUser?.firstName, hostUser?.lastName].filter(Boolean).join(" ") || "Host Operator";
  const activePlan = competition.host?.subscriptions?.[0]?.plan?.name || "Free Tier";
  const totalHosted = competition.host?._count?.raffles ?? "N/A";
  const instantWinsList = competition.instantWins || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isApproving) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[820px] max-h-[92vh] bg-surface border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-8 border-b border-divider bg-elevated/70">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg lg:text-xl text-text-primary uppercase tracking-tight">
                  Review Competition Submission
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] font-sans font-bold text-[10px] uppercase tracking-wider">
                  Pending Approval
                </span>
              </div>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Inspect competition parameters, UK schedule, and host credentials before publishing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isApproving}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Close modal (Esc)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 lg:px-8 border-b border-divider bg-surface">
          <button
            onClick={() => setActiveTab("raffle")}
            className={`flex items-center gap-2 py-3 px-4 font-heading font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "raffle"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-elevated/40"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            <span>Raffle Details</span>
            {instantWinsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-sans font-bold">
                ⚡ {instantWinsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("host")}
            className={`flex items-center gap-2 py-3 px-4 font-heading font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "host"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-elevated/40"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <span>Host Operator</span>
            {competition.host?.isVerified && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Verified Host" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 lg:px-8 space-y-6 flex-1 custom-scrollbar">

          {/* TAB 1: RAFFLE DETAILS */}
          {activeTab === "raffle" && (
            <div className="space-y-6 animate-in fade-in duration-150">

              {/* Cover & Main Identification */}
              <div className="flex flex-col sm:flex-row gap-5 p-5 bg-elevated border border-border-medium rounded-2xl">
                {/* Image Thumbnail */}
                <div className="relative group w-full sm:w-44 h-36 shrink-0 bg-surface border border-border-medium rounded-xl overflow-hidden flex items-center justify-center shadow-xs">
                  {competition.mainImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={competition.mainImage}
                        alt={competition.title}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                        onClick={() => setShowImageLightbox(true)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageLightbox(true)}
                        className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-lg text-xs opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                        title="Expand full image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                        </svg>
                        <span className="font-sans text-[10px] font-bold">Zoom</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-text-muted p-4 text-center">
                      <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      <span className="font-sans text-[10px] font-semibold">No Image Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Primary Info */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {competition.category && (
                        <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/20 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                          {competition.category}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px] uppercase tracking-wider border ${
                        competition.isAutoDraw 
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {competition.isAutoDraw ? "⚙️ Auto Draw System" : "🎥 Live / Manual Draw"}
                      </span>
                      {competition.autoDrawSoldOut && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans font-bold text-[10px] uppercase tracking-wider">
                          Instant Draw on Sellout
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-black text-xl text-text-primary tracking-tight leading-snug">
                      {competition.title}
                    </h3>
                    {competition.prizeName && (
                      <p className="font-sans text-xs text-text-muted mt-1">
                        <span className="font-bold text-text-primary">Featured Prize: </span>
                        {competition.prizeName}
                      </p>
                    )}
                  </div>

                  {/* Quick Host reference */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-divider text-xs text-text-muted">
                    <span>Hosted by:</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("host")}
                      className="font-heading font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {hostName}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule / UK Time Card */}
              <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">
                      UK Schedule & Drawing Timestamps
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-accent-bg border border-primary/20 text-text-brand font-mono font-bold text-[10px]">
                    Europe/London ({currentTz})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-elevated rounded-lg p-3 border border-border-medium flex flex-col">
                    <span className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                      Goes Live (Starts UK Time)
                    </span>
                    <span className="font-heading font-black text-sm text-text-primary mt-1">
                      {competition.startDate ? formatUkDateTime(competition.startDate) : "Immediate / TBD"}
                    </span>
                    <span className="font-sans text-[10px] text-text-muted mt-0.5">
                      Raffle is hidden from public store until this timestamp
                    </span>
                  </div>

                  <div className="bg-elevated rounded-lg p-3 border border-border-medium flex flex-col">
                    <span className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                      Scheduled Draw / Close (UK Time)
                    </span>
                    <span className="font-heading font-black text-sm text-text-primary mt-1">
                      {competition.endDate ? formatUkDateTime(competition.endDate) : "TBD"}
                    </span>
                    <span className="font-sans text-[10px] text-text-muted mt-0.5">
                      Tickets close & winners selected at this timestamp
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & Ticket Economics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-elevated border border-border-medium rounded-xl p-3.5 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Ticket Price
                  </span>
                  <span className="font-heading font-black text-lg text-primary mt-1 block">
                    £{ticketPrice.toFixed(2)}
                  </span>
                </div>

                <div className="bg-elevated border border-border-medium rounded-xl p-3.5 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Total Tickets
                  </span>
                  <span className="font-heading font-black text-lg text-text-primary mt-1 block">
                    {totalTickets.toLocaleString("en-GB")}
                  </span>
                </div>

                <div className="bg-elevated border border-border-medium rounded-xl p-3.5 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Gross Pool Max
                  </span>
                  <span className="font-heading font-black text-lg text-emerald-600 mt-1 block">
                    £{maxPotentialRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-elevated border border-border-medium rounded-xl p-3.5 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Limits / Entrant
                  </span>
                  <span className="font-heading font-bold text-sm text-text-primary mt-1 block">
                    Min {competition.minTickets || 1} / Max {competition.maxTickets || "∞"}
                  </span>
                </div>
              </div>

              {/* Main Prize Valuation */}
              {prizeValue !== null && (
                <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-sans font-bold text-xs uppercase tracking-wider">
                      Declared Main Prize Value (RRP):
                    </span>
                  </div>
                  <span className="font-heading font-black text-base text-emerald-800">
                    £{prizeValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Independently Scrollable Description Container */}
              <div className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">
                      Competition Description & Terms
                    </h4>
                  </div>
                  <span className="font-sans text-[10px] text-text-muted">
                    {competition.description ? `${competition.description.length} characters` : "Empty"}
                  </span>
                </div>

                <div className="max-h-48 sm:max-h-56 overflow-y-auto pr-2 custom-scrollbar bg-elevated/70 border border-border-medium rounded-lg p-3.5 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap selection:bg-primary/20">
                  {competition.description ? (
                    competition.description
                  ) : (
                    <span className="italic text-text-muted">No description provided for this competition.</span>
                  )}
                </div>
              </div>

              {/* Instant Wins Breakdown */}
              <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">⚡</span>
                    <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">
                      Instant Win Allocations
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-sans font-bold text-[10px]">
                    {instantWinsList.length} Instant {instantWinsList.length === 1 ? "Prize" : "Prizes"}
                  </span>
                </div>

                {instantWinsList.length > 0 ? (
                  <div className="max-h-44 overflow-y-auto pr-1 custom-scrollbar border border-border-medium rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-elevated border-b border-border-medium text-[10px] font-heading font-bold text-text-muted uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Ticket #</th>
                          <th className="py-2 px-3">Prize Name</th>
                          <th className="py-2 px-3 text-right">Value (RRP)</th>
                          <th className="py-2 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {instantWinsList.map((iw, idx) => (
                          <tr key={iw.id || idx} className="hover:bg-elevated/40">
                            <td className="py-2 px-3 font-mono font-bold text-text-brand">
                              #{iw.ticketNumber}
                            </td>
                            <td className="py-2 px-3 font-medium text-text-primary">
                              {iw.prizeName}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                              {iw.rrpValue ? `£${Number(iw.rrpValue).toFixed(2)}` : "—"}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                                iw.isClaimed
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {iw.isClaimed ? "Claimed" : "Unclaimed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-elevated border border-border-medium rounded-lg p-3 text-center text-xs text-text-muted font-sans font-medium">
                    No instant win prizes configured for this competition.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: HOST OPERATOR DETAILS */}
          {activeTab === "host" && (
            <div className="space-y-6 animate-in fade-in duration-150">

              {/* Host Brand Hero */}
              <div className="bg-elevated border border-border-medium rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 bg-surface flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {hostUser?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={hostUser.avatar} alt={hostName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading font-black text-2xl text-text-brand">
                      {hostName.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-xl text-text-primary">
                      {hostName}
                    </h3>
                    {competition.host?.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans font-bold text-[10px] uppercase tracking-wider">
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified Host
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-sans font-bold text-[10px] uppercase tracking-wider">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-text-muted">
                    {competition.host?.slug && (
                      <Link
                        href={`/hosts/${competition.host.slug}`}
                        target="_blank"
                        className="text-primary hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                      >
                        @{competition.host.slug}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>
                    )}
                    <span>•</span>
                    <span>Primary Contact: <strong className="text-text-primary">{contactPerson}</strong></span>
                  </div>
                </div>
              </div>

              {/* Host Contact Credentials */}
              <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
                <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider mb-3">
                  Operator Credentials & Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email */}
                  <div className="bg-elevated border border-border-medium rounded-lg p-3 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="font-sans font-semibold text-[10px] text-text-muted uppercase tracking-wider block">
                        Email Address
                      </span>
                      <span className="font-sans text-xs font-bold text-text-primary truncate block mt-0.5">
                        {hostUser?.email || "Not provided"}
                      </span>
                    </div>
                    {hostUser?.email && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(hostUser.email, "email")}
                        className="px-2 py-1 rounded bg-surface border border-border hover:bg-elevated text-[10px] font-sans font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
                      >
                        {copiedText === "email" ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="bg-elevated border border-border-medium rounded-lg p-3 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="font-sans font-semibold text-[10px] text-text-muted uppercase tracking-wider block">
                        Telephone
                      </span>
                      <span className="font-sans text-xs font-bold text-text-primary truncate block mt-0.5">
                        {competition.host?.phone || hostUser?.phone || "Not provided"}
                      </span>
                    </div>
                    {(competition.host?.phone || hostUser?.phone) && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard((competition.host?.phone || hostUser?.phone)!, "phone")}
                        className="px-2 py-1 rounded bg-surface border border-border hover:bg-elevated text-[10px] font-sans font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
                      >
                        {copiedText === "phone" ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>

                  {/* Address */}
                  <div className="bg-elevated border border-border-medium rounded-lg p-3 sm:col-span-2">
                    <span className="font-sans font-semibold text-[10px] text-text-muted uppercase tracking-wider block">
                      Registered Address / Location
                    </span>
                    <span className="font-sans text-xs text-text-primary block mt-0.5">
                      {competition.host?.address || hostUser?.address || "No physical address specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Host Account Stats & Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-elevated border border-border-medium rounded-xl p-4 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Subscription Tier
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-heading font-black text-xs uppercase tracking-wider mt-1.5">
                    {activePlan}
                  </span>
                </div>

                <div className="bg-elevated border border-border-medium rounded-xl p-4 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Total Competitions
                  </span>
                  <span className="font-heading font-black text-xl text-text-primary mt-1 block">
                    {totalHosted}
                  </span>
                </div>

                <div className="bg-elevated border border-border-medium rounded-xl p-4 text-center">
                  <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider block">
                    Member Since (UK)
                  </span>
                  <span className="font-heading font-bold text-xs text-text-primary mt-2 block">
                    {competition.host?.createdAt ? formatUkDate(competition.host.createdAt) : "N/A"}
                  </span>
                </div>
              </div>

              {/* Host Bio */}
              {competition.host?.bio && (
                <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
                  <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider mb-2">
                    Operator Biography / Background
                  </h4>
                  <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar bg-elevated/70 border border-border-medium rounded-lg p-3 text-xs text-text-secondary leading-relaxed">
                    {competition.host.bio}
                  </div>
                </div>
              )}

              {/* Host Reference ID */}
              <div className="flex items-center justify-between px-3 py-2 bg-elevated/40 border border-border rounded-lg text-[11px] text-text-muted">
                <span className="font-mono">Host ID: {competition.host?.id || "N/A"}</span>
                {competition.host?.id && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(competition.host!.id, "hostId")}
                    className="font-sans text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {copiedText === "hostId" ? "Copied!" : "Copy ID"}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 lg:px-8 border-t border-divider bg-elevated/80 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isApproving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onReject(competition.id, competition.title);
              }}
              disabled={isApproving}
              className="btn-glossy-red flex-1 sm:flex-none h-10 px-6 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-98"
            >
              Reject & Request Changes
            </button>

            <button
              type="button"
              onClick={() => onApprove(competition.id)}
              disabled={isApproving}
              className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              {isApproving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Approve & Publish</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Image Lightbox */}
      {showImageLightbox && competition.mainImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowImageLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setShowImageLightbox(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors cursor-pointer"
            title="Close image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={competition.mainImage}
              alt={competition.title}
              className="w-full h-full object-contain max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
