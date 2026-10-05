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
    <div className="min-h-screen w-full flex flex-col bg-[#cfdfcb] bg-[radial-gradient(#0b4d3520_1px,transparent_1px)] bg-[size:28px_28px] lg:grid lg:grid-cols-[38%_62%]">
      {/* Left panel - brand and status */}
      <div className="w-full lg:h-screen lg:sticky lg:top-0">
        <HostAuthBrandPanel mode={mode} currentStep={currentStep} />
      </div>

      {/* Right panel - form content card */}
      <main className="flex w-full items-center justify-center overflow-y-auto px-4 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 sm:pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:px-10 md:pt-10 md:pb-[calc(8rem+env(safe-area-inset-bottom,0px))] lg:p-16 xl:p-24 [&_.bg-surface]:bg-[#edf5e9] [&_.bg-bg]:bg-[#f8fbf6] [&_.border-divider]:border-[#bdd3ba] [&_input]:border-[#bdd3ba] [&_textarea]:border-[#bdd3ba]">
        <div className="w-full max-w-3xl flex flex-col justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
