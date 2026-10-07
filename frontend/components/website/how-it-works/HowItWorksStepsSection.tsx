"use client";

import React, { useState } from "react";
import { entrantSteps, hostSteps } from "../../../data/how-it-works/how-it-works-steps.data";
import { cn } from "../../../lib/utils";

/**
 * Interactive steps section allowing toggling between Entrant and Host guides.
 * Renders a responsive vertical timeline with obsidian cards and golden badges.
 */
export default function HowItWorksStepsSection() {
  const [activeTab, setActiveTab] = useState<"entrants" | "hosts">("entrants");

  const steps = activeTab === "entrants" ? entrantSteps : hostSteps;

  return (
    <section className="relative bg-[#090A0E] py-16 md:py-24">
      {/* Background Subtle Gradient & Grid Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />

      <div className="container-custom relative z-10">
        {/* Tab Swapper Segment Capsule */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-1.5 rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.6)] select-none">
            <button
              onClick={() => setActiveTab("entrants")}
              className={cn(
                "px-6 py-3 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer",
                activeTab === "entrants"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                  : "text-[#A69B82] hover:text-[#F4EBD9]"
              )}
            >
              I Want to Enter Draws
            </button>
            <button
              onClick={() => setActiveTab("hosts")}
              className={cn(
                "px-6 py-3 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer",
                activeTab === "hosts"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                  : "text-[#A69B82] hover:text-[#F4EBD9]"
              )}
            >
              I Want to Host Draws
            </button>
          </div>
        </div>

        {/* Timeline Layout */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative pl-14 sm:pl-20">
            {/* Connecting Vertical Gold Line */}
            <div className="absolute bottom-[28px] left-[27px] top-[28px] w-px bg-[rgba(212,175,55,0.2)] sm:left-[27px]" />

            {/* List of Timeline Steps */}
            <div className="flex flex-col gap-8 sm:gap-10">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group"
                >
                  {/* Circular Number Indicator */}
                  <div className="absolute left-[-56px] z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.35)] bg-[#181C28] font-heading text-lg font-black text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] select-none transition-all duration-300 group-hover:border-[#D4AF37] sm:left-[-80px]">
                    {String(step.stepNumber).padStart(2, "0")}
                  </div>

                  {/* Step Description Card */}
                  <div className="w-full rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#D4AF37]/50 group-hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] sm:p-8">
                    <h3 className="font-heading font-black text-lg md:text-xl text-[#F4EBD9] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {step.title}
                    </h3>
                    <p className="font-sans text-xs md:text-sm text-[#A69B82] leading-relaxed max-w-[933px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
