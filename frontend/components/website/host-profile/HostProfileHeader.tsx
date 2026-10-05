"use client";

import React from "react";

interface HostProfileHeaderProps {
  name: string;
  bio: string;
  logo: string;
  isVerified: boolean;
  drawsHosted: number;
  rating: number;
  memberSince: number;
}

export default function HostProfileHeader({
  name,
  bio,
  logo,
  isVerified,
  drawsHosted = 0,
  rating = 5.0,
  memberSince = 2026,
}: HostProfileHeaderProps) {
  const [imgError, setImgError] = React.useState(false);

  const isImage = Boolean(
    logo &&
      !imgError &&
      (logo.startsWith("http://") ||
        logo.startsWith("https://") ||
        logo.startsWith("/") ||
        logo.startsWith("data:image/"))
  );

  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "FD";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#174f36] bg-gradient-to-br from-[#032b1d] via-[#06452f] to-[#073826] p-6 sm:p-8 md:p-10 shadow-xl">
      {/* Subtle Background Glow Elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#16A34A]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#0b4d35]/30 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
          {/* Avatar Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#042016] border-2 border-[#16A34A]/50 p-1.5 shrink-0 shadow-lg group">
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#073826] flex items-center justify-center">
              {isImage ? (
                <img
                  src={logo}
                  alt={name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="font-heading font-black text-white text-3xl sm:text-4xl tracking-wider">
                  {initials}
                </span>
              )}
            </div>
            {isVerified && (
              <div
                className="absolute -bottom-2 -right-2 bg-[#16A34A] text-white p-1 rounded-full shadow-md border border-[#042016]"
                title="Verified Host"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Host Info */}
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                {name}
              </h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 bg-[#16A34A]/20 border border-[#16A34A]/40 text-[#4ADE80] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified Host
                </span>
              )}
            </div>

            <p className="font-sans text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
              {bio}
            </p>

            {/* Stat Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl shadow-sm">
                <span className="text-base">🎯</span>
                <span className="font-sans text-xs sm:text-sm font-semibold text-white">
                  {drawsHosted} {drawsHosted === 1 ? "Draw" : "Draws"} Hosted
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl shadow-sm">
                <span className="text-amber-400 text-base">★</span>
                <span className="font-sans text-xs sm:text-sm font-semibold text-white">
                  {Number(rating).toFixed(1)} Host Rating
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl shadow-sm">
                <span className="text-base">⛳</span>
                <span className="font-sans text-xs sm:text-sm font-semibold text-white">
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
