import React from "react";
import Link from "next/link";
import { VerifiedHost } from "../../../types/host.types";

interface VerifiedHostCardProps {
  host: VerifiedHost;
}

export default function VerifiedHostCard({ host }: VerifiedHostCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const isImage = Boolean(
    host.logo &&
    !imgError &&
    (host.logo.startsWith('http://') ||
     host.logo.startsWith('https://') ||
     host.logo.startsWith('/') ||
     host.logo.startsWith('data:image/'))
  );

  const initials = host.name
    ? host.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'TCG';

  return (
    <Link href={`/hosts/${host.slug}`} className="block h-full">
      <div className="group relative flex min-h-[210px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_18px_35px_rgba(212,175,55,0.18)]">
        {/* Subtle hover gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(212,175,55,0.06)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#181C28] shadow-sm">
              {isImage ? (
                <img
                  src={host.logo}
                  alt={host.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading text-lg font-black text-[#D4AF37] tracking-tight">{initials}</span>
              )}
            </div>
            {host.isVerified && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/60 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Verified
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-lg font-black text-[#F4EBD9] transition-colors group-hover:text-[#D4AF37]">
              {host.name}
            </h3>
            <span className="line-clamp-2 font-sans text-xs leading-relaxed text-[#A69B82]">
              {host.description || "Verified TCG Draws partner hosting premium Pokémon competitions."}
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[rgba(212,175,55,0.12)] pt-5">
          <div className="flex items-center gap-4 font-sans text-xs font-medium text-[#A69B82]">
            <span>{host.competitionCount} Draws</span>
            {host.averageRating && (
              <span className="flex items-center gap-1.5">
                <span className="text-[#D4AF37]">★</span> {host.averageRating}
              </span>
            )}
          </div>
          <span className="flex -translate-x-2 items-center gap-1 font-heading text-xs font-bold text-[#D4AF37] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 uppercase tracking-wider">
            View Profile 
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
