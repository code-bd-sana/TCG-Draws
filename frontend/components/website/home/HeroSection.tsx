'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { raffleService } from '../../../services/raffle.service';

/**
 * Homepage hero: a mobile-first, high-impact golf course composition.
 * The product image is deliberately allowed to lead the right side of the
 * frame, while the copy stays readable through layered gradients.
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
    <section className="relative min-h-[810px] overflow-hidden bg-[#F8FAF6] pt-24 sm:min-h-[770px] md:pt-32 lg:min-h-[690px]">
      {/* Golden Hour Golf Course Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-banner.jpg"
          alt="Fairway Draws Golf Background"
          fill
          priority
          className="object-cover object-[58%_center] sm:object-center lg:object-right opacity-95"
        />
        {/* Responsive Readability Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAF6]/97 via-[#F8FAF6]/82 to-transparent lg:w-[64%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF6]/45 via-transparent to-[#073826]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.28),transparent_35%)]" />
      </div>

      <div className="container-custom relative z-10 flex min-h-[670px] items-start pt-5 pb-32 sm:min-h-[625px] sm:items-center sm:pb-28 lg:min-h-[600px] lg:pb-20">
        <div className="grid w-full grid-cols-1 items-center lg:grid-cols-12">
          {/* LEFT — Main Hero Headline & CTAs */}
          <div className="flex max-w-[720px] flex-col items-start text-left lg:col-span-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#073826] border border-[#16A34A]/40 text-white text-[11px] font-bold uppercase tracking-widest mb-6 shadow-md">
              <span className="text-sm">🏆</span>
              <span>PREMIUM GOLF COMPETITIONS</span>
            </div>

            {/* Main 3-Tier Headline */}
            <div className="mb-5">
              <h1 className="font-heading text-[clamp(3.35rem,14vw,5.3rem)] font-black leading-[0.82] tracking-[-0.075em] text-[#073826] uppercase text-shadow-hero-green sm:tracking-[-0.06em]">
                WIN PREMIUM
              </h1>
              <div className="my-2 flex items-center gap-2.5 sm:gap-4">
                <span className="text-xl font-black text-[#b91c1c] sm:text-3xl">—</span>
                <span className="font-heading text-[clamp(2.55rem,10.5vw,4rem)] font-black leading-none tracking-[-0.055em] text-[#b91c1c] uppercase text-shadow-hero-red">
                  GOLF GEAR
                </span>
                <span className="text-xl font-black text-[#b91c1c] sm:text-3xl">—</span>
              </div>
              <span className="font-heading block text-[clamp(3.35rem,14vw,5.3rem)] font-black leading-[0.82] tracking-[-0.075em] text-[#073826] uppercase text-shadow-hero-green sm:tracking-[-0.06em]">
                FOR LESS
              </span>
            </div>

            {/* Description Subtitle */}
            <p className="mb-8 max-w-[20rem] rounded-2xl border border-white/55 bg-white/40 p-3.5 font-sans text-sm font-medium leading-relaxed text-[#1e342b] shadow-xs backdrop-blur-xs sm:max-w-xl sm:text-base">
              Discover premium golf competitions with top-tier prizes. Every draw is <strong className="font-bold text-[#073826]">fair, transparent, and fully verified</strong>—created for a community that loves the game.
            </p>

            {/* Action Buttons */}
            <div className="flex w-full flex-wrap items-center gap-3.5 sm:w-auto sm:gap-4">
              <Link
                href="/live-raffles"
                className="btn-glossy-red px-7 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <span>VIEW ALL COMPETITIONS</span>
                <svg
                  className="w-4 h-4 text-white"
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
                className="btn-glossy-white px-6 py-3.5 rounded-2xl text-[#073826] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <span className="w-5 h-5 rounded-full bg-[#073826] text-white flex items-center justify-center text-xs font-serif font-bold italic">
                  i
                </span>
                <span>HOW IT WORKS</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* The course continues through this translucent grass statistics band. */}
      <div className="relative z-10 mt-6 overflow-hidden border-t border-[#58b866]/45 bg-[url('/hero-banner.jpg')] bg-[length:200%_auto] bg-left-bottom bg-no-repeat shadow-[0_-10px_35px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#032417]/92 via-[#07502f]/88 to-[#032417]/92" />
        <div className="container-custom relative pt-7 pb-8 sm:pt-9 sm:pb-10">
          <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-white/30">
            {/* Stat Card 1 */}
            <div className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-[1.03] sm:px-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#c91818]/90 text-lg text-white shadow-[0_5px_14px_rgba(60,0,0,.38)] sm:h-12 sm:w-12 sm:text-xl">
                🏆
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                {isLoading ? "..." : (drawsCompletedStat?.value || "0")}
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold tracking-wide text-white/85 uppercase sm:text-[11px] sm:tracking-wider">
                DRAWS COMPLETED
              </span>
            </div>

            {/* Stat Card 2 */}
            <div className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-[1.03] sm:px-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#c91818]/90 text-lg text-white shadow-[0_5px_14px_rgba(60,0,0,.38)] sm:h-12 sm:w-12 sm:text-xl">
                ⛳
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                PREMIUM
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold tracking-wide text-white/85 uppercase sm:text-[11px] sm:tracking-wider">
                GOLF PRIZES
              </span>
            </div>

            {/* Stat Card 3 */}
            <div className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-[1.03] sm:px-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#c91818]/90 text-lg text-white shadow-[0_5px_14px_rgba(60,0,0,.38)] sm:h-12 sm:w-12 sm:text-xl">
                🛡️
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                VERIFIED
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold tracking-wide text-white/85 uppercase sm:text-[11px] sm:tracking-wider">
                FAIR DRAWS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
