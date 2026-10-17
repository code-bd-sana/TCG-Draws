import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import UserAuthLayout from "../../../components/user-auth/UserAuthLayout";

export const metadata: Metadata = {
  title: "Registration Successful | TCG Draws",
  description: "Your account has been created successfully. Welcome to TCG Draws.",
};

export default function RegisterSuccessPage() {
  return (
    <UserAuthLayout mode="register">
      <div className="art-deco-card rounded-2xl p-8 sm:p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)] flex flex-col items-center max-w-md mx-auto animate-fadeIn">
        {/* Animated Green Check Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgba(16,185,129,0.15)] border border-[#10B981] flex items-center justify-center mb-6 text-[#34D399] shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] text-[#D4AF37] font-sans font-bold text-[10px] uppercase tracking-widest mb-3">
          Account Verified
        </span>

        <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#F4EBD9] uppercase tracking-tight mb-3">
          Account Created!
        </h2>

        <p className="max-w-sm text-sm text-[#C8BFAD] leading-relaxed mb-8 font-sans">
          Welcome to <strong className="text-[#F4EBD9]">TCG Draws</strong>. Your account is fully set up. You can now explore live collectible card raffles, grab instant win tickets, and track your entries.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/login"
            className="btn-gold-metallic w-full py-3.5 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] text-center transition-all shadow-md active:scale-98"
          >
            <span>Proceed to Login</span>
            <span> &rarr;</span>
          </Link>

          <Link
            href="/live-raffles"
            className="btn-dark-metallic w-full py-3 px-6 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9] text-center transition-all hover:border-[rgba(212,175,55,0.4)]"
          >
            Browse Live Competitions
          </Link>
        </div>
      </div>
    </UserAuthLayout>
  );
}
