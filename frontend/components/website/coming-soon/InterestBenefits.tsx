"use client";

import React from "react";

const BENEFITS = [
  {
    emoji: "🏆",
    title: "Launch Day Grails",
    description:
      "Be first to enter inaugural competitions — Base Set Charizards, Evolving Skies booster boxes, Luffy Manga rares & PSA 10 gem mint slabs.",
    tag: "Collectors",
  },
  {
    emoji: "💰",
    title: "Zero Host Fees",
    description:
      "TCG card shops & reputable community breakers who register early lock in 0% platform commission for their first 3 competitions.",
    tag: "Hosts & Breakers",
  },
  {
    emoji: "🛡️",
    title: "100% Certified Authentic",
    description:
      "Every graded slab and factory-sealed booster box is authenticated, tamper-sealed, and insured with tracked express delivery — guaranteed.",
    tag: "All Members",
  },
];

/**
 * Premium VIP Waitlist Privileges section — TCG Draws.
 * Art-Deco luxury gold & obsidian cards with hover aura.
 */
export default function InterestBenefits() {
  return (
    <section className="w-full max-w-6xl mx-auto px-2 md:px-0 pb-6">

      {/* Section header */}
      <div className="text-center mb-12">
        <span className="inline-block text-[11px] font-heading font-black uppercase tracking-[0.22em] text-[#D4AF37] mb-3">
          Why Register Early?
        </span>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F4EBD9] uppercase tracking-tight">
          VIP Waitlist Privileges
        </h2>
        <p className="font-sans text-sm text-[#A69B82] mt-3 max-w-lg mx-auto leading-relaxed">
          Founding members unlock exclusive ticket perks and priority access unavailable after public launch.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="group relative art-deco-card rounded-2xl p-7 flex flex-col gap-5 border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.45)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] transition-all duration-300 overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[rgba(212,175,55,0.08)] via-transparent to-transparent pointer-events-none rounded-2xl" />

            {/* Top row */}
            <div className="flex items-center justify-between">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-2xl group-hover:scale-105 group-hover:border-[#D4AF37] transition-all duration-300 shrink-0 shadow-sm">
                <span>{b.emoji}</span>
              </div>
              {/* Tag */}
              <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#D4AF37] border border-[rgba(212,175,55,0.25)] rounded-full px-3 py-1 bg-[#12151F]">
                {b.tag}
              </span>
            </div>

            {/* Text */}
            <div>
              <h4 className="font-heading font-black text-lg text-[#F4EBD9] uppercase tracking-wide mb-2 group-hover:text-[#D4AF37] transition-colors">
                {b.title}
              </h4>
              <p className="font-sans text-xs sm:text-sm text-[#C8BFAD] leading-relaxed">
                {b.description}
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-[#F5E5C0] via-[#D4AF37] to-transparent rounded-full transition-all duration-500 ease-out mt-auto" />
          </div>
        ))}
      </div>

      {/* Bottom trust strip */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 py-5 px-6 art-deco-card rounded-2xl border border-[rgba(212,175,55,0.2)] shadow-card">
        {[
          { icon: "🛡️", text: "UK Prize Competition Compliant" },
          { icon: "🔐", text: "GDPR & Encrypted Payment Data" },
          { icon: "📦", text: "Insured Tracked Courier Dispatch" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2.5 text-[#C8BFAD]">
            <span className="text-lg">{item.icon}</span>
            <span className="font-sans text-xs font-semibold text-[#F4EBD9]">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
