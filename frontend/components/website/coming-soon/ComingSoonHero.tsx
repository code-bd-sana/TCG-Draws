"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import FairwayDrawsLogo from "../shared/FairwayDrawsLogo";

const TARGET_LAUNCH_TIMESTAMP = new Date("2026-12-01T12:00:00Z").getTime();

/**
 * Premium TCG Draws Coming Soon Hero.
 * Luxury Art-Deco dark obsidian layout: left = brand story & collector stats, right = high-value card slab showcase.
 * Glowing metallic countdown timer below.
 */
export default function ComingSoonHero() {
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let target = TARGET_LAUNCH_TIMESTAMP;
    const stored = localStorage.getItem("tcg_launch_ts");
    if (stored) {
      target = parseInt(stored, 10);
    } else {
      localStorage.setItem("tcg_launch_ts", String(TARGET_LAUNCH_TIMESTAMP));
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
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F] text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.18em] shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          VIP Waitlist — Founding Collectors &amp; Hosts
        </span>
      </div>

      {/* ── SPLIT LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* LEFT — Brand Story */}
        <div className="flex flex-col items-start text-left order-2 lg:order-1">

          {/* Official Brand Logo */}
          <div className="mb-6">
            <FairwayDrawsLogo variant="dark" size="xl" href="" priority />
          </div>

          {/* Tagline */}
          <p className="text-[#C8BFAD] text-base sm:text-lg leading-relaxed mb-8 max-w-md font-sans">
            Win <strong className="text-[#F4EBD9] font-bold">PSA 10 vintage grails</strong>, factory sealed booster boxes &amp; exclusive{" "}
            <strong className="text-[#D4AF37] font-bold">Manga &amp; Secret Rares</strong> — for passionate TCG collectors across the UK.
          </p>

          {/* Stat Pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { value: "1,850+", label: "Collectors Registered" },
              { value: "£0.99", label: "Min. Ticket Price" },
              { value: "100%", label: "PSA / BGS Authenticated" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-5 py-3 bg-[#12151F] border border-[rgba(212,175,55,0.2)] rounded-2xl shadow-card min-w-[90px]"
              >
                <span className="font-heading text-2xl font-black text-[#D4AF37]">{stat.value}</span>
                <span className="font-sans text-[10px] font-bold text-[#A69B82] uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-2 text-xs text-[#A69B82] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            UK Competition Law Compliant · Escrow Protected · Zero Spam
          </div>
        </div>

        {/* RIGHT — Cap Image Showcase */}
        <div className="relative order-1 lg:order-2 flex justify-center">
          {/* Decorative ring */}
          <div className="absolute inset-[-14px] rounded-[36px] border border-dashed border-[rgba(212,175,55,0.3)] pointer-events-none" />

          {/* Outer glow */}
          <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] blur-2xl pointer-events-none" />

          {/* Card */}
          <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-[28px] overflow-hidden border border-[rgba(212,175,55,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] group art-deco-card">
            <Image
              src="/logo_final.jpg"
              alt="TCG Draws Exclusive Launch Vault"
              fill
              sizes="(max-width: 768px) 100vw, 460px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/30 to-transparent" />

            {/* Floating bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
              <div>
                <p className="text-[#D4AF37] text-[10px] font-heading font-black uppercase tracking-widest mb-1">
                  Verified Collectibles
                </p>
                <p className="font-heading text-[#F4EBD9] text-lg font-bold leading-tight">
                  Launch Day Vault Edition
                </p>
              </div>
              <span className="px-3 py-1.5 bg-[rgba(24,28,40,0.85)] backdrop-blur-md border border-[rgba(212,175,55,0.3)] rounded-full text-[#F4EBD9] text-[10px] font-bold uppercase tracking-wide">
                Inaugural Drop
              </span>
            </div>

            {/* Top-right badge */}
            <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B39042] rounded-full text-[#090A0E] text-[10px] font-heading font-black uppercase tracking-wider shadow-lg">
              Limited
            </div>
          </div>
        </div>
      </div>

      {/* ── COUNTDOWN TIMER ── */}
      <div className="mt-16 flex flex-col items-center">
        <p className="text-[11px] font-heading font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-5">
          ⏱️ Official Launch Countdown
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
                  className={`w-[70px] sm:w-[88px] h-[74px] sm:h-[92px] flex items-center justify-center rounded-2xl border shadow-[0_8px_20px_rgba(0,0,0,0.6)] ${
                    unit.accent
                      ? "bg-gradient-to-b from-[#D4AF37] to-[#997A35] border-[#F5E5C0] text-[#090A0E] shadow-[0_0_25px_rgba(212,175,55,0.35)]"
                      : "bg-[#12151F] border-[rgba(212,175,55,0.25)] text-[#F4EBD9]"
                  }`}
                >
                  <span
                    className={`font-heading text-3xl sm:text-4xl font-black tabular-nums ${
                      unit.accent ? "text-[#090A0E]" : "text-[#F4EBD9]"
                    }`}
                  >
                    {unit.value}
                  </span>
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-bold text-[#A69B82] uppercase tracking-widest">
                  {unit.label}
                </span>
              </div>
              {i < 3 && (
                <div className="flex items-center pb-7">
                  <span className="text-2xl font-black text-[#D4AF37]/50">:</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

    </section>
  );
}
