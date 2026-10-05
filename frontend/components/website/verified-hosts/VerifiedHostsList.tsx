"use client";

import React, { useState } from "react";
import { VerifiedHost } from "../../../types/host.types";
import VerifiedHostCard from "./VerifiedHostCard";
import { cn } from "../../../lib/utils";

interface VerifiedHostsListProps {
  hosts: VerifiedHost[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function VerifiedHostsList({ hosts }: VerifiedHostsListProps) {
  const [activeLetter, setActiveLetter] = useState<string>("ALL");

  const verifiedOnlyHosts = hosts.filter(
    (host) => host && host.isVerified === true && !host.isBlocked
  );

  const filteredHosts = activeLetter === "ALL" 
    ? verifiedOnlyHosts 
    : verifiedOnlyHosts.filter(host => host.name.toUpperCase().startsWith(activeLetter));

  return (
    <div className="flex flex-col w-full">
      {/* A-Z Filter */}
      <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-[#0b4d35]/20 pb-6">
        <button
          onClick={() => setActiveLetter("ALL")}
          className={cn(
            "h-[36px] px-4 rounded-[8px] font-sans text-[13px] font-medium transition-colors duration-200 cursor-pointer select-none",
            activeLetter === "ALL"
              ? "bg-[#8CB34A] text-[#0D0D0B] shadow-[0_0_15px_rgba(140,179,74,0.15)]"
              : "border border-[#bbd3b8] bg-[#edf5e9] text-[#426256] hover:border-[#0b4d35]/45 hover:text-[#0b4d35]"
          )}
        >
          All
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            className={cn(
              "w-[36px] h-[36px] rounded-[8px] flex items-center justify-center font-sans text-[13px] font-medium transition-colors duration-200 cursor-pointer select-none",
              activeLetter === letter
                ? "bg-[#8CB34A] text-[#0D0D0B] shadow-[0_0_15px_rgba(140,179,74,0.15)]"
                : "border border-[#bbd3b8] bg-[#edf5e9] text-[#426256] hover:border-[#0b4d35]/45 hover:text-[#0b4d35]"
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredHosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHosts.map((host) => (
            <VerifiedHostCard key={host.id} host={host} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center gap-3 rounded-[20px] border border-[#0b4d35]/25 bg-[#edf5e9] px-8 py-20 text-center shadow-[0_12px_28px_rgba(11,77,53,.1)]">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#0b4d35]/20 bg-[#dcebd8] text-[26px]">🔍</span>
          <span className="font-sans text-[10px] font-black tracking-[.16em] text-[#dc2626] uppercase">Host directory</span>
          <h3 className="font-heading text-[20px] font-black text-[#073826]">No Hosts Found</h3>
          <p className="max-w-[340px] font-sans text-[13px] leading-relaxed text-[#5e766c]">
            {activeLetter === "ALL"
              ? "There are no verified hosts to show right now. Please check back soon."
              : <>We couldn&apos;t find a verified host whose name starts with &quot;{activeLetter}&quot;. Try selecting &quot;All&quot; to view the full directory.</>}
          </p>
        </div>
      )}
    </div>
  );
}
