import React from "react";
import Link from "next/link";

/**
 * Fallback screen for raffle details pages when a requested slug does not resolve to an active drawing.
 */
export default function RaffleDetailsEmptyState() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-24 bg-[#090A0E] font-sans relative isolate overflow-hidden">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-[90px]" />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-[#12151F] border border-[rgba(212,175,55,0.3)] flex items-center justify-center mb-6 text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      
      <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] uppercase tracking-tight mb-3">
        Competition Not Found
      </h2>
      
      <p className="text-xs sm:text-sm text-[#A69B82] max-w-sm leading-relaxed mb-8">
        The competition you are looking for does not exist, has completed, or was removed by the host.
      </p>

      <Link
        href="/live-raffles"
        className="btn-gold-metallic font-heading font-black text-xs text-[#090A0E] px-8 py-3.5 rounded-xl uppercase tracking-wider shadow-md"
      >
        Browse Live Draws &rarr;
      </Link>
    </div>
  );
}
