import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Draw } from "../../../types/draw.types";
import { formatCurrency } from "../../../lib/utils";
import PrimaryButton from "./PrimaryButton";

interface DrawCardProps {
  draw: Draw;
  variant?: "grid" | "featured" | "instant";
}

function checkIsEndPassed(rawEnd?: string, endDate?: string): boolean {
  if (rawEnd) {
    if (rawEnd === "Draw Closed" || rawEnd === "Ended") {
      return true;
    }
    const parsedTime = new Date(rawEnd).getTime();
    if (!isNaN(parsedTime)) {
      return parsedTime <= Date.now();
    }
  }

  if (endDate) {
    if (endDate === "Draw Closed" || endDate === "Ended") {
      return true;
    }
    if (endDate.includes("T") || endDate.includes(":")) {
      const parsedTime = new Date(endDate).getTime();
      if (!isNaN(parsedTime)) {
        return parsedTime <= Date.now();
      }
    } else {
      // Date-only string like "25 Sep 2026": do not expire until end of day (23:59:59.999)
      const parsedDate = new Date(endDate);
      if (!isNaN(parsedDate.getTime())) {
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay.getTime() <= Date.now();
      }
    }
  }

  return false;
}

/**
 * Reusable Card component for Competitions, Live Draws, and Instant Wins.
 */
