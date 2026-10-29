"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SOCIAL_LINKS } from "../../../lib/constants";

/**
 * Checks whether the UK customer support desk is currently open.
 * Schedule (GMT): Mon-Fri 09:00-18:00, Sat 10:00-14:00, Sun Closed.
 */
function isSupportDeskOpen(): boolean {
  try {
    const now = new Date();
    // Format to UK timezone
    const ukTimeStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
    const ukDate = new Date(ukTimeStr);

    const day = ukDate.getDay(); // 0 = Sunday, 1 = Mon, ..., 6 = Sat
    const hours = ukDate.getHours();
    const minutes = ukDate.getMinutes();
    const currentDecimalHour = hours + minutes / 60;

    if (day >= 1 && day <= 5) {
      // Mon-Fri: 09:00 to 18:00
      return currentDecimalHour >= 9 && currentDecimalHour < 18;
    } else if (day === 6) {
      // Sat: 10:00 to 14:00
      return currentDecimalHour >= 10 && currentDecimalHour < 14;
    }
    // Sunday: Closed
    return false;
  } catch {
    return true;
  }
}

/**
 * Luxury VIP Sidebar contact details stack in TCG Draws Art-Deco Obsidian & Gold style.
 */
export default function ContactInfoCards() {
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    setIsOpenNow(isSupportDeskOpen());
    const interval = setInterval(() => {
      setIsOpenNow(isSupportDeskOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText("support@tcgdraws.com");
      setCopiedEmail(true);
      toast.success("Email address copied to clipboard!");
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      toast.error("Failed to copy email.");
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Direct VIP WhatsApp Channel Banner */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-[#25D366]/40 bg-gradient-to-br from-[#12151F] via-[#181C28] to-[#12151F] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.7)] group hover:border-[#25D366] transition-all duration-300">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.15)_0%,transparent_70%)] blur-xl" />

        <div className="flex items-start justify-between gap-4 relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-black flex items-center justify-center font-bold text-xl shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              💬
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[#25D366]">
                FASTEST RESPONSE
              </span>
              <h3 className="font-heading font-black text-lg text-[#F4EBD9]">
                WhatsApp Concierge
              </h3>
            </div>
          </div>

          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Direct Desk
          </span>
        </div>

        <p className="font-sans text-xs text-[#D6CEBC] leading-relaxed relative z-10 mb-5">
          Have an urgent question regarding an active competition, instant win prize, or card shipment? Connect directly with our concierge team.
        </p>

        <a
          href="https://wa.me/447466347548?text=Hello%20TCG%20Draws%20Customer%20Service%2C%20I%20have%20an%20inquiry"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md select-none cursor-pointer"
        >
          <span>Chat on WhatsApp (07466 347548)</span>
          <span className="text-sm">&rarr;</span>
        </a>
      </div>

      {/* 2. Direct Email Support Card with Copy Button */}
      <div className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#12151F] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xs font-black uppercase tracking-wider text-[#F4EBD9]">
                Email Concierge
              </span>
              <a
                href="mailto:support@tcgdraws.com"
                className="font-mono text-xs text-[#D4AF37] hover:underline"
              >
                support@tcgdraws.com
              </a>
            </div>
          </div>

          <button
            onClick={handleCopyEmail}
            className="px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#181C28] hover:border-[#D4AF37] text-xs font-heading font-bold uppercase tracking-wider text-[#F4EBD9] transition-all cursor-pointer select-none"
            title="Copy email address"
          >
            {copiedEmail ? "Copied! ✓" : "Copy"}
          </button>
        </div>

        <div className="border-t border-[rgba(212,175,55,0.1)] pt-3 flex items-center justify-between text-[11px] font-sans text-[#A69B82]">
          <span>Standard Ticket Turnaround:</span>
          <span className="font-heading font-bold text-[#F4EBD9]">&lt; 24 Hours Guaranteed</span>
        </div>
      </div>

      {/* 3. Live Support Desk Hours */}
      <div className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#12151F] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37] shrink-0 text-sm">
              🕒
            </div>
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#F4EBD9]">
              Operating Hours (UK Time)
            </h4>
          </div>

          {isOpenNow ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open Now
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-[rgba(212,175,55,0.3)] bg-[#181C28] px-2.5 py-0.5 text-[10px] font-bold text-[#A69B82] uppercase tracking-wider">
              🌙 Offline Now
            </span>
          )}
        </div>

        <div className="flex flex-col font-sans text-xs divide-y divide-[rgba(212,175,55,0.1)]">
          <div className="flex justify-between py-2">
            <span className="text-[#A69B82]">Monday – Friday</span>
            <span className="text-[#F4EBD9] font-medium">9:00am – 6:00pm GMT</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#A69B82]">Saturday</span>
            <span className="text-[#F4EBD9] font-medium">10:00am – 2:00pm GMT</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#A69B82]">Sunday</span>
            <span className="text-[#6E6655] font-semibold">Closed (Queued for Monday)</span>
          </div>
        </div>

        <p className="text-[10px] font-sans text-[#A69B82] leading-relaxed pt-1">
          * Automated ticket purchases, live draws, and instant win prize validations run 24/7/365 without interruption.
        </p>
      </div>

      {/* 4. Registered Headquarters & Free Postal Route Card */}
      <div className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#12151F] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🏛️</span>
          <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#D4AF37]">
            UK Postal Route &amp; Registered Office
          </h4>
        </div>

        <div className="bg-[#090A0E] border border-[rgba(212,175,55,0.18)] rounded-xl p-4 font-sans text-xs text-[#D6CEBC] space-y-1">
          <p className="font-heading font-bold text-[#F4EBD9]">TCG Draws Ltd</p>
          <p className="text-[#A69B82]">PO Box 99, Manchester, M1 1AA</p>
          <p className="text-[#A69B82]">United Kingdom</p>
          <div className="pt-2 text-[10px] text-[#D4AF37] border-t border-[rgba(212,175,55,0.1)] mt-2 font-medium">
            Send free postal entries via standard first/second class post as outlined in our Terms &amp; Conditions.
          </div>
        </div>
      </div>
    </div>
  );
}
