"use client";

import React, { useEffect, useState } from "react";
import { trustBenefitsData } from "../../../data/homepage/trust-benefits.data";
import StatCard from "../shared/StatCard";
import { raffleService } from "../../../services/raffle.service";

const ICONS: Record<string, React.ReactNode> = {
  ShieldCheckIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.75 3.75 0 0 1 21 12Z" />
    </svg>
  ),
  LockClosedIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  SparklesIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.096.813ZM19.071 5.929 18.5 9l-.571-3.071L15 5.5l3.071-.571L18.5 2l.571 3.071L22 5.5l-2.929.571Z" />
    </svg>
  ),
};

/**
 * Trust & Statistics section — marquee stats + benefits grid.
 */
export default function TrustBenefitsSection() {
  const [stats, setStats] = useState<{ id: number; value: string; label: string }[]>([]);

  useEffect(() => {
    raffleService.getPublicStats()
      .then(data => { if (data?.length) setStats(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-white border-t border-[#EFF4ED]">
      <div className="container-custom">

        {/* Marquee strip */}
        {stats.length > 0 && (
          <div className="relative w-full overflow-hidden bg-[#F8FAF6] border border-[#0b4d35]/12 rounded-2xl shadow-sm mb-16 py-5">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F8FAF6] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F8FAF6] to-transparent z-10 pointer-events-none" />
            <div className="flex w-max animate-marquee gap-20">
              {[...stats, ...stats, ...stats, ...stats].map((stat, i) => (
                <div key={`${stat.id}-${i}`} className="shrink-0 min-w-[200px] flex flex-col items-center">
                  <span className="font-serif text-2xl font-black text-[#0b4d35]">{stat.value}</span>
                  <span className="font-sans text-[10px] font-bold text-[#5e766c] uppercase tracking-wider mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#dc2626] block mb-2">Why Trust Us</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0b4d35]">Built for Golfers, By Golfers</h2>
          <p className="font-sans text-sm text-[#5e766c] mt-3 max-w-md mx-auto leading-relaxed">
            Every detail of Fairway Draws is designed to give you a secure, transparent, and premium experience.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {trustBenefitsData.map((benefit) => (
            <div
              key={benefit.id}
              className="group relative bg-[#F8FAF6] border border-[#0b4d35]/12 rounded-[20px] p-7 flex flex-col gap-4 hover:border-[#0b4d35]/35 hover:shadow-xl hover:shadow-emerald-900/8 transition-all duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#0b4d35]/4 via-transparent to-transparent pointer-events-none rounded-[20px]" />

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#0b4d35]/15 flex items-center justify-center text-[#0b4d35] group-hover:bg-[#0b4d35] group-hover:text-white group-hover:border-[#0b4d35] transition-all duration-300 shrink-0 shadow-sm">
                {ICONS[benefit.iconName]}
              </div>

              <h3 className="font-serif font-black text-lg text-[#0b4d35]">{benefit.title}</h3>
              <p className="font-sans text-sm text-[#334e43] leading-relaxed">{benefit.description}</p>

              {/* Animated bottom line */}
              <div className="h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-[#0b4d35] to-[#dc2626]/50 rounded-full transition-all duration-500 ease-out mt-auto" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
