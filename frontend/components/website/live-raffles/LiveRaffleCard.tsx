"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Draw } from "../../../types/draw.types";
import { formatCurrency } from "../../../lib/utils";
import { cn } from "../../../lib/utils";
import { formatUkDateTime, formatUkDate } from "../../../lib/uk-time";

interface LiveRaffleCardProps {
  raffle: Draw;
  viewMode?: "grid" | "list";
}

/**
 * Dedicated Card component for the Live Raffles page and Related Raffles section.
 * Handles both API raffle payloads and local mock draw data seamlessly.
 */
export default function LiveRaffleCard({ raffle, viewMode = "grid" }: LiveRaffleCardProps) {
  const r = raffle as any;

  const id = r.id;
  const title = r.title || "Untitled Competition";
  const slug = r.slug || id;
  const isAutoDraw = r.isAutoDraw;
  const host = r.host;

  const fallbackImg = "https://placehold.co/800x600/1a230a/8cb34a?text=No+Image";
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
  const badgeText = r.badgeText || (soldPercent >= 90 ? "ALMOST GONE" : "HOT");

  const rawCategory = r.category;
  const category = typeof rawCategory === 'object' && rawCategory !== null
    ? (rawCategory.slug || rawCategory.name || 'drivers')
    : (typeof rawCategory === 'string' ? rawCategory : 'drivers');

  const hostName = host?.businessName || (host?.user?.firstName ? `${host.user.firstName} ${host.user.lastName || ''}`.trim() : "");
  const hostLocation = host?.user?.location || host?.address || "";

  const rawEndDate = r.endDate;
  const isValidDate = rawEndDate && !isNaN(new Date(rawEndDate).getTime());
  const formattedEndDate = isValidDate
    ? formatUkDateTime(rawEndDate)
    : (typeof rawEndDate === "string" ? rawEndDate : "Closing Soon");

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

  // SVG Icons matching Figma design
  const fireIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5 text-[#ef9f27]"
    >
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-3.66-2.61-6.72-6.07-7.39.37.76.57 1.62.57 2.53 0 1.95-1.07 3.65-2.67 4.54l-.06.03c.53-2.14-.17-4.47-1.78-6.1l-.32-.33c-.09.33-.14.67-.14 1.02 0 2.27 1.34 4.22 3.28 5.11l.08.04c-1.61-.31-3.23.36-4.13 1.73A7.514 7.514 0 0 0 7 17.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-1.65-.54-3.18-1.57-4.52z" />
    </svg>
  );

  const ticketIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-3.5 h-3.5 text-[#72943a]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h12c.621 0 1.125.504 1.125 1.125v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0-1.125 1.125H7.5a1.125 1.125 0 0 1-1.125-1.125v-1.757a1.5 1.5 0 0 0 0-2.236V11.23a1.5 1.5 0 0 0 0-2.236V7.125A1.125 1.125 0 0 1 7.5 6Z"
      />
    </svg>
  );

  const clockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-3.5 h-3.5 text-text-muted"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  // Status badge styling helper
  const getBadgeStyle = (text: string) => {
    switch (text.toUpperCase()) {
      case "ALMOST GONE":
        return "bg-[#4a2e00] border-[#ef9f27]/30 text-[#ef9f27]";
      case "HOT":
        return "bg-red-950 border-red-800 text-red-400";
      case "NEW":
        return "bg-[#1a230a] border-[#8cb34a]/30 text-[#8cb34a]";
      case "EXCLUSIVE":
        return "bg-purple-950 border-purple-800 text-purple-400";
      default:
        return "bg-[#161810] border-border text-text-muted";
    }
  };

  const categoryLabels: Record<string, string> = {
    drivers: "Drivers",
    "golf drivers": "Golf Drivers",
    irons: "Iron Sets",
    "iron sets": "Iron Sets",
    "golf irons": "Golf Irons",
    putters: "Putters",
    putter: "Putter",
    "golf putters": "Golf Putters",
    experiences: "Experiences",
    apparel: "Apparel & Bags",
    "golf bags & apparel": "Golf Bags & Apparel",
    tech: "Rangefinders & Tech",
    "rangefinders & tech": "Rangefinders & Tech",
    accessories: "Accessories",
    cash: "Cash Prizes",
    bundles: "Bundles",
    luxury: "Luxury",
    "pga-lessons": "PGA Lessons",
    "pga lessons": "PGA Lessons",
  };

  const categoryLabel =
    typeof category === "string"
      ? (categoryLabels[category.toLowerCase()] || categoryLabels[category] || category)
      : "Competition";

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

  if (viewMode === "list") {
    return (
      <div className="group flex w-full flex-col overflow-hidden rounded-[20px] border border-[#c5d9c1] bg-[#f0f6ed] shadow-[0_10px_28px_rgba(11,77,53,.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0b4d35]/35 hover:shadow-[0_18px_34px_rgba(11,77,53,.16)] sm:flex-row">
        {/* Left Side: Image Block */}
        <div className="relative w-full sm:w-[240px] md:w-[280px] h-[180px] sm:h-auto bg-bg shrink-0">
          <Image
            src={imgError ? fallbackImg : image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 280px"
            className="object-cover text-transparent transition-transform duration-500 group-hover:scale-[1.03]"
            unoptimized
            onError={() => setImgError(true)}
          />

          {/* Badges on Top of Image */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none">
            {hostName ? (
              <div className="max-w-[160px] truncate rounded-full border border-white/65 bg-[#073826]/88 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur-sm">
                By {hostName}
              </div>
            ) : <div />}

            <div className="rounded-full border border-white/65 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#0b4d35] shadow-sm backdrop-blur-sm">
              {categoryLabel}
            </div>
          </div>
          
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-[#073826]/88 px-3 py-1.5 shadow-md backdrop-blur-sm">
              {clockIcon}
              <span className="text-[11px] font-bold tracking-wide text-white">{isEnded ? "Draw Closed" : timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Content */}
        <div className="flex-grow p-5 md:p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            {/* Title & Price Row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg md:text-xl text-text-primary group-hover:text-text-brand transition-colors duration-200">
                  {title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {badgeText && (
                    <div className={cn("inline-flex items-center gap-1 border px-2 py-0.5 rounded-badge text-[9px] font-semibold tracking-wider", getBadgeStyle(badgeText))}>
                      {badgeText.toUpperCase() === "ALMOST GONE" && fireIcon}
                      <span>{badgeText}</span>
                    </div>
                  )}
                  {isAutoDraw && (
                    <div className="inline-flex items-center gap-1 border border-[#8cb34a]/30 bg-[#1a230a] px-2 py-0.5 rounded-badge text-[9px] font-semibold text-[#8cb34a] tracking-wider">
                      AUTO DRAW
                    </div>
                  )}
                  {isEnded && (
                    <div className="inline-flex items-center gap-1 border border-[#FECACA] bg-[#FEE2E2] px-2 py-0.5 rounded-badge text-[9px] font-semibold text-[#DC2626] tracking-wider">
                      CLOSED
                    </div>
                  )}
                </div>
                {worthPrice > 0 && (
                  <p className="font-sans text-[11px] text-[#72943a] mt-1.5">
                    Worth {formatCurrency(worthPrice, 0)}
                  </p>
                )}
              </div>
              <div className="shrink-0 rounded-full border border-[#0b4d35]/15 bg-[#ecf5ee] px-3.5 py-1.5 text-xs font-black text-[#0b4d35]">
                {formatCurrency(ticketPrice)}
              </div>
            </div>
          </div>

          {/* Middle: Progress Bar & Countdown Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 pt-4 border-t border-divider/50">
            {/* Progress block */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] text-text-muted mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  {ticketIcon}
                  <span>{soldTickets} / {totalTickets} sold</span>
                </span>
                <span className="text-[#a0d056] font-semibold">{soldPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6eee3]">
                <div
                  className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>

            {/* Countdown block */}
            <div className="flex w-full items-center gap-2 rounded-lg border border-[#dce8da] bg-[#f8faf6] px-3.5 py-2">
              {clockIcon}
              <div className="flex gap-1 text-[11px]">
                <span className="text-text-muted">{isEnded ? "Closed on" : "Closes on"}</span>
                <span className="font-semibold text-text-primary">{formattedEndDate}</span>
              </div>
            </div>
          </div>

          {/* Bottom: CTA */}
          <div className="pt-2">
            {isEnded ? (
              <Link
                href={`/live-raffles/${slug || id}`}
                className="block w-full rounded-xl px-4 py-2.5 text-center font-heading text-xs font-bold tracking-wider uppercase bg-elevated border border-border text-text-muted hover:text-text-primary transition-all duration-200"
              >
                Draw Closed
              </Link>
            ) : (
              <Link
                href={`/live-raffles/${slug || id}`}
                className="btn-glossy-red block w-full rounded-xl px-4 py-2.5 text-center font-heading text-xs font-bold tracking-wider text-white uppercase transition-all duration-200 hover:scale-[1.01]"
              >
                Enter Draw →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Grid Layout Card
  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-[20px] border border-[#c5d9c1] bg-[#f0f6ed] shadow-[0_10px_28px_rgba(11,77,53,.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0b4d35]/35 hover:shadow-[0_18px_34px_rgba(11,77,53,.16)]">
      {/* Card Image Block */}
      <div className="relative w-full h-[180px] bg-bg shrink-0">
        <Image
          src={imgError ? fallbackImg : image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover text-transparent transition-transform duration-500 group-hover:scale-[1.04]"
          unoptimized
          onError={() => setImgError(true)}
        />

        {/* Floating Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none">
          {hostName ? (
            <div className="max-w-[160px] truncate rounded-full border border-white/65 bg-[#073826]/88 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur-sm">
              By {hostName}
            </div>
          ) : <div />}

          <div className="rounded-full border border-white/65 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#0b4d35] shadow-sm backdrop-blur-sm">
            {categoryLabel}
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-[#073826]/88 px-3 py-1.5 shadow-md backdrop-blur-sm">
            {clockIcon}
            <span className="text-[11px] font-bold tracking-wide text-white">{isEnded ? "Draw Closed" : timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Card Content details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Header Row: Title & Price Tag */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-heading font-medium text-lg text-text-primary line-clamp-1">
              {title}
            </h3>
            <div className="mt-0.5 shrink-0 rounded-full border border-[#0b4d35]/15 bg-[#ecf5ee] px-2.5 py-1 text-[11px] font-black text-[#0b4d35]">
              {formatCurrency(ticketPrice)}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {badgeText && (
              <div className={cn("inline-flex items-center gap-1 border px-2 py-0.5 rounded-badge text-[9px] font-semibold tracking-wider", getBadgeStyle(badgeText))}>
                {badgeText.toUpperCase() === "ALMOST GONE" && fireIcon}
                <span>{badgeText}</span>
              </div>
            )}
            {isAutoDraw && (
              <div className="inline-flex items-center gap-1 border border-[#8cb34a]/30 bg-[#1a230a] px-2 py-0.5 rounded-badge text-[9px] font-semibold text-[#8cb34a] tracking-wider">
                AUTO DRAW
              </div>
            )}
            {isEnded && (
              <div className="inline-flex items-center gap-1 border border-[#FECACA] bg-[#FEE2E2] px-2 py-0.5 rounded-badge text-[9px] font-semibold text-[#DC2626] tracking-wider">
                CLOSED
              </div>
            )}
          </div>

          {/* Worth Subheading */}
          {worthPrice > 0 && (
            <p className="mb-3 font-sans text-[11px] font-semibold text-[#5e766c]">
              Worth {formatCurrency(worthPrice, 0)}
            </p>
          )}

          {/* Ticket Sold Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[10px] text-text-muted mb-1.5 font-normal">
              <span className="flex items-center gap-1">
                {ticketIcon}
                <span>{soldTickets} / {totalTickets} sold</span>
              </span>
              <span className="text-[#8cb34a] font-medium">{soldPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6eee3]">
              <div
                className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>

          {/* Closes in Countdown Block */}
          <div className="mb-4 flex items-center gap-1.5 rounded-lg border border-[#dce8da] bg-[#f8faf6] px-3 py-2 text-xs">
            {clockIcon}
            <span className="text-[#5a752a]">{isEnded ? "Closed on" : "Closes in"}</span>
            <span className="font-semibold text-text-primary">{formattedEndDate}</span>
          </div>
        </div>

        {/* Enter Draw CTA Button */}
        {isEnded ? (
          <Link
            href={`/live-raffles/${slug || id}`}
            className="block w-full rounded-xl px-4 py-2.5 text-center font-heading text-xs font-bold tracking-wider uppercase bg-elevated border border-border text-text-muted hover:text-text-primary transition-all duration-200"
          >
            Draw Closed
          </Link>
        ) : (
          <Link
            href={`/live-raffles/${slug || id}`}
            className="btn-glossy-red block w-full rounded-xl px-4 py-2.5 text-center font-heading text-xs font-bold tracking-wider text-white uppercase transition-all duration-200 hover:scale-[1.01]"
          >
            Enter Draw →
          </Link>
        )}
      </div>
    </div>
  );
}
