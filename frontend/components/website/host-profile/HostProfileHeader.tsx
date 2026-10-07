"use client";

import React from "react";

interface HostProfileHeaderProps {
  name: string;
  bio: string;
  logo: string;
  category?: string;
  isVerified: boolean;
  drawsHosted: number;
  rating: number;
  totalReviews?: number;
  memberSince: number | string;
  location?: string;
}

export default function HostProfileHeader({
  name,
  bio,
  logo,
  category = "Pro Shop",
  isVerified = true,
  drawsHosted = 0,
  rating = 5.0,
  totalReviews = 0,
  memberSince = 2024,
  location = "United Kingdom",
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
    : "TCG";

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,transparent_70%)] blur-[80px]" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[90px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)] opacity-25" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
          {/* Avatar Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#181C28] border-2 border-[rgba(212,175,55,0.4)] p-1.5 shrink-0 shadow-[0_10px_25px_rgba(0,0,0,0.6)] group">
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#090A0E] flex items-center justify-center">
              {isImage ? (
                <img
                  src={logo}
                  alt={name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="font-heading font-black text-[#D4AF37] text-3xl sm:text-4xl tracking-wider">
                  {initials}
                </span>
              )}
            </div>
            {isVerified && (
              <div
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] p-1.5 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.5)] border-2 border-[#12151F]"
                title="Verified Host"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="flex flex-col gap-2.5 flex-grow">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {category && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#181C28]/90 px-3 py-1 font-sans text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37]">
                  {category}
                </span>
              )}

              {isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/60 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Officially Verified Host
                </span>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#F4EBD9] tracking-tight uppercase">
              {name}
            </h1>

            <p className="font-sans text-xs sm:text-sm text-[#D6CEBC] max-w-2xl leading-relaxed">
              {bio}
            </p>

            {/* Stat Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-2">
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28]/90 px-3.5 py-1.5 shadow-sm">
                <span className="text-[#D4AF37] text-sm">🎯</span>
                <span className="font-sans text-xs font-semibold text-[#F4EBD9]">
                  {drawsHosted} {drawsHosted === 1 ? "Draw" : "Draws"} Hosted
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28]/90 px-3.5 py-1.5 shadow-sm">
                <span className="text-[#D4AF37] text-sm">★</span>
                <span className="font-sans text-xs font-semibold text-[#F4EBD9]">
                  {Number(rating).toFixed(1)} Rating {totalReviews > 0 ? `(${totalReviews} reviews)` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28]/90 px-3.5 py-1.5 shadow-sm">
                <span className="text-[#D4AF37] text-sm">🛡️</span>
                <span className="font-sans text-xs font-semibold text-[#F4EBD9]">
                  Member since {memberSince}
                </span>
              </div>

              {location && (
                <div className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28]/90 px-3.5 py-1.5 shadow-sm">
                  <span className="text-[#D4AF37] text-sm">📍</span>
                  <span className="font-sans text-xs font-semibold text-[#F4EBD9]">
                    {location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
