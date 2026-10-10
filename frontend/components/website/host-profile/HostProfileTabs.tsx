"use client";

import React, { useState } from "react";
import Link from "next/link";
import LiveRaffleCard from "../live-raffles/LiveRaffleCard";
import { Draw } from "../../../types/draw.types";
import { HostReview, HostReviewStats, HostReviewItem } from "../../../types/review.types";
import HostReviewsTab from "../host-reviews/HostReviewsTab";

interface HostProfileTabsProps {
  hostId?: string;
  raffles?: any[];
  name?: string;
  bio?: string;
  location?: string;
  rating?: number | null;
  totalReviews?: number;
  stats?: HostReviewStats | null;
  reviews?: any[];
}

export default function HostProfileTabs({
  hostId = "",
  raffles = [],
  name = "Host",
  bio = "",
  location = "",
  rating = null,
  totalReviews = 0,
  stats = null,
  reviews = [],
}: HostProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"active" | "past" | "reviews" | "about">("active");

  const isPastRaffle = (r: any) => {
    if (r.status === "ENDED" || r.status === "COMPLETED" || r.status === "CANCELLED" || r.status === "ended") {
      return true;
    }
    const end = r.rawEndDate || r.endDate;
    if (end) {
      if (end === "Draw Closed" || end === "Ended") return true;
      const parsed = new Date(end);
      if (!isNaN(parsed.getTime()) && parsed.getTime() <= Date.now()) {
        return true;
      }
    }
    const total = Number(r.totalTickets ?? 0);
    const sold = Number(r.ticketsSold ?? r.soldTickets ?? 0);
    if (total > 0 && sold >= total) {
      return true;
    }
    return false;
  };

  const formatDraw = (r: any): Draw => {
    const isPast = isPastRaffle(r);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.mainImage || r.image || "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop",
      ticketPrice: Number(r.pricePerTicket ?? r.ticketPrice ?? 0),
      totalTickets: Number(r.totalTickets ?? 0),
      soldTickets: Number(r.ticketsSold ?? r.soldTickets ?? 0),
      rawEndDate: r.rawEndDate || r.endDate,
      endDate: isPast
        ? "Draw Closed"
        : r.endDate
        ? (typeof r.endDate === "string" && !r.endDate.includes("-") ? r.endDate : new Date(r.endDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }))
        : "Closing Soon",
      status: isPast ? ("ended" as const) : ("live" as const),
      category: r.category || "drivers",
      slug: r.slug || r.id,
      worthPrice: r.mainPrizeValue
        ? Number(r.mainPrizeValue)
        : r.worthPrice
        ? Number(r.worthPrice)
        : undefined,
      mainPrizeValue: r.mainPrizeValue ? Number(r.mainPrizeValue) : undefined,
      instantWinsCount:
        r._count?.instantWins ||
        (Array.isArray(r.instantWins) ? r.instantWins.length : 0) ||
        0,
      isInstantWin:
        (r._count?.instantWins ||
          (Array.isArray(r.instantWins) ? r.instantWins.length : 0) ||
          0) > 0,
      badgeText: r.badgeText || (isPast ? "ENDED" : undefined),
    };
  };

  const liveDraws = raffles.filter((r) => !isPastRaffle(r)).map(formatDraw);
  const pastDraws = raffles.filter((r) => isPastRaffle(r)).map(formatDraw);
  const displayedReviews = reviews.length > 0 ? reviews : [];

  return (
    <div className="flex flex-col mt-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-[rgba(212,175,55,0.2)] pb-4 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("active")}
          className={`h-[42px] px-5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none flex items-center gap-2.5 shrink-0 ${
            activeTab === "active"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
              : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
          }`}
        >
          <span>Active Draws</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
              activeTab === "active"
                ? "bg-[#090A0E] text-[#D4AF37]"
                : "bg-[#181C28] text-[#A69B82]"
            }`}
          >
            {liveDraws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`h-[42px] px-5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none flex items-center gap-2.5 shrink-0 ${
            activeTab === "past"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
              : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
          }`}
        >
          <span>Past Draws</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
              activeTab === "past"
                ? "bg-[#090A0E] text-[#D4AF37]"
                : "bg-[#181C28] text-[#A69B82]"
            }`}
          >
            {pastDraws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`h-[42px] px-5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none flex items-center gap-2.5 shrink-0 ${
            activeTab === "reviews"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
              : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
          }`}
        >
          <span>Reviews</span>
          {displayedReviews.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                activeTab === "reviews"
                  ? "bg-[#090A0E] text-[#D4AF37]"
                  : "bg-[#181C28] text-[#A69B82]"
              }`}
            >
              {displayedReviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`h-[42px] px-5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none flex items-center gap-2.5 shrink-0 ${
            activeTab === "about"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
              : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
          }`}
        >
          <span>About Host</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {/* ACTIVE DRAWS */}
        {activeTab === "active" && (
          <div className="animate-in fade-in duration-300">
            {liveDraws.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {liveDraws.map((draw) => (
                  <LiveRaffleCard key={draw.id} raffle={draw} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-lg my-2 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-3xl mb-4 text-[#D4AF37] shadow-inner">
                  🎯
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#F4EBD9] mb-2 uppercase tracking-tight">
                  No Active Draws At The Moment
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#A69B82] max-w-md mb-6 leading-relaxed">
                  <strong className="text-[#F4EBD9]">{name}</strong> does not have any live competitions running right now. Explore live draws from other verified hosts or check back soon!
                </p>
                <Link
                  href="/live-raffles"
                  className="btn-gold-metallic inline-flex items-center justify-center gap-2 font-heading font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:scale-105 transition-all"
                >
                  Explore All Live Competitions →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* PAST DRAWS */}
        {activeTab === "past" && (
          <div className="animate-in fade-in duration-300">
            {pastDraws.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pastDraws.map((draw) => (
                  <LiveRaffleCard key={draw.id} raffle={draw} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-lg my-2 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-3xl mb-4 text-[#D4AF37] shadow-inner">
                  🏆
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#F4EBD9] mb-2 uppercase tracking-tight">
                  No Past Draws Yet
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#A69B82] max-w-md leading-relaxed">
                  Completed competition history and winning ticket records will appear here once draws wrap up.
                </p>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div className="animate-in fade-in duration-300">
            <HostReviewsTab
              hostId={hostId}
              hostName={name}
              initialStats={stats}
              initialReviews={displayedReviews}
            />
          </div>
        )}

        {/* ABOUT HOST */}
        {activeTab === "about" && (
          <div className="animate-in fade-in duration-300">
            <div className="rounded-3xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-6 sm:p-8 md:p-10 shadow-lg max-w-4xl">
              <h3 className="font-heading font-black text-xl sm:text-2xl text-[#F4EBD9] mb-4 uppercase tracking-tight">
                About {name}
              </h3>
              <p className="font-sans text-sm text-[#D6CEBC] leading-relaxed mb-6">
                {bio || `${name} is an officially verified partner on TCG Draws, delivering authentic competitions, certified manufacturer items, and audited transparent draws.`}
              </p>

              {location && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28] px-3.5 py-1.5 text-xs font-semibold text-[#D4AF37] mb-8">
                  <span>📍</span>
                  <span>Headquartered in {location}</span>
                </div>
              )}

              {/* 3 Trust pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[rgba(212,175,55,0.15)]">
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.2)]">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <div className="font-heading text-xs font-black text-[#F4EBD9] uppercase tracking-wide">
                      Fully Vetted
                    </div>
                    <div className="font-sans text-[11px] text-[#A69B82] mt-0.5 leading-relaxed">
                      KYC verified business registration and approved host status.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.2)]">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-heading text-xs font-black text-[#F4EBD9] uppercase tracking-wide">
                      Guaranteed Prizes
                    </div>
                    <div className="font-sans text-[11px] text-[#A69B82] mt-0.5 leading-relaxed">
                      100% authentic merchandise with tracked &amp; insured UK courier dispatch.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.2)]">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-heading text-xs font-black text-[#F4EBD9] uppercase tracking-wide">
                      Instant Payouts
                    </div>
                    <div className="font-sans text-[11px] text-[#A69B82] mt-0.5 leading-relaxed">
                      Automated instant win payouts and cryptographically verifiable draws.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
