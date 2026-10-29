"use client";

import React from "react";
import { cn } from "../../../lib/utils";

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Reusable Accordion Item for FAQs with smooth CSS transitions.
 */
export default function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-b border-divider py-1 px-6 transition-all duration-200">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-heading font-black text-sm md:text-base text-[#F4EBD9] hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer group py-4"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        
        {/* Toggle Icon */}
        <span className={cn(
          "ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200",
          isOpen
            ? "bg-[#D4AF37] border-[#D4AF37] text-[#090A0E] shadow-[0_0_10px_rgba(212,175,55,0.35)]"
            : "bg-[#181C28] border-[rgba(212,175,55,0.25)] text-[#D4AF37] group-hover:border-[#D4AF37]"
        )}>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </span>
      </button>

      {/* Accordion Content with transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out font-sans text-xs md:text-sm text-[#C8BFAD] leading-relaxed overflow-hidden",
          isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p dangerouslySetInnerHTML={{ __html: answer }} className="text-[#C8BFAD] leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
