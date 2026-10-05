"use client";

import React, { useState } from "react";
import { entrantSteps, hostSteps } from "../../../data/how-it-works/how-it-works-steps.data";
import { cn } from "../../../lib/utils";

/**
 * Interactive steps section allowing toggling between Entrant and Host guides.
 * Renders a responsive vertical timeline with circles and connecting vertical lines.
 */
export default function HowItWorksStepsSection() {
  const [activeTab, setActiveTab] = useState<"entrants" | "hosts">("entrants");

  const steps = activeTab === "entrants" ? entrantSteps : hostSteps;

  return (
    <section className="relative bg-[#cfdfcb] py-16 before:absolute before:inset-0 before:bg-[radial-gradient(#0b4d3520_1px,transparent_1px)] before:bg-[size:28px_28px] md:py-24">
      <div className="container-custom relative">
        {/* Tab Swapper Segment Capsule */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-1.5 rounded-full border border-[#0b4d35]/20 bg-[#e8f2e5] p-1.5 shadow-[0_8px_18px_rgba(11,77,53,.12)] select-none">
            <button
              onClick={() => setActiveTab("entrants")}
              className={cn(
                "px-6 py-2.5 rounded-full font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer",
                activeTab === "entrants"
                  ? "bg-primary text-primary-text shadow-md"
                  : "text-[#426256] hover:text-[#0b4d35]"
              )}
            >
              I Want to Enter Draws
            </button>
            <button
              onClick={() => setActiveTab("hosts")}
              className={cn(
                "px-6 py-2.5 rounded-full font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer",
                activeTab === "hosts"
                  ? "bg-primary text-primary-text shadow-md"
                  : "text-[#426256] hover:text-[#0b4d35]"
              )}
            >
              I Want to Host Draws
            </button>
          </div>
        </div>

        {/* Timeline Layout */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative pl-14 sm:pl-20">
            {/* Connecting Vertical Green Line */}
            <div className="absolute bottom-[28px] left-[27px] top-[28px] w-px bg-[#0b4d35]/25 sm:left-[27px]" />

            {/* List of Timeline Steps */}
            <div className="flex flex-col gap-8 sm:gap-10">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group"
                >
                  {/* Circular Number Indicator */}
                  <div className="absolute left-[-56px] z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#0b4d35]/25 bg-[#ecf5ee] font-heading text-lg font-black text-[#0b4d35] shadow-md select-none transition-colors duration-300 group-hover:border-primary sm:left-[-80px]">
                    {String(step.stepNumber).padStart(2, "0")}
                  </div>

                  {/* Step Description Card */}
                  <div className="w-full rounded-[20px] border border-[#bdd3ba] bg-[#f0f6ed] p-6 shadow-[0_10px_25px_rgba(11,77,53,.09)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0b4d35]/40 hover:shadow-[0_18px_32px_rgba(11,77,53,.16)] sm:p-8">
                    <h3 className="font-heading font-semibold text-lg md:text-xl text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed max-w-[933px]">
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
