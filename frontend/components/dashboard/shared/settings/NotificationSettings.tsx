"use client";

import React, { useState } from "react";

export default function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [newCompetitions, setNewCompetitions] = useState(true);

  return (
    <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card animate-fadeIn">
      <div>
        <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">Notification Preferences</h2>
        <p className="font-sans text-xs text-text-muted mt-1">Manage how and when you receive alerts from Fairway Draws.</p>
      </div>

      <div className="h-px w-full bg-divider" />

      <div className="flex flex-col gap-6">
        
        {/* Toggle 1 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-6">
            <span className="font-heading font-bold text-sm text-text-primary">Essential Account Alerts</span>
            <span className="font-sans text-xs text-text-muted">Receive emails about password changes, successful purchases, and active ticket numbers.</span>
          </div>
          <button 
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-11 h-6 rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${emailAlerts ? 'bg-primary' : 'bg-elevated border border-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-6">
            <span className="font-heading font-bold text-sm text-text-primary">New Competitions &amp; Draws</span>
            <span className="font-sans text-xs text-text-muted">Get notified when new competitions drop or when live draws are about to begin.</span>
          </div>
          <button 
            onClick={() => setNewCompetitions(!newCompetitions)}
            className={`w-11 h-6 rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${newCompetitions ? 'bg-primary' : 'bg-elevated border border-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${newCompetitions ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 3 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-6">
            <span className="font-heading font-bold text-sm text-text-primary">Marketing &amp; Promotions</span>
            <span className="font-sans text-xs text-text-muted">Receive special offers, discount codes, and platform news.</span>
          </div>
          <button 
            onClick={() => setMarketing(!marketing)}
            className={`w-11 h-6 rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${marketing ? 'bg-primary' : 'bg-elevated border border-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${marketing ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

      </div>

    </div>
  );
}
