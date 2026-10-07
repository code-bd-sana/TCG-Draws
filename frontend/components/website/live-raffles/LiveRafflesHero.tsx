"use client";

import React from "react";
import Link from "next/link";
import { usePublicLiveStats } from "../../../hooks/useRaffleHooks";

interface LiveRafflesHeroProps {
  liveCount?: number;
  closingTodayCount?: number;
  totalPrizesValue?: string;
}

/**
 * TCG Draws Luxury Pokémon Live Raffles Hero Header.
 * Features Obsidian black background, golden geometric grids, ambient glow,
 * gold stats cards and breadcrumb navigation.
 */
export default function LiveRafflesHero({
  liveCount,
  closingTodayCount,
  totalPrizesValue,
}: LiveRafflesHeroProps) {
  const { data: stats, isLoading } = usePublicLiveStats();

  const displayLiveCount = liveCount ?? stats?.liveCount ?? 0;
  const displayClosingTodayCount = closingTodayCount ?? stats?.closingTodayCount ?? 0;
  const displayTotalPrizesValue = totalPrizesValue ?? stats?.totalPrizesValue ?? "£0";

  return (
    <section className="relative isolate overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] pt-28 sm:pt-32">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />

        {/* Radial Gold Aura Glows */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090A0E] to-transparent" />
      </div>

      <div className="container-custom py-10 sm:py-14 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-[#A69B82]">
            <li>
              <Link href="/" className="transition-colors hover:text-[#D4AF37]">
                Home
              </Link>
            </li>
            <li className="text-[#D4AF37]/50" aria-hidden="true">
              /
            </li>
            <li className="text-[#F4EBD9]">Live Competitions</li>
          </ol>
        </nav>

        {/* Header Content & Live Stats Box */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            {/* Pill Badge */}
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.18em] text-[#F4EBD9] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                POKÉMON TCG DRAWS — LIVE NOW
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-[-0.04em] text-[#F4EBD9] uppercase">
              EXPLORE ACTIVE{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
                CARD GRAILS &amp; SLABS
              </span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-3.5 max-w-xl leading-relaxed">
              Transparent live draws for PSA 10 slabs, vintage booster packs, and modern sealed boxes. Every draw is provably fair and streamed live.
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid w-full grid-cols-3 overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F]/80 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-md lg:w-auto lg:min-w-[460px]">
            {[
              ["●", isLoading && !stats ? "..." : `${displayLiveCount}`, "Live Draws"],
              ["◷", isLoading && !stats ? "..." : `${displayClosingTodayCount}`, "Closing Today"],
              ["★", isLoading && !stats ? "..." : displayTotalPrizesValue, "In Prize Value"],
            ].map(([icon, value, label], index) => (
              <div
                key={label}
                className={`px-3 py-4 sm:py-5 text-center sm:px-5 transition-colors hover:bg-[rgba(212,175,55,0.04)] ${
                  index < 2 ? "border-r border-[rgba(212,175,55,0.15)]" : ""
                }`}
              >
                <div className="mb-1 text-xs text-[#D4AF37]">{icon}</div>
                <div className="font-heading text-lg sm:text-2xl font-black tracking-tight text-[#F4EBD9]">
                  {value}
                </div>
                <div className="mt-0.5 font-sans text-[8px] sm:text-[10px] font-bold tracking-wider text-[#A69B82] uppercase">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
