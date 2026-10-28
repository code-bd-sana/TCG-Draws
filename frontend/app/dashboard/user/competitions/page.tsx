"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePublicRaffles } from "@/hooks/useRaffleHooks";
import { usePublicCategories } from "@/hooks/useCategoryHooks";
import { Pagination } from "@/components/ui/Pagination";
import { CompetitionStatsCards } from "@/components/dashboard/user/CompetitionStatsCards";
import { CompetitionQuickViewModal } from "@/components/dashboard/user/CompetitionQuickViewModal";
import { Raffle } from "@/services/raffle.service";

export default function UserRafflesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Competitions");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Quick View Modal State
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Public Categories
  const { data: categoriesData } = usePublicCategories();

  // Fetch Public Raffles
  const { data, isLoading, isError, refetch } = usePublicRaffles({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    statusFilter: statusFilter === "All Competitions" ? undefined : statusFilter,
    category: category === "All" ? undefined : category,
    sort,
  });

  const raffles: Raffle[] = data?.data || [];
  const meta = data?.meta;

  const handleOpenQuickView = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setIsQuickViewOpen(true);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("All Competitions");
    setCategory("All");
    setSort("Latest");
    setPage(1);
  };

  // Combine fetched categories with default fallbacks
  const availableCategories = React.useMemo(() => {
    const fetched = (categoriesData || []).map((c) => c.name);
    const defaults = [
      "Graded Slabs",
      "Vintage Packs",
      "Booster Boxes",
      "Alternate Arts",
      "Instant Wins",
      "Cash Prizes",
    ];
    const combined = Array.from(new Set([...fetched, ...defaults]));
    return ["All", ...combined];
  }, [categoriesData]);

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
          <span className="text-[#D4AF37]">Competitions</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Draws Sync</span>
          </div>

          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#141720] text-text-muted hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer"
            title="Refresh Competitions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
            TCG Marketplace
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-tight mt-1">
            Browse Competitions
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Explore active, upcoming, and guaranteed draws. Secure verified Pokémon, One Piece & rare collectible grails.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-[rgba(212,175,55,0.2)] self-start md:self-auto">
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
      </div>

      {/* KPI Stats Cards */}
      <CompetitionStatsCards
        raffles={raffles}
        totalCount={meta?.total}
        isLoading={isLoading}
      />

      {/* Search & Filters Section */}
      <div className="art-deco-card p-5 sm:p-6 rounded-2xl flex flex-col gap-5">
        {/* Top Filter Bar: Search + Status Tabs + Sort Dropdown */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search competitions, cards, sets, or hosts..."
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

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-[rgba(212,175,55,0.15)]">
            {["All Competitions", "Live", "Upcoming", "Past"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === status
                    ? "btn-gold-metallic text-[#090A0E] shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-text-muted hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="input-obsidian h-11 px-3.5 text-xs font-mono uppercase tracking-wider text-text-primary cursor-pointer pr-8"
            >
              <option value="Latest">Latest Added</option>
              <option value="Ending Soon">Ending Soonest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs font-mono uppercase text-text-muted whitespace-nowrap mr-1">
            Categories:
          </span>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                category === cat
                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                  : "bg-[#090A0E]/60 border-[rgba(212,175,55,0.15)] text-text-muted hover:text-text-primary hover:border-[rgba(212,175,55,0.3)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Competitions Display Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="art-deco-card rounded-2xl overflow-hidden flex flex-col p-4 animate-pulse gap-4"
            >
              <div className="w-full aspect-square bg-[#1C202B] rounded-xl" />
              <div className="h-4 w-1/3 bg-white/5 rounded" />
              <div className="h-5 w-4/5 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-9 w-full bg-white/10 rounded-xl mt-auto" />
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
              Failed to load competitions
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              We encountered an issue synchronizing the live competition pool. Please retry.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="btn-gold-metallic px-6 py-2.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : raffles.length === 0 ? (
        <div className="art-deco-card p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#D4AF37]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-heading font-black uppercase text-text-primary tracking-wide">
              No Competitions Found
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-md">
              There are no competitions matching your search or active filter settings. Try adjusting your query or resetting all filters.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="btn-gold-metallic px-6 py-2.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {raffles.map((raffle) => {
            const now = new Date();
            const startDate = new Date(raffle.startDate);
            const endDate = new Date(raffle.endDate);
            const isLive = startDate <= now && endDate >= now;
            const isPast = endDate < now;

            const timeDiff = endDate.getTime() - now.getTime();
            const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
            const hours = Math.max(0, Math.floor((timeDiff / (1000 * 60 * 60)) % 24));
            const drawsIn = timeDiff > 0 ? `${days}d ${hours}h` : "Ended";

            const ticketsSold = raffle.ticketsSold || 0;
            const totalTickets = raffle.totalTickets || 1;
            const progressPercentage = Math.min(
              100,
              Math.round((ticketsSold / totalTickets) * 100)
            );

            return (
              <div
                key={raffle.id}
                className="art-deco-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37] hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)] group"
              >
                {/* Image Container with Badges & Quick View Overlay */}
                <div className="relative w-full aspect-square bg-[#090A0E] overflow-hidden flex items-center justify-center">
                  <Image
                    src={raffle.mainImage || "/coming-soon-hero.jpg"}
                    alt={raffle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-[#090A0E]/85 backdrop-blur-md border border-[rgba(212,175,55,0.25)] text-[10px] font-heading font-bold uppercase tracking-wider text-[#F5E5C0]">
                      {raffle.category || "Pokémon TCG"}
                    </span>
                    <div className="px-2.5 py-1 rounded-full bg-[#090A0E]/90 backdrop-blur-md border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                      <span className="text-xs font-mono font-black text-[#D4AF37]">
                        £{Number(raffle.pricePerTicket).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Hover Quick View Button */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => handleOpenQuickView(raffle)}
                      className="px-4 py-2 rounded-xl bg-[#090A0E]/90 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Quick View
                    </button>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
                    <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {drawsIn}
                    </span>

                    {isLive ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono uppercase tracking-wider text-emerald-400">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    ) : isPast ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono uppercase tracking-wider text-rose-400">
                        Ended
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono uppercase tracking-wider text-amber-400">
                        Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                  <div>
                    {/* Host Name */}
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono mb-1.5">
                      <span>By</span>
                      <span className="text-[#F5E5C0] font-semibold truncate max-w-[150px]">
                        {raffle.host?.businessName || raffle.host?.user?.firstName || "TCG Draws"}
                      </span>
                    </div>

                    {/* Competition Title */}
                    <h3 className="font-heading font-black text-sm text-text-primary line-clamp-2 min-h-[40px] group-hover:text-[#D4AF37] transition-colors">
                      {raffle.title}
                    </h3>
                  </div>

                  {/* Progress & Tickets Sold */}
                  <div className="space-y-1.5 pt-2 border-t border-[rgba(212,175,55,0.1)]">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-text-muted text-[11px]">{ticketsSold} claimed</span>
                      <span className="text-[#D4AF37] font-bold text-[11px]">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#1C202B] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#997A35] via-[#D4AF37] to-[#F5E5C0] transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-text-muted font-mono">
                      <span>Max: {totalTickets}</span>
                      <span>Left: {Math.max(0, totalTickets - ticketsSold)}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    {isLive ? (
                      <Link href={`/live-raffles/${raffle.slug}`} className="w-full block">
                        <button className="btn-gold-metallic w-full h-10 rounded-xl text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                          <span>Enter Competition</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full h-10 rounded-xl bg-[#1C202B] border border-white/10 text-text-muted font-heading font-bold text-xs uppercase tracking-wider opacity-60 cursor-not-allowed flex items-center justify-center"
                      >
                        {isPast ? "Competition Closed" : "Upcoming Soon"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-4 w-full">
          {raffles.map((raffle) => {
            const now = new Date();
            const startDate = new Date(raffle.startDate);
            const endDate = new Date(raffle.endDate);
            const isLive = startDate <= now && endDate >= now;
            const isPast = endDate < now;

            const timeDiff = endDate.getTime() - now.getTime();
            const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
            const hours = Math.max(0, Math.floor((timeDiff / (1000 * 60 * 60)) % 24));
            const drawsIn = timeDiff > 0 ? `${days}d ${hours}h` : "Ended";

            const ticketsSold = raffle.ticketsSold || 0;
            const totalTickets = raffle.totalTickets || 1;
            const progressPercentage = Math.min(
              100,
              Math.round((ticketsSold / totalTickets) * 100)
            );

            return (
              <div
                key={raffle.id}
                className="art-deco-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 transition-all duration-300 hover:border-[#D4AF37] group"
              >
                {/* Left Side: Thumbnail & Title Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#090A0E] flex-shrink-0 border border-[rgba(212,175,55,0.2)]">
                    <Image
                      src={raffle.mainImage || "/coming-soon-hero.jpg"}
                      alt={raffle.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-black uppercase tracking-wider bg-[#090A0E] border border-[rgba(212,175,55,0.25)] text-[#F5E5C0]">
                        {raffle.category || "Pokémon TCG"}
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-black text-base text-text-primary truncate group-hover:text-[#D4AF37] transition-colors">
                      {raffle.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
                      <span>Host: <strong className="text-text-primary">{raffle.host?.businessName || "TCG Draws"}</strong></span>
                      <span>•</span>
                      <span>Draws in: <strong className="text-[#F5E5C0]">{drawsIn}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Center / Right: Progress Bar & Price */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between md:justify-end flex-shrink-0">
                  <div className="w-full sm:w-48 space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-text-muted text-[11px]">{ticketsSold}/{totalTickets}</span>
                      <span className="text-[#D4AF37] font-bold text-[11px]">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#1C202B] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#997A35] via-[#D4AF37] to-[#F5E5C0]"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono uppercase text-text-muted block">Ticket Price</span>
                    <span className="text-lg font-mono font-black text-[#D4AF37]">
                      £{Number(raffle.pricePerTicket).toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenQuickView(raffle)}
                      className="px-3.5 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] text-text-muted hover:text-text-primary hover:bg-[#1C202B] transition-all cursor-pointer"
                      title="Quick View"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    {isLive ? (
                      <Link href={`/live-raffles/${raffle.slug}`}>
                        <button className="btn-gold-metallic px-5 py-2.5 rounded-xl text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                          <span>Enter</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-[#1C202B] border border-white/10 text-text-muted font-heading font-bold text-xs uppercase tracking-wider opacity-60 cursor-not-allowed whitespace-nowrap"
                      >
                        Closed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Draggable Competition Quick View Modal */}
      <CompetitionQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedRaffle(null);
        }}
        raffle={selectedRaffle}
      />
    </div>
  );
}
