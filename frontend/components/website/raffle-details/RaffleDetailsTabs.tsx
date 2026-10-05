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
    <div className="w-5 h-5 rounded-full bg-[#1A230A] border border-[#43581E] flex items-center justify-center shrink-0">
      <svg className="w-3 h-3 text-[#8CB34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
    <div className="w-full flex flex-col font-sans mt-2 bg-surface border border-border rounded-card p-6 shadow-card">
      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-divider mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-3 text-xs font-heading font-bold uppercase tracking-wider transition-colors duration-200 border-b-2 -mb-[1px] cursor-pointer",
              activeTab === tab.id
                ? "border-primary text-text-brand"
                : "border-transparent text-text-muted hover:text-text-primary"
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
            <p className="text-xs text-text-secondary leading-relaxed">
              {raffle.description}
            </p>
            {raffle.highlights.length > 0 && (
              <ul className="flex flex-col gap-2 mt-2">
                {raffle.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
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
              <div className="bg-accent-bg border border-primary/30 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-text-brand text-xs">
                1
              </div>
              <div>
                <h4 className="font-heading font-bold text-text-primary text-xs">Select your tickets</h4>
                <p className="text-xs text-text-muted mt-0.5">Choose how many tickets you&apos;d like to purchase. More tickets = more chances to win.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="bg-accent-bg border border-primary/30 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-text-brand text-xs">
                2
              </div>
              <div>
                <h4 className="font-heading font-bold text-text-primary text-xs">Complete checkout</h4>
                <p className="text-xs text-text-muted mt-0.5">Pay securely via card or gateway. Free postal entry also available — see T&Cs.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="bg-accent-bg border border-primary/30 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-text-brand text-xs">
                3
              </div>
              <div>
                <h4 className="font-heading font-bold text-text-primary text-xs">Instant win check</h4>
                <p className="text-xs text-text-muted mt-0.5">Your ticket numbers are checked against instant win outcomes automatically. If you win, you&apos;ll know straight away.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="bg-accent-bg border border-primary/30 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-text-brand text-xs">
                4
              </div>
              <div>
                <h4 className="font-heading font-bold text-text-primary text-xs">Watch the live draw</h4>
                <p className="text-xs text-text-muted mt-0.5">The main draw goes live when the timer ends or tickets sell out. Watch the live selection!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <p className="text-xs text-text-muted mb-1 font-semibold">Please read the terms carefully before entering.</p>
            <ul className="flex flex-col gap-2">
              {raffle.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Instant Win Prizes (Only visible to Admin and creator Host) */}
      {isAuthorizedToViewInstantWins && raffle.instantWinPrizes.length > 0 && (
        <div className="mt-6 bg-elevated border border-border-medium rounded-xl p-5 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎁</span>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">Instant Win Prizes</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {raffle.instantWinPrizes.map((prize) => (
              <div key={prize.id} className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  {prize.image ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-elevated border border-border-medium">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prize.image} alt={prize.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    checkIcon
                  )}
                  <div className="flex flex-col">
                    <span className="font-sans font-semibold text-xs text-text-primary">{prize.title}</span>
                    <span className="font-sans text-[11px] text-text-muted">
                      Ticket #{prize.ticketNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className={cn("font-sans font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-xs", prize.isClaimed ? "bg-elevated border border-border text-text-muted" : "bg-accent-bg border border-primary/30 text-text-brand")}>
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
          <div className="mt-6 bg-elevated border border-border-medium rounded-xl p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
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
                  <span className="font-heading font-bold text-text-brand text-sm">{initials}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-text-muted uppercase tracking-wider font-bold">Hosted by</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-heading font-bold text-sm text-text-primary">{raffle.hostName}</span>
                  {raffle.hostVerified && (
                    <span className="bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">Verified</span>
                  )}
                </div>
              </div>
            </div>
            <Link 
              href={`/hosts/${hostSlug}`}
              className="text-xs font-heading font-bold text-text-brand hover:underline transition-colors"
            >
              View Host Profile
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
