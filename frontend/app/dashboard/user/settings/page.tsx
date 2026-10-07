import React from "react";

export default function UserSettingsPage() {
  return (
    <div className="flex flex-col items-center gap-6 p-6 lg:p-8 max-w-[840px] mx-auto w-full animate-fadeIn">
      
      {/* Header */}
      <div className="w-full flex flex-col gap-1 pb-2 border-b border-divider">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Account Settings
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Manage privacy preferences, two-factor authentication, and active browser sessions.
        </p>
      </div>

      {/* Privacy Card */}
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col gap-6 shadow-card">
        <h2 className="font-heading font-black text-base text-text-primary uppercase tracking-tight pb-3 border-b border-divider">
          Privacy
        </h2>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-xs text-text-primary">Show my name on public Winners page</span>
              <span className="font-sans text-xs text-text-muted">Your name will be visible in the verified Winners gallery</span>
            </div>
            {/* Active Toggle */}
            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer shrink-0 transition-colors shadow-xs">
              <div className="absolute top-[3px] right-[3px] w-4.5 h-4.5 bg-black rounded-full shadow-sm transition-transform" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-xs text-text-primary">Allow host communications</span>
              <span className="font-sans text-xs text-text-muted">Draw hosts can send you direct messages regarding active raffles</span>
            </div>
            {/* Inactive Toggle */}
            <div className="w-10 h-6 bg-elevated border border-border-medium rounded-full relative cursor-pointer shrink-0 transition-colors">
              <div className="absolute top-[2px] left-[3px] w-4.5 h-4.5 bg-text-muted rounded-full shadow-sm transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col gap-6 shadow-card">
        <h2 className="font-heading font-black text-base text-text-primary uppercase tracking-tight pb-3 border-b border-divider">
          Security
        </h2>
        
        <div className="flex items-center justify-between pb-6 border-b border-divider">
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-xs text-text-primary">Two-Factor Authentication</span>
            <span className="font-sans text-xs text-text-muted">Add an extra layer of security to your collector account</span>
          </div>
          {/* Inactive Toggle */}
          <div className="w-10 h-6 bg-elevated border border-border-medium rounded-full relative cursor-pointer shrink-0 transition-colors">
            <div className="absolute top-[2px] left-[3px] w-4.5 h-4.5 bg-text-muted rounded-full shadow-sm transition-transform" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Active Collector Sessions
          </span>
          
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-elevated border border-border-medium">
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-bold text-xs text-text-primary">MacBook Pro — Chrome</span>
              <span className="font-sans text-xs text-primary font-semibold">Manchester, UK • Current session</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold font-sans text-primary uppercase">Active Now</span>
          </div>
          
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-elevated border border-border-medium">
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-bold text-xs text-text-primary">iPhone 14 — Safari</span>
              <span className="font-sans text-xs text-text-muted">Manchester, UK</span>
            </div>
            <button className="font-heading font-bold text-xs uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Delete My Account Card */}
      <div className="w-full bg-surface border border-red-900/40 rounded-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
        <div className="flex flex-col gap-1">
          <span className="font-heading font-black text-sm text-red-400 uppercase tracking-tight">Delete My Account</span>
          <span className="font-sans text-xs text-text-muted">This action is permanent and will remove all active ticket entries and transaction logs.</span>
        </div>
        
        <button className="px-5 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200 font-heading font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-sm">
          Delete Account
        </button>
      </div>

    </div>
  );
}
