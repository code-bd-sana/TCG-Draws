"use client";

import React, { useEffect, useState } from "react";
import { trustBenefitsData } from "../../../data/homepage/trust-benefits.data";
import { raffleService } from "../../../services/raffle.service";

const ICONS: Record<string, React.ReactNode> = {
  ShieldCheckIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.75 3.75 0 0 1 21 12Z" />
    </svg>
  ),
  LockClosedIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  SparklesIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.096.813ZM19.071 5.929 18.5 9l-.571-3.071L15 5.5l3.071-.571L18.5 2l.571 3.071L22 5.5l-2.929.571Z" />
    </svg>
  ),
};

/**
 * Trust & Collector Integrity section — luxury dark theme with gold marquee + Art-Deco benefits grid.
 */
export default function TrustBenefitsSection() {
  const [stats, setStats] = useState<{ id: number; value: string; label: string }[]>([]);

  useEffect(() => {
    raffleService.getPublicStats()
      .then(data => { if (data?.length) setStats(data); })
      .catch(() => {});
  }, []);

  const marqueeItems = [
    "100% AUTHENTICATED PSA & BGS GEM MINT 10 SLABS",
    "NEXT-DAY INSURED ROYAL MAIL SPECIAL DELIVERY",
    "PROVABLY FAIR RANDOM.ORG AUDITED ALGORITHM",
    "UK COMPLIANT TRANSPARENT COLLECTOR COMPETITIONS",
    "BANK-GRADE 256-BIT ENCRYPTED CHECKOUT",
    "STRICT CHAIN-OF-CUSTODY VERIFICATION",
  ];

  return (
    <section className="relative py-24 bg-[#090A0E] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* High-end Marquee Ticker */}
        <div className="relative w-full overflow-hidden bg-[#0C0E14] border border-[rgba(212,175,55,0.25)] rounded-2xl shadow-xl mb-16 py-4.5">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0C0E14] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0C0E14] to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-max animate-marquee gap-12 items-center">
            {[...marqueeItems, ...marqueeItems].map((text, i) => (
              <div key={i} className="flex items-center gap-6 shrink-0">
                <span className="font-heading font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                  {text}
                </span>
                <span className="text-[#D4AF37] text-xs">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.3)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-heading font-black uppercase tracking-[0.2em] text-[#D4AF37]">
              Collector Confidence
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] uppercase tracking-tight">
            Built For Serious Collectors
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-3 leading-relaxed">
            Every draw on TCG DRAWS is fully audited, legally compliant, and strictly backed by physical Gem Mint PSA &amp; BGS slabs secured in tamper-evident vaults.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustBenefitsData.map((benefit, idx) => (
            <div
              key={benefit.id}
              className="art-deco-card rounded-3xl p-8 flex flex-col group hover:border-[#D4AF37]/50 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.18)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Corner gold flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-[#141722] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37] group-hover:bg-gradient-to-r group-hover:from-[#D4AF37] group-hover:to-[#B39042] group-hover:text-[#090A0E] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all duration-300 shrink-0 shadow-inner mb-6">
                {ICONS[benefit.iconName]}
              </div>

              {/* Step / Pillar Index */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                  PILLAR 0{idx + 1}
                </span>
                <span className="h-px w-8 bg-[rgba(212,175,55,0.3)]" />
              </div>

              <h3 className="font-heading font-black text-xl text-[#F4EBD9] mb-3 group-hover:text-[#D4AF37] transition-colors">
                {benefit.title}
              </h3>
              
              <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-6">
                {benefit.description}
              </p>

              {/* Bottom animated metallic accent */}
              <div className="mt-auto pt-4 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between text-[11px] font-mono text-[#D6CEBC]">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Verified Standard
                </span>
                <span className="text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
