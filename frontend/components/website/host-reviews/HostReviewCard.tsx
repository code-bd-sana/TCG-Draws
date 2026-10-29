"use client";

import React, { useState } from "react";
import { HostReview } from "../../../types/review.types";
import { cn } from "../../../lib/utils";

interface HostReviewCardProps {
  review: HostReview;
}

export default function HostReviewCard({ review }: HostReviewCardProps) {
  const [isFlagged, setIsFlagged] = useState(review.status === "flagged");

  const handleFlag = () => {
    setIsFlagged(true);
    // In future: call API to flag review
  };

  return (
    <div className={cn(
      "border rounded-2xl p-5 transition-all duration-300 shadow-md",
      isFlagged 
        ? "bg-[#181212] border-red-900/60 opacity-75" 
        : "bg-[#12151F] border-[rgba(212,175,55,0.2)] hover:border-[#D4AF37]/50 hover:shadow-[0_10px_25px_rgba(212,175,55,0.1)]"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="font-heading font-black text-[#F4EBD9] text-sm uppercase tracking-wide">
            {review.reviewerName}
          </span>
          <span className="font-mono text-[10px] text-[#A69B82] mt-0.5">
            {review.createdAt}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-[#D4AF37] text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < review.rating ? "opacity-100" : "opacity-20"}>★</span>
          ))}
        </div>
      </div>
      
      {review.competitionTitle && (
        <div className="mb-3">
          <span className="text-[10px] font-heading font-bold text-[#D4AF37] uppercase tracking-wider bg-[#181C28] border border-[rgba(212,175,55,0.25)] px-2.5 py-1 rounded-md inline-block">
            Won: {review.competitionTitle}
          </span>
        </div>
      )}

      <p className="font-sans text-xs sm:text-sm text-[#D6CEBC] leading-relaxed mb-4">
        {isFlagged ? (
          <span className="italic text-[#A69B82]">This review is currently under moderation.</span>
        ) : (
          review.message
        )}
      </p>

      {/* Flag Button for Hosts */}
      {review.canBeFlagged && !isFlagged && (
        <div className="flex justify-end border-t border-[rgba(212,175,55,0.12)] pt-3">
          <button 
            onClick={handleFlag}
            className="text-[10px] font-semibold text-[#A69B82] hover:text-[#ef4444] transition-colors flex items-center gap-1 cursor-pointer select-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a15.26 15.26 0 0 1 9.46 0l2.77.693M3 15V4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v10.5M21 15v-6" />
            </svg>
            Flag for Review
          </button>
        </div>
      )}
    </div>
  );
}
