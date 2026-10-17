import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import ComingSoonHero from "../../components/website/coming-soon/ComingSoonHero";
import EarlyAccessForm from "../../components/website/coming-soon/EarlyAccessForm";
import InterestBenefits from "../../components/website/coming-soon/InterestBenefits";

export const metadata: Metadata = {
  title: "TCG Draws | Exclusive Trading Card & Collectibles Raffles",
  description:
    "Join the official VIP waitlist for TCG Draws. Win PSA 10 vintage Pokémon cards, sealed One Piece booster boxes, Magic: The Gathering staples, and exclusive instant win cash prizes.",
};

/**
 * Public 'Coming Soon' lead registration landing page at `/raffle-coming-soon`.
 * Redesigned with TCG Draws Luxury Dark Obsidian & Gold Art-Deco aesthetic.
 */
export default function RaffleComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E] text-[#F4EBD9]">
      <WebsiteNavbar />

      <main className="flex-1 pt-24 lg:pt-32 relative overflow-hidden">

        {/* ── Ambient Gold Background Glows ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top-left gold glow */}
          <div className="absolute -top-[20%] -left-[10%] w-[65%] h-[65%] bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-[140px]" />
          {/* Bottom-right amber glow */}
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(245,229,192,0.08)_0%,transparent_70%)] blur-[120px]" />
          {/* Center subtle dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(212,175,55,0.07)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        {/* ── HERO ── */}
        <div className="container-custom relative z-10 pb-16 pt-4">
          <ComingSoonHero />
        </div>

        {/* ── Subtle Gold Hairline Divider ── */}
        <div className="relative z-10 container-custom max-w-5xl mx-auto my-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.35)] to-transparent" />
        </div>

        {/* ── FORM SECTION ── */}
        <div className="relative z-10 py-16">
          <div className="container-custom">
            <div className="text-center mb-10">
              <span className="inline-block text-[11px] font-heading font-black uppercase tracking-[0.22em] text-[#D4AF37] mb-3">
                Early Access Registration
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F4EBD9] uppercase tracking-tight">
                Secure Your VIP Allocation
              </h2>
              <p className="font-sans text-sm text-[#A69B82] mt-3 max-w-md mx-auto leading-relaxed">
                Founding members receive free ticket credits on launch day and early access to high-demand booster box draws.
              </p>
            </div>

            <EarlyAccessForm />
          </div>
        </div>

        {/* ── Subtitle Divider ── */}
        <div className="relative z-10 container-custom max-w-5xl mx-auto my-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.35)] to-transparent" />
        </div>

        {/* ── PRIVILEGES / BENEFITS ── */}
        <div className="relative z-10 py-16">
          <InterestBenefits />
        </div>

      </main>

      <WebsiteFooter />
    </div>
  );
}
