"use client";

import React from "react";
import UserAuthBrandPanel from "./UserAuthBrandPanel";

interface UserAuthLayoutProps {
  children: React.ReactNode;
  mode: "login" | "register" | "forgot" | "reset" | "verify";
}

export default function UserAuthLayout({
  children,
  mode,
}: UserAuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#090A0E] text-[#F4EBD9] lg:grid lg:grid-cols-[40%_60%] xl:grid-cols-[38%_62%] relative overflow-x-hidden">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(180,140,40,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Left panel - brand and status */}
      <div className="w-full lg:h-screen lg:sticky lg:top-0 z-10">
        <UserAuthBrandPanel mode={mode} />
      </div>

      {/* Right panel - form content card */}
      <main className="relative z-10 flex w-full items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 xl:p-16">
        <div className="w-full max-w-xl flex flex-col justify-center my-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
