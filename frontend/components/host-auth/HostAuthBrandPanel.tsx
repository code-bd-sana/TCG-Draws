"use client";

import React from "react";
import FairwayDrawsLogo from '../website/shared/FairwayDrawsLogo';
import { cn } from "../../lib/utils";

interface HostAuthBrandPanelProps {
  mode: "login" | "register";
  currentStep?: number;
}

export default function HostAuthBrandPanel({
  mode,
  currentStep = 1,
}: HostAuthBrandPanelProps) {
  // Trust stats for Login screen
  const trustStats = [
    {
      label: "2,400+ Competitions Hosted",
      icon: (
        <svg
          className="w-[18px] h-[18px] text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
    },
    {
      label: "£350,000+ Paid Out to Breakers",
      icon: (
        <svg
          className="w-[18px] h-[18px] text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.268-.118a5.5 5.5 0 007.702-6.183L16.2 6.642m-7.2 9.358a5.5 5.5 0 01-3.66-4.996l.006-.05a5.5 5.5 0 018.66-4.332"
          />
        </svg>
      ),
    },
    {
      label: "Real-Time Live Break Analytics",
      icon: (
        <svg
          className="w-[18px] h-[18px] text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
          />
        </svg>
      ),
    },
  ];

  // Stepper tracker steps for Registration flow
  const registrationSteps = [
    { number: 1, label: "Account Setup", stepIds: [1, 2] },
    { number: 2, label: "Breaker / Shop Info", stepIds: [3] },
    { number: 3, label: "Logo & Branding", stepIds: [4] },
    { number: 4, label: "Bank Payouts", stepIds: [5, 8] },
  ];

  const getStepStatus = (stepIds: number[]) => {
    const isActive = stepIds.includes(currentStep);
    const maxStepId = Math.max(...stepIds);
    const isCompleted = currentStep > maxStepId;

    if (isActive) return "active";
    if (isCompleted) return "completed";
    return "inactive";
  };

  return (
    <div className="relative isolate flex h-full flex-col justify-between overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#0C0E14] px-6 py-8 md:px-[60px] lg:px-[70px] md:py-[50px] lg:py-[64px] lg:min-h-screen lg:border-r lg:border-[rgba(212,175,55,0.2)] lg:border-b-0">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.12)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
      </div>

      {/* Top Branding Logo */}
      <div className="relative z-10">
        <FairwayDrawsLogo variant="dark" size="lg" priority />
      </div>

      {/* Center Body Panel */}
      <div className="relative z-10 my-10 lg:my-auto flex flex-col gap-8 w-full max-w-[580px]">
        {/* Header Text Group */}
        <div className="flex flex-col gap-4 items-start">
          {/* Community Pill Badge */}
          <div className="bg-[#141722] border border-[rgba(212,175,55,0.3)] px-3.5 py-1 rounded-full shadow-sm">
            <p className="font-heading font-bold text-[10px] md:text-[11px] text-[#D4AF37] tracking-[0.2em] uppercase whitespace-nowrap">
              {mode === "login" ? "TCG HOST VAULT" : "VERIFIED TCG BREAKER"}
            </p>
          </div>

          {/* Hero Headlines */}
          <div className="flex flex-col items-start w-full">
            <h1 className="font-heading font-black text-[30px] md:text-[40px] text-[#F4EBD9] leading-[1.15] tracking-tight select-none">
              {mode === "login"
                ? "Manage Your Card Draws"
                : "Become a Verified TCG Host"}
            </h1>
          </div>
          <div className="max-w-[420px] w-full">
            <p className="font-sans font-normal text-sm md:text-base text-[#A69B82] leading-relaxed">
              {mode === "login"
                ? "Log in to manage your active draws, track ticket sales, and receive instant payouts."
                : "Host draws for graded slabs, booster boxes, and vintage collections. Applications reviewed in 24h."}
            </p>
          </div>
        </div>

        {/* Bottom Feature Details / Tracker */}
        <div className="mt-2">
          {mode === "login" ? (
            /* Login Trust Stats list */
            <div className="flex flex-col gap-[16px]">
              {trustStats.map((stat, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#141722] border border-[rgba(212,175,55,0.3)] shrink-0">
                    {stat.icon}
                  </div>
                  <span className="font-sans font-medium text-sm text-[#F4EBD9] leading-[21px] whitespace-nowrap">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Registration stepper */
            <div className="flex flex-col gap-0 select-none">
              {registrationSteps.map((step, index) => {
                const status = getStepStatus(step.stepIds);
                const isLast = index === registrationSteps.length - 1;

                return (
                  <div key={step.number} className="flex gap-[14px] items-start">
                    {/* Visual Connector Column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-[34px] h-[34px] rounded-full border transition-all duration-300 font-heading text-xs shadow-sm",
                          status === "active" && "btn-gold-metallic text-[#090A0E] font-black border-[#F5E5C0] shadow-[0_0_15px_rgba(212,175,55,0.45)] ring-2 ring-[rgba(212,175,55,0.3)]",
                          status === "completed" && "bg-[#141722] border-[#D4AF37] text-[#D4AF37] font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]",
                          status === "inactive" && "bg-[#090A0E] border-[rgba(212,175,55,0.2)] text-[#A69B82] font-semibold"
                        )}
                      >
                        {status === "completed" ? (
                          <svg
                            className="w-4 h-4 text-[#D4AF37]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                      {!isLast && (
                        <div className="py-[3px]">
                          <div
                            className={cn(
                              "w-0.5 h-[34px] transition-colors duration-300",
                              status === "completed" || status === "active" ? "bg-[#D4AF37]" : "bg-[rgba(212,175,55,0.2)]"
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Step Label Column */}
                    <div className="pt-[6px] pb-[34px]">
                      <p
                        className={cn(
                          "font-heading text-xs md:text-sm uppercase tracking-wider transition-colors duration-300 whitespace-nowrap",
                          status === "active" && "text-[#D4AF37] font-black drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]",
                          status === "completed" && "text-[#F4EBD9] font-bold",
                          status === "inactive" && "text-[#A69B82] font-semibold"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Copy */}
      <div className="relative z-10 mt-8 lg:mt-0">
        <p className="font-sans font-medium text-[11px] text-[#A69B82] whitespace-nowrap">
          © {new Date().getFullYear()} TCG DRAWS · Privacy Policy · Terms
        </p>
      </div>
    </div>
  );
}
