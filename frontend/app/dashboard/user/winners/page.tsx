"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useMyWinnersQuery } from "@/hooks/useUserHooks";
import { UserWinner } from "@/services/user.service";

export default function UserWinnersPage() {
  const { data: winners, isLoading, isError } = useMyWinnersQuery();
  const [filter, setFilter] = useState<"ALL" | "INSTANT_WIN" | "MAIN_DRAW">("ALL");
  const [search, setSearch] = useState("");

  const allWinners = winners || [];

  const instantWinsCount = allWinners.filter((w) => w.winType === "INSTANT_WIN").length;
  const mainDrawWinsCount = allWinners.filter((w) => w.winType === "MAIN_DRAW").length;
  const totalWins = allWinners.length;

  const filteredWinners = allWinners.filter((w) => {
    const matchesFilter =
      filter === "ALL" ? true : w.winType === filter;
    const matchesSearch =
      search.trim() === ""
        ? true
        : w.prizeName.toLowerCase().includes(search.toLowerCase()) ||
          w.raffle.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-text-primary uppercase tracking-tight">
            My Winnings &amp; Prizes
          </h1>
          <p className="font-sans text-xs text-text-muted mt-1">
            Track all your Instant Wins and Main Competition Draw victories.
          </p>
        </div>
        <Link
          href="/dashboard/user/competitions"
          className="btn-glossy-red px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Enter More Competitions
        </Link>
      </div>

      {/* Stats KPI Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {/* Total Wins */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Total Won Prizes
            </p>
            <div className="w-9 h-9 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              🏆
            </div>
          </div>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-text-primary">
            {totalWins}
          </p>
          <span className="font-sans font-semibold text-xs text-text-muted">
            Lifetime claims across all competitions
          </span>
        </div>

        {/* Instant Wins */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Instant Wins
            </p>
            <div className="w-9 h-9 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-xs">
              ⚡
            </div>
          </div>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-[#D97706]">
            {instantWinsCount}
          </p>

          <span className="font-sans font-semibold text-xs text-text-muted">
            Instant prizes matched on ticket purchase
          </span>
        </div>

        {/* Main Draw Wins */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Main Competition Wins
            </p>
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shadow-xs">
              🎖️
            </div>
          </div>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-[#15803D]">
            {mainDrawWinsCount}
          </p>
          <span className="font-sans font-semibold text-xs text-text-muted">
            Grand prizes won in official draws
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface border border-border rounded-card p-4 shadow-card">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filter === "ALL"
                ? "bg-primary text-white shadow-xs"
                : "bg-elevated border border-border-medium text-text-muted hover:text-text-primary"
            }`}
          >
            All Wins ({totalWins})
          </button>
          <button
            onClick={() => setFilter("INSTANT_WIN")}
            className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filter === "INSTANT_WIN"
                ? "bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] shadow-xs"
                : "bg-elevated border border-border-medium text-text-muted hover:text-[#D97706]"
            }`}
          >
            <span>⚡</span> Instant Wins ({instantWinsCount})
          </button>
          <button
            onClick={() => setFilter("MAIN_DRAW")}
            className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filter === "MAIN_DRAW"
                ? "bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] shadow-xs"
                : "bg-elevated border border-border-medium text-text-muted hover:text-[#15803D]"
            }`}
          >
            <span>🏆</span> Main Draw Wins ({mainDrawWinsCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-[300px]">
          <input
            type="text"
            placeholder="Search prize or competition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 bg-elevated border border-border-medium rounded-xl px-3 pr-8 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-card shadow-card">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-sans font-bold text-xs text-text-muted">Loading your prize history...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface border border-red-200 rounded-card shadow-card">
          <p className="font-sans font-bold text-xs text-[#DC2626]">Failed to load winning records. Please refresh the page.</p>
        </div>
      ) : filteredWinners.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-surface border border-border rounded-card p-8 shadow-card">
          <div className="w-20 h-20 bg-elevated rounded-full border border-border-medium flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
              />
            </svg>
          </div>
          <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight mb-2">
            {allWinners.length === 0 ? "No Prizes Won Yet" : "No Matching Prizes Found"}
          </h3>
          <p className="font-sans text-xs text-text-muted max-w-[420px] mb-6">
            {allWinners.length === 0
              ? "You haven't won any instant prizes or main draws yet. Buy tickets to test your luck and unlock instant wins!"
              : "No prizes match your current filter or search criteria."}
          </p>
          <Link
            href="/dashboard/user/competitions"
            className="btn-glossy-red px-6 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 transition-all"
          >
            Explore Live Competitions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredWinners.map((win: UserWinner) => {
            const isInstant = win.winType === "INSTANT_WIN";

            const displayImage =
              win.prizeImage ||
              win.raffle?.mainImage ||
              "/coming-soon-hero.jpg";

            const wonDateFormatted = win.createdAt
              ? format(new Date(win.createdAt), "dd MMM yyyy")
              : "N/A";

            return (
              <div
                key={win.id}
                className="bg-surface border border-border rounded-card overflow-hidden flex flex-col shadow-card transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Card Top Banner Image Header */}
                <div className="relative w-full aspect-[16/10] bg-elevated overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={win.prizeName}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/60" />

                  {/* Badge Top Left */}
                  <div className="absolute top-3 left-3">
                    {isInstant ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] backdrop-blur-md shadow-xs">
                        <span className="text-xs">⚡</span>
                        <span className="font-sans font-bold text-[10px] uppercase tracking-wider">
                          Instant Win Prize
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] backdrop-blur-md shadow-xs">
                        <span className="text-xs">🏆</span>
                        <span className="font-sans font-bold text-[10px] uppercase tracking-wider">
                          Main Draw Winner
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Number Top Right */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-xs">
                    <span className="font-mono text-xs font-bold text-text-primary">
                      Ticket #{win.ticketNumber.toString().padStart(4, "0")}
                    </span>
                  </div>

                  {/* Prize Title overlay on image bottom */}
                  <div className="absolute bottom-3 left-4 right-4 flex flex-col">
                    <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-text-brand drop-shadow-sm">
                      {isInstant ? "Instant Reward" : "Grand Prize Winner"}
                    </span>
                    <h3 className="font-heading font-black text-base lg:text-lg text-text-primary line-clamp-1">
                      {win.prizeName}
                    </h3>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                  <div className="flex flex-col gap-3">
                    {/* Competition Name */}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Competition
                      </span>
                      <Link
                        href={`/live-raffles/${win.raffle.slug}`}
                        className="font-heading font-bold text-sm text-text-primary hover:text-text-brand transition-colors line-clamp-1"
                      >
                        {win.raffle.title}
                      </Link>
                    </div>

                    {/* Host & Date info */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-divider">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] text-text-muted uppercase font-bold">
                          Hosted By
                        </span>
                        <span className="font-sans text-xs font-semibold text-text-brand truncate">
                          {win.raffle.hostBusinessName}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] text-text-muted uppercase font-bold">
                          Won On
                        </span>
                        <span className="font-sans text-xs font-semibold text-text-primary">
                          {wonDateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* RRP / Value if available */}
                    {win.rrpValue !== null && (
                      <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-elevated border border-border-medium">
                        <span className="font-sans font-semibold text-xs text-text-muted">Prize Value (RRP):</span>
                        <span className="font-heading font-black text-sm text-text-brand">
                          £{Number(win.rrpValue).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delivery / Claim Status Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-divider mt-1">
                    <span className="font-sans text-xs font-semibold text-text-muted">Fulfillment:</span>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider border ${
                        win.deliveryStatus === "DELIVERED"
                          ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                          : win.deliveryStatus === "SHIPPED"
                          ? "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]"
                          : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {win.deliveryStatus === "DELIVERED"
                        ? "Delivered"
                        : win.deliveryStatus === "SHIPPED"
                        ? "Dispatched"
                        : "Claim Processing"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
