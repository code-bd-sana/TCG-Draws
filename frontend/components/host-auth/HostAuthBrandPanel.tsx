"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
      label: "2,400 Draws Completed",
      icon: (
        <svg
          className="w-[18px] h-[18px]"
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
      label: "£284,600 Paid to Hosts",
      icon: (
        <svg
          className="w-[18px] h-[18px]"
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
      label: "Real-Time Sales Dashboard",
      icon: (
        <svg
          className="w-[18px] h-[18px]"
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
    { number: 1, label: "Account Details", stepIds: [1, 2] },
    { number: 2, label: "Business Information", stepIds: [3] },
    { number: 3, label: "Logo & Branding", stepIds: [4] },
    { number: 4, label: "Payout Details", stepIds: [5, 8] },
  ];

  const getStepStatus = (stepIds: number[]) => {
    // If the active step matches any of the step's component parts
    const isActive = stepIds.includes(currentStep);
    // Find the highest step ID represented in this group
    const maxStepId = Math.max(...stepIds);
    const isCompleted = currentStep > maxStepId;

    if (isActive) return "active";
    if (isCompleted) return "completed";
    return "inactive";
  };

  return (
    <div className="relative isolate flex h-full flex-col justify-between overflow-hidden border-b border-[#bdd3ba] bg-[#e5f0e2] bg-[url('/hero-banner.jpg')] bg-cover bg-[position:left_center] px-6 py-8 before:absolute before:inset-0 before:z-0 before:bg-gradient-to-b before:from-[#f4faf1]/96 before:via-[#e5f0e2]/92 before:to-[#c9dec4]/96 [&>*]:relative [&>*]:z-10 md:px-[60px] lg:px-[80px] md:py-[50px] lg:py-[64px] lg:min-h-screen lg:w-[795px] lg:border-r-0 lg:border-b-0">
      {/* Top Branding Logo */}
      <div>
        <FairwayDrawsLogo variant="light" size="lg" priority />
      </div>

      {/* Center Body Panel */}
      <div className="my-10 lg:my-auto flex flex-col gap-8 w-full max-w-[635px]">
        {/* Header Text Group */}
        <div className="flex flex-col gap-5 items-start">
          {/* Community Pill Badge */}
          <div className="bg-accent-bg border border-border px-[11px] py-[4px] rounded-[99px]">
            <p className="font-sans font-medium text-[10px] md:text-[12px] text-primary tracking-[0.6px] uppercase whitespace-nowrap">
              JOIN THE COMMUNITY
            </p>
          </div>

          {/* Hero Headlines */}
          <div className="flex flex-col items-start w-full">
            <h1 className="font-heading font-bold text-[36px] md:text-[48px] text-text-primary leading-[1.1] md:leading-[80px] tracking-[0.24px] select-none">
              {mode === "login"
                ? "Run Your Own Golf Competitions"
                : "Become a Verified Host"}
            </h1>
          </div>
          <div className="max-w-[380px] w-full">
            <p className="font-sans font-normal text-[16px] md:text-[20px] text-text-secondary leading-normal w-[593px] max-w-full">
              {mode === "login"
                ? "Log in to manage your raffles, track sales, and view your earnings."
                : "Apply in minutes. Our team typically reviews applications within 24 hours."}
            </p>
          </div>
        </div>

        {/* Bottom Feature Details / Tracker */}
        <div className="mt-3">
          {mode === "login" ? (
            /* Login Trust Stats list */
            <div className="flex flex-col gap-[16px]">
              {trustStats.map((stat, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <div className="flex items-center justify-center w-[18px] h-[18px] text-text-secondary">
                    {stat.icon}
                  </div>
                  <span className="font-sans font-normal text-[14px] text-text-secondary leading-[21px] whitespace-nowrap">
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
                  <div key={step.number} className="flex gap-[12px] items-start">
                    {/* Visual Connector Column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-[34px] h-[34px] rounded-full border transition-all duration-300 font-heading text-[13px] shadow-sm",
                          status === "active" && "bg-primary border-primary text-white font-bold ring-4 ring-primary/20",
                          status === "completed" && "bg-primary border-primary text-white font-bold",
                          status === "inactive" && "bg-white border-primary/50 text-primary font-bold shadow-xs"
                        )}
                      >
                        {status === "completed" ? (
                          <svg
                            className="w-4 h-4"
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
                        <div className="py-[2px]">
                          <div
                            className={cn(
                              "w-px h-[36px] transition-colors duration-300",
                              status === "completed" || status === "active" ? "bg-primary" : "bg-primary/30"
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Step Label Column */}
                    <div className="pt-[6px] pb-[36px]">
                      <p
                        className={cn(
                          "font-sans text-[14px] leading-[19.5px] transition-colors duration-300 whitespace-nowrap",
                          status === "active" && "text-text-primary font-bold tracking-tight",
                          status === "completed" && "text-text-primary font-semibold",
                          status === "inactive" && "text-text-secondary font-semibold"
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
      <div className="mt-8 lg:mt-0">
        <p className="font-sans font-medium text-[11px] leading-[16.5px] text-text-secondary whitespace-nowrap">
          © {new Date().getFullYear()} Fairway Draws · Privacy Policy · Terms
        </p>
      </div>
    </div>
  );
}
