"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PrimaryButton from "../website/shared/PrimaryButton";
import { useVerifyEmailMutation, useResendVerificationMutation } from "../../hooks/useAuthHooks";
import { extractApiError } from "../../lib/utils";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (token && verificationStatus === "idle") {
      setVerificationStatus("verifying");
      verifyMutation.mutateAsync(token)
        .then(() => {
          setVerificationStatus("success");
          showToast("Email verified successfully! Redirecting...");
          setTimeout(() => router.push("/login"), 2000);
        })
        .catch((error) => {
          setVerificationStatus("error");
          showToast(extractApiError(error, "Failed to verify email. The link might have expired."));
        });
    }
  }, [token, verifyMutation, router, verificationStatus]);

  const handleResend = async () => {
    if (!email) {
      showToast("Email address is missing. Please try logging in again.");
      return;
    }

    try {
      await resendMutation.mutateAsync(email);
      showToast("Verification link resent! Please check your inbox.");
    } catch (error: any) {
      showToast(extractApiError(error, "Failed to resend verification link."));
    }
  };

  if (verificationStatus === "verifying") {
    return (
      <div className="art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fadeIn select-none shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] mb-3">
          Verifying Collector Key...
        </h2>
        <div className="animate-spin h-9 w-9 border-4 border-[#D4AF37] border-t-transparent rounded-full mt-4 shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fadeIn select-none shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#141722] border border-[#D4AF37] text-[#F5E5C0] px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] text-xs md:text-sm animate-fadeIn">
            {toastMessage}
          </div>
        )}
        <div className="w-14 h-14 rounded-2xl bg-[#181C28] border border-[#D4AF37] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-[#D4AF37]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-[#D4AF37] tracking-[0.25em] uppercase mb-2">
          VAULT MEMBERSHIP ACTIVE
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] mb-3">
          Email Verified!
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-6 max-w-sm">
          Your collector account has been authenticated. Redirecting you to sign in to the vault...
        </p>
      </div>
    );
  }

  return (
    <div className="art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fadeIn select-none shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#141722] border border-[#D4AF37] text-[#F5E5C0] px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] text-xs md:text-sm animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Envelope Icon */}
      <div className="w-14 h-14 rounded-2xl bg-[#181C28] border border-[#D4AF37] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7 text-[#D4AF37]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>

      {/* Header */}
      <span className="text-[10px] sm:text-xs font-bold text-[#D4AF37] tracking-[0.25em] uppercase mb-2">
        AUTHENTICATION REQUIRED
      </span>
      <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] mb-3">
        Verify Your Email
      </h2>

      {/* Explanation */}
      <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-6 max-w-sm">
        We&apos;ve sent a verification link to your email address {email ? <span className="text-[#F4EBD9] font-medium">({email})</span> : ''}. Please click the link inside the email to activate your account.
      </p>

      {/* Resend Button */}
      <div className="w-full mb-6">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendMutation.isPending}
          className="btn-gold-metallic w-full py-3.5 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {resendMutation.isPending ? "Resending Link..." : "Resend Verification Email"}
        </button>
      </div>

      {/* Footer link */}
      <Link
        href="/login"
        className="font-sans font-semibold text-xs text-[#A69B82] hover:text-[#D4AF37] uppercase tracking-wider transition-colors duration-200"
      >
        &larr; Back to Sign In
      </Link>
    </div>
  );
}
