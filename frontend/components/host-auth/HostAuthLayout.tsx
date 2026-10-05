"use client";

import React from "react";
import HostAuthBrandPanel from "./HostAuthBrandPanel";

interface HostAuthLayoutProps {
  children: React.ReactNode;
  mode: "login" | "register";
  currentStep?: number;
}

export default function HostAuthLayout({
  children,
  mode,
  currentStep = 1,
}: HostAuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#090A0E] text-[#F4EBD9] lg:grid lg:grid-cols-[40%_60%] xl:grid-cols-[38%_62%] relative overflow-x-hidden">
      {/* Subtle ambient gold aura lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(180,140,40,0.05)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Left panel - brand and status */}
      <div className="w-full lg:h-screen lg:sticky lg:top-0 z-10">
        <HostAuthBrandPanel mode={mode} currentStep={currentStep} />
      </div>

      {/* Right panel - form content card */}
      <main className="relative z-10 flex w-full items-center justify-center overflow-y-auto px-4 pt-6 pb-20 sm:px-6 sm:pt-8 md:px-10 lg:p-12 xl:p-16">
        <div className="w-full max-w-3xl flex flex-col justify-center my-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
