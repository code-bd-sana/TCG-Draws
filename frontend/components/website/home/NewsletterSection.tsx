"use client";

import React, { useState } from "react";

/**
 * Newsletter Section — luxury dark-themed collector email subscription.
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="py-20 bg-[#090A0E] border-t border-[rgba(212,175,55,0.15)]">
      <div className="container-custom">

        <div className="relative bg-gradient-to-b from-[#141722] to-[#0C0E14] border border-[rgba(212,175,55,0.3)] rounded-[28px] px-8 md:px-16 py-14 md:py-16 max-w-5xl mx-auto text-center overflow-hidden shadow-2xl">
          {/* Decorative gold ambient aura */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-[rgba(212,175,55,0.2)] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full border border-[rgba(212,175,55,0.15)] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[40%] h-[60%] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C0E14] border border-[rgba(212,175,55,0.35)] text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              VIP GRAIL ALERTS
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F4EBD9] mb-4 leading-tight">
              Never Miss a Grail Drop
            </h2>
            <p className="font-sans text-sm text-[#A69B82] leading-relaxed mb-10 max-w-lg mx-auto">
              Get instant alerts the second vintage 1st Edition booster boxes, PSA 10 slabs, or exclusive Pokémon instant win draws go live.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-[#34D399] font-sans text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#34D399]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Thank you! You are now subscribed to TCG DRAWS VIP alerts. ✨
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="collector@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 input-obsidian border border-[rgba(212,175,55,0.3)] focus:border-[#D4AF37] text-[#F4EBD9] placeholder:text-[#6E6655] px-5 py-3.5 rounded-xl text-sm font-sans outline-none transition-colors duration-200"
                />
                <button
                  type="submit"
                  className="btn-gold-metallic px-7 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider active:scale-[0.98] transition-all duration-200 shadow-lg whitespace-nowrap cursor-pointer"
                >
                  Subscribe &rarr;
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
