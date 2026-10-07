"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Draw } from "../../../types/draw.types";
import { formatCurrency } from "../../../lib/utils";
import { cn } from "../../../lib/utils";
import { formatUkDateTime } from "../../../lib/uk-time";

interface LiveRaffleCardProps {
  raffle: Draw;
  viewMode?: "grid" | "list";
}

/**
 * TCG Draws Luxury Pokémon Raffle Card.
 * Renders both Grid and List modes with Obsidian surface, Gold metallic accents,
 * PSA/Grade badges, custom progress bars, and glowing interactive hover states.
 */
export default function LiveRaffleCard({ raffle, viewMode = "grid" }: LiveRaffleCardProps) {
  const r = raffle as any;

  const id = r.id;
  const title = r.title || "Untitled Pokémon Grail";
  const slug = r.slug || id;
  const isAutoDraw = r.isAutoDraw;
  const host = r.host;

  const fallbackImg = "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop";
  const image = r.mainImage || r.image || fallbackImg;

  const ticketPrice = Number(r.pricePerTicket ?? r.ticketPrice ?? 0) || 0;
  const totalTickets = Number(r.totalTickets ?? 0) || 0;
  const soldTickets = Number(r.ticketsSold ?? r.soldTickets ?? 0) || 0;

  const declaredPrizeValue =
    r.mainPrizeValue !== undefined && r.mainPrizeValue !== null && r.mainPrizeValue !== ""
      ? Number(r.mainPrizeValue)
      : (r.worthPrice !== undefined && r.worthPrice !== null && r.worthPrice !== ""
          ? Number(r.worthPrice)
          : 0);

  const worthPrice = declaredPrizeValue > 0 ? declaredPrizeValue : 0;
  const soldPercent = totalTickets > 0 ? Math.min(Math.round((soldTickets / totalTickets) * 100), 100) : 0;
  const badgeText = r.badgeText || (soldPercent >= 90 ? "ALMOST GONE" : soldPercent >= 50 ? "POPULAR" : "FEATURED");

  const rawCategory = r.category;
  const category =
    typeof rawCategory === "object" && rawCategory !== null
      ? rawCategory.slug || rawCategory.name || "slabs"
      : typeof rawCategory === "string"
      ? rawCategory
      : "slabs";

  const hostName =
    host?.businessName ||
    (host?.user?.firstName ? `${host.user.firstName} ${host.user.lastName || ""}`.trim() : "");

  const rawEndDate = r.endDate;
  const isValidDate = rawEndDate && !isNaN(new Date(rawEndDate).getTime());
  const formattedEndDate = isValidDate
    ? formatUkDateTime(rawEndDate)
    : typeof rawEndDate === "string"
    ? rawEndDate
    : "Closing Soon";

  const [timeLeft, setTimeLeft] = useState<string>(() => {
    if (!isValidDate) return typeof rawEndDate === "string" ? rawEndDate : "Closing Soon";
    return "";
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isValidDate) {
      if (typeof rawEndDate === "string") setTimeLeft(rawEndDate);
      return;
    }

    const calculateTime = () => {
      const now = Date.now();
      const startMs = r.startDate ? new Date(r.startDate).getTime() : 0;
      if (startMs > now) {
        const startDiff = startMs - now;
        const sd = Math.floor(startDiff / (1000 * 60 * 60 * 24));
        const sh = Math.floor((startDiff / (1000 * 60 * 60)) % 24);
        const sm = Math.floor((startDiff / 1000 / 60) % 60);
        return sd > 0 ? `Starts in ${sd}d ${sh}h` : `Starts in ${sh}h ${sm}m`;
      }

      const diff = new Date(rawEndDate).getTime() - now;
      if (diff <= 0) return "Ended";
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      if (d > 0) return `${d}d ${h}h ${m}m`;
      return `${h}h ${m}m ${s}s`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [rawEndDate, isValidDate, r.startDate]);

  // Icons
  const fireIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#E5C158]">
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-3.66-2.61-6.72-6.07-7.39.37.76.57 1.62.57 2.53 0 1.95-1.07 3.65-2.67 4.54l-.06.03c.53-2.14-.17-4.47-1.78-6.1l-.32-.33c-.09.33-.14.67-.14 1.02 0 2.27 1.34 4.22 3.28 5.11l.08.04c-1.61-.31-3.23.36-4.13 1.73A7.514 7.514 0 0 0 7 17.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-1.65-.54-3.18-1.57-4.52z" />
    </svg>
  );

  const ticketIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#D4AF37]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h12c.621 0 1.125.504 1.125 1.125v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0-1.125 1.125H7.5a1.125 1.125 0 0 1-1.125-1.125v-1.757a1.5 1.5 0 0 0 0-2.236V11.23a1.5 1.5 0 0 0 0-2.236V7.125A1.125 1.125 0 0 1 7.5 6Z" />
    </svg>
  );

  const clockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#A69B82]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const getBadgeStyle = (text: string) => {
    switch (text.toUpperCase()) {
      case "ALMOST GONE":
        return "bg-[#2A1E08] border-[#D4AF37]/50 text-[#E5C158]";
      case "HOT":
      case "POPULAR":
        return "bg-[#251010] border-red-500/40 text-red-400";
      case "NEW":
      case "FEATURED":
        return "bg-[#181C28] border-[#D4AF37]/35 text-[#D4AF37]";
      default:
        return "bg-[#12151F] border-[rgba(212,175,55,0.2)] text-[#A69B82]";
    }
  };

  const categoryLabels: Record<string, string> = {
    slabs: "Graded Slabs",
    "graded-slabs": "Graded Slabs",
    vintage: "Vintage Booster",
    "booster-boxes": "Booster Box",
    grails: "Alternate Art",
    "instant-wins": "Instant Win",
    cash: "Cash Prizes",
    drivers: "Graded Slabs",
    irons: "Vintage Packs",
    putters: "Booster Boxes",
    experiences: "TCG Grails",
    apparel: "Accessories",
  };

  const categoryLabel =
    typeof category === "string"
      ? categoryLabels[category.toLowerCase()] || categoryLabels[category] || category
      : "Pokémon Draw";

  const isExpired = Boolean(
    rawEndDate &&
      (rawEndDate === "Draw Closed" ||
        rawEndDate === "Ended" ||
        (!isNaN(new Date(rawEndDate).getTime()) && new Date(rawEndDate).getTime() <= Date.now()))
  );
  const isStatusEnded =
    r.status?.toLowerCase() === "ended" ||
    r.status?.toLowerCase() === "completed" ||
    r.status?.toLowerCase() === "cancelled";
  const isSoldOut = totalTickets > 0 && soldTickets >= totalTickets;
  const isEnded = isStatusEnded || isExpired || isSoldOut;

  // -------------------------------------------------------------
  // LIST VIEW LAYOUT
  // -------------------------------------------------------------
  if (viewMode === "list") {
    return (
      <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-[0_15px_35px_rgba(212,175,55,0.18)] sm:flex-row">
        {/* Left Side: Image Block */}
        <div className="relative w-full sm:w-[260px] md:w-[300px] h-[200px] sm:h-auto bg-[#090A0E] shrink-0 overflow-hidden">
          <Image
            src={imgError ? fallbackImg : image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover text-transparent transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
            unoptimized
            onError={() => setImgError(true)}
          />

          {/* Badges on Top of Image */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none z-10">
            {hostName ? (
              <div className="max-w-[160px] truncate rounded-full border border-[rgba(212,175,55,0.3)] bg-[#090A0E]/85 px-3 py-1 text-[10px] font-semibold text-[#F4EBD9] shadow-md backdrop-blur-md">
                By {hostName}
              </div>
            ) : <div />}

            <div className="rounded-full border border-[rgba(212,175,55,0.4)] bg-[#12151F]/90 px-3 py-1 text-[10px] font-bold text-[#D4AF37] shadow-sm backdrop-blur-md uppercase tracking-wider">
              {categoryLabel}
            </div>
          </div>

          {/* Countdown Clock Floating at Bottom of Image */}
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-center pointer-events-none z-10">
            <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#090A0E]/90 px-3 py-1.5 shadow-md backdrop-blur-md">
              {clockIcon}
              <span className="text-[11px] font-bold tracking-wide text-[#F4EBD9]">
                {isEnded ? "Draw Closed" : timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Content */}
        <div className="flex-grow p-6 flex flex-col justify-between">
          <div>
            {/* Title & Price Row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-black text-lg md:text-xl text-[#F4EBD9] group-hover:text-[#D4AF37] transition-colors duration-200">
                  {title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {badgeText && (
                    <div className={cn("inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-badge text-[9px] font-bold uppercase tracking-wider", getBadgeStyle(badgeText))}>
                      {badgeText.toUpperCase() === "ALMOST GONE" && fireIcon}
                      <span>{badgeText}</span>
                    </div>
                  )}
                  {isAutoDraw && (
                    <div className="inline-flex items-center gap-1 border border-[#D4AF37]/35 bg-[#181C28] px-2.5 py-0.5 rounded-badge text-[9px] font-bold text-[#D4AF37] tracking-wider uppercase">
                      ⚡ AUTO DRAW
                    </div>
                  )}
                  {isEnded && (
                    <div className="inline-flex items-center gap-1 border border-red-500/40 bg-red-950/60 px-2.5 py-0.5 rounded-badge text-[9px] font-bold text-red-300 tracking-wider uppercase">
                      CLOSED
                    </div>
                  )}
                </div>
                {worthPrice > 0 && (
                  <p className="font-heading font-bold text-xs text-[#D4AF37] mt-2">
                    Worth {formatCurrency(worthPrice, 0)}
                  </p>
                )}
              </div>
              <div className="shrink-0 rounded-xl border border-[rgba(212,175,55,0.35)] bg-[#181C28] px-4 py-2 text-sm font-black font-heading text-[#D4AF37] shadow-sm">
                {formatCurrency(ticketPrice)}
              </div>
            </div>
          </div>

          {/* Middle: Progress Bar & Countdown Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 pt-4 border-t border-[rgba(212,175,55,0.12)]">
            {/* Progress block */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] text-[#A69B82] mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  {ticketIcon}
                  <span>{soldTickets} / {totalTickets} sold</span>
                </span>
                <span className="text-[#D4AF37] font-bold">{soldPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#090A0E] border border-[rgba(212,175,55,0.15)]">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5E5C0] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>

            {/* Countdown / End block */}
            <div className="flex w-full items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28]/80 px-3.5 py-2">
              {clockIcon}
              <div className="flex gap-1 text-[11px]">
                <span className="text-[#A69B82]">{isEnded ? "Closed on" : "Closes on"}</span>
                <span className="font-semibold text-[#F4EBD9]">{formattedEndDate}</span>
              </div>
            </div>
          </div>

          {/* Bottom: CTA */}
          <div>
            {isEnded ? (
              <Link
                href={`/live-raffles/${slug || id}`}
                className="block w-full rounded-xl px-4 py-3 text-center font-heading text-xs font-bold tracking-wider uppercase bg-[#181C28] border border-[rgba(212,175,55,0.2)] text-[#6E6655] hover:text-[#A69B82] transition-all duration-200"
              >
                Draw Closed
              </Link>
            ) : (
              <Link
                href={`/live-raffles/${slug || id}`}
                className="btn-gold-metallic block w-full rounded-xl px-4 py-3 text-center font-heading text-xs font-black tracking-wider uppercase transition-all duration-200 hover:scale-[1.01] shadow-md"
              >
                Enter Draw →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GRID VIEW LAYOUT (DEFAULT)
  // -------------------------------------------------------------
  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_20px_40px_rgba(212,175,55,0.18)]">
      {/* Card Image Block */}
      <div className="relative w-full h-[210px] bg-[#090A0E] shrink-0 overflow-hidden">
        <Image
          src={imgError ? fallbackImg : image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover text-transparent transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
          unoptimized
          onError={() => setImgError(true)}
        />

        {/* Floating Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none z-10">
          {hostName ? (
            <div className="max-w-[160px] truncate rounded-full border border-[rgba(212,175,55,0.3)] bg-[#090A0E]/85 px-3 py-1 text-[10px] font-semibold text-[#F4EBD9] shadow-md backdrop-blur-md">
              By {hostName}
            </div>
          ) : <div />}

          <div className="rounded-full border border-[rgba(212,175,55,0.4)] bg-[#12151F]/90 px-3 py-1 text-[10px] font-bold text-[#D4AF37] shadow-sm backdrop-blur-md uppercase tracking-wider">
            {categoryLabel}
          </div>
        </div>

        {/* Floating Clock at Bottom of Image */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-center pointer-events-none z-10">
          <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#090A0E]/90 px-3 py-1.5 shadow-md backdrop-blur-md">
            {clockIcon}
            <span className="text-[11px] font-bold tracking-wide text-[#F4EBD9]">
              {isEnded ? "Draw Closed" : timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Header Row: Title & Price Tag */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-heading font-black text-lg text-[#F4EBD9] group-hover:text-[#D4AF37] transition-colors duration-200 line-clamp-1">
              {title}
            </h3>
            <div className="shrink-0 rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#181C28] px-3 py-1 text-xs font-black font-heading text-[#D4AF37]">
              {formatCurrency(ticketPrice)}
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {badgeText && (
              <div className={cn("inline-flex items-center gap-1 border px-2 py-0.5 rounded-badge text-[9px] font-bold uppercase tracking-wider", getBadgeStyle(badgeText))}>
                {badgeText.toUpperCase() === "ALMOST GONE" && fireIcon}
                <span>{badgeText}</span>
              </div>
            )}
            {isAutoDraw && (
              <div className="inline-flex items-center gap-1 border border-[#D4AF37]/35 bg-[#181C28] px-2 py-0.5 rounded-badge text-[9px] font-bold text-[#D4AF37] tracking-wider uppercase">
                ⚡ AUTO
              </div>
            )}
            {isEnded && (
              <div className="inline-flex items-center gap-1 border border-red-500/40 bg-red-950/60 px-2 py-0.5 rounded-badge text-[9px] font-bold text-red-300 tracking-wider uppercase">
                CLOSED
              </div>
            )}
          </div>

          {/* Worth Subheading */}
          {worthPrice > 0 && (
            <p className="mb-3 font-heading text-xs font-bold text-[#D4AF37]">
              Worth {formatCurrency(worthPrice, 0)}
            </p>
          )}

          {/* Ticket Sold Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[10px] text-[#A69B82] mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                {ticketIcon}
                <span>{soldTickets} / {totalTickets} sold</span>
              </span>
              <span className="text-[#D4AF37] font-bold">{soldPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#090A0E] border border-[rgba(212,175,55,0.15)]">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5E5C0] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>

          {/* Closes in Countdown Block */}
          <div className="mb-4 flex items-center gap-1.5 rounded-xl border border-[rgba(212,175,55,0.18)] bg-[#181C28]/70 px-3 py-2 text-xs">
            {clockIcon}
            <span className="text-[#A69B82] text-[11px]">{isEnded ? "Closed:" : "Closes:"}</span>
            <span className="font-semibold text-[#F4EBD9] text-[11px] truncate">{formattedEndDate}</span>
          </div>
        </div>

        {/* Enter Draw CTA Button */}
        <div>
          {isEnded ? (
            <Link
              href={`/live-raffles/${slug || id}`}
              className="block w-full rounded-xl px-4 py-3 text-center font-heading text-xs font-bold tracking-wider uppercase bg-[#181C28] border border-[rgba(212,175,55,0.2)] text-[#6E6655] hover:text-[#A69B82] transition-all duration-200"
            >
              Draw Closed
            </Link>
          ) : (
            <Link
              href={`/live-raffles/${slug || id}`}
              className="btn-gold-metallic block w-full rounded-xl px-4 py-3 text-center font-heading text-xs font-black tracking-wider uppercase transition-all duration-200 hover:scale-[1.01] shadow-md"
            >
              Enter Draw →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
