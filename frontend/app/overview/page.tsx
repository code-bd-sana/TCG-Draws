import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "@/components/website/layout/WebsiteNavbar";
import WebsiteFooter from "@/components/website/layout/WebsiteFooter";

export const metadata: Metadata = {
  title: "Platform Architecture & Flow | TCG Draws",
  description: "Interactive architectural overview of the TCG Draws platform lifecycle, from host onboarding and instant wins to verified escrow payouts.",
};

const steps = [
  {
    id: 1,
    title: "Host Onboarding & Competition Creation",
    role: "Verified Host",
    badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    description: "Verified card shops and reputable hosts register, select a subscription plan, and submit authenticated collectible card competitions with instant win mechanics.",
    details: [
      "Host submits business credentials & proof of inventory for verification.",
      "Purchases a Host subscription plan via Stripe checkout.",
      "Creates a new Raffle with graded slabs, sealed booster boxes, or raw singles.",
      "Allocates Instant Win prizes to cryptographically randomized ticket numbers."
    ]
  },
  {
    id: 2,
    title: "Admin Moderation & Quality Approval",
    role: "Compliance & Admin",
    badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-700",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    description: "Compliance admins review competition listings, verify authenticity proof (grading certs, seal integrity), and approve listings before they go live.",
    details: [
      "Admin reviews listing images, PSA/BGS cert numbers, and market RRP values.",
      "Ensures transparent Instant Win probability and statutory UK compliance.",
      "Approves competition (Status transitions to ACTIVE).",
      "Listing publishes globally to the TCG Draws live competitions catalog."
    ]
  },
  {
    id: 3,
    title: "Collector Entry & Instant Win Reveals",
    role: "Collector / Player",
    badgeColor: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
    iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: "Collectors browse active draws, buy tickets via PCI-DSS secure checkout, and immediately find out if they won an Instant Win prize.",
    details: [
      "Collector chooses tickets and completes payment via card or wallet.",
      "Database allocates verifiable unique ticket numbers to user account.",
      "System cross-references tickets against pre-allocated Instant Win numbers.",
      "If matched, Instant Win notification triggers immediately and enters profile dashboard."
    ]
  },
  {
    id: 4,
    title: "Live Draw, Tracked Dispatch & Escrow Release",
    role: "System & Escrow",
    badgeColor: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Once tickets sell out or the timer expires, a certified live RNG draw selects the main winner. Funds are released from Escrow upon verified delivery.",
    details: [
      "Main draw is executed via audited RNG and broadcast live.",
      "Winner details are published publicly for transparency.",
      "Host dispatches prizes via tracked, insured courier within 7 business days.",
      "Delivery is verified, platform commission is settled, and host payout is released."
    ]
  }
];

export default function OverviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E] font-sans">
      <WebsiteNavbar />
      
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4">
              <span>⚡ Platform Engineering &amp; Lifecycle</span>
            </div>
            
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#F4EBD9] uppercase tracking-tight mb-4">
              Platform Architecture &amp; Flow
            </h1>
            
            <p className="font-sans text-sm sm:text-base text-[#C8BFAD] max-w-2xl mx-auto leading-relaxed">
              Interactive high-level overview of the <strong className="text-[#F4EBD9]">TCG Draws</strong> lifecycle. 
              Understand how Collectors, Verified Hosts, and Compliance Admins interact with the ecosystem.
            </p>
          </div>

          {/* Timeline Container */}
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[rgba(212,175,55,0.3)] before:to-transparent">
            {steps.map((step) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                
                {/* Timeline Icon */}
                <div className={`flex items-center justify-center w-11 h-11 rounded-full border-2 border-[rgba(212,175,55,0.5)] ${step.iconBg} shadow-[0_0_20px_rgba(212,175,55,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110`}>
                  {step.icon}
                </div>
                
                {/* Timeline Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] art-deco-card p-6 sm:p-8 rounded-2xl border border-[rgba(212,175,55,0.25)] shadow-[0_15px_35px_rgba(0,0,0,0.7)] hover:border-[rgba(212,175,55,0.45)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-default relative overflow-hidden">
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${step.badgeColor}`}>
                        Step {step.id} • {step.role}
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-xl sm:text-2xl text-[#F4EBD9] uppercase tracking-tight mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-[#C8BFAD] mb-6 text-xs sm:text-sm leading-relaxed font-sans">
                      {step.description}
                    </p>
                    
                    <div className="bg-[#181C28] p-5 rounded-xl border border-[rgba(212,175,55,0.15)] group-hover:border-[rgba(212,175,55,0.3)] transition-colors duration-300">
                      <h4 className="font-heading font-bold text-xs text-[#D4AF37] uppercase mb-3 tracking-wider flex items-center">
                        <svg className="w-4 h-4 mr-2 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Ecosystem Execution Steps
                      </h4>
                      <ul className="space-y-2.5">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start text-xs sm:text-sm text-[#A69B82]">
                            <svg className="w-4 h-4 text-[#D4AF37] mr-2 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="art-deco-card rounded-2xl p-8 sm:p-10 border border-[rgba(212,175,55,0.25)] max-w-2xl mx-auto flex flex-col items-center">
              <h3 className="font-heading font-black text-2xl text-[#F4EBD9] uppercase tracking-tight mb-2">
                Ready to Experience TCG Draws?
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#A69B82] mb-6 max-w-md">
                Browse our live prize pools for Pokémon booster boxes, PSA 10 slabs, One Piece cards, and exclusive instant wins.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/live-raffles"
                  className="btn-gold-metallic px-8 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md"
                >
                  Explore Live Raffles →
                </Link>
                <Link
                  href="/host/register"
                  className="btn-dark-metallic px-6 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9]"
                >
                  Become a Verified Host
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <WebsiteFooter />
    </div>
  );
}
