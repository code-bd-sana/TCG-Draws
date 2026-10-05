import React from "react";
import Link from "next/link";

const STEPS = [
  {
    n: 1,
    emoji: "🔍",
    title: "Select Your Grail",
    desc: "Browse live Pokémon draws — PSA & BGS Gem Mint 10 slabs, vintage 1st Edition booster packs, or sealed booster boxes.",
  },
  {
    n: 2,
    emoji: "🎟️",
    title: "Claim Your Tickets",
    desc: "Answer a quick collector skill question and select your lucky ticket numbers securely using bank-grade encrypted checkout.",
  },
  {
    n: 3,
    emoji: "🏆",
    title: "Live Audited Draw",
    desc: "Every draw is conducted transparently live on stream with third-party verified random selection, and dispatched insured.",
  },
];

/**
 * How It Works section — 3-step luxury layout with gold connector line.
 */
export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)]">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">Simple Process</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F4EBD9]">How TCG DRAWS Works</h2>
          <p className="font-sans text-sm text-[#A69B82] mt-3 max-w-md mx-auto leading-relaxed">
            Enter draws in three transparent steps and win authenticated Pokémon grails. Legal, secure, and provably fair.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[52px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.4)] to-transparent z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
            {STEPS.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center group">
                {/* Circle */}
                <div className="relative mb-7">
                  <div className="w-[104px] h-[104px] rounded-full bg-[#12151F] border-2 border-[rgba(212,175,55,0.3)] flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(212,175,55,0.15)] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all duration-300">
                    {step.emoji}
                  </div>
                  {/* Number badge */}
                  <span className="absolute -top-1 -right-1 w-7 h-7 flex items-center justify-center bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] font-heading font-black text-xs rounded-full shadow-md">
                    {step.n}
                  </span>
                </div>

                <h3 className="font-heading font-black text-xl text-[#F4EBD9] mb-3">{step.title}</h3>
                <p className="font-sans text-sm text-[#A69B82] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-14">
          <Link
            href="/how-it-works"
            className="btn-dark-metallic inline-flex items-center gap-2 px-7 py-3.5 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] font-sans text-sm font-bold tracking-wider uppercase rounded-xl hover:border-[#D4AF37] transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#D4AF37]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.054.955l-.448 1.002a.75.75 0 0 1-1.059.416l-.018-.01a.75.75 0 0 1-.416-1.059l.448-1.002Zm.75-3c.414 0 .75-.336.75-.75s-.336-.75-.75-.75-.75.336-.75.75.336.75.75.75Zm-.008 9a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
            </svg>
            Learn More About Our Process &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
}
