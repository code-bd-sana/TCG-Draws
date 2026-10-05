"use client";

import React from "react";

export default function LiveDrawMonitor() {
  return (
    <div className="flex flex-col w-full bg-accent-bg border border-primary/30 rounded-card p-6 mb-8 shadow-xs animate-fadeIn">
      <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight mb-6">Live Draw Monitor</h3>
      
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
        {/* Pulsing Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full bg-primary/20 animate-ping opacity-75"></div>
          <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary text-white flex items-center justify-center z-10 shadow-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        
        {/* Text */}
        <p className="font-sans text-xs text-text-secondary">
          Drawing winner from <strong className="font-bold text-text-brand">verified ticket entries</strong> for active competition...
        </p>
      </div>
    </div>
  );
}
