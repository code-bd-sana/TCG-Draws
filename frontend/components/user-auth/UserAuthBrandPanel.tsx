"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import FairwayDrawsLogo from "../website/shared/FairwayDrawsLogo";

interface UserAuthBrandPanelProps {
  mode: "login" | "register" | "forgot" | "reset" | "verify";
}

export default function UserAuthBrandPanel({ mode }: UserAuthBrandPanelProps) {
  // Trust stats for TCG Customer screens
  const trustStats = [
    {
      label: "100% Verifiable & Compliant Draws",
      description: "Provably fair and transparent draw mechanics",
      icon: (
        <svg
          className="w-5 h-5 text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      label: "PSA, BGS & CGC Authenticated Slabs",
      description: "1st Edition grails, Charizards & vintage booster boxes",
      icon: (
        <svg
          className="w-5 h-5 text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.172-.468.83-.468 1.002 0l1.968 5.378 5.674.526c.499.046.7.66.321 1.002l-4.27 3.863 1.34 5.578c.118.49-.413.876-.843.614L12 18.064l-4.832 2.923c-.43.262-.961-.124-.843-.614l1.34-5.578-4.27-3.863c-.379-.342-.178-.956.321-1.002l5.674-.526 1.968-5.378z" />
        </svg>
      ),
    },
    {
      label: "Instant Winner & Live Draw Alerts",
      description: "Real-time ticket tracking & secured UK courier delivery",
      icon: (
        <svg
          className="w-5 h-5 text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative isolate flex h-full flex-col justify-between overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#0C0E14] px-6 py-8 md:px-[60px] lg:px-[70px] md:py-[50px] lg:py-[64px] lg:min-h-screen lg:border-r lg:border-b-0">
      {/* Ambient background glows and Art-Deco grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(140,109,45,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(rgba(212,175,55,0.4)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Decorative Art-Deco line */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[rgba(212,175,55,0.15)] to-transparent pointer-events-none" />

      {/* Top Branding Logo */}
      <div className="relative z-10">
        <FairwayDrawsLogo variant="dark" size="lg" priority />
      </div>

      {/* Center Body Panel */}
      <div className="relative z-10 my-10 lg:my-auto flex flex-col gap-8 w-full max-w-lg">
        {/* Vault Badge */}
        <div className="self-start inline-flex items-center gap-2 bg-[#141722] border border-[rgba(212,175,55,0.3)] px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.12)]">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <p className="font-sans font-semibold text-[10px] md:text-xs text-[#E5C158] tracking-[0.2em] uppercase">
            TCG VAULT & COLLECTIBLES
          </p>
        </div>

        {/* Hero Headlines */}
        <div className="flex flex-col gap-3.5">
          <h1 className="font-heading font-black text-3xl md:text-[44px] text-[#F4EBD9] leading-[1.1] md:leading-[1.15] tracking-tight">
            Win Holy Grail{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
              Pokémon Cards
            </span>
          </h1>
          <p className="font-sans font-normal text-sm md:text-base text-[#A69B82] leading-relaxed">
            Join the UK&apos;s premier trading card competition platform. Win PSA 10 slabs, vintage booster boxes, and rare collectibles with instant transparent draws.
          </p>
        </div>

        {/* Feature Highlights Card */}
        <div className="flex flex-col gap-3.5 bg-[#12151F]/90 backdrop-blur-md border border-[rgba(212,175,55,0.2)] rounded-xl p-4 sm:p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]">
          {trustStats.map((stat, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#181C28] border border-[rgba(212,175,55,0.25)] shrink-0 mt-0.5 shadow-[0_0_12px_rgba(212,175,55,0.1)]">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-semibold text-xs sm:text-sm text-[#F4EBD9]">
                  {stat.label}
                </span>
                <span className="font-sans text-[11px] sm:text-xs text-[#A69B82]">
                  {stat.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Copy */}
      <div className="relative z-10 mt-8 lg:mt-0 pt-6 border-t border-[rgba(212,175,55,0.15)] flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans font-medium text-[10px] md:text-[11px] text-[#A69B82]">
          © {new Date().getFullYear()} TCG DRAWS · Pokemon Cards & Collectables
        </p>
        <div className="flex items-center gap-3 text-[10px] md:text-[11px] text-[#6E6655]">
          <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  );
}
