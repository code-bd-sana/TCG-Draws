"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useMyWinnersQuery } from "@/hooks/useUserHooks";
import { UserWinner } from "@/services/user.service";
import WinnerReviewModal from "@/components/reviews/WinnerReviewModal";
import UserWinDetailsModal from "@/components/dashboard/user/UserWinDetailsModal";
import { UserWinnersStatsCards } from "@/components/dashboard/user/UserWinnersStatsCards";

export default function UserWinnersPage() {
  const { data: winners, isLoading, isError, refetch } = useMyWinnersQuery();
  const [winTypeFilter, setWinTypeFilter] = useState<"ALL" | "INSTANT_WIN" | "MAIN_DRAW">("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [reviewModalWinner, setReviewModalWinner] = useState<UserWinner | null>(null);
  const [detailsModalWinner, setDetailsModalWinner] = useState<UserWinner | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const allWinners = winners || [];

  const instantWinsCount = allWinners.filter((w) => w.winType === "INSTANT_WIN").length;
  const mainDrawWinsCount = allWinners.filter((w) => w.winType === "MAIN_DRAW").length;
  const totalWins = allWinners.length;

  const filteredWinners = useMemo(() => {
    return allWinners.filter((w) => {
      // Win Type
      const matchesType = winTypeFilter === "ALL" ? true : w.winType === winTypeFilter;

      // Delivery Status
      const matchesDelivery =
        deliveryFilter === "ALL"
          ? true
          : deliveryFilter === "DELIVERED"
          ? w.deliveryStatus === "DELIVERED"
          : deliveryFilter === "SHIPPED"
          ? w.deliveryStatus === "SHIPPED"
          : w.deliveryStatus === "PENDING";

      // Search Query
      const query = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        query === ""
          ? true
          : w.prizeName.toLowerCase().includes(query) ||
            w.raffle?.title?.toLowerCase().includes(query) ||
            w.ticketNumber.toString().includes(query) ||
            w.raffle?.hostBusinessName?.toLowerCase().includes(query);

      return matchesType && matchesDelivery && matchesSearch;
    });
  }, [allWinners, winTypeFilter, deliveryFilter, debouncedSearch]);

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setWinTypeFilter("ALL");
    setDeliveryFilter("ALL");
  };

  return (
    <div className="relative flex flex-col gap-8 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn min-h-screen">
      {/* Ambient Art-Deco Lighting Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb Navigation & Real-time Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(212,175,55,0.15)] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted">
          <Link href="/dashboard/user" className="hover:text-[#D4AF37] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-text-muted">User</span>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-[#D4AF37]">Winnings &amp; Prizes</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified Prizes Registry</span>
          </div>

          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#141720] text-text-muted hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer"
            title="Refresh Prizes"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
            Prize Vault &amp; Claim Tracker
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-tight mt-1">
            My Winnings &amp; Prizes
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Track confirmed instant prizes, main draw victories, cryptographic certificates and fulfillment dispatch tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-[rgba(212,175,55,0.2)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#D4AF37] text-[#090A0E] shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#D4AF37] text-[#090A0E] shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          <Link href="/dashboard/user/competitions">
            <button className="btn-gold-metallic px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
              <span>Enter Competitions</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <UserWinnersStatsCards winners={allWinners} isLoading={isLoading} />

      {/* Filter and Search Bar */}
      <div className="art-deco-card p-5 sm:p-6 rounded-2xl flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by prize name, competition, or ticket #..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-obsidian w-full h-11 pl-10 pr-10 text-xs sm:text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Win Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-[rgba(212,175,55,0.15)]">
            <button
              onClick={() => setWinTypeFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                winTypeFilter === "ALL"
                  ? "btn-gold-metallic text-[#090A0E] shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              All Wins ({totalWins})
            </button>
            <button
              onClick={() => setWinTypeFilter("INSTANT_WIN")}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                winTypeFilter === "INSTANT_WIN"
                  ? "bg-amber-500 text-[#090A0E] font-black shadow-sm"
                  : "text-text-muted hover:text-amber-400"
              }`}
            >
              <span>⚡</span> Instant Wins ({instantWinsCount})
            </button>
            <button
              onClick={() => setWinTypeFilter("MAIN_DRAW")}
              className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                winTypeFilter === "MAIN_DRAW"
                  ? "bg-emerald-500 text-[#090A0E] font-black shadow-sm"
                  : "text-text-muted hover:text-emerald-400"
              }`}
            >
              <span>🏆</span> Main Draws ({mainDrawWinsCount})
            </button>
          </div>
        </div>

        {/* Fulfillment Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pt-2 border-t border-[rgba(212,175,55,0.1)]">
          <span className="text-xs font-mono uppercase text-text-muted whitespace-nowrap mr-1">
            Fulfillment:
          </span>
          {[
            { id: "ALL", label: "All Statuses" },
            { id: "DELIVERED", label: "✓ Delivered" },
            { id: "SHIPPED", label: "📦 Dispatched" },
            { id: "PENDING", label: "⏳ Claim Processing" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setDeliveryFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                deliveryFilter === st.id
                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                  : "bg-[#090A0E]/60 border-[rgba(212,175,55,0.15)] text-text-muted hover:text-text-primary"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="art-deco-card rounded-2xl overflow-hidden flex flex-col p-4 animate-pulse gap-4"
            >
              <div className="w-full aspect-[16/10] bg-[#1C202B] rounded-xl" />
              <div className="h-4 w-1/3 bg-white/5 rounded" />
              <div className="h-6 w-4/5 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/10 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="art-deco-card p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-heading font-black uppercase text-text-primary">
              Failed to load winning records
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              An error occurred while querying the prizes registry. Please retry.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="btn-gold-metallic px-6 py-2.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredWinners.length === 0 ? (
        <div className="art-deco-card p-16 text-center rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#D4AF37] text-3xl">
            🏆
          </div>
          <div>
            <h3 className="text-lg font-heading font-black uppercase text-text-primary tracking-wide">
              {allWinners.length === 0 ? "No Prizes Won Yet" : "No Matching Prizes Found"}
            </h3>
            <p className="font-sans text-xs text-text-muted max-w-md mt-1">
              {allWinners.length === 0
                ? "You haven't claimed any instant wins or main draws yet. Enter active competitions to secure verified tickets and unlock instant prizes!"
                : "No prizes match your current search or status filter criteria."}
            </p>
          </div>
          {allWinners.length === 0 ? (
            <Link href="/dashboard/user/competitions">
              <button className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer">
                Explore Live Competitions
              </button>
            </Link>
          ) : (
            <button
              onClick={handleClearFilters}
              className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredWinners.map((win: UserWinner) => {
            const isInstant = win.winType === "INSTANT_WIN";
            const displayImage =
              win.prizeImage ||
              win.raffle?.mainImage ||
              "/coming-soon-hero.jpg";

            const wonDateFormatted = win.createdAt
              ? format(new Date(win.createdAt), "dd MMM yyyy")
              : "Recent";

            return (
              <div
                key={win.id}
                className="art-deco-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)] group"
              >
                {/* Hero Image Container */}
                <div className="relative w-full aspect-[16/10] bg-[#090A0E] overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={win.prizeName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/70" />

                  {/* Win Type Badge Top Left */}
                  <div className="absolute top-3 left-3">
                    {isInstant ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider">
                        <span>⚡</span>
                        <span>Instant Win</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px] uppercase tracking-wider">
                        <span>🏆</span>
                        <span>Main Draw</span>
                      </span>
                    )}
                  </div>

                  {/* Ticket Number Top Right */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#090A0E]/90 backdrop-blur-md border border-[rgba(212,175,55,0.3)] shadow-xs">
                    <span className="font-mono text-xs font-black text-[#D4AF37]">
                      Ticket #{win.ticketNumber.toString().padStart(4, "0")}
                    </span>
                  </div>

                  {/* Prize Title Overlay on Image Bottom */}
                  <div className="absolute bottom-3 left-4 right-4 flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-[#D4AF37] font-semibold">
                      {isInstant ? "Instant Win Prize" : "Grand Victory Prize"}
                    </span>
                    <h3 className="font-heading font-black text-base text-[#F5E5C0] truncate group-hover:text-white transition-colors">
                      {win.prizeName}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                  <div className="space-y-3">
                    {/* Competition Link */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">
                        Competition
                      </span>
                      <Link
                        href={`/live-raffles/${win.raffle?.slug}`}
                        className="font-heading font-bold text-xs sm:text-sm text-text-primary hover:text-[#D4AF37] transition-colors truncate block"
                      >
                        {win.raffle?.title}
                      </Link>
                    </div>

                    {/* Host & Date info */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-[rgba(212,175,55,0.1)] text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Hosted By</span>
                        <span className="text-[#F5E5C0] font-semibold truncate block">
                          {win.raffle?.hostBusinessName || "TCG Verified Host"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Won On</span>
                        <span className="text-text-primary font-semibold block">
                          {wonDateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Value (RRP) if available */}
                    {win.rrpValue !== null && (
                      <div className="flex justify-between items-center px-3.5 py-2 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.15)] text-xs">
                        <span className="font-mono text-text-muted">Prize Value (RRP):</span>
                        <span className="font-heading font-black text-[#D4AF37] text-sm">
                          £{Number(win.rrpValue).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delivery & Review Actions */}
                  <div className="space-y-3 pt-2">
                    {/* Fulfillment Status */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-text-muted">Fulfillment:</span>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          win.deliveryStatus === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : win.deliveryStatus === "SHIPPED"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {win.deliveryStatus === "DELIVERED"
                          ? "Delivered"
                          : win.deliveryStatus === "SHIPPED"
                          ? "Dispatched"
                          : "Processing"}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(212,175,55,0.1)]">
                      <button
                        type="button"
                        onClick={() => setDetailsModalWinner(win)}
                        className="w-full py-2 rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] hover:border-[#D4AF37] text-text-muted hover:text-text-primary font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Certificate</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>

                      {win.review ? (
                        <button
                          type="button"
                          onClick={() => setReviewModalWinner(win)}
                          className="w-full py-2 rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#D4AF37]/10 text-[#D4AF37] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer hover:bg-[#D4AF37] hover:text-[#090A0E]"
                        >
                          Reviewed ★{win.review.rating}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewModalWinner(win)}
                          className="btn-gold-metallic w-full py-2 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>★ Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-4 w-full">
          {filteredWinners.map((win: UserWinner) => {
            const isInstant = win.winType === "INSTANT_WIN";
            const displayImage =
              win.prizeImage ||
              win.raffle?.mainImage ||
              "/coming-soon-hero.jpg";

            const wonDateFormatted = win.createdAt
              ? format(new Date(win.createdAt), "dd MMM yyyy")
              : "Recent";

            return (
              <div
                key={win.id}
                className="art-deco-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 transition-all duration-300 hover:border-[#D4AF37] group"
              >
                {/* Left Side: Thumbnail & Title Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#090A0E] flex-shrink-0 border border-[rgba(212,175,55,0.2)]">
                    <Image
                      src={displayImage}
                      alt={win.prizeName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isInstant ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300">
                          ⚡ Instant Win
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                          🏆 Main Draw
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-[#D4AF37]">
                        Ticket #{win.ticketNumber.toString().padStart(4, "0")}
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-sm sm:text-base text-text-primary truncate group-hover:text-[#D4AF37] transition-colors">
                      {win.prizeName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
                      <span>Draw: <strong className="text-text-primary">{win.raffle?.title}</strong></span>
                      <span>•</span>
                      <span>Host: <strong className="text-[#F5E5C0]">{win.raffle?.hostBusinessName}</strong></span>
                      <span>•</span>
                      <span>Won: {wonDateFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: RRP, Status & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between md:justify-end flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  {win.rrpValue !== null && (
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-text-muted block">Prize Value</span>
                      <span className="text-base font-mono font-black text-[#D4AF37]">
                        £{Number(win.rrpValue).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Fulfillment Status */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      win.deliveryStatus === "DELIVERED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : win.deliveryStatus === "SHIPPED"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {win.deliveryStatus === "DELIVERED"
                      ? "Delivered"
                      : win.deliveryStatus === "SHIPPED"
                      ? "Dispatched"
                      : "Processing"}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setDetailsModalWinner(win)}
                      className="px-3.5 py-2 rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] text-text-muted hover:text-text-primary hover:border-[#D4AF37] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                    >
                      Certificate
                    </button>

                    {win.review ? (
                      <button
                        type="button"
                        onClick={() => setReviewModalWinner(win)}
                        className="px-3.5 py-2 rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#D4AF37]/10 text-[#D4AF37] font-heading font-black text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap hover:bg-[#D4AF37] hover:text-[#090A0E]"
                      >
                        Reviewed ★{win.review.rating}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewModalWinner(win)}
                        className="btn-gold-metallic px-4 py-2 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        ★ Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Draggable Prize Certificate & Details Modal */}
      <UserWinDetailsModal
        isOpen={!!detailsModalWinner}
        onClose={() => setDetailsModalWinner(null)}
        win={detailsModalWinner}
      />

      {/* Draggable Winner Review Modal */}
      {reviewModalWinner && (
        <WinnerReviewModal
          isOpen={!!reviewModalWinner}
          onClose={() => setReviewModalWinner(null)}
          winnerId={reviewModalWinner.id}
          prizeName={reviewModalWinner.prizeName}
          competitionTitle={reviewModalWinner.raffle?.title || "Competition"}
          hostName={reviewModalWinner.raffle?.hostBusinessName || "TCG Host"}
          existingReview={reviewModalWinner.review}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
