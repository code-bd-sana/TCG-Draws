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

  const filteredHosts =
    activeLetter === "ALL"
      ? verifiedOnlyHosts
      : verifiedOnlyHosts.filter((host) =>
          host.name.toUpperCase().startsWith(activeLetter)
        );

  return (
    <div className="flex flex-col w-full">
      {/* A-Z Filter */}
      <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-[rgba(212,175,55,0.18)] pb-6">
        <button
          onClick={() => setActiveLetter("ALL")}
          className={cn(
            "h-[36px] px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
            activeLetter === "ALL"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
              : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
          )}
        >
          All
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            className={cn(
              "w-[36px] h-[36px] rounded-xl flex items-center justify-center font-heading text-xs font-bold transition-all duration-200 cursor-pointer select-none",
              activeLetter === letter
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
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
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#12151F] border border-[rgba(212,175,55,0.2)] border-dashed rounded-2xl max-w-lg mx-auto">
          <p className="font-heading font-black text-lg text-[#F4EBD9] uppercase mb-1">
            No Verified Hosts Found
          </p>
          <p className="font-sans text-xs text-[#A69B82]">
            No verified card shops found under the selected letter.
          </p>
        </div>
      )}
    </div>
  );
}
