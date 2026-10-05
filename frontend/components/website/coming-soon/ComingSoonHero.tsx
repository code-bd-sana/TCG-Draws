"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import EarlyAccessForm from "./EarlyAccessForm";
import FairwayDrawsLogo from "../shared/FairwayDrawsLogo";

const TARGET_LAUNCH_TIMESTAMP = new Date("2026-09-05T12:00:00Z").getTime();

/**
 * Premium Fairway Draws Coming Soon Hero.
 * Two-column split: left = brand story, right = cap showcase.
 * Countdown timer below.
 */
export default function ComingSoonHero() {
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let target = TARGET_LAUNCH_TIMESTAMP;
    const stored = localStorage.getItem("fairway_launch_ts");
    if (stored) {
      target = parseInt(stored, 10);
    } else {
      localStorage.setItem("fairway_launch_ts", String(TARGET_LAUNCH_TIMESTAMP));
    }

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="w-full max-w-6xl mx-auto">

      {/* ── TOP BADGE ── */}
      <div className="flex justify-center mb-10">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#0b4d35]/30 bg-[#0b4d35]/8 text-[#0b4d35] text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
          VIP Waitlist — Founding Members Only
        </span>
      </div>

      {/* ── SPLIT LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* LEFT — Brand Story */}
        <div className="flex flex-col items-start text-left order-2 lg:order-1">

          {/* Official Brand Logo */}
          <div className="mb-6">
            <FairwayDrawsLogo variant="light" size="xl" href="" priority />
          </div>

          {/* Tagline */}
          <p className="text-[#334e43] text-base sm:text-lg leading-relaxed mb-8 max-w-md font-sans">
            Win <strong className="text-[#0b4d35] font-semibold">luxury golf equipment</strong>, premium club memberships &amp; exclusive{" "}
            <strong className="text-[#0b4d35] font-semibold">PGA tournament access</strong> — for passionate golfers across the UK.
          </p>

          {/* Stat Pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { value: "1,200+", label: "Golfers Registered" },
              { value: "£0", label: "Entry Min. Price" },
              { value: "100%", label: "Certified Gear" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-5 py-3 bg-white border border-[#0b4d35]/15 rounded-2xl shadow-sm min-w-[90px]"
              >
                <span className="font-serif text-2xl font-black text-[#0b4d35]">{stat.value}</span>
                <span className="font-sans text-[10px] font-semibold text-[#5e766c] uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-2 text-[11px] text-[#5e766c] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#0b4d35]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            UK Raffle Compliant · GDPR Protected · Zero Spam
          </div>
        </div>

        {/* RIGHT — Cap Image Showcase */}
        <div className="relative order-1 lg:order-2 flex justify-center">
          {/* Decorative ring */}
          <div className="absolute inset-[-16px] rounded-[40px] border-2 border-dashed border-[#0b4d35]/12 pointer-events-none" />

          {/* Outer glow */}
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#0b4d35]/10 via-transparent to-[#dc2626]/5 blur-2xl pointer-events-none" />

          {/* Card */}
          <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-[28px] overflow-hidden border border-[#0b4d35]/20 shadow-2xl group">
            <Image
              src="/logo_final.jpg"
              alt="Fairway Draws Official Golf Cap — Limited 2026 Edition"
              fill
              sizes="(max-width: 768px) 100vw, 460px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Floating bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
              <div>
                <p className="text-emerald-300 text-[10px] font-semibold uppercase tracking-widest mb-1">Official Gear &amp; Apparel</p>
                <p className="font-serif text-white text-lg font-bold leading-tight">Fairway Draws Edition</p>
              </div>
              <span className="px-3 py-1.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-white text-[10px] font-bold uppercase tracking-wide">
                2026 Batch
              </span>
            </div>

            {/* Top-right badge */}
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#dc2626] rounded-full text-white text-[10px] font-black uppercase tracking-wide shadow-lg">
              Limited
            </div>
          </div>
        </div>
      </div>

      {/* ── COUNTDOWN TIMER ── */}
      <div className="mt-14 flex flex-col items-center">
        <p className="text-[11px] font-bold text-[#5e766c] uppercase tracking-[0.2em] mb-5">
          ⛳ Official Launch Countdown
        </p>
        <div className="flex items-stretch gap-3 sm:gap-5">
          {[
            { value: pad(timeLeft.days), label: "Days" },
            { value: pad(timeLeft.hours), label: "Hours" },
            { value: pad(timeLeft.minutes), label: "Mins" },
            { value: pad(timeLeft.seconds), label: "Secs", accent: true },
          ].map((unit, i) => (
            <React.Fragment key={unit.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-[68px] sm:w-[84px] h-[72px] sm:h-[88px] flex items-center justify-center rounded-2xl border shadow-sm ${
                    unit.accent
                      ? "bg-[#dc2626] border-[#dc2626] shadow-red-200"
                      : "bg-white border-[#0b4d35]/15"
                  }`}
                >
                  <span
                    className={`font-serif text-3xl sm:text-4xl font-black tabular-nums ${
                      unit.accent ? "text-white" : "text-[#0b4d35]"
                    }`}
                  >
                    {unit.value}
                  </span>
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-bold text-[#5e766c] uppercase tracking-widest">
                  {unit.label}
                </span>
              </div>
              {i < 3 && (
                <div className="flex items-center pb-7">
                  <span className="text-2xl font-black text-[#0b4d35]/30">:</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

    </section>
  );
}
