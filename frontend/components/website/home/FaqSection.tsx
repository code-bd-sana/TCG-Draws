"use client";

import React, { useState } from "react";
import AccordionItem from "../shared/AccordionItem";
import { faqData } from "../../../data/homepage/faq.data";
import Link from "next/link";

/**
 * FAQ Section — luxury dark-themed split layout with gold accordion.
 */
export default function FaqSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  return (
    <section id="faq" className="relative py-24 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT — Context */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151F] border border-[rgba(212,175,55,0.3)] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[11px] font-heading font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                Clear Transparency
              </span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] mb-4 uppercase tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>
            
            <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-8 max-w-sm">
              Everything you need to know about entering Pokémon draws, slab grading authentication, ticket purchase limits, and insured prize deliveries on TCG DRAWS.
            </p>

            {/* VIP Concierge Support Card */}
            <div className="w-full art-deco-card rounded-3xl p-7 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#141722] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-xl text-[#D4AF37] shadow-inner">
                  💬
                </div>
                <div>
                  <h4 className="font-heading font-black text-base text-[#F4EBD9] uppercase tracking-wide">
                    Collector Concierge
                  </h4>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    ● Mon–Fri, 9am–5pm GMT
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs text-[#A69B82] mb-6 leading-relaxed">
                Have specific inquiries regarding slab grading certificates, postal entries, or breaker hosting? Our UK support desk answers within 2 hours.
              </p>
              
              <Link
                href="/contact"
                className="btn-gold-metallic inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-heading text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] w-full cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#090A0E]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <span>Contact UK Concierge</span>
              </Link>
            </div>
          </div>

          {/* RIGHT — Accordion */}
          <div className="lg:col-span-7 w-full">
            <div className="art-deco-card rounded-3xl overflow-hidden shadow-2xl divide-y divide-[rgba(212,175,55,0.12)]">
              {faqData.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaqId === faq.id}
                  onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
