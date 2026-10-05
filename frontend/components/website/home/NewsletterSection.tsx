"use client";

import React, { useState } from "react";

/**
 * Newsletter Section — premium light-themed email subscription.
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
    <section className="py-20 bg-white border-t border-[#EFF4ED]">
      <div className="container-custom">

        <div className="relative bg-[#0b4d35] rounded-[28px] px-8 md:px-16 py-14 md:py-16 max-w-5xl mx-auto text-center overflow-hidden shadow-2xl">
          {/* Decorative rings */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border-2 border-white/10 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full border-2 border-white/8 pointer-events-none" />
          {/* Red accent glow */}
          <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-[#dc2626]/8 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
              Newsletter
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
              Never Miss a Golf Draw
            </h2>
            <p className="font-sans text-sm text-white/70 leading-relaxed mb-10 max-w-lg mx-auto">
              Get weekly notifications when new premium golf competitions, luxury prizes, or exclusive instant wins go live. Unsubscribe anytime.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-sans text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-emerald-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Thank you! You&apos;re now subscribed. ⛳
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 focus:border-white/50 text-white placeholder:text-white/40 px-5 py-3.5 rounded-2xl text-sm font-sans outline-none transition-colors duration-200"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-white text-[#0b4d35] font-sans text-sm font-black tracking-wider uppercase rounded-2xl hover:bg-[#F1F5EE] active:scale-[0.98] transition-all duration-200 shadow-lg whitespace-nowrap"
                >
                  Subscribe →
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
