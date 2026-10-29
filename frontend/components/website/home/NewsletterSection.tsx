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
    <section className="relative py-24 bg-[#090A0E] border-t border-[rgba(212,175,55,0.15)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        <div className="relative art-deco-card rounded-3xl px-8 md:px-16 py-14 md:py-16 max-w-5xl mx-auto text-center overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(212,175,55,0.18)]">
          {/* Decorative gold ambient aura */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-[rgba(212,175,55,0.2)] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full border border-[rgba(212,175,55,0.15)] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[40%] h-[60%] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C0E14] border border-[rgba(212,175,55,0.35)] text-[#D4AF37] text-[11px] font-heading font-black uppercase tracking-widest mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>VIP VAULT CLUB ACCESS</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4EBD9] mb-4 uppercase tracking-tight leading-tight">
              Never Miss A High-End Drop
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-8 max-w-lg mx-auto">
              Get immediate notifications the exact moment vintage 1st Edition booster boxes, PSA &amp; BGS 10 slabs, or exclusive Pokémon Instant Win draws go live.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 font-sans text-sm font-semibold shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Welcome to the VIP Vault Club! You are now on the priority drop list. ✨</span>
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
                  className="btn-gold-metallic px-7 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider active:scale-[0.98] transition-all duration-200 shadow-lg whitespace-nowrap cursor-pointer hover:scale-[1.02]"
                >
                  Join Vault Club &rarr;
                </button>
              </form>
            )}

            {/* Privacy micro-assurance */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[10px] font-mono text-[#A69B82]">
              <span className="flex items-center gap-1">
                <span>🔒</span> No spam guarantee
              </span>
              <span>•</span>
              <span>Only high-tier grails</span>
              <span>•</span>
              <span>Instant 1-click unsubscribe</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
