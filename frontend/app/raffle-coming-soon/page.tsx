import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import ComingSoonHero from "../../components/website/coming-soon/ComingSoonHero";
import EarlyAccessForm from "../../components/website/coming-soon/EarlyAccessForm";
import InterestBenefits from "../../components/website/coming-soon/InterestBenefits";

export const metadata: Metadata = {
  title: "Fairway Draws | Premier Golf & Luxury Equipment Draws",
  description:
    "Join the official waitlist for Fairway Draws. Win luxury golf equipment, premium club memberships, and exclusive PGA tournament experiences.",
};

/**
 * Public 'Coming Soon' lead registration landing page at `/raffle-coming-soon`.
 * Premium two-column split layout with cap showcase, countdown, form, and benefits grid.
 */
export default function RaffleComingSoonPage() {
  return (
    <>
      <WebsiteNavbar />

      <main className="min-h-screen bg-[#F8FAF6] pt-24 lg:pt-28 relative overflow-hidden">

        {/* ── Decorative background blobs ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top-left emerald glow */}
          <div className="absolute -top-[20%] -left-[15%] w-[70%] h-[70%] bg-[#0b4d35]/8 rounded-full blur-[160px]" />
          {/* Bottom-right crimson glow */}
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#dc2626]/5 rounded-full blur-[130px]" />
          {/* Center subtle dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#0b4d3514_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        {/* ── HERO ── */}
        <div className="container-custom relative z-10 pb-16 pt-4">
          <ComingSoonHero />
        </div>

        {/* ── Wavy Divider ── */}
        <div className="relative z-10 -my-1">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#FFFFFF" />
          </svg>
        </div>

        {/* ── FORM SECTION ── */}
        <div className="bg-white relative z-10 py-16">
          <div className="container-custom">
            {/* Section label */}
            <div className="text-center mb-10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#dc2626]">Step 1 of 1</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0b4d35] mt-1">Reserve Your Spot</h2>
              <p className="font-sans text-sm text-[#5e766c] mt-2 max-w-sm mx-auto">
                Takes 30 seconds. No payment required.
              </p>
            </div>
            <EarlyAccessForm />
          </div>
        </div>

        {/* ── Wavy Divider (reversed) ── */}
        <div className="relative z-10 -my-1">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
            <path d="M0,30 C360,0 1080,60 1440,30 L1440,0 L0,0 Z" fill="#FFFFFF" />
          </svg>
        </div>

        {/* ── BENEFITS SECTION ── */}
        <div className="relative z-10 py-16">
          <div className="container-custom">
            <InterestBenefits />
          </div>
        </div>

        {/* ── FOOTER STRIP ── */}
        <div className="relative z-10 border-t border-[#0b4d35]/10 py-8">
          <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-start">
              <span className="font-serif text-lg font-black text-[#0b4d35] tracking-wider uppercase">FAIRWAY</span>
              <span className="font-sans text-[10px] font-black text-[#dc2626] tracking-[0.22em] uppercase">— DRAWS —</span>
            </div>
            <p className="font-sans text-[11px] text-[#5e766c] text-center sm:text-right">
              © 2026 Fairway Draws Ltd · UK Registered · All Rights Reserved
            </p>
          </div>
        </div>

      </main>
    </>
  );
}
