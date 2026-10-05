"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePublicLiveStats } from "../../../hooks/useRaffleHooks";

interface LiveRafflesHeroProps {
  liveCount?: number;
  closingTodayCount?: number;
  totalPrizesValue?: string;
}

/** Campaign-style header for the active competition catalogue. */
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
    <section className="relative isolate overflow-hidden border-b border-[#174f36] bg-[#073826] pt-24 sm:pt-28">
      <Image
        src="/hero-banner.jpg"
        alt="Golf course at golden hour"
        fill
        priority
        className="-z-20 object-cover object-[72%_center] opacity-100 lg:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#032b1d]/95 via-[#06452f]/72 to-[#073826]/12" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8faf6]/85 via-[#f8faf6]/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#021e14]/76 to-transparent" />

      <div className="container-custom py-11 sm:py-14">
        <nav className="mb-7" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-white/65">
            <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
            <li className="text-[#ef4444]" aria-hidden="true">/</li>
            <li className="text-white">Live Competitions</li>
          </ol>
        </nav>

        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#61a66e]/45 bg-[#0b4d35]/92 px-4 py-2 font-sans text-[10px] font-black tracking-[.16em] text-white uppercase shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626] shadow-[0_0_8px_#dc2626]" />
              Premium golf draws — live now
            </span>
            <h1 className="font-heading text-4xl font-black leading-[.92] tracking-[-.055em] text-white uppercase [text-shadow:0_5px_18px_rgba(0,0,0,.3)] sm:text-5xl md:text-6xl">
              Find your next<br />winning shot
            </h1>
          </div>

          <div className="grid w-full grid-cols-3 overflow-hidden rounded-2xl border border-white/30 bg-[#063d29]/88 shadow-2xl backdrop-blur-md lg:w-auto lg:min-w-[460px]">
            {[
              ["●", isLoading && !stats ? "..." : `${displayLiveCount}`, "Live draws"],
              ["◷", isLoading && !stats ? "..." : `${displayClosingTodayCount}`, "Closing today"],
              ["★", isLoading && !stats ? "..." : displayTotalPrizesValue, "In prizes"],
            ].map(([icon, value, label], index) => (
              <div key={label} className={`px-3 py-4 text-center sm:px-5 ${index < 2 ? "border-r border-white/20" : ""}`}>
                <div className="mb-1 text-xs text-[#f04b45]">{icon}</div>
                <div className="font-heading text-lg font-black tracking-tight text-white sm:text-2xl">{value}</div>
                <div className="mt-0.5 font-sans text-[8px] font-bold tracking-wider text-white/70 uppercase sm:text-[10px]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
