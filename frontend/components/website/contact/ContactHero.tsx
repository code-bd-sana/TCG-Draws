import React from "react";

/**
 * TCG Draws Luxury Contact Hero component.
 * Features Obsidian textures, Gold ambient lighting, live concierge status, and key trust badges.
 */
export default function ContactHero() {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] pt-28 pb-16 sm:pt-32 md:pb-20">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090A0E] to-transparent" />
      </div>

      <div className="container-custom flex flex-col items-center text-center relative z-10">
        {/* VIP Concierge Status Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.18em] text-[#F4EBD9] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
            VIP CONCIERGE &amp; DEDICATED SUPPORT
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 font-heading text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-[-0.04em] text-[#F4EBD9] uppercase">
          WE&apos;RE HERE TO HELP{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
            EVERY STEP OF THE WAY
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/70 p-4 font-sans text-xs sm:text-sm leading-relaxed text-[#D6CEBC] shadow-lg backdrop-blur-md">
          Questions about a Pokémon grail draw, instant win prize fulfillment, ticket allocation, or breaker onboarding? Our UK-based concierge team is standing by.
        </p>

        {/* Key Guarantee Pillars */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl">
          <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/80 px-3.5 py-2 text-xs font-sans text-[#F4EBD9] shadow-sm backdrop-blur-sm">
            <span className="text-[#D4AF37]">⚡</span>
            <span>Typical Response: <strong className="text-[#D4AF37]">&lt; 2 Hours</strong></span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/80 px-3.5 py-2 text-xs font-sans text-[#F4EBD9] shadow-sm backdrop-blur-sm">
            <span className="text-emerald-400">💬</span>
            <span>WhatsApp Direct Desk Available</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/80 px-3.5 py-2 text-xs font-sans text-[#F4EBD9] shadow-sm backdrop-blur-sm">
            <span className="text-[#D4AF37]">🇬🇧</span>
            <span>UK Verified Support Team</span>
          </div>
        </div>
      </div>
    </section>
  );
}
