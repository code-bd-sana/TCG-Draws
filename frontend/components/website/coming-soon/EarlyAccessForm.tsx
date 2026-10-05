"use client";

import React, { useState } from "react";
import InputField from "../shared/InputField";
import { cn } from "../../../lib/utils";

/**
 * Premium Early Access Lead Form — Fairway Draws.
 * Clean white card with gold-green CTA, role selector toggle, and VIP success state.
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
        <div className="bg-white border border-[#0b4d35]/20 rounded-[24px] p-10 shadow-xl text-center">
          {/* Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-[#0b4d35]/30 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-[#0b4d35]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl font-black text-[#0b4d35] mb-2">You&apos;re on the VIP List!</h3>
          <p className="font-sans text-sm text-[#334e43] leading-relaxed max-w-sm mx-auto mb-6">
            Your early-access pass is saved. Watch your inbox for exclusive launch day tokens and first-entry privileges.
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-[#0b4d35]/20 to-transparent mb-6" />
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-xs font-bold text-[#5e766c] hover:text-[#0b4d35] transition-colors uppercase tracking-wider"
          >
            ← Register Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white border border-[#0b4d35]/20 rounded-[24px] p-8 sm:p-10 shadow-xl">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-block px-3 py-1 rounded-full bg-[#0b4d35]/8 border border-[#0b4d35]/15 text-[#0b4d35] text-[10px] font-bold uppercase tracking-widest mb-3">
            Founding Members Only
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#0b4d35]">
            Secure Early Access
          </h3>
          <p className="font-sans text-sm text-[#5e766c] mt-2">
            Join <strong className="text-[#0b4d35]">1,200+ golfers</strong> on the official waitlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* General Error */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 text-center font-semibold">
              ⚠️ {generalError}
            </div>
          )}

          {/* Inputs */}
          <InputField
            label="Full Name"
            id="fullName"
            name="fullName"
            placeholder="e.g. Rory McIlroy"
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
            placeholder="rory@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
            error={emailError}
            disabled={isSubmitting}
            required
          />

          {/* Role Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-bold text-[#334e43] uppercase tracking-wider">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F1F5EE] rounded-2xl">
              {(["CUSTOMER", "HOST"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isSubmitting}
                  className={cn(
                    "py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50",
                    role === r
                      ? "bg-[#0b4d35] text-white shadow-md"
                      : "text-[#5e766c] hover:text-[#0b4d35]"
                  )}
                >
                  {r === "CUSTOMER" ? "⛳ Enter Draws (Player)" : "🏆 Host Draws (Club)"}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-1 bg-[#0b4d35] hover:bg-[#073826] active:scale-[0.98] text-white font-sans text-sm font-black tracking-[0.12em] uppercase rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
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
                Join VIP Waitlist
                <span className="text-[#dc2626] text-lg font-black">→</span>
              </>
            )}
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {["🔒 100% Private", "✅ Zero Spam", "🎯 Instant Entry"].map((item) => (
              <span key={item} className="text-[10px] font-semibold text-[#5e766c]">{item}</span>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
