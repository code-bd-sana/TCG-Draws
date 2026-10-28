import React from "react";
import Link from "next/link";
import SettingsManager from "@/components/dashboard/shared/settings/SettingsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collector Settings | Dashboard | TCG Draws",
  description: "Manage collector preferences, security credentials, two-factor authentication, and notification settings.",
};

export default function UserSettingsPage() {
  return (
    <div className="relative flex flex-col gap-8 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn font-sans min-h-screen">
      {/* Ambient Art-Deco Lighting Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(212,175,55,0.15)] pb-6">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted">
            <Link 
              href="/dashboard/user" 
              className="hover:text-[#D4AF37] transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-[#D4AF37]/40">/</span>
            <span className="text-text-muted">User</span>
            <span className="text-[#D4AF37]/40">/</span>
            <span className="text-[#D4AF37]">Settings</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold block">
              Collector Preferences &amp; Vault
            </span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-tight">
            Account &amp; Security Settings
          </h1>

          <p className="font-sans text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            Manage your personal profile details, master credentials, two-factor authentication, and platform communication preferences.
          </p>
        </div>

        {/* Live System Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide uppercase">
              Vault Secured
            </span>
          </div>
        </div>
      </div>
      
      {/* Settings Navigation & Content */}
      <SettingsManager />
    </div>
  );
}
