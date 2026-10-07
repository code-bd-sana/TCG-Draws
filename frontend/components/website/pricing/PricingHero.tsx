"use client";

import React, { useState } from "react";
import { BillingCycle } from "../../../types/pricing.types";
import PricingPlanGrid from "./PricingPlanGrid";
import { cn } from "../../../lib/utils";

/**
 * TCG Draws Pricing Hero section with billing toggle and plan grid.
 */
export default function PricingHero() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <section className="relative isolate w-full overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] pt-28 pb-16 md:pt-32 md:pb-20">
      {/* Dark Luxury Ambient Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090A0E] to-transparent" />
      </div>

      <div className="container-custom relative flex flex-col items-center z-10">
        {/* Host Badge Label */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-4 py-2 font-sans text-[10px] font-black tracking-[0.18em] text-[#F4EBD9] uppercase shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
            FOR CARD SHOPS, BREAKERS &amp; HOSTS
          </span>
        </div>

        {/* Hero Headers */}
        <h1 className="mb-4 max-w-3xl text-center font-heading text-3xl md:text-5xl font-black leading-[0.95] tracking-[-0.04em] text-[#F4EBD9] uppercase">
          CHOOSE YOUR HOSTING{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
            MEMBERSHIP PLAN
          </span>
        </h1>

        <p className="mb-8 max-w-xl rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/70 p-4 text-center font-sans text-xs sm:text-sm text-[#D6CEBC] shadow-lg backdrop-blur-md">
          Start free, upgrade as your card breaks scale. Automated draws, instant payouts, and zero hidden platform fees.
        </p>

        {/* Custom Toggle Billing Switcher */}
        <div className="mb-14 flex w-fit items-center gap-2 rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.7)] backdrop-blur-md select-none">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-xl px-6 py-2.5 font-heading text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer select-none",
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                : "text-[#A69B82] hover:text-[#F4EBD9]"
            )}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "rounded-xl px-6 py-2.5 font-heading text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none",
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                : "text-[#A69B82] hover:text-[#F4EBD9]"
            )}
          >
            Yearly
            <span
              className={cn(
                "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs transition-all duration-300",
                billingCycle === "yearly"
                  ? "bg-[#090A0E] text-[#D4AF37]"
                  : "bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]"
              )}
            >
              SAVE 20%
            </span>
          </button>
        </div>

        {/* Render Plans Grid */}
        <PricingPlanGrid billingCycle={billingCycle} />
      </div>
    </section>
  );
}
