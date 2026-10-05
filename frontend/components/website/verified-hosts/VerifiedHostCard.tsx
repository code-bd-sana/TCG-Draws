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
    : 'FD';

  return (
    <Link href={`/hosts/${host.slug}`} className="block h-full">
      <div className="group relative flex min-h-[200px] w-full flex-col justify-between overflow-hidden rounded-[18px] border border-[#bdd3ba] bg-[#edf5e9] p-6 shadow-[0_10px_25px_rgba(11,77,53,.09)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0b4d35]/45 hover:shadow-[0_18px_32px_rgba(11,77,53,.16)]">
        
        {/* Subtle hover gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b4d35]/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#0b4d35]/20 bg-[#dcebd8] shadow-sm">
              {isImage ? (
                <img
                  src={host.logo}
                  alt={host.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading text-[18px] font-black text-[#0b4d35] tracking-tight">{initials}</span>
              )}
            </div>
            {host.isVerified && (
              <span className="flex items-center gap-1.5 rounded-full border border-[#16a34a]/25 bg-[#dcfce7] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#15803d] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> Verified
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-[18px] font-bold text-text-primary transition-colors group-hover:text-[#0b4d35]">
              {host.name}
            </h3>
            <span className="line-clamp-2 font-sans text-[13px] leading-relaxed text-[#5e766c]">
              {host.description || "Verified Fairway Draws partner hosting premium golf competitions."}
            </span>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#cfe0cc] pt-5">
          <div className="flex items-center gap-4 font-sans text-[12px] font-medium text-[#426256]">
            <span>{host.competitionCount} Competitions</span>
            {host.averageRating && (
              <span className="flex items-center gap-1.5">
                <span className="text-[#dc2626]">★</span> {host.averageRating}
              </span>
            )}
          </div>
          <span className="flex -translate-x-2 items-center gap-1 text-[13px] font-semibold text-[#0b4d35] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            View Profile 
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
