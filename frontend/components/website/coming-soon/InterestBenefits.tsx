"use client";

import React from "react";

const BENEFITS = [
  {
    emoji: "🏆",
    title: "Launch Day Raffles",
    description:
      "Be first to enter inaugural competitions — Titleist drivers, TaylorMade irons, Scotty Cameron putters & VIP PGA tickets.",
    tag: "Players",
  },
  {
    emoji: "💰",
    title: "Zero Host Fees",
    description:
      "Golf clubs & organizers who register early lock in zero platform commission for their first 3 competitions.",
    tag: "Hosts",
  },
  {
    emoji: "✅",
    title: "100% Certified Gear",
    description:
      "Every item is brand-new, verified authentic, and fully compliant with UK raffle regulations — guaranteed.",
    tag: "All Members",
  },
];

/**
 * Premium VIP Waitlist Privileges section — Fairway Draws.
 * Large icon cards with hover glow and a subtle top header.
 */
export default function InterestBenefits() {
  return (
    <section className="w-full max-w-6xl mx-auto px-2 md:px-0 pb-6">

      {/* Section header */}
      <div className="text-center mb-10">
        <span className="inline-block text-[11px] font-black uppercase tracking-[0.22em] text-[#dc2626] mb-3">
          Why Register Early?
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0b4d35]">
          VIP Waitlist Privileges
        </h2>
        <p className="font-sans text-sm text-[#5e766c] mt-3 max-w-lg mx-auto leading-relaxed">
          Founding members unlock exclusive perks unavailable after launch day.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="group relative bg-white border border-[#0b4d35]/12 rounded-[20px] p-7 flex flex-col gap-4 hover:border-[#0b4d35]/35 hover:shadow-2xl hover:shadow-emerald-900/8 transition-all duration-300 overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#0b4d35]/4 via-transparent to-transparent pointer-events-none rounded-[20px]" />

            {/* Top row */}
            <div className="flex items-center justify-between">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#0b4d35]/8 border border-[#0b4d35]/15 flex items-center justify-center text-2xl group-hover:bg-[#0b4d35] group-hover:border-[#0b4d35] transition-all duration-300 shrink-0">
                <span className="group-hover:grayscale-0">{b.emoji}</span>
              </div>
              {/* Tag */}
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5e766c] border border-[#E2EADF] rounded-full px-3 py-1 bg-[#F8FAF6]">
                {b.tag}
              </span>
            </div>

            {/* Text */}
            <div>
              <h4 className="font-serif text-lg font-black text-[#0b4d35] mb-2">{b.title}</h4>
              <p className="font-sans text-sm text-[#334e43] leading-relaxed">{b.description}</p>
            </div>

            {/* Bottom accent line */}
            <div className="h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-[#0b4d35] to-[#dc2626]/50 rounded-full transition-all duration-500 ease-out mt-auto" />
          </div>
        ))}
      </div>

      {/* Bottom strip */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 py-5 px-6 bg-white border border-[#0b4d35]/10 rounded-2xl shadow-sm">
        {[
          { icon: "⛳", text: "UK Prize Competition Compliant" },
          { icon: "🔐", text: "GDPR & Data Protected" },
          { icon: "📦", text: "Prizes Dispatched Within 7 Days" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2.5 text-[#334e43]">
            <span className="text-lg">{item.icon}</span>
            <span className="font-sans text-xs font-semibold">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
