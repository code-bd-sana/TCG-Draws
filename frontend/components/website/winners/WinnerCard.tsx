import React from "react";
import Image from "next/image";
import { Winner } from "../../../types/winner.types";

interface WinnerCardProps {
  winner: Winner;
}

/**
 * Renders a completed raffle winner record card with ticket and avatar details.
 */
export default function WinnerCard({ winner }: WinnerCardProps) {
  const { name, location, avatar, competitionImage, initials, prizeTitle, drawDate, ticketNumber } = winner;
  const displayImage = competitionImage || avatar;

  return (
    <div className="relative min-h-[185px] w-full rounded-[18px] border border-[#bdd3ba] bg-[#f0f6ed] p-5 shadow-[0_10px_25px_rgba(11,77,53,.09)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0b4d35]/40 hover:shadow-[0_18px_32px_rgba(11,77,53,.16)]">
      
      {/* Top Header Block: Initials & User Details */}
      <div className="flex items-center gap-3 pr-24">
        {/* Initials Placeholder Circle */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0b4d35]/20 bg-[#e0eddd] font-sans text-sm font-bold text-[#0b4d35] select-none">
          {initials}
        </div>

        {/* Name & Location Details */}
        <div className="flex flex-col min-w-0">
          <span className="font-sans font-medium text-sm text-text-primary truncate">
            {name}
          </span>
          {location && location !== "Unknown Location" && location !== "Unknown" && (
            <span className="font-sans text-xs text-text-secondary truncate mt-0.5">
              {location}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="my-4 h-px w-full bg-[#d6e4d3]" />

      {/* Body Section: Prize Name & Draw Date */}
      <div className="flex flex-col justify-between pr-24">
        <div>
          <h3 className="font-heading font-normal text-sm text-text-primary line-clamp-1 leading-snug">
            {prizeTitle}
          </h3>
          <p className="font-sans text-[11px] text-text-muted mt-1 leading-normal">
            {drawDate}
          </p>
        </div>
      </div>

      {/* Bottom Row: Delivered status pill & ticket ref */}
      <div className="flex items-center justify-between mt-4 pr-24 sm:pr-0">
        {/* Verification Status Badge */}
        <div className="flex w-fit items-center gap-1.5 rounded-full border border-[#16a34a]/30 bg-[#dcfce7] px-3 py-1">
          <span className="text-[10px] font-semibold leading-none text-[#15803d]">
            ✓
          </span>
          <span className="text-[10px] font-semibold leading-none tracking-wider text-[#15803d] uppercase">
            Delivered
          </span>
        </div>

        {/* Masked Ticket Reference Number (For transparency) */}
        <span className="font-sans text-[9px] text-text-muted/50 tracking-wider font-semibold mr-1">
          {ticketNumber}
        </span>
      </div>

      {/* Competition/Prize photo (Absolute positioning on the top-right corner) */}
      {displayImage && (
        <div className="absolute right-5 top-5 w-20 h-20 rounded-[10px] border border-border overflow-hidden bg-surface shrink-0 shadow-sm select-none">
          <Image
            src={displayImage}
            alt={`${prizeTitle} prize image`}
            fill
            sizes="80px"
            className="object-cover opacity-85 hover:opacity-100 transition-opacity duration-200"
            unoptimized
          />
        </div>
      )}

    </div>
  );
}
