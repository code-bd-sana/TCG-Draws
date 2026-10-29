"use client";

import React, { useState } from "react";
import { cn } from "../../../lib/utils";

interface ContactFaq {
  q: string;
  a: string;
  category: string;
}

const CONTACT_FAQS: ContactFaq[] = [
  {
    category: "Prizes & Claims",
    q: "How do I claim my prize if I win a draw or hit an Instant Win?",
    a: "If you win an Instant Win prize during checkout, it is immediately registered to your profile under Dashboard > My Wins. For main competition draws, our concierge team contacts you via your registered email within 24 hours of the draw closing to confirm your insured shipping address. High-value graded slabs and booster boxes are dispatched via Royal Mail Special Delivery Guaranteed.",
  },
  {
    category: "Fair Play & Verification",
    q: "How are competition winners chosen and verified?",
    a: "Every competition uses provably fair, certified random number selection streamed live on stream channels. Entrant ticket manifests with assigned ticket numbers are locked in the database before the draw begins. After every draw, the result is permanently documented on our Winners Gallery.",
  },
  {
    category: "Free Postal Entry",
    q: "How do I enter competitions for free via the postal entry route?",
    a: "In full compliance with UK prize competition legislation, every draw offers a free postal entry route. Send a handwritten postcard containing your full name, home address, email, telephone number, and the exact competition title to: TCG Draws Ltd, PO Box 99, Manchester, M1 1AA, United Kingdom. Postal entries are processed with equal odds as paid tickets.",
  },
  {
    category: "Hosting & Partnerships",
    q: "How can card shops and live breakers apply to host draws on TCG Draws?",
    a: "Verified card shops, hobby stores, and streamers can apply through our 'Become a Host' portal. We verify your trading history and authentic card inventory to maintain our community's trust. Once approved, your host dashboard is activated with automated ticket allocations and instant payouts.",
  },
  {
    category: "Payments & Orders",
    q: "What should I do if my payment was deducted but tickets aren't showing?",
    a: "Ticket allocations are automated and usually reflect immediately in your account. If your bank required 3D Secure authorization and the redirect was interrupted, the payment gateway webhook will synchronize within 5-10 minutes. If your tickets do not appear, send a quick message to our WhatsApp desk (+44 7466 347548) with your email and bank transaction reference.",
  },
];

export default function ContactFaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full mt-16 pt-16 border-t border-[rgba(212,175,55,0.2)]">
      <div className="text-center mb-10">
        <span className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
          INSTANT RESOLUTIONS
        </span>
        <h2 className="mt-2 font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] uppercase tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-1 font-sans text-xs sm:text-sm text-[#A69B82]">
          Quick answers to our most common entrant, claim, and host inquiries.
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {CONTACT_FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={faq.q}
              className={cn(
                "rounded-2xl border transition-all duration-300 overflow-hidden",
                isOpen
                  ? "bg-[#12151F] border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(212,175,55,0.12)]"
                  : "bg-[#12151F]/70 border-[rgba(212,175,55,0.18)] hover:border-[#D4AF37]/35"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer select-none gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#181C28] font-mono text-xs font-bold text-[#D4AF37]">
                    0{idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#D4AF37]">
                      {faq.category}
                    </span>
                    <span className="font-heading font-black text-sm text-[#F4EBD9]">
                      {faq.q}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                    isOpen
                      ? "bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                      : "bg-[#181C28] border-[rgba(212,175,55,0.3)] hover:border-[#D4AF37]"
                  )}
                >
                  <svg
                    className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      isOpen ? "rotate-180" : ""
                    )}
                    style={{ color: isOpen ? "#090A0E" : "#D4AF37" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#D6CEBC] font-sans leading-relaxed border-t border-[rgba(212,175,55,0.1)]">
                  <p className="max-w-3xl">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
