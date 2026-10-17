"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import WebsiteNavbar from "../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../components/website/layout/WebsiteFooter";

export default function RaffleDetailsErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Live raffle page error boundary caught:", error);
  }, [error]);

  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen flex items-center justify-center bg-[#090A0E] pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(212,175,55,0.08)] via-transparent to-transparent pointer-events-none blur-3xl" />

        <div className="art-deco-card relative z-10 p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-3xl mx-auto mb-5 text-[#D4AF37] shadow-inner">
            🎴
          </div>
          <h2 className="font-heading font-black text-2xl text-[#F4EBD9] uppercase tracking-tight mb-2">
            Competition Unavailable
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-6">
            We couldn&apos;t load this competition details right now. It may have concluded, been archived, or experienced a temporary connection issue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="btn-gold-metallic w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md transition-all active:scale-98 cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/live-raffles"
              className="btn-dark-metallic w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider border border-[rgba(212,175,55,0.3)] hover:border-[#D4AF37] text-[#D4AF37] transition-all text-center"
            >
              Browse Live Draws
            </Link>
          </div>
        </div>
      </main>
      <WebsiteFooter />
    </>
  );
}
