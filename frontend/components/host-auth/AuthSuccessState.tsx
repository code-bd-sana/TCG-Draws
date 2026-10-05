"use client";

import React from "react";
import Link from "next/link";

interface AuthSuccessStateProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function AuthSuccessState({
  title,
  description,
  buttonText = "Back to Homepage",
  buttonHref = "/",
}: AuthSuccessStateProps) {
  return (
    <div className="art-deco-card p-6 md:p-12 rounded-2xl shadow-2xl flex flex-col items-center text-center animate-fadeIn max-w-xl mx-auto">
      {/* Animated Success Circle Icon */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[rgba(16,185,129,0.15)] border border-[#10B981] flex items-center justify-center mb-6 text-[#34D399] shadow-[0_0_25px_rgba(16,185,129,0.3)]">
        <svg
          className="w-8 h-8 md:w-10 md:h-10 animate-scaleIn"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      {/* Success Text */}
      <h2 className="font-heading font-black text-2xl md:text-3xl text-[#F4EBD9] mb-4">
        {title}
      </h2>
      <p className="font-sans text-sm md:text-base text-[#A69B82] leading-relaxed mb-8">
        {description}
      </p>

      {/* Action Button */}
      <Link
        href={buttonHref}
        className="btn-gold-metallic w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider inline-flex items-center justify-center cursor-pointer"
      >
        {buttonText} &rarr;
      </Link>
    </div>
  );
}
