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
      <main className="min-h-[70vh] flex items-center justify-center bg-[#cfdfcb] pt-24 pb-16 px-4">
        <div className="bg-white border border-[#CBD8C8] rounded-2xl p-8 sm:p-12 max-w-md w-full text-center shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-3xl mx-auto mb-5 text-[#DC2626]">
            ⛳
          </div>
          <h2 className="font-heading font-black text-2xl text-[#0e1e17] uppercase tracking-tight mb-2">
            Competition Unavailable
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#5e766c] leading-relaxed mb-6">
            We couldn&apos;t load this competition details right now. It may have been removed or experienced a temporary connection issue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider bg-[#0b4d35] text-white hover:bg-[#073826] transition-all cursor-pointer shadow-sm"
            >
              Try Again
            </button>
            <Link
              href="/live-raffles"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider bg-[#f0f6ed] border border-[#CBD8C8] text-[#0e1e17] hover:bg-[#e2eadf] transition-all text-center"
            >
              Browse Competitions
            </Link>
          </div>
        </div>
      </main>
      <WebsiteFooter />
    </>
  );
}
