"use client";

import React, { useState } from "react";
import Link from "next/link";
import LiveRaffleCard from "../live-raffles/LiveRaffleCard";
import { Draw } from "../../../types/draw.types";
import { HostReview } from "../../../types/review.types";

interface HostProfileTabsProps {
  raffles?: any[];
  name?: string;
  bio?: string;
  location?: string;
  rating?: number;
  totalReviews?: number;
  reviews?: HostReview[];
}

export default function HostProfileTabs({
  raffles = [],
  name = "Host",
  bio = "",
  location = "",
  rating = 5.0,
  totalReviews = 0,
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
          <div className="animate-in fade-in duration-300 flex flex-col gap-6">
            {/* Rating Summary Card */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-lg">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.35)] flex flex-col items-center justify-center text-center shadow-inner shrink-0">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-[#D4AF37]">
                    {Number(rating).toFixed(1)}
                  </span>
                  <div className="flex text-[10px] text-[#D4AF37]">★★★★★</div>
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-[#F4EBD9] uppercase tracking-tight">
                    Verified Host Rating
                  </h3>
                  <p className="font-sans text-xs text-[#A69B82] mt-1">
                    Based on verified ticket buyer entries &amp; delivered prize reviews.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#181C28] border border-emerald-500/35 px-4 py-2 rounded-xl text-emerald-400 font-sans text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                100% Genuine Winner Feedback
              </div>
            </div>

            {/* Reviews List */}
            {displayedReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col justify-between gap-4 p-5 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#12151F] shadow-md transition-all hover:border-[#D4AF37]/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-xs font-black text-[#D4AF37]">
                            {rev.reviewerName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-sans text-xs font-bold text-[#F4EBD9] block">
                              {rev.reviewerName}
                            </span>
                            <span className="font-sans text-[10px] text-[#A69B82]">
                              {rev.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[#D4AF37] text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>

                      {rev.competitionTitle && (
                        <div className="font-heading text-[11px] font-bold text-[#D4AF37] uppercase tracking-wide mb-1.5">
                          Draw: {rev.competitionTitle}
                        </div>
                      )}

                      <p className="font-sans text-xs text-[#D6CEBC] leading-relaxed">
                        "{rev.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 pt-2 border-t border-[rgba(212,175,55,0.1)]">
                      <span>✓</span> Verified Ticket Entrant
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]">
                <p className="font-sans text-xs text-[#A69B82]">
                  No public reviews submitted yet for this host. Verified entrants can submit reviews once draws conclude.
                </p>
              </div>
            )}
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
