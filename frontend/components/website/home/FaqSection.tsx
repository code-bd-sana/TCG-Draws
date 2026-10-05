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
    <section id="faq" className="py-20 bg-[#0C0E14] border-t border-[rgba(212,175,55,0.15)]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT — Context */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] block mb-4">⚡ FAQ</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F4EBD9] mb-5 leading-tight">
              Common Questions
            </h2>
            <p className="font-sans text-sm text-[#A69B82] leading-relaxed mb-8 max-w-sm">
              Everything you need to know about entering Pokémon draws, slab grading authentication, ticket purchases, and insured prize deliveries on TCG DRAWS.
            </p>

            {/* Contact Card */}
            <div className="w-full bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-[20px] p-6 shadow-xl">
              <div className="text-2xl mb-3">💬</div>
              <h4 className="font-heading font-black text-base text-[#F4EBD9] mb-1">Still have questions?</h4>
              <p className="font-sans text-xs text-[#A69B82] mb-4 leading-relaxed">
                Our team is available Mon–Fri, 9am–5pm GMT. We typically reply within 2 hours.
              </p>
              <Link
                href="/contact"
                className="btn-gold-metallic inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-black tracking-wider uppercase transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#090A0E]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                Contact Support
              </Link>
            </div>
          </div>

          {/* RIGHT — Accordion */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-[#12151F] border border-[rgba(212,175,55,0.2)] rounded-[20px] overflow-hidden shadow-xl divide-y divide-[rgba(212,175,55,0.1)]">
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
