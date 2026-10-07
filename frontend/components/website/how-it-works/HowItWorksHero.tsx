import React from "react";

/**
 * TCG Draws How It Works Hero section.
 * Obsidian textures, gold ambient lighting, and high-impact typography.
 */
export default function HowItWorksHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] pt-28 pb-14 sm:pt-32 md:pb-16">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090A0E] to-transparent" />
      </div>

      <div className="container-custom relative flex flex-col items-center text-center z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.18em] text-[#F4EBD9] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
            TRANSPARENT · VERIFIED · COMPLIANT
          </span>
        </span>

        <h1 className="mt-4 max-w-4xl font-heading text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-[-0.04em] text-[#F4EBD9] uppercase">
          YOUR ROUTE TO WINNING{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
            PSA 10 POKÉMON GRAILS
          </span>
        </h1>

        <p className="mt-4 max-w-2xl rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/70 p-4 font-sans text-xs sm:text-sm font-medium leading-relaxed text-[#D6CEBC] shadow-lg backdrop-blur-md">
          Whether you&apos;re entering a live Pokémon card draw or hosting one for your community, every step is built on 100% transparency and verified random draws.
        </p>
      </div>
    </section>
  );
}
