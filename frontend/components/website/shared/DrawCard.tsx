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
      <div className="art-deco-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.18)] hover:-translate-y-1">
        {/* Subtle corner glow flare */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

        {/* Card Image */}
        <div className="relative w-full h-[200px] bg-[#090A0E] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12151F] via-transparent to-black/30 pointer-events-none" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {worthPrice && (
              <span className="bg-[#090A0E]/85 backdrop-blur-md border border-[rgba(212,175,55,0.4)] px-3 py-1 rounded-full text-[10px] font-heading font-black text-[#D4AF37] tracking-wider uppercase shadow-md">
                VALUE {formatCurrency(worthPrice, 0)}
              </span>
            )}
            <span className="bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ⚡ INSTANT WINS
            </span>
          </div>

          {isEnded && (
            <div className="absolute inset-0 bg-[#090A0E]/80 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-1.5 rounded-full text-xs font-heading font-black tracking-widest uppercase shadow-lg">
                DRAW CONCLUDED
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1 relative z-10">
          <h3 className="font-heading font-black text-base text-[#F4EBD9] mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {title}
          </h3>

          {/* Ticket Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[11px] font-mono text-[#A69B82] mb-1.5">
              <span>{soldTickets.toLocaleString()} / {totalTickets.toLocaleString()} entries</span>
              <span className="text-[#D4AF37] font-bold">{soldPercent}% SOLD</span>
            </div>
            <div className="w-full h-1.5 bg-[#090A0E] rounded-full overflow-hidden border border-[rgba(212,175,55,0.2)]">
              <div
                className="h-full bg-gradient-to-r from-[#B39042] via-[#D4AF37] to-[#FFF0D4] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#A69B82] mb-5 bg-[#090A0E]/60 px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.15)] w-fit">
            {clockIcon}
            <span>{isEnded ? "Draw Closed" : endDate}</span>
          </div>

          {/* Pricing & CTA Row */}
          <div className="flex items-center justify-between pt-4 border-t border-[rgba(212,175,55,0.15)] mt-auto gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A69B82] uppercase tracking-wider font-mono">
                Entry from
              </span>
              <span className="text-lg font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                {formatCurrency(ticketPrice)}
              </span>
            </div>
            
            {isEnded ? (
              <Link
                href={`/live-raffles/${draw.slug || draw.id}`}
                className="btn-dark-metallic px-4 py-2 text-xs font-heading font-bold uppercase rounded-xl border border-[rgba(212,175,55,0.2)] text-[#A69B82] hover:text-[#F4EBD9] transition-all"
              >
                View Results
              </Link>
            ) : (
              <Link
                href={`/live-raffles/${draw.slug || draw.id}`}
                className="btn-gold-metallic px-5 py-2.5 text-xs rounded-xl font-heading font-black tracking-wider uppercase inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>ENTER NOW</span>
                <span className="inline-flex">{arrowIcon}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid draw card
  return (
    <div className="art-deco-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.18)] hover:-translate-y-1">
      {/* Subtle corner glow flare */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

      {/* Card Image */}
      <div className="relative w-full h-[200px] bg-[#090A0E] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151F] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {worthPrice ? (
            <span className="bg-[#090A0E]/85 backdrop-blur-md border border-[rgba(212,175,55,0.4)] px-3 py-1 rounded-full text-[10px] font-heading font-black text-[#D4AF37] tracking-wider uppercase shadow-md">
              WORTH {formatCurrency(worthPrice, 0)}
            </span>
          ) : <div />}

          <span className="bg-[#12151F]/90 backdrop-blur-md border border-[rgba(212,175,55,0.3)] text-[#F4EBD9] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE DRAW
          </span>
        </div>

        {isEnded && (
          <div className="absolute inset-0 bg-[#090A0E]/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-1.5 rounded-full text-xs font-heading font-black tracking-widest uppercase shadow-lg">
              DRAW CONCLUDED
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10">
        <h3 className="font-heading font-black text-base text-[#F4EBD9] mb-1.5 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
          {title}
        </h3>
        
        {description && (
          <p className="font-sans text-xs text-[#A69B82] leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
            {description}
          </p>
        )}

        {/* Ticket Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[11px] font-mono text-[#A69B82] mb-1.5">
            <span>{soldTickets.toLocaleString()} / {totalTickets.toLocaleString()} entries</span>
            <span className="text-[#D4AF37] font-bold">{soldPercent}% SOLD</span>
          </div>
          <div className="w-full h-1.5 bg-[#090A0E] rounded-full overflow-hidden border border-[rgba(212,175,55,0.2)]">
            <div
              className="h-full bg-gradient-to-r from-[#B39042] via-[#D4AF37] to-[#FFF0D4] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#A69B82] mb-5 bg-[#090A0E]/60 px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.15)] w-fit">
          {clockIcon}
          <span>{isEnded ? "Draw Closed" : endDate}</span>
        </div>

        {/* Pricing & CTA Row */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(212,175,55,0.15)] mt-auto gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#A69B82] uppercase tracking-wider font-mono">
              Ticket Price
            </span>
            <span className="text-lg font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
              {formatCurrency(ticketPrice)}
            </span>
          </div>
          
          {isEnded ? (
            <Link
              href={`/live-raffles/${draw.slug || draw.id}`}
              className="btn-dark-metallic px-4 py-2 text-xs font-heading font-bold uppercase rounded-xl border border-[rgba(212,175,55,0.2)] text-[#A69B82] hover:text-[#F4EBD9] transition-all"
            >
              View Results
            </Link>
          ) : (
            <Link
              href={`/live-raffles/${draw.slug || draw.id}`}
              className="btn-gold-metallic px-5 py-2.5 text-xs rounded-xl font-heading font-black tracking-wider uppercase inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>ENTER DRAW</span>
              <span className="inline-flex">{arrowIcon}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
