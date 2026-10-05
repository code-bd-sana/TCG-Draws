import React from "react";
import Image from "next/image";

/**
 * Standard Contact Page Hero component matching the Figma layouts.
 */
export default function ContactHero() {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-[#174f36] bg-[#073826] pt-28 pb-14 sm:pt-32 md:pb-16">
      <Image src="/hero-banner.jpg" alt="Golf course at golden hour" fill priority className="-z-20 object-cover object-[68%_center] opacity-90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#032b1d]/95 via-[#06452f]/72 to-[#073826]/18" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8faf6]/82 to-transparent" />
      <div className="container-custom flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#073826]/85 px-4 py-2 font-sans text-[10px] font-black tracking-[.16em] text-white uppercase shadow-lg backdrop-blur-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" /> Support team</span>
        
        {/* Title */}
        <h1 className="mb-3 mt-5 font-heading text-3xl font-black leading-[.92] tracking-[-.055em] text-white uppercase [text-shadow:0_5px_18px_rgba(0,0,0,.3)] md:text-5xl">
          Get in Touch
        </h1>
        
        {/* Subtitle */}
        <p className="max-w-2xl rounded-2xl border border-white/15 bg-[#042d1e]/58 p-3.5 font-sans text-sm leading-relaxed text-white/85 shadow-xl backdrop-blur-sm md:text-xl">
          Questions about a draw, payment, or hosting? We&apos;re here to help.
        </p>

      </div>
    </section>
  );
}
