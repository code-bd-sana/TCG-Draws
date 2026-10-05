import React from "react";
import Image from "next/image";

/** Campaign header for the Fairway Draws guide. */
export default function HowItWorksHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#174f36] bg-[#073826] pt-28 pb-14 sm:pt-32 md:pb-16">
      <Image src="/hero-banner.jpg" alt="Golf course at golden hour" fill priority className="-z-20 object-cover object-[70%_center] opacity-90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#032b1d]/95 via-[#06452f]/72 to-[#073826]/18" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8faf6]/82 to-transparent" />
      <div className="container-custom flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#073826]/85 px-4 py-2 font-sans text-[10px] font-black tracking-[.16em] text-white uppercase shadow-lg backdrop-blur-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" /> Simple. Secure. Fair.</span>
        <h1 className="mt-5 max-w-4xl font-heading text-4xl font-black leading-[.9] tracking-[-.055em] text-white uppercase [text-shadow:0_5px_18px_rgba(0,0,0,.3)] sm:text-5xl md:text-6xl">Your route to the<br />winner&apos;s circle</h1>
        <p className="mt-5 max-w-2xl rounded-2xl border border-white/15 bg-[#042d1e]/58 p-3.5 font-sans text-sm font-medium leading-relaxed text-white/85 shadow-xl backdrop-blur-sm sm:text-base">Whether you&apos;re entering a premium golf competition or hosting one, every step is designed to be clear, transparent, and enjoyable.</p>
      </div>
    </section>
  );
}
