"use client";

import React, { useEffect, useState } from "react";
import { raffleService } from "../../../services/raffle.service";
import { cn } from "../../../lib/utils";

/**
 * TCG Draws Luxury Pokémon Winners Hero Section.
 * Obsidian textures, gold aura accents, and live winner statistics.
 */
export default function WinnersHero() {
  const [stats, setStats] = useState({
    prizesAwarded: "£0",
    totalWinners: 0,
    mainDrawWinners: 0,
    instantWinners: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await raffleService.getPublicWinnerStats();
        if (data) {
          setStats({
            prizesAwarded: data.prizesAwarded || "£0",
            totalWinners: Number(data.totalWinners) || 0,
            mainDrawWinners: Number(data.mainDrawWinners) || 0,
            instantWinners: Number(data.instantWinners) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load winner stats", error);
      }
    }
    loadStats();
  }, []);

  const metrics = [
    { icon: "🏆", value: stats.prizesAwarded, label: "Prizes Awarded" },
    { icon: "★", value: stats.totalWinners.toLocaleString(), label: "Total Winners" },
    { icon: "🎯", value: stats.mainDrawWinners.toLocaleString(), label: "Main Draw Winners" },
    { icon: "⚡", value: stats.instantWinners.toLocaleString(), label: "Instant Winners" },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] pt-28 pb-14 sm:pt-32 md:pb-16">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090A0E] to-transparent" />
      </div>

      <div className="container-custom relative flex flex-col items-center text-center z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.18em] text-[#F4EBD9] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
            HALL OF FAME &amp; PROOF OF WINS
          </span>
        </div>

        <h1 className="mt-2 font-heading text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-[-0.04em] text-[#F4EBD9] uppercase">
          CELEBRATING EVERY{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
            WINNING POKÉMON GRAIL
          </span>
        </h1>

        <p className="mt-4 max-w-2xl rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/70 p-4 font-sans text-xs sm:text-sm leading-relaxed text-[#D6CEBC] shadow-lg backdrop-blur-md">
          Real collectors, authenticated PSA 10 slabs, vintage booster boxes, and independently verifiable live draws. Meet the TCG Draws winners&apos; circle.
        </p>

        {/* Stats metrics box - Exactly 4 boxes in a single row on desktop, responsive 2x2 grid on mobile */}
        <div className="mt-8 grid w-full max-w-4xl grid-cols-2 sm:grid-cols-4 overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F]/80 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-md">
          {metrics.map((item, idx) => (
            <div
              key={item.label}
              className={cn(
                "px-3 py-4 sm:py-5 text-center transition-colors hover:bg-[rgba(212,175,55,0.04)]",
                idx < 2 ? "border-b border-[rgba(212,175,55,0.15)] sm:border-b-0" : "",
                idx % 2 === 0 ? "border-r border-[rgba(212,175,55,0.15)] sm:border-r-0" : "",
                idx > 0 ? "sm:border-l sm:border-[rgba(212,175,55,0.15)]" : ""
              )}
            >
              <div className="mb-1 text-sm text-[#D4AF37]">{item.icon}</div>
              <div className="font-heading text-lg sm:text-2xl font-black tracking-tight text-[#F4EBD9]">
                {item.value}
              </div>
              <div className="mt-0.5 font-sans text-[8px] sm:text-[10px] font-bold tracking-wider text-[#A69B82] uppercase">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
