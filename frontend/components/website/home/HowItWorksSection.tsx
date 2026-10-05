import React from "react";
import Link from "next/link";

const STEPS = [
  {
    n: 1,
    emoji: "🔍",
    title: "Choose Your Draw",
    desc: "Browse active golf competitions — premium drivers, luxury irons, Scotty Cameron putters, or VIP PGA tournament tickets.",
  },
  {
    n: 2,
    emoji: "🎟️",
    title: "Buy Your Tickets",
    desc: "Answer a quick entry question and choose your tickets securely. Free and paid competitions may be available, depending on the draw.",
  },
  {
    n: 3,
    emoji: "🏆",
    title: "Win Your Prize",
    desc: "When ticket sales close or the timer ends, the winner is drawn live using a random lottery ball machine for a fair and transparent result.",
  },
];

/**
 * How It Works section — 3-step premium layout with connector line.
 */
export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#F8FAF6] border-t border-[#EFF4ED]">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#dc2626] block mb-2">Simple Process</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0b4d35]">How Fairway Draws Works</h2>
          <p className="font-sans text-sm text-[#5e766c] mt-3 max-w-md mx-auto leading-relaxed">
            Enter draws in three simple steps and win high-end golf gear. Transparent, secure, and certified.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[52px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-[#0b4d35]/20 to-transparent z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
            {STEPS.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center group">
                {/* Circle */}
                <div className="relative mb-7">
                  <div className="w-[104px] h-[104px] rounded-full bg-white border-2 border-[#0b4d35]/20 flex items-center justify-center text-4xl shadow-md group-hover:border-[#0b4d35]/50 group-hover:shadow-lg transition-all duration-300">
                    {step.emoji}
                  </div>
                  {/* Number badge */}
                  <span className="absolute -top-1 -right-1 w-7 h-7 flex items-center justify-center bg-[#0b4d35] text-white font-sans font-black text-xs rounded-full shadow-md">
                    {step.n}
                  </span>
                </div>

                <h3 className="font-serif font-black text-xl text-[#0b4d35] mb-3">{step.title}</h3>
                <p className="font-sans text-sm text-[#334e43] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-14">
          <Link
            href="/host-rules"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#0b4d35]/25 text-[#0b4d35] font-sans text-sm font-bold tracking-wider uppercase rounded-2xl hover:bg-[#F1F5EE] hover:border-[#0b4d35]/40 transition-all duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.054.955l-.448 1.002a.75.75 0 0 1-1.059.416l-.018-.01a.75.75 0 0 1-.416-1.059l.448-1.002Zm.75-3c.414 0 .75-.336.75-.75s-.336-.75-.75-.75-.75.336-.75.75.336.75.75.75Zm-.008 9a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
            </svg>
            Read Full Host Rules
          </Link>
        </div>

      </div>
    </section>
  );
}