export default function DrawCard({ draw, variant = "grid" }: DrawCardProps) {
  const {
    title,
    description,
    image,
    ticketPrice,
    totalTickets,
    soldTickets,
    endDate,
    worthPrice: rawWorthPrice,
    instantWinsCount,
    isInstantWin,
  } = draw;

  const statusLower = (draw.status || "").toLowerCase();
  const rawEnd = draw.rawEndDate || (draw as any).rawEndDate;
  const isEndPassed = checkIsEndPassed(rawEnd, endDate);

  const isSoldOut = totalTickets > 0 && soldTickets >= totalTickets;
  const isEnded =
    statusLower === "ended" ||
    statusLower === "completed" ||
    statusLower === "cancelled" ||
    statusLower === "sold_out" ||
    isSoldOut ||
    isEndPassed;

  const declaredValue =
    (draw as any).mainPrizeValue !== undefined &&
    (draw as any).mainPrizeValue !== null &&
    (draw as any).mainPrizeValue !== ""
      ? Number((draw as any).mainPrizeValue)
      : (rawWorthPrice ? Number(rawWorthPrice) : undefined);

  const worthPrice = declaredValue && declaredValue > 0 ? declaredValue : undefined;

  const soldPercent = totalTickets > 0 ? Math.min(Math.round((soldTickets / totalTickets) * 100), 100) : 0;

  // Render a clock SVG icon
  const clockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4 text-text-secondary"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  // Render a check/arrow SVG icon
  const arrowIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );

  if (variant === "featured") {
    return (
      <div className="flex flex-col bg-surface border border-border rounded-card overflow-hidden shadow-card transition-all duration-300 hover:border-border-medium hover:shadow-glow w-full max-w-[750px]">
        {/* Card Image */}
        <div className="relative w-full h-[280px] md:h-[340px] bg-bg">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 750px"
            className="object-cover opacity-80"
            unoptimized
          />
          {worthPrice && (
            <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur-sm border border-border-medium px-3.5 py-1.5 rounded-badge text-[11px] font-semibold text-text-brand tracking-wide">
              WORTH {formatCurrency(worthPrice, 0)}
            </div>
          )}
          {isEnded && (
            <div className="absolute top-4 right-4 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-3 py-1 rounded-badge text-[11px] font-bold tracking-wider uppercase shadow-xs">
              Draw Closed
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-6 md:p-8 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
              {title}
            </h3>
            {worthPrice && (
              <span className="text-sm font-semibold text-text-secondary whitespace-nowrap hidden sm:inline">
                Worth {formatCurrency(worthPrice, 0)}
              </span>
            )}
          </div>

          {description && (
            <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed mb-6">
              {description}
            </p>
          )}

          {/* Ticket Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs text-text-muted mb-2 font-medium">
              <span>{soldTickets} / {totalTickets} tickets sold</span>
              <span className="text-text-brand font-semibold">{soldPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-bg rounded-badge overflow-hidden border border-divider">
              <div
                className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>

          {/* Pricing & CTA Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-divider mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                Ticket Price
              </span>
              <span className="text-2xl font-bold font-heading text-text-brand">
                {formatCurrency(ticketPrice)}
              </span>
            </div>
            {isEnded ? (
              <Link
                href={`/live-raffles/${draw.slug || draw.id}`}
                className="px-8 py-3.5 text-sm font-sans font-bold uppercase rounded-button bg-elevated border border-border text-text-muted hover:text-text-primary text-center transition-all"
              >
                Draw Closed
              </Link>
            ) : (
              <PrimaryButton
                href={`/live-raffles/${draw.slug || draw.id}`}
                icon={arrowIcon}
                className="px-8 py-3.5 text-sm"
              >
                Enter Now
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Instant wins variant
  if (variant === "instant" || isInstantWin) {
    return (
      <div className="flex flex-col bg-surface border border-border rounded-card overflow-hidden shadow-card transition-all duration-300 hover:border-border-medium hover:shadow-glow">
        {/* Card Image */}
        <div className="relative w-full h-[180px] bg-bg">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover opacity-75"
            unoptimized
          />
          {isEnded && (
            <div className="absolute top-3 right-3 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-2.5 py-0.5 rounded-badge text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Draw Closed
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-heading font-bold text-lg text-text-primary mb-2 line-clamp-1">
            {title}
          </h3>

          <div className="text-xl font-bold text-text-brand font-heading mb-4">
            Worth {formatCurrency(worthPrice || 0, 0)}
          </div>

          {/* Ticket Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-1 bg-bg rounded-badge overflow-hidden border border-divider">
              <div
                className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-muted mt-2">
              <span>{soldTickets} / {totalTickets} tickets</span>
              <span>{soldPercent}% sold</span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-5 bg-bg/50 px-2.5 py-1.5 rounded-button border border-divider w-fit">
            {clockIcon}
            <span>{isEnded ? "Draw Closed" : endDate}</span>
          </div>

          {/* Pricing & CTA Row */}
          <div className="flex items-center justify-between pt-4 border-t border-divider mt-auto gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">
                Entry from
              </span>
              <span className="text-base font-bold text-text-brand">
                {formatCurrency(ticketPrice)}
              </span>
            </div>
            
            {isEnded ? (
              <Link
                href={`/live-raffles/${draw.slug || draw.id}`}
                className="px-4 py-2 text-xs font-sans font-bold uppercase rounded-button bg-elevated border border-border text-text-muted hover:text-text-primary text-center transition-all"
              >
                Draw Closed
              </Link>
            ) : (
              <PrimaryButton
                href={`/live-raffles/${draw.slug || draw.id}`}
                className="px-4 py-2 text-xs"
                icon={arrowIcon}
              >
                Enter Draw
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid draw card
  return (
    <div className="flex flex-col bg-surface border border-border rounded-card overflow-hidden shadow-card transition-all duration-300 hover:border-border-medium hover:shadow-glow">
      {/* Card Image */}
      <div className="relative w-full h-[180px] bg-bg">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover opacity-75"
          unoptimized
        />
        {worthPrice && (
          <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur-sm border border-border px-2.5 py-1 rounded-badge text-[10px] font-semibold text-text-brand tracking-wide">
            WORTH {formatCurrency(worthPrice, 0)}
          </div>
        )}
        {isEnded && (
          <div className="absolute top-4 right-4 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-2.5 py-1 rounded-badge text-[10px] font-bold tracking-wider uppercase shadow-xs">
            Draw Closed
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-lg text-text-primary mb-2 line-clamp-1">
          {title}
        </h3>
        
        {description && (
          <p className="font-sans text-[11px] text-text-muted leading-relaxed mb-4 line-clamp-2 h-8">
            {description}
          </p>
        )}

        {/* Ticket Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-1 bg-bg rounded-badge overflow-hidden border border-divider">
            <div
              className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-text-muted mt-2">
            <span>{soldTickets} / {totalTickets} tickets</span>
            <span>{soldPercent}% sold</span>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-5 bg-bg/50 px-2.5 py-1.5 rounded-button border border-divider w-fit">
          {clockIcon}
          <span>{isEnded ? "Draw Closed" : endDate}</span>
        </div>

        {/* Pricing & CTA Row */}
        <div className="flex items-center justify-between pt-4 border-t border-divider mt-auto gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">
              Ticket
            </span>
            <span className="text-base font-bold text-text-brand">
              {formatCurrency(ticketPrice)}
            </span>
          </div>
          
          {isEnded ? (
            <Link
              href={`/live-raffles/${draw.slug || draw.id}`}
              className="px-4 py-2 text-xs font-sans font-bold uppercase rounded-button bg-elevated border border-border text-text-muted hover:text-text-primary text-center transition-all"
            >
              Draw Closed
            </Link>
          ) : (
            <PrimaryButton
              href={`/live-raffles/${draw.slug || draw.id}`}
              className="px-4 py-2 text-xs"
              icon={arrowIcon}
            >
              Enter Draw
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
