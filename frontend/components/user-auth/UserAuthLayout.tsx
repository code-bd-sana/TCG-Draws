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
    <div className="min-h-screen w-full flex flex-col bg-[#cfdfcb] bg-[radial-gradient(#0b4d3520_1px,transparent_1px)] bg-[size:28px_28px] lg:grid lg:grid-cols-[38%_62%]">
      {/* Left panel - brand and status */}
      <div className="w-full lg:h-screen lg:sticky lg:top-0">
        <UserAuthBrandPanel mode={mode} />
      </div>

      {/* Right panel - form content card */}
      <main className="flex w-full items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-16 xl:p-24 [&_.bg-surface]:bg-[#edf5e9] [&_.bg-bg]:bg-[#f8fbf6] [&_.border-divider]:border-[#bdd3ba] [&_input]:border-[#bdd3ba] [&_textarea]:border-[#bdd3ba]">
        <div className="w-full max-w-3xl flex flex-col justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
