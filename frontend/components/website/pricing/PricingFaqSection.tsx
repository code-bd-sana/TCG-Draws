"use client";

import React, { useState } from "react";
import { PRICING_FAQ } from "../../../data/pricing/pricing-faq.data";
import AccordionItem from "../shared/AccordionItem";

/**
 * Pricing Page FAQ Section using the shared AccordionItem component.
 * Allows expansion of one question at a time.
 */
export default function PricingFaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full border-b border-[#bcd5b8] bg-[#dcebd8] py-20">
      <div className="container-custom max-w-3xl flex flex-col items-center">
        
        {/* Title Heading */}
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-text-primary text-center mb-10 tracking-tight">
          Frequently Asked Questions
        </h2>

        {/* Accordions Wrapper */}
        <div className="flex w-full flex-col gap-1 rounded-[18px] border border-[#bdd3ba] bg-[#edf5e9] p-6 shadow-[0_12px_28px_rgba(11,77,53,.1)] md:p-8">
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
