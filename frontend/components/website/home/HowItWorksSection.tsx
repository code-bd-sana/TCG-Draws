import React from "react";
import Link from "next/link";

const STEPS = [
  {
    n: "01",
    icon: (
      <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
      </svg>
    ),
    title: "Select Your Vault Grail",
    badge: "AUTHENTICATED SLABS",
    desc: "Browse live Pokémon draws — PSA & BGS Gem Mint 10 slabs, sealed vintage 1st Edition booster boxes, or modern Alternate Art grails with clear odds.",
    subtext: "100% Chain-of-Custody Verified",
  },
  {
    n: "02",
    icon: (
      <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
      </svg>
    ),
    title: "Claim Lucky Tickets",
    badge: "INSTANT NUMBER LOCK",
    desc: "Answer a fast collector skill question and choose your preferred ticket numbers or use instant lucky dip with bank-grade 256-bit encrypted checkout.",
    subtext: "Instant Win Matching Included",
  },
  {
    n: "03",
    icon: (
      <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.496 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492c.981.142 1.953.316 2.916.52a6.003 6.003 0 0 1-5.405 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
    title: "Live Draw & Delivery",
    badge: "RANDOM.ORG VERIFIED",
    desc: "Every draw is streamed live using audited Random.org algorithm. All winners receive next-day insured delivery via Royal Mail Special Delivery.",
    subtext: "Tracked & Insured Courier",
  },
];

/**
 * How It Works section — 3-step luxury Art-Deco layout with gold connector line.
 */
export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.3)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[11px] font-heading font-black uppercase tracking-[0.2em] text-[#D4AF37]">
              Provably Fair Protocol
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] uppercase tracking-tight">
            How TCG DRAWS Works
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-3 leading-relaxed">
            Three simple, transparent steps to compete for authenticated Gem Mint 10 Pokémon grails with complete compliance and third-party verified random selection.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connector Line behind cards */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.4)] to-transparent z-0 pointer-events-none -translate-y-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="art-deco-card rounded-3xl p-8 flex flex-col justify-between group hover:border-[#D4AF37]/50 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.18)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

                {/* Top Row: Icon + Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#141722] border border-[rgba(212,175,55,0.35)] flex items-center justify-center shadow-inner group-hover:border-[#D4AF37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300">
                    {step.icon}
                  </div>
                  <span className="font-mono font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] tracking-tighter">
                    {step.n}
                  </span>
                </div>

                {/* Badge */}
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] text-[10px] font-mono font-bold tracking-wider uppercase text-[#D4AF37]">
                    {step.badge}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="font-heading font-black text-xl text-[#F4EBD9] mb-3 group-hover:text-[#D4AF37] transition-colors">
                  {step.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-6">
                  {step.desc}
                </p>

                {/* Bottom Trust Subtext */}
                <div className="pt-4 border-t border-[rgba(212,175,55,0.15)] mt-auto flex items-center gap-2 text-[11px] font-mono text-[#D6CEBC]">
                  <span className="text-[#D4AF37]">✦</span>
                  <span>{step.subtext}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
          <Link
            href="/how-it-works"
            className="btn-dark-metallic inline-flex items-center gap-2 px-8 py-3.5 border border-[rgba(212,175,55,0.3)] text-[#F4EBD9] font-heading font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#D4AF37] transition-all duration-200 cursor-pointer shadow-md"
          >
            <span>Read Complete Protocol &amp; Rules</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/live-raffles"
            className="btn-gold-metallic inline-flex items-center gap-2 px-8 py-3.5 font-heading font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
          >
            <span>Enter A Live Draw</span>
            <span>⚡</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
