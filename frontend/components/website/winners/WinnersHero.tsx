"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { raffleService } from "../../../services/raffle.service";

/** Renders live winner statistics in the public campaign visual system. */
export default function WinnersHero() {
  const [stats, setStats] = useState({ prizesAwarded: "£0", totalWinners: 0, verifiedDraws: "0" });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await raffleService.getPublicWinnerStats();
        if (data) setStats(data);
      } catch (error) {
        console.error("Failed to load winner stats", error);
      }
    }
    loadStats();
  }, []);

  const metrics = [
    ["🏆", stats.prizesAwarded, "Prizes awarded"],
    ["★", `${stats.totalWinners.toLocaleString()}`, "Happy winners"],
    ["✓", stats.verifiedDraws, "Verified draws"],
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-[#174f36] bg-[#073826] pt-28 pb-12 sm:pt-32 md:pb-14">
      <Image src="/hero-banner.jpg" alt="Golf course and Fairway Draws bag" fill priority className="-z-20 object-cover object-[68%_center] opacity-90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#032b1d]/95 via-[#06452f]/72 to-[#073826]/18" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8faf6]/82 to-transparent" />
      <div className="container-custom relative flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#073826]/85 px-4 py-2 font-sans text-[10px] font-black tracking-[.16em] text-white uppercase shadow-lg backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" /> Hall of fame
        </span>
        <h1 className="mt-5 font-heading text-4xl font-black leading-[.9] tracking-[-.055em] text-white uppercase [text-shadow:0_5px_18px_rgba(0,0,0,.3)] sm:text-5xl md:text-6xl">Celebrating every<br />winning moment</h1>
        <p className="mt-5 max-w-2xl rounded-2xl border border-white/15 bg-[#042d1e]/58 p-3.5 font-sans text-sm font-medium leading-relaxed text-white/85 shadow-xl backdrop-blur-sm sm:text-base">Real golfers, exceptional prizes, and independently verifiable draws. Meet the Fairway Draws winners&apos; circle.</p>
        <div className="mt-8 grid w-full max-w-4xl grid-cols-3 divide-x divide-white/20 overflow-hidden rounded-2xl border border-white/20 bg-[#063d29]/88 shadow-2xl backdrop-blur-md">
          {metrics.map(([icon, value, label]) => <div key={label} className="px-2 py-4 text-center sm:px-5"><div className="mb-1 text-base text-[#ef4444]">{icon}</div><div className="font-heading text-lg font-black tracking-tight text-white sm:text-2xl">{value}</div><div className="mt-0.5 font-sans text-[8px] font-bold tracking-wider text-white/70 uppercase sm:text-[10px]">{label}</div></div>)}
        </div>
      </div>
    </section>
  );
}
