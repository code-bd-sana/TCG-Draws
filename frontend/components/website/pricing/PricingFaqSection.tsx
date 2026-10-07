"use client";

import React, { useState } from "react";
import { PRICING_FAQ } from "../../../data/pricing/pricing-faq.data";
import AccordionItem from "../shared/AccordionItem";

/**
 * Pricing Page FAQ Section using dark obsidian theme.
 */
export default function PricingFaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] py-20">
      <div className="container-custom max-w-3xl flex flex-col items-center">
        <h2 className="font-heading font-black text-2xl md:text-4xl text-[#F4EBD9] uppercase text-center mb-10 tracking-tight">
          Frequently Asked Questions
        </h2>

        {/* Accordions Wrapper */}
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] md:p-8">
          {PRICING_FAQ.map((faq) => (
            <AccordionItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
