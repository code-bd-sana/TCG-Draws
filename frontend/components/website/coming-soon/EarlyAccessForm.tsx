"use client";

import React, { useState } from "react";
import InputField from "../shared/InputField";
import { cn } from "../../../lib/utils";

/**
 * Premium Early Access Lead Form — TCG Draws.
 * Art-Deco dark obsidian card with metallic gold button, role toggle, and success state.
 */
export default function EarlyAccessForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "HOST">("CUSTOMER");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    let ok = true;
    setNameError(""); setEmailError(""); setGeneralError("");
    if (!fullName.trim()) { setNameError("Full name is required."); ok = false; }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) { setEmailError("Email address is required."); ok = false; }
    else if (!re.test(email)) { setEmailError("Please enter a valid email."); ok = false; }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setIsSuccess(true);
      setFullName(""); setEmail(""); setRole("CUSTOMER");
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="art-deco-card rounded-2xl p-8 sm:p-10 text-center shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)] flex flex-col items-center">
          {/* Checkmark */}
          <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] border border-[#10B981] text-[#34D399] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="font-heading text-2xl font-black text-[#F4EBD9] uppercase tracking-tight mb-2">
            You&apos;re on the VIP List!
          </h3>
          <p className="font-sans text-sm text-[#C8BFAD] leading-relaxed max-w-sm mx-auto mb-6">
            Your founding pass has been secured. Watch your inbox for exclusive launch day credits and early access to holy grail booster boxes.
          </p>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.25)] to-transparent mb-6" />
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-xs font-heading font-bold text-[#D4AF37] hover:text-[#F5E5C0] transition-colors uppercase tracking-wider cursor-pointer"
          >
            ← Register Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="art-deco-card rounded-2xl p-8 sm:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)]">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-[10px] font-heading font-black uppercase tracking-widest mb-3">
            Founding Members Only
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl font-black text-[#F4EBD9] uppercase tracking-tight">
            Secure Early Access
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-2">
            Join <strong className="text-[#D4AF37]">1,850+ collectors &amp; shops</strong> on the official waitlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* General Error */}
          {generalError && (
            <div className="bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl p-3.5 text-center font-semibold">
              ⚠️ {generalError}
            </div>
          )}

          {/* Inputs */}
          <InputField
            label="Full Name"
            id="fullName"
            name="fullName"
            placeholder="e.g. Ash Ketchum"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); if (nameError) setNameError(""); }}
            error={nameError}
            disabled={isSubmitting}
            required
          />
          <InputField
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="collector@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
            error={emailError}
            disabled={isSubmitting}
            required
          />

          {/* Role Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-heading text-xs font-bold text-[#F4EBD9] uppercase tracking-wider">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#0C0E14] border border-[rgba(212,175,55,0.2)] rounded-xl">
              {(["CUSTOMER", "HOST"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isSubmitting}
                  className={cn(
                    "py-2.5 px-3 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50",
                    role === r
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-sm"
                      : "text-[#A69B82] hover:text-[#F4EBD9]"
                  )}
                >
                  {r === "CUSTOMER" ? "🃏 Enter Draws (Player)" : "🏪 Host Draws (Shop)"}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold-metallic w-full py-4 mt-2 rounded-xl text-xs font-heading font-black tracking-[0.14em] uppercase transition-all duration-200 shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Registering…
              </>
            ) : (
              <>
                <span>Join VIP Waitlist</span>
                <span>&rarr;</span>
              </>
            )}
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {["🔒 100% Private", "✅ Zero Spam", "🎯 First Access"].map((item) => (
              <span key={item} className="text-[10px] font-sans font-medium text-[#8C8472]">{item}</span>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
