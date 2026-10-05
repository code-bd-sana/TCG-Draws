import React from "react";
import SettingsManager from "../../../components/dashboard/shared/settings/SettingsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Dashboard",
  description: "Manage your profile, security, and notification settings.",
};

export default function SharedSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      <div>
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight mb-2">
          Account &amp; Security Settings
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Manage your personal details, security preferences, and notification settings.
        </p>
      </div>
      
      <SettingsManager />
    </div>
  );
}
