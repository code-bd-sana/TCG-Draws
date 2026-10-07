import React from "react";
import Image from "next/image";
import { Winner } from "../../../types/winner.types";

interface WinnerCardProps {
  winner: Winner;
}

/**
 * TCG Draws Luxury Pokémon Winner Card.
 * Obsidian surface, metallic gold borders, verified delivered badge, and slab photo.
 */
export default function WinnerCard({ winner }: WinnerCardProps) {
  const { name, location, avatar, competitionImage, initials, prizeTitle, drawDate, ticketNumber } = winner;
  const displayImage = competitionImage || avatar;

  return (
    <div className="group relative min-h-[190px] w-full rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_18px_35px_rgba(212,175,55,0.18)]">
      {/* Top Header Block: Initials & User Details */}
      <div className="flex items-center gap-3 pr-24">
        {/* Initials Placeholder Circle */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#181C28] font-heading text-sm font-black text-[#D4AF37] select-none shadow-sm">
          {initials}
        </div>

        {/* Name & Location Details */}
        <div className="flex flex-col min-w-0">
          <span className="font-heading font-bold text-sm text-[#F4EBD9] truncate group-hover:text-[#D4AF37] transition-colors">
            {name}
          </span>
          {location && location !== "Unknown Location" && location !== "Unknown" && (
            <span className="font-sans text-xs text-[#A69B82] truncate mt-0.5">
              {location}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="my-4 h-px w-full bg-[rgba(212,175,55,0.12)]" />

      {/* Body Section: Prize Name & Draw Date */}
      <div className="flex flex-col justify-between pr-24">
        <div>
          <h3 className="font-heading font-black text-sm text-[#F4EBD9] line-clamp-1 leading-snug">
            {prizeTitle}
          </h3>
          <p className="font-sans text-[11px] text-[#A69B82] mt-1 leading-normal">
            {drawDate}
          </p>
        </div>
      </div>

      {/* Bottom Row: Delivered status pill & ticket ref */}
      <div className="flex items-center justify-between mt-4 pr-24 sm:pr-0">
        {/* Verification Status Badge */}
        <div className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3 py-1">
          <span className="text-[10px] font-bold leading-none text-emerald-400">
            ✓
          </span>
          <span className="text-[10px] font-bold leading-none tracking-wider text-emerald-400 uppercase">
            Delivered
          </span>
        </div>

        {/* Masked Ticket Reference Number */}
        <span className="font-sans text-[10px] text-[#6E6655] tracking-wider font-semibold mr-1">
          {ticketNumber}
        </span>
      </div>

      {/* Competition/Prize photo (Absolute positioning on the top-right corner) */}
      {displayImage && (
        <div className="absolute right-5 top-5 w-20 h-20 rounded-xl border border-[rgba(212,175,55,0.25)] overflow-hidden bg-[#090A0E] shrink-0 shadow-md select-none">
          <Image
            src={displayImage}
            alt={`${prizeTitle} prize image`}
            fill
            sizes="80px"
            className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
