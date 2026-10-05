'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { raffleService } from '../../../services/raffle.service';

/**
 * TCG DRAWS Luxury Pokémon Hero Section.
 * Designed with obsidian textures, gold aura accents, interactive CTAs,
 * and live-updating statistics.
 */
export default function HeroSection() {
  const [stats, setStats] = useState<{ id: number; value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    raffleService.getPublicStats()
      .then(data => {
        if (data?.length) setStats(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const drawsCompletedStat = stats.find(s => s.id === 1 || s.label.toLowerCase().includes('draws'));

  return (
    <section className="relative min-h-[820px] overflow-hidden bg-[#090A0E] pt-28 sm:min-h-[780px] md:pt-36 lg:min-h-[720px]">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
        
        {/* Radial Gold Aura Glows */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(163,123,36,0.14)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[250px] bg-gradient-to-t from-[#090A0E] to-transparent" />
      </div>

      <div className="container-custom relative z-10 flex min-h-[640px] items-center pt-4 pb-28 sm:pb-24 lg:min-h-[580px] lg:pb-16">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* LEFT — Main Hero Headline & CTAs */}
          <div className="flex max-w-[720px] flex-col items-start text-left lg:col-span-7">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#141722] border border-[rgba(212,175,55,0.4)] text-[#F4EBD9] text-[11px] font-bold uppercase tracking-[0.2em] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <span className="text-sm">✨</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                UK&apos;S PREMIER POKÉMON VAULT
              </span>
            </div>

            {/* Main 3-Tier Headline */}
            <div className="mb-5">
              <h1 className="font-heading text-[clamp(2.8rem,9vw,5rem)] font-black leading-[0.88] tracking-[-0.04em] text-[#F4EBD9] uppercase">
                WIN GRADED
              </h1>
              <div className="my-2.5 flex items-center gap-2.5 sm:gap-4 flex-wrap">
                <span className="text-xl font-black text-[#D4AF37] sm:text-3xl">—</span>
                <span className="font-heading text-[clamp(2.4rem,8vw,4.4rem)] font-black leading-none tracking-[-0.03em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.35)]">
                  POKÉMON GRAILS
                </span>
                <span className="text-xl font-black text-[#D4AF37] sm:text-3xl">—</span>
              </div>
              <span className="font-heading block text-[clamp(2.6rem,8.5vw,4.8rem)] font-black leading-[0.88] tracking-[-0.04em] text-[#A69B82] uppercase">
                &amp; VINTAGE SLABS
              </span>
            </div>

            {/* Description Subtitle */}
            <p className="mb-8 max-w-xl rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/70 p-4 font-sans text-sm sm:text-base font-normal leading-relaxed text-[#D6CEBC] shadow-lg backdrop-blur-md">
              Enter transparent draws for <strong className="font-bold text-[#F4EBD9]">PSA &amp; BGS Gem Mint 10 slabs</strong>, sealed vintage 1st Edition booster packs, and modern Alternate Art chase grails. Every draw is <strong className="font-bold text-[#D4AF37]">100% verified, legal, and streamed live</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex w-full flex-wrap items-center gap-3.5 sm:w-auto sm:gap-4">
              <Link
                href="/live-raffles"
                className="btn-gold-metallic px-8 py-4 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto cursor-pointer"
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

          {/* RIGHT — Luxury PSA Slab Holographic Showcase Card */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div className="relative w-full max-w-[380px] p-6 rounded-2xl art-deco-card transform hover:scale-[1.02] transition-transform duration-300">
              {/* PSA Header Label Simulation */}
              <div className="bg-[#FFFFFF] text-[#000000] rounded-lg p-3 mb-4 shadow-sm border border-[#E5E7EB]">
                <div className="flex items-center justify-between border-b border-red-600 pb-1 mb-1.5">
                  <span className="font-heading font-black text-xs tracking-wider text-red-600">PSA</span>
                  <span className="font-sans font-bold text-[10px] text-gray-500 uppercase tracking-widest">CERTIFIED SLAB</span>
                  <span className="font-mono font-black text-xs text-red-600">GEM MT 10</span>
                </div>
                <div className="text-[11px] font-bold font-sans tracking-tight text-gray-900 leading-tight">
                  1999 POKÉMON SHADOWLESS
                </div>
                <div className="text-[10px] font-semibold text-gray-700">
                  #4 CHARIZARD - HOLO
                </div>
              </div>

              {/* Holographic Card Art Representation */}
              <div className="relative h-[340px] rounded-xl overflow-hidden bg-gradient-to-br from-[#1C160E] via-[#352511] to-[#0E0F14] border border-[rgba(212,175,55,0.4)] flex flex-col items-center justify-center p-6 text-center shadow-inner group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.25)_0%,transparent_60%)]" />
                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-[#997A35] via-[#D4AF37] to-[#FFF0D4] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)] mb-4">
                  <span className="text-4xl">🔥</span>
                </div>
                <div className="relative z-10 font-heading font-black text-lg text-[#F4EBD9] tracking-wider uppercase drop-shadow-md">
                  PSA 10 HOLO GRAIL
                </div>
                <p className="relative z-10 font-sans text-xs text-[#A69B82] mt-1 max-w-[220px]">
                  Estimated Value: <strong className="text-[#D4AF37]">£12,500+</strong>
                </p>

                <div className="relative z-10 mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.4)] text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  <span>🔒 AUDITED IN VAULT</span>
                </div>
              </div>

              {/* Subtle Slab Bottom Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(212,175,55,0.2)] text-[10px] font-semibold text-[#A69B82]">
                <span>TAMPER-SEALED CASE</span>
                <span className="text-[#D4AF37]">AUTHENTICATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Band */}
      <div className="relative z-10 mt-4 overflow-hidden border-t border-[rgba(212,175,55,0.25)] bg-[#0C0E14]/95 backdrop-blur-md shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
        <div className="container-custom relative pt-6 pb-7 sm:pt-8 sm:pb-8">
          <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-[rgba(212,175,55,0.2)]">
            {/* Stat Card 1 */}
            <div className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-[1.03] sm:px-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#141722] text-lg text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] sm:h-12 sm:w-12 sm:text-xl">
                🏆
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-[#F4EBD9] sm:text-2xl lg:text-3xl">
                {isLoading ? "..." : (drawsCompletedStat?.value || "2,400+")}
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold tracking-wider text-[#A69B82] uppercase sm:text-[11px]">
                DRAWS COMPLETED
              </span>
            </div>

            {/* Stat Card 2 */}
            <div className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-[1.03] sm:px-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#141722] text-lg text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] sm:h-12 sm:w-12 sm:text-xl">
                ✨
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-[#F4EBD9] sm:text-2xl lg:text-3xl">
                PSA &amp; BGS 10
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold tracking-wider text-[#A69B82] uppercase sm:text-[11px]">
                AUTHENTICATED SLABS
              </span>
            </div>

            {/* Stat Card 3 */}
            <div className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-[1.03] sm:px-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#141722] text-lg text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] sm:h-12 sm:w-12 sm:text-xl">
                🛡️
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-[#F4EBD9] sm:text-2xl lg:text-3xl">
                100% AUDITED
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold tracking-wider text-[#A69B82] uppercase sm:text-[11px]">
                LIVE STREAMED DRAWS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
