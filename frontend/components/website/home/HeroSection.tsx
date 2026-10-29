'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { raffleService, PublicLiveStats } from '../../../services/raffle.service';

/**
 * TCG DRAWS Luxury Pokémon Hero Section.
 * Designed with obsidian textures, gold aura accents, interactive CTAs,
 * and 100% real dynamic statistics from the database (no fake data).
 */
export default function HeroSection() {
  const [stats, setStats] = useState<{ id: number; value: string; label: string }[]>([]);
  const [liveStats, setLiveStats] = useState<PublicLiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      raffleService.getPublicStats().catch(() => []),
      raffleService.getPublicLiveStats().catch(() => null),
    ])
      .then(([statsData, liveStatsData]) => {
        if (statsData?.length) setStats(statsData);
        if (liveStatsData) setLiveStats(liveStatsData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const drawsCompletedStat = stats.find(s => s.id === 1 || s.label.toLowerCase().includes('draws'));

  return (
    <section className="relative min-h-[860px] overflow-hidden bg-[#090A0E] pt-28 sm:min-h-[820px] md:pt-36 lg:min-h-[760px]">
      {/* Dark Luxury Ambient Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Radial Gold Aura Glows */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(163,123,36,0.14)_0%,transparent_70%)] blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[260px] bg-gradient-to-t from-[#090A0E] via-[#090A0E]/80 to-transparent" />
      </div>

      <div className="container-custom relative z-10 flex min-h-[640px] items-center pt-4 pb-20 sm:pb-24 lg:min-h-[580px] lg:pb-16">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* LEFT — Main Hero Headline & CTAs */}
          <div className="flex max-w-[720px] flex-col items-start text-left lg:col-span-7">
            {/* Live Session & Brand Pill Badge */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.4)] text-[11px] font-heading font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                  UK&apos;S PREMIER POKÉMON VAULT
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Provably Fair Platform</span>
              </div>
            </div>

            {/* Main 3-Tier Headline */}
            <div className="mb-6">
              <h1 className="font-heading text-[clamp(2.8rem,8.5vw,4.8rem)] font-black leading-[0.9] tracking-[-0.04em] text-[#F4EBD9] uppercase">
                WIN GRADED
              </h1>
              <div className="my-2 flex items-center gap-2.5 sm:gap-4 flex-wrap">
                <span className="text-xl font-black text-[#D4AF37] sm:text-3xl">—</span>
                <span className="font-heading text-[clamp(2.4rem,7.5vw,4.2rem)] font-black leading-none tracking-[-0.03em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_4px_20px_rgba(212,175,55,0.4)]">
                  POKÉMON GRAILS
                </span>
                <span className="text-xl font-black text-[#D4AF37] sm:text-3xl">—</span>
              </div>
              <span className="font-heading block text-[clamp(2.5rem,8vw,4.4rem)] font-black leading-[0.9] tracking-[-0.04em] text-[#A69B82] uppercase">
                &amp; VINTAGE SLABS
              </span>
            </div>

            {/* Description Subtitle in Art-Deco Frame */}
            <div className="mb-8 w-full max-w-xl art-deco-card rounded-2xl p-4.5 sm:p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
              <p className="font-sans text-xs sm:text-sm font-normal leading-relaxed text-[#D6CEBC] relative z-10">
                Enter transparent UK draws for <strong className="font-bold text-[#F4EBD9]">PSA &amp; BGS Gem Mint 10 slabs</strong>, sealed vintage booster boxes, and modern Alternate Art chase grails. Every draw is <strong className="font-bold text-[#D4AF37]">100% verified, legal, and streamed live</strong>.
              </p>
              
              {/* Trust Badges Bar */}
              <div className="mt-3.5 pt-3 border-t border-[rgba(212,175,55,0.15)] flex items-center gap-4 flex-wrap text-[11px] font-mono text-[#A69B82]">
                <span className="flex items-center gap-1 text-[#F4EBD9]">
                  <span className="text-[#D4AF37]">✓</span> PSA &amp; BGS Authenticated
                </span>
                <span className="flex items-center gap-1 text-[#F4EBD9]">
                  <span className="text-[#D4AF37]">✓</span> Royal Mail Special Delivery
                </span>
                <span className="flex items-center gap-1 text-[#F4EBD9]">
                  <span className="text-[#D4AF37]">✓</span> Provably Fair RNG
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-wrap items-center gap-3.5 sm:w-auto sm:gap-4">
              <Link
                href="/live-raffles"
                className="btn-gold-metallic px-8 py-4 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto cursor-pointer shadow-lg"
              >
                <span>EXPLORE LIVE DRAWS</span>
                <svg
                  className="w-4 h-4 text-[#090A0E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <Link
                href="/how-it-works"
                className="btn-dark-metallic px-7 py-4 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-[rgba(212,175,55,0.2)] text-[#D4AF37] flex items-center justify-center text-xs font-serif font-bold italic">
                  i
                </span>
                <span>HOW IT WORKS</span>
              </Link>
            </div>
          </div>

          {/* RIGHT — Luxury PSA Slab Showcase Frame */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div className="relative w-full max-w-[390px] p-6 rounded-3xl art-deco-card transform hover:scale-[1.02] transition-transform duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(212,175,55,0.2)]">
              {/* Acrylic Case Bevel & Reflections */}
              <div className="absolute inset-1 rounded-2xl border border-white/10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-bl-full pointer-events-none" />

              {/* PSA Header Label Standard */}
              <div className="bg-[#FFFFFF] text-[#000000] rounded-xl p-3.5 mb-4 shadow-md border border-[#E5E7EB] relative overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-sm tracking-wider text-red-600">PSA</span>
                    <span className="font-mono text-[9px] text-gray-500 font-bold uppercase">AUTHENTIC</span>
                  </div>
                  <span className="font-sans font-black text-[9px] text-gray-600 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                    GEM MT 10
                  </span>
                </div>
                <div className="text-[12px] font-black font-heading tracking-tight text-gray-900 leading-tight uppercase">
                  POKÉMON TCG VAULT
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mt-0.5">
                  <span>GRADED COLLECTORS SPECIMEN</span>
                  <span className="text-[10px] font-mono text-gray-500">OFFICIAL CASING</span>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-2 pt-1 border-t border-gray-200 flex items-center justify-between">
                  <div className="h-3 w-32 bg-[repeating-linear-gradient(90deg,#111_0px,#111_2px,transparent_2px,transparent_4px)] opacity-70" />
                  <span className="text-[8px] font-mono font-bold text-gray-400">CHAIN OF CUSTODY</span>
                </div>
              </div>

              {/* Holographic Card Art Representation */}
              <div className="relative h-[340px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1C160E] via-[#2F1F0E] to-[#0A0C12] border border-[rgba(212,175,55,0.45)] flex flex-col items-center justify-center p-6 text-center shadow-inner group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.3)_0%,transparent_65%)]" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[radial-gradient(circle,rgba(255,240,212,0.25)_0%,transparent_70%)] blur-2xl pointer-events-none" />

                {/* Shimmering Holographic Center Icon */}
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#997A35] via-[#D4AF37] to-[#FFF0D4] flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.6)] mb-4 border border-white/30 transform group-hover:rotate-3 transition-transform duration-300">
                  <span className="text-4xl drop-shadow-lg">✨</span>
                </div>

                <div className="relative z-10 font-heading font-black text-xl text-[#F4EBD9] tracking-wider uppercase drop-shadow-md">
                  AUTHENTICATED VAULT GRAIL
                </div>
                
                <p className="relative z-10 text-xs font-sans text-[#A69B82] mt-2 max-w-[240px]">
                  All slabs verified through official PSA, BGS &amp; CGC verification databases prior to draw entry.
                </p>

                <div className="relative z-10 mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.45)] text-[10px] font-black uppercase tracking-widest text-[#D4AF37] shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>VAULT AUDITED &amp; INSURED</span>
                </div>
              </div>

              {/* Slab Acrylic Bottom Footer */}
              <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[rgba(212,175,55,0.2)] text-[10px] font-mono font-bold text-[#A69B82]">
                <span className="flex items-center gap-1">
                  <span>🔒</span> ULTRASONIC WELDED
                </span>
                <span className="text-[#D4AF37] font-semibold">ROYAL MAIL INSURED</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Real Statistics Band — 100% Dynamic / Truthful Platform Specifications */}
      <div className="relative z-10 overflow-hidden border-t border-[rgba(212,175,55,0.25)] bg-[#0C0E14]/95 backdrop-blur-md shadow-[0_-10px_35px_rgba(0,0,0,0.6)]">
        <div className="container-custom relative py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            
            {/* KPI 1: Real Draws Completed */}
            <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Draws Completed
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
                  🏆
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                  {isLoading ? "..." : (drawsCompletedStat?.value ?? "0")}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
                <span>Database verified</span>
                <span className="text-emerald-400 font-bold">Live Synced</span>
              </p>
            </div>

            {/* KPI 2: Live Active Raffles */}
            <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Live Competitions
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  ⚡
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-heading font-black text-emerald-400">
                  {isLoading ? "..." : (liveStats?.liveCount ?? 0)}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
                <span>Active entries open</span>
                <span className="text-emerald-400 font-bold">Real-time</span>
              </p>
            </div>

            {/* KPI 3: Grading Standard Specification */}
            <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Grading Standard
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  ✨
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-heading font-black text-amber-400">
                  PSA &amp; BGS 10
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
                <span>Third-party certified</span>
                <span className="text-amber-400 font-bold">Guaranteed</span>
              </p>
            </div>

            {/* KPI 4: Random Algorithm Standard */}
            <div className="art-deco-card p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Selection Algorithm
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
                  🛡️
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-heading font-black text-text-primary">
                  Random.org
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
                <span>Provably fair RNG</span>
                <span className="text-emerald-400 font-bold">Audited</span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
