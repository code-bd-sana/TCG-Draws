"use client";

import React, { useState } from "react";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";

type SettingsTab = "profile" | "security" | "notifications" | "billing";

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs = [
    {
      id: "profile" as const,
      label: "Profile Details",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      id: "security" as const,
      label: "Security & Keys",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      id: "notifications" as const,
      label: "Notifications",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      ),
    },
    {
      id: "billing" as const,
      label: "Billing & Invoices",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-[1400px] animate-fadeIn">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-[260px] shrink-0">
        <div className="art-deco-card rounded-2xl overflow-hidden flex flex-col p-3 shadow-xl border border-[rgba(212,175,55,0.2)]">
          <div className="px-3 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-[#D4AF37]">
            Preferences Navigation
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full h-11 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? "btn-gold-metallic text-[#090A0E] font-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                      : "text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "billing" && (
          <div className="art-deco-card rounded-card p-10 flex flex-col gap-4 items-center justify-center min-h-[420px] shadow-card border border-border text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-bg border border-primary/30 flex items-center justify-center text-text-brand shadow-inner mb-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
            </div>
            <h3 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
              Billing &amp; Invoice Portal
            </h3>
            <p className="font-sans text-xs text-text-muted max-w-[360px] leading-relaxed">
              Payment methods, automatic recurring host subscriptions, and tax invoice statements are securely managed via our PCI-DSS compliant vault.
            </p>
            <span className="px-3 py-1 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-xs uppercase mt-2">
              Automated Billing Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
