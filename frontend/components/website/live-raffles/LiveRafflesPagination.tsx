"use client";

import React from "react";
import { cn } from "../../../lib/utils";

interface LiveRafflesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * TCG Draws Luxury Pagination Component.
 * Obsidian surfaces, gold border accents, and gold active states.
 */
export default function LiveRafflesPagination({
  currentPage = 1,
  totalPages = 3,
  onPageChange,
}: LiveRafflesPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 py-8 mt-12 border-t border-[rgba(212,175,55,0.15)] font-sans">
      {/* Prev Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-xl border select-none transition-all duration-200 cursor-pointer shadow-xs",
          currentPage === 1
            ? "border-[rgba(212,175,55,0.1)] text-[#6E6655] bg-[#12151F]/40 cursor-not-allowed"
            : "border-[rgba(212,175,55,0.3)] text-[#F4EBD9] hover:bg-[#D4AF37] hover:text-[#090A0E] hover:border-[#D4AF37] bg-[#12151F]"
        )}
      >
        ← Prev
      </button>

      {/* Pages list */}
      <div className="flex items-center gap-2 select-none">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-9 h-9 text-xs font-heading font-bold rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer select-none",
              currentPage === p
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] border-[#D4AF37] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                : "bg-[#12151F] border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:bg-[#1A1E2B] hover:text-[#F4EBD9] hover:border-[#D4AF37]/50"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-xl border select-none transition-all duration-200 cursor-pointer shadow-xs",
          currentPage === totalPages
            ? "border-[rgba(212,175,55,0.1)] text-[#6E6655] bg-[#12151F]/40 cursor-not-allowed"
            : "border-[rgba(212,175,55,0.3)] text-[#F4EBD9] hover:bg-[#D4AF37] hover:text-[#090A0E] hover:border-[#D4AF37] bg-[#12151F]"
        )}
      >
        Next →
      </button>
    </div>
  );
}
