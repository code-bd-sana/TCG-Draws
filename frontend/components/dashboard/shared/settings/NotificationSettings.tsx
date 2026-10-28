"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [newCompetitions, setNewCompetitions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Notification preferences updated successfully!");
    }, 600);
  };

  const notificationOptions = [
    {
      title: "Essential Security & Account Alerts",
      description: "Critical notifications regarding password changes, new logins, ticket purchase receipts, and winning claims.",
      state: emailAlerts,
      toggle: () => setEmailAlerts(!emailAlerts),
    },
    {
      title: "New Competitions & Provably Fair Draws",
      description: "Be alerted whenever new Pokémon, One Piece, or MTG raffles drop and when live winner draws commence.",
      state: newCompetitions,
      toggle: () => setNewCompetitions(!newCompetitions),
    },
    {
      title: "Marketing & Platform VIP Offers",
      description: "Receive exclusive promotional ticket drop discounts, seasonal promotions, and platform milestone perks.",
      state: marketing,
      toggle: () => setMarketing(!marketing),
    },
  ];

  return (
    <div className="art-deco-card rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card animate-fadeIn border border-border">
      {/* Section Header */}
      <div className="pb-4 border-b border-border/80">
        <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
          Notification Preferences
        </h2>
        <p className="font-sans text-xs text-text-muted mt-0.5">
          Select communication channels and choose which platform notifications reach your inbox.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {notificationOptions.map((opt, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded-xl bg-surface/70 border border-border gap-4"
          >
            <div className="flex flex-col gap-0.5 min-w-0 pr-2">
              <span className="font-heading font-bold text-xs sm:text-sm text-text-primary">
                {opt.title}
              </span>
              <span className="font-sans text-xs text-text-muted leading-relaxed">
                {opt.description}
              </span>
            </div>

            <button
              type="button"
              onClick={opt.toggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                opt.state ? "bg-primary" : "bg-neutral-700"
              }`}
              role="switch"
              aria-checked={opt.state}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  opt.state ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border/80">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-gold-metallic h-10 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
