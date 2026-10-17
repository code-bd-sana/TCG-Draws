"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

function ErrorContent() {
  const searchParams = useSearchParams();

  const errorMessage =
    searchParams.get("message") ||
    searchParams.get("reason") ||
    searchParams.get("error") ||
    "Your payment was declined, cancelled, or could not be completed by your payment provider.";

  const orderNumber =
    searchParams.get("ordernumber") ||
    searchParams.get("orderNumber") ||
    searchParams.get("ref");

  return (
    <div className="container-custom max-w-2xl mx-auto px-4 sm:px-6">
      <div className="art-deco-card rounded-2xl p-6 sm:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)] flex flex-col items-center text-center animate-fadeIn">
        
        {/* Decline / Alert Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.35)] text-[#F87171] flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
            stroke="currentColor"
            className="w-8 h-8 sm:w-10 sm:h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Status Badge */}
        <span className="px-3.5 py-1 rounded-full bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#FCA5A5] font-sans font-bold text-[10px] uppercase tracking-wider mb-2">
          Payment Incomplete
        </span>

        {/* Main Heading */}
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] uppercase tracking-tight mb-2">
          Payment Not Completed
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-xs sm:text-sm text-[#C8BFAD] max-w-md mb-6 leading-relaxed">
          {errorMessage}
        </p>

        {/* Order Reference (if available) */}
        {orderNumber && (
          <div className="mb-6 px-4 py-2 rounded-xl bg-[#181C28] border border-[rgba(212,175,55,0.2)] text-xs font-sans text-[#A69B82]">
            Order Reference: <strong className="text-[#F4EBD9] font-mono">{orderNumber}</strong>
          </div>
        )}

        {/* Informative Guidance Box */}
        <div className="w-full mb-8 text-left bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl p-5 flex flex-col gap-3.5">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#D4AF37]">
            Common Reasons For Declined Transactions
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-[#C8BFAD]">
            <div className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span><strong>3D Secure / OTP:</strong> Verification was cancelled, timed out, or not approved in your banking app.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span><strong>Bank Security:</strong> Your card issuer may have flagged the transaction for routine online payment checks.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span><strong>Card Details:</strong> Verify your 16-digit number, expiration date, and CVV code were entered accurately.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span><strong>Available Balance:</strong> Insufficient funds or exceeding daily card spending limits.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/basket"
            className="btn-gold-metallic w-full sm:w-auto px-8 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Basket</span>
            <span>&rarr;</span>
          </Link>

          <Link
            href="/dashboard"
            className="btn-dark-metallic w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9] transition-all text-center"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/contact"
            className="btn-dark-metallic w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#A69B82] hover:text-[#F4EBD9] transition-all text-center"
          >
            Contact Support
          </Link>
        </div>

        {/* Security Reassurance */}
        <p className="mt-8 text-[11px] font-sans text-[#8C8472] max-w-sm">
          No funds have been charged from your card and no tickets were allocated. Your selected items remain safely in your basket.
        </p>

      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E]">
      <WebsiteNavbar />

      <main className="flex-1 pt-28 pb-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ErrorContent />
        </Suspense>
      </main>

      <WebsiteFooter />
    </div>
  );
}
