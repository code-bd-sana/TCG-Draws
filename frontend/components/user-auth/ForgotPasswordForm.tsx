"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ForgotPasswordFormValues, UserAuthFormState } from "../../types/user-auth.types";
import { validateForgotPasswordForm } from "../../lib/validations/user-auth.validation";
import PrimaryButton from "../website/shared/PrimaryButton";
import { cn } from "../../lib/utils";
import { useForgotPasswordMutation } from "../../hooks/useUserHooks";

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormValues>({
    email: "",
  });

  const [formState, setFormState] = useState<UserAuthFormState<ForgotPasswordFormValues>>({
    values: formData,
    isSubmitting: false,
    submitStatus: "idle",
  });

  const [errors, setErrors] = useState<{ email?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (errors.email) setErrors({});
  };

  const mutation = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForgotPasswordForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
    }));

    try {
      await mutation.mutateAsync(formData.email);
      setFormState({
        values: formData,
        isSubmitting: false,
        submitStatus: "success",
      });
    } catch (err: any) {
      setErrors({ email: err.response?.data?.message || "Failed to send reset link" });
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  if (formState.submitStatus === "success") {
    return (
      <div className="art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-xl mx-auto flex flex-col items-center text-center animate-fadeIn select-none shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
        <div className="w-14 h-14 rounded-2xl bg-[#181C28] border border-[#D4AF37] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7 text-[#D4AF37]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-[#D4AF37] tracking-[0.25em] uppercase mb-2">
          INSTRUCTIONS DISPATCHED
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] mb-3">
          Check Your Email
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed mb-8 max-w-sm">
          We&apos;ve sent a password recovery link to <span className="text-[#F4EBD9] font-semibold">{formState.values.email}</span>. Please check your inbox and follow the link to reset your credentials.
        </p>
        <Link
          href="/login"
          className="btn-gold-metallic w-full py-3.5 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase text-center flex items-center justify-center gap-2"
        >
          &larr; Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
      {/* Subtle top gold accent light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

      {/* Header section */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between">
          <span className="font-sans font-semibold text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.25em] uppercase">
            ACCOUNT RECOVERY
          </span>
          <span className="text-[10px] text-[#A69B82] bg-[#181C28] px-2.5 py-1 rounded-full border border-[rgba(212,175,55,0.2)]">
            Encrypted
          </span>
        </div>
        <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-[34px] text-[#F4EBD9] tracking-tight">
          Forgot Password
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed">
          Enter your registered email address below, and we&apos;ll dispatch a secure recovery link.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col w-full gap-1.5">
          <label htmlFor="email" className="font-sans font-medium text-xs sm:text-sm text-[#A69B82]">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="you@tcgdraws.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={formState.isSubmitting}
            className={cn(
              "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none",
              errors.email
                ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                : "",
              formState.isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          />
          {errors.email && (
            <span className="font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn">
              {errors.email}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="btn-gold-metallic w-full py-3.5 mt-2 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {formState.isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#090A0E]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending Link...</span>
            </>
          ) : (
            <span>Send Reset Link &rarr;</span>
          )}
        </button>

        <div className="text-center mt-2">
          <Link
            href="/login"
            className="font-sans font-semibold text-xs text-[#A69B82] hover:text-[#D4AF37] transition-colors duration-200"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
