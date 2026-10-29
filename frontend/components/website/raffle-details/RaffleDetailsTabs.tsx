"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RaffleDetail, RaffleTabId, RaffleTab } from "../../../types/raffle-details.types";
import { formatCurrency } from "../../../lib/utils";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../features/auth/AuthContext";

interface RaffleDetailsTabsProps {
  raffle: RaffleDetail;
}

export default function RaffleDetailsTabs({ raffle }: RaffleDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<RaffleTabId>("details");
  const { user } = useAuth();

  const tabs: RaffleTab[] = [
    { id: "details", label: "Description" },
    { id: "how-to-enter", label: "How to Enter" },
    { id: "terms", label: "Terms" },
  ];

  const checkIcon = (
    <div className="w-5 h-5 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.35)] flex items-center justify-center shrink-0">
      <svg className="w-3 h-3 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );

  const isAuthorizedToViewInstantWins = Boolean(
    user && (
      user.role === 'ADMIN' ||
      (user.role === 'HOST' && (
        (raffle.hostUserId && user.id === raffle.hostUserId) ||
        (raffle.hostId && user.hostProfile?.id === raffle.hostId) ||
        (raffle.hostName && user.hostProfile?.businessName === raffle.hostName)
      )) ||
      (raffle.hostUserId && user.id === raffle.hostUserId)
    )
  );

  return (
    <div className="w-full flex flex-col font-sans mt-2 bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-2xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-[rgba(212,175,55,0.15)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-3 text-xs font-heading font-black uppercase tracking-wider transition-colors duration-200 border-b-2 -mb-[1px] cursor-pointer",
              activeTab === tab.id
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-[#A69B82] hover:text-[#F4EBD9]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[140px]">
        {activeTab === "details" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <p className="text-xs text-[#D6CEBC] leading-relaxed">
              {raffle.description}
            </p>
            {raffle.highlights.length > 0 && (
              <ul className="flex flex-col gap-2 mt-2">
                {raffle.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#F4EBD9] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 shadow-[0_0_6px_#D4AF37]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "how-to-enter" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex gap-3.5 items-start">
              <div className="bg-[#181C28] border border-[rgba(212,175,55,0.35)] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-black text-[#D4AF37] text-xs">
                1
              </div>
              <div>
                <h4 className="font-heading font-black uppercase tracking-wide text-[#F4EBD9] text-xs">Select your tickets</h4>
                <p className="text-xs text-[#A69B82] mt-0.5 leading-relaxed">Choose how many tickets you&apos;d like to purchase. More tickets = more chances to win.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="bg-[#181C28] border border-[rgba(212,175,55,0.35)] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-black text-[#D4AF37] text-xs">
                2
              </div>
              <div>
                <h4 className="font-heading font-black uppercase tracking-wide text-[#F4EBD9] text-xs">Complete checkout</h4>
                <p className="text-xs text-[#A69B82] mt-0.5 leading-relaxed">Pay securely via card or gateway. Free postal entry also available — see T&Cs.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="bg-[#181C28] border border-[rgba(212,175,55,0.35)] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-black text-[#D4AF37] text-xs">
                3
              </div>
              <div>
                <h4 className="font-heading font-black uppercase tracking-wide text-[#F4EBD9] text-xs">Instant win check</h4>
                <p className="text-xs text-[#A69B82] mt-0.5 leading-relaxed">Your ticket numbers are checked against instant win outcomes automatically. If you win, you&apos;ll know straight away.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="bg-[#181C28] border border-[rgba(212,175,55,0.35)] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-black text-[#D4AF37] text-xs">
                4
              </div>
              <div>
                <h4 className="font-heading font-black uppercase tracking-wide text-[#F4EBD9] text-xs">Watch the live draw</h4>
                <p className="text-xs text-[#A69B82] mt-0.5 leading-relaxed">The main draw goes live when the timer ends or tickets sell out. Watch the live selection!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <p className="text-xs text-[#A69B82] mb-1 font-semibold">Please read the terms carefully before entering.</p>
            <ul className="flex flex-col gap-2">
              {raffle.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[#D6CEBC] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 shadow-[0_0_6px_#D4AF37]" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Instant Win Prizes (Only visible to Admin and creator Host) */}
      {isAuthorizedToViewInstantWins && raffle.instantWinPrizes.length > 0 && (
        <div className="mt-6 bg-[#090A0E] border border-[rgba(212,175,55,0.25)] rounded-xl p-5 flex flex-col gap-3.5 shadow-inner">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎁</span>
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#D4AF37]">Instant Win Prizes</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {raffle.instantWinPrizes.map((prize) => (
              <div key={prize.id} className="flex items-center justify-between p-3.5 bg-[#12151F] border border-[rgba(212,175,55,0.2)] rounded-xl">
                <div className="flex items-center gap-3">
                  {prize.image ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#090A0E] border border-[rgba(212,175,55,0.25)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prize.image} alt={prize.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    checkIcon
                  )}
                  <div className="flex flex-col">
                    <span className="font-heading font-bold text-xs text-[#F4EBD9]">{prize.title}</span>
                    <span className="font-mono text-[11px] text-[#A69B82]">
                      Ticket #{prize.ticketNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className={cn("font-heading font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider", prize.isClaimed ? "bg-[#181C28] border border-[rgba(212,175,55,0.2)] text-[#6E6655]" : "bg-[#2A1E08] border border-[#D4AF37]/50 text-[#E5C158]")}>
                    {prize.isClaimed ? "Claimed" : "Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Host Profile Banner */}
      {raffle.hostName && (() => {
        const isImage = Boolean(
          raffle.hostLogo &&
          (raffle.hostLogo.startsWith('http://') ||
           raffle.hostLogo.startsWith('https://') ||
           raffle.hostLogo.startsWith('/') ||
           raffle.hostLogo.startsWith('data:image/'))
        );
        const initials = raffle.hostName
          ? raffle.hostName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
          : 'FD';
        const hostSlug = (raffle as any).hostSlug || raffle.hostName.toLowerCase().replace(/\s+/g, '-');

        return (
          <div className="mt-6 bg-[#090A0E] border border-[rgba(212,175,55,0.2)] rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.35)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {isImage ? (
                  <img
                    src={raffle.hostLogo}
                    alt={raffle.hostName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="font-heading font-black text-[#D4AF37] text-sm">{initials}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-[#A69B82] uppercase tracking-wider font-bold">Hosted by</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-heading font-bold text-sm text-[#F4EBD9]">{raffle.hostName}</span>
                  {raffle.hostVerified && (
                    <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Verified</span>
                  )}
                </div>
              </div>
            </div>
            <Link 
              href={`/hosts/${hostSlug}`}
              className="text-xs font-heading font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#FFF0D4] transition-colors"
            >
              View Host Profile &rarr;
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
