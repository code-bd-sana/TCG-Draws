import React from "react";
import Link from "next/link";

/**
 * Bottom CTA block encouraging users to participate or host drawings in TCG Draws theme.
 */
export default function HowItWorksFinalCta() {
  return (
    <section className="select-none border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] py-16 md:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="container-custom relative z-10 flex flex-col items-center gap-6 text-center">
        <span className="font-heading text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
          ⚡ CLAIM YOUR GRAIL
        </span>
        <h2 className="font-heading text-3xl font-black text-[#F4EBD9] sm:text-4xl md:text-5xl uppercase">
          Ready to Get Started?
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#A69B82] max-w-md">
          Explore today&apos;s active PSA 10 slabs or register as a verified shop host to launch your own community draws.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
          <Link
            href="/live-raffles"
            className="btn-gold-metallic px-8 py-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] w-full sm:w-auto shadow-md"
          >
            Browse Live Draws →
          </Link>
          <Link
            href="/host/register"
            className="btn-dark-metallic px-8 py-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9] w-full sm:w-auto"
          >
            Become a Host
          </Link>
        </div>
      </div>
    </section>
  );
}
