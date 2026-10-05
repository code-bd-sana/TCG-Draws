"use client";

import React, { useState } from "react";
import Link from "next/link";
import DrawCard from "../shared/DrawCard";

interface HostProfileTabsProps {
  raffles?: any[];
  name?: string;
  bio?: string;
  location?: string;
}

export default function HostProfileTabs({
  raffles = [],
  name = "Host",
  bio = "",
  location = "",
}: HostProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"active" | "past" | "reviews" | "about">("active");

  const isPastRaffle = (r: any) => {
    if (r.status === "ENDED" || r.status === "COMPLETED" || r.status === "CANCELLED") {
      return true;
    }
    const end = r.rawEndDate || r.endDate;
    if (end) {
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

  const formatDraw = (r: any): any => {
    const isPast = isPastRaffle(r);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.mainImage || r.image || "",
      ticketPrice: Number(r.pricePerTicket ?? r.ticketPrice ?? 0),
      totalTickets: Number(r.totalTickets ?? 0),
      soldTickets: Number(r.ticketsSold ?? r.soldTickets ?? 0),
      rawEndDate: r.endDate,
      endDate: isPast
        ? "Draw Closed"
        : r.endDate
        ? new Date(r.endDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Closing Soon",
      status: isPast ? "ended" : "live",
      category: r.category || "general",
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
    };
  };

  const liveDraws = raffles.filter((r) => r.status === "ACTIVE" && !isPastRaffle(r)).map(formatDraw);
  const pastDraws = raffles.filter((r) => isPastRaffle(r)).map(formatDraw);

  return (
    <div className="flex flex-col mt-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#CBD8C8] mb-8 overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3.5 pt-2 px-4 font-sans text-sm font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === "active"
              ? "border-[#0b4d35] text-[#0b4d35]"
              : "border-transparent text-[#5e766c] hover:text-[#0e1e17]"
          }`}
        >
          <span>Active Draws</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === "active"
                ? "bg-[#0b4d35] text-white"
                : "bg-[#E2EADF] text-[#334e43]"
            }`}
          >
            {liveDraws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`pb-3.5 pt-2 px-4 font-sans text-sm font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === "past"
              ? "border-[#0b4d35] text-[#0b4d35]"
              : "border-transparent text-[#5e766c] hover:text-[#0e1e17]"
          }`}
        >
          <span>Past Draws</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === "past"
                ? "bg-[#0b4d35] text-white"
                : "bg-[#E2EADF] text-[#334e43]"
            }`}
          >
            {pastDraws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3.5 pt-2 px-4 font-sans text-sm font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === "reviews"
              ? "border-[#0b4d35] text-[#0b4d35]"
              : "border-transparent text-[#5e766c] hover:text-[#0e1e17]"
          }`}
        >
          <span>Reviews</span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`pb-3.5 pt-2 px-4 font-sans text-sm font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === "about"
              ? "border-[#0b4d35] text-[#0b4d35]"
              : "border-transparent text-[#5e766c] hover:text-[#0e1e17]"
          }`}
        >
          <span>About Host</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[360px]">
        {activeTab === "active" && (
          <div className="animate-in fade-in duration-300">
            {liveDraws.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {liveDraws.map((draw) => (
                  <DrawCard key={draw.id} draw={draw} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-[#CBD8C8] bg-white shadow-sm my-2">
                <div className="w-16 h-16 rounded-2xl bg-[#ECF5EE] border border-[#CBD8C8] flex items-center justify-center text-3xl mb-4 text-[#0b4d35] shadow-inner">
                  ⛳
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0e1e17] mb-2 uppercase tracking-tight">
                  No Active Draws At The Moment
                </h3>
                <p className="font-sans text-sm text-[#5e766c] max-w-md mb-6 leading-relaxed">
                  <strong className="text-[#0e1e17]">{name}</strong> does not have any live competitions running right now. Check back soon or explore live draws from other verified hosts!
                </p>
                <Link
                  href="/live-raffles"
                  className="inline-flex items-center justify-center gap-2 font-sans font-bold text-sm px-6 py-3 rounded-button bg-[#0b4d35] text-white hover:bg-[#073826] transition-all shadow-md hover:shadow-lg"
                >
                  Explore All Live Competitions →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="animate-in fade-in duration-300">
            {pastDraws.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pastDraws.map((draw) => (
                  <DrawCard key={draw.id} draw={draw} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-[#CBD8C8] bg-white shadow-sm my-2">
                <div className="w-16 h-16 rounded-2xl bg-[#ECF5EE] border border-[#CBD8C8] flex items-center justify-center text-3xl mb-4 text-[#0b4d35] shadow-inner">
                  🏆
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0e1e17] mb-2 uppercase tracking-tight">
                  No Past Draws Yet
                </h3>
                <p className="font-sans text-sm text-[#5e766c] max-w-md leading-relaxed">
                  This host hasn't completed any competitions yet. Completed draw history and winning tickets will appear here once draws wrap up.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-[#CBD8C8] bg-white shadow-sm my-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl mb-4 text-amber-500 shadow-inner">
                ⭐
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0e1e17] mb-2 uppercase tracking-tight">
                Host Ratings & Reviews
              </h3>
              <p className="font-sans text-sm text-[#5e766c] max-w-md leading-relaxed mb-4">
                Verified ticket buyers can leave feedback after completing draws with <strong className="text-[#0e1e17]">{name}</strong>.
              </p>
              <div className="inline-flex items-center gap-2 bg-[#ECF5EE] border border-[#CBD8C8] px-4 py-2 rounded-xl">
                <span className="text-amber-500 font-bold text-lg">★ 5.0</span>
                <span className="text-xs font-semibold text-[#0b4d35]">Verified Host Standard</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="animate-in fade-in duration-300">
            <div className="rounded-2xl border border-[#CBD8C8] bg-white p-6 sm:p-8 shadow-sm my-2 max-w-3xl">
              <h3 className="font-heading font-black text-xl text-[#0e1e17] mb-3 uppercase tracking-tight">
                About {name}
              </h3>
              <p className="font-sans text-sm text-[#334e43] leading-relaxed mb-4">
                {bio || `${name} is an officially verified host on Fairway Draws, delivering premium golf equipment competitions, transparent audited draws, and instant win opportunities.`}
              </p>
              {location && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5e766c] mb-6">
                  <span>📍</span>
                  <span>Based in {location}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#EFF4ED]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF6] border border-[#E2EADF]">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <div className="text-xs font-bold text-[#0e1e17]">Fully Vetted</div>
                    <div className="text-[11px] text-[#5e766c]">Verified Partner</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF6] border border-[#E2EADF]">
                  <span className="text-xl">⛳</span>
                  <div>
                    <div className="text-xs font-bold text-[#0e1e17]">Golf Specialist</div>
                    <div className="text-[11px] text-[#5e766c]">Premium Clubs & Gear</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF6] border border-[#E2EADF]">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="text-xs font-bold text-[#0e1e17]">Instant Payouts</div>
                    <div className="text-[11px] text-[#5e766c]">Guaranteed Winners</div>
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
