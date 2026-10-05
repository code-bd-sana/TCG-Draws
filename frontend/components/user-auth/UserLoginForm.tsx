"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserLoginFormValues, UserAuthFormState } from "../../types/user-auth.types";
import { validateLoginForm } from "../../lib/validations/user-auth.validation";
import PrimaryButton from "../website/shared/PrimaryButton";
import AuthSuccessState from "../host-auth/AuthSuccessState";
import { cn, extractApiError } from "../../lib/utils";
import { useLoginMutation, useAuthUser } from "../../hooks/useAuthHooks";

export default function UserLoginForm() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Controlled form values state
  const [formData, setFormData] = useState<UserLoginFormValues>({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Overall form state
  const [formState, setFormState] = useState<UserAuthFormState<UserLoginFormValues>>({
    values: formData,
    isSubmitting: false,
    submitStatus: "idle",
  });

  // Client-side validation errors state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loginMutation = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Perform validation checks
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await loginMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
      });
      // The mutation handles redirect on success
    } catch (error: any) {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
      if (error.response?.data?.message === 'Please verify your email address before logging in') {
        showToast("Please verify your email address before logging in. Redirecting...");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      } else {
        showToast(extractApiError(error, "Login failed. Please check your credentials."));
      }
    }
  };

  if (formState.submitStatus === "success") {
    return (
      <AuthSuccessState
        title="Welcome Back!"
        description="Your Player session has been successfully simulated. Directing you to the draws homepage..."
        buttonText="Explore Competitions"
        buttonHref="/"
      />
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">
      {/* Toast Alert popup for mock actions */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-accent-bg border border-primary text-text-brand px-4 py-3 rounded-button shadow-card text-xs md:text-sm animate-fadeIn">
          {toastMessage}
        </div>
      )}



      {/* Main Login Card wrapper */}
      <div className="art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        {/* Subtle top gold accent light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

        {/* Header section */}
        <div className="flex flex-col gap-2 mb-7">
          <div className="flex items-center justify-between">
            <span className="font-sans font-semibold text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.25em] uppercase">
              COLLECTOR ACCESS
            </span>
            <span className="text-[10px] text-[#A69B82] bg-[#181C28] px-2.5 py-1 rounded-full border border-[rgba(212,175,55,0.2)]">
              256-Bit SSL
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-[34px] text-[#F4EBD9] tracking-tight">
            Sign In to Vault
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-[#A69B82]">New collector?</span>
            <Link
              href="/register"
              className="font-semibold text-[#D4AF37] hover:text-[#F5E5C0] hover:underline transition-colors duration-200"
            >
              Create an account →
            </Link>
          </div>
        </div>

        {/* Semantic Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input field */}
          <div className="flex flex-col w-full gap-1.5">
            <label
              htmlFor="email"
              className="font-sans font-medium text-xs sm:text-sm text-[#A69B82]"
            >
              Email Address or Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              autoComplete="username"
              placeholder="you@tcgdraws.com or username"
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

          {/* Password input field */}
          <div className="flex flex-col w-full gap-1.5">
            <label
              htmlFor="password"
              className="font-sans font-medium text-xs sm:text-sm text-[#A69B82]"
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={formState.isSubmitting}
                className={cn(
                  "w-full input-obsidian rounded-xl pl-4 pr-12 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none",
                  errors.password
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    : "",
                  formState.isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69B82] hover:text-[#D4AF37] p-1 cursor-pointer select-none transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Eye Slash Icon */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn">
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between mt-1 text-xs sm:text-sm">
            <label className="flex items-center gap-2 text-[#A69B82] hover:text-[#F4EBD9] select-none cursor-pointer transition-colors">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={formState.isSubmitting}
                className="w-4 h-4 rounded border border-[rgba(212,175,55,0.3)] bg-[#0C0E14] text-[#D4AF37] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#D4AF37] transition-all duration-200 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="font-sans font-semibold text-[#D4AF37] hover:text-[#F5E5C0] hover:underline transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formState.isSubmitting || !isMounted}
            className="btn-gold-metallic w-full py-3.5 mt-2 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {formState.isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#090A0E]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Enter Vault &rarr;</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
