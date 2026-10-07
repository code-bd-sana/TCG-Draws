import React from "react";

interface LiveRafflesEmptyStateProps {
  onReset: () => void;
}

/**
 * TCG Draws Empty State feedback for search/filter results containing zero elements.
 */
export default function LiveRafflesEmptyState({ onReset }: LiveRafflesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#12151F] border border-[rgba(212,175,55,0.25)] border-dashed rounded-2xl max-w-lg mx-auto font-sans shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
      <div className="w-16 h-16 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center mb-5 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <h3 className="font-heading font-black text-xl text-[#F4EBD9] mb-2 uppercase tracking-wide">
        No Pokémon Draws Found
      </h3>
      <p className="text-xs sm:text-sm text-[#A69B82] max-w-sm leading-relaxed mb-6 font-sans">
        We couldn&apos;t find any active competition matching your search query or category filters. Check back soon for newly listed slabs!
      </p>
      <button
        onClick={onReset}
        className="btn-gold-metallic font-heading font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer select-none shadow-md"
      >
        Reset Filters
      </button>
    </div>
  );
}
