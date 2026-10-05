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
      <div className="bg-surface border border-border rounded-card p-6 sm:p-10 shadow-card flex flex-col items-center text-center animate-fadeIn">
        
        {/* Decline / Alert Icon */}
        <div className="w-16 h-16 rounded-full bg-[#FEE2E2] border border-[#FCA5A5]/60 text-[#DC2626] flex items-center justify-center mb-4 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
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

        {/* Status Badge */}
        <span className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider mb-2">
          Payment Incomplete
        </span>

        {/* Main Heading */}
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary uppercase tracking-tight mb-2">
          Payment Not Completed
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-xs sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
          {errorMessage}
        </p>

        {/* Order Reference (if available) */}
        {orderNumber && (
          <div className="mb-6 px-4 py-2 rounded-xl bg-elevated border border-divider text-xs font-sans text-text-muted">
            Order Reference: <strong className="text-text-primary font-mono">{orderNumber}</strong>
          </div>
        )}

        {/* Informative Guidance Box */}
        <div className="w-full mb-8 text-left bg-elevated border border-border rounded-xl p-5 flex flex-col gap-3.5">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
            Common Reasons For Declined Transactions
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-text-muted">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>3D Secure / OTP:</strong> Verification was cancelled, timed out, or not approved in your banking app.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Bank Security:</strong> Your card issuer may have blocked the transaction for routine fraud protection.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Card Details:</strong> Ensure your card number, expiration date, and CVV code were entered accurately.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Available Balance:</strong> Insufficient funds or exceeding daily card spending limits.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/dashboard"
            className="btn-glossy-red w-full sm:w-auto px-8 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Dashboard</span>
            <span>→</span>
          </Link>

          <Link
            href="/basket"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all text-center"
          >
            Return to Basket
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all text-center"
          >
            Contact Support
          </Link>
        </div>

        {/* Security Reassurance */}
        <p className="mt-8 text-[11px] font-sans text-text-muted max-w-sm">
          No funds have been charged from your account and no tickets were allocated. Your items remain safely in your basket.
        </p>

      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf6]">
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
