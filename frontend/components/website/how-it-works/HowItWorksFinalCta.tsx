import React from "react";
import PrimaryButton from "../shared/PrimaryButton";
import SecondaryButton from "../shared/SecondaryButton";

/**
 * Renders the bottom CTA block encouraging users to participate or host drawings.
 */
export default function HowItWorksFinalCta() {
  return (
    <section className="select-none border-b border-[#174f36] bg-[#073826] py-16 md:py-20">
      <div className="container-custom flex flex-col items-center gap-6 text-center">
        <span className="font-sans text-[10px] font-black tracking-[.16em] text-[#f05a4f] uppercase">Take your shot</span>
        <h2 className="font-heading text-2xl font-black text-white sm:text-3xl md:text-4xl">
          Ready to get started?
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <PrimaryButton href="/live-raffles" className="px-8 py-3.5 text-base w-full sm:w-auto">
            Browse Draws
          </PrimaryButton>
          <SecondaryButton href="/#host-info" className="w-full border-white/25 bg-white/10 px-8 py-3.5 text-base text-white hover:bg-white/20 sm:w-auto">
            Become a Host
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
