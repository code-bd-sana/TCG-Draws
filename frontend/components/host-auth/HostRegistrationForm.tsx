"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HostRegistrationFormValues, HostRegistrationStep, HostAuthFormState } from "../../types/host-auth.types";
import {
  validateRegisterStep1,
  validateRegisterStep2,
  validateRegisterStep3,
  validateRegisterStep4,
  getPasswordStrength
} from "../../lib/validations/host-auth.validation";
import AuthSuccessState from "./AuthSuccessState";
import { cn } from "../../lib/utils";
import { useRegisterMutation } from "../../hooks/useAuthHooks";
import { extractApiError } from "../../lib/utils";
import { authService } from "../../services/auth.service";

interface HostRegistrationFormProps {
  step: HostRegistrationStep;
  onChangeStep: (step: HostRegistrationStep) => void;
}

export default function HostRegistrationForm({
  step,
  onChangeStep,
}: HostRegistrationFormProps) {
  const router = useRouter();
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const businessLogoInputRef = useRef<HTMLInputElement>(null);

  // Controlled Registration Data
  const [formData, setFormData] = useState<HostRegistrationFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
    hostType: "individual",
    profilePhoto: null,
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    country: "United Kingdom",
    bio: "",
    businessName: "",
    contactFullName: "",
    businessRole: "",
    businessEmail: "",
    businessPhone: "",
    vatNumber: "",
    businessLogo: null,
    businessBio: "",
    bankAccountName: "",
    sortCode: "",
    accountNumber: "",
    acceptedTerms: false,
  });

  // Overall form submitting state
  const [formState, setFormState] = useState<HostAuthFormState<HostRegistrationFormValues>>({
    values: formData,
    isSubmitting: false,
    submitStatus: "idle",
  });

  // Step validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Profile photo & business logo file selection with server uploader and local preview fallback
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profilePhoto" | "businessLogo") => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Instant local preview
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [field]: previewUrl,
      }));

      // 2. Upload to server
      if (field === "businessLogo") {
        setIsUploadingLogo(true);
        try {
          const res = await authService.uploadLogo(file);
          if (res?.url) {
            setFormData((prev) => ({
              ...prev,
              businessLogo: res.url,
            }));
          }
        } catch (err) {
          console.error("Failed to upload logo to server, falling back to base64", err);
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData((prev) => ({
              ...prev,
              businessLogo: reader.result as string,
            }));
          };
          reader.readAsDataURL(file);
        } finally {
          setIsUploadingLogo(false);
        }
      }
    }
  };

  // Navigating back
  const handleBack = () => {
    if (step === 2) onChangeStep(1);
    else if (step === 3) onChangeStep(2);
    else if (step === 4) onChangeStep(3);
    else if (step === 8) onChangeStep(4);
  };

  // Advancing steps with validation gates
  const registerMutation = useRegisterMutation();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      const stepErrors = validateRegisterStep1(formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      onChangeStep(2);
    } else if (step === 2) {
      const stepErrors = validateRegisterStep2(formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      onChangeStep(3);
    } else if (step === 3) {
      const stepErrors = validateRegisterStep3(formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      onChangeStep(4);
    } else if (step === 4) {
      const stepErrors = validateRegisterStep4(formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      // Advance to review step
      onChangeStep(8);
    } else if (step === 8) {
      if (!formData.acceptedTerms) {
        showToast("Please agree to the Host Guidelines and Platform Rules.");
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      try {
        await registerMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          location: formData.city ? `${formData.city}, ${formData.country}` : formData.country,
          phone: formData.phone || undefined,
          role: 'HOST',
          businessName: formData.businessName || `${formData.firstName} ${formData.lastName}`,
          bio: formData.businessBio || formData.bio || undefined,
          avatarUrl: formData.businessLogo || formData.profilePhoto || undefined,
        });
        
        showToast("Host registration successful! Check your email to verify.");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      } catch (error: any) {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
        const errorMsg = extractApiError(error, "Registration failed");
        showToast(errorMsg);
      }
    }
  };

  if (formState.submitStatus === "success") {
    return (
      <AuthSuccessState
        title="Application Submitted!"
        description="Your details have been recorded. Our team will review your application and activate your host portal within 24 hours."
        buttonText="Return to Homepage"
        buttonHref="/"
      />
    );
  }

  // Calculate password strength rating
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col gap-5 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#12151F] border border-[#D4AF37] text-[#D4AF37] px-4 py-3 rounded-xl shadow-2xl text-xs md:text-sm animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Account Type Selector Pill */}
      {step === 1 && (
        <div className="flex items-center justify-start self-start bg-[#12151F] border border-[rgba(212,175,55,0.25)] p-1 rounded-full mb-1 select-none">
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-sans text-xs font-semibold text-[#A69B82] hover:text-[#F4EBD9] px-4 py-2 rounded-full transition-colors cursor-pointer"
          >
            Collector Account
          </button>
          <div className="btn-gold-metallic px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider select-none shadow-sm">
            Host &amp; Breaker
          </div>
        </div>
      )}

      {/* Main Form container card */}
      <div className="art-deco-card p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full">
        <form onSubmit={handleContinue}>
          {/* STEP 1: Account Details */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Step Title Header */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-[rgba(212,175,55,0.2)]">
                <div className="flex items-center justify-between text-xs font-medium text-[#A69B82]">
                  <span>Step 1 of 4</span>
                  <span className="text-[10px] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.3)] px-2.5 py-0.5 rounded-full text-[#D4AF37] font-bold uppercase tracking-wider">
                    Account Setup
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl md:text-2xl text-[#F4EBD9] mt-1">
                  Create Your Breaker Account
                </h2>
                <p className="font-sans text-xs md:text-sm text-[#A69B82]">
                  Set up your login credentials to access the TCG DRAWS host &amp; breaker portal.
                </p>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="breaker@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                    errors.email && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                  )}
                />
                {errors.email && (
                  <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none animate-fadeIn">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl pl-4 pr-12 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.password && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69B82] hover:text-[#D4AF37] p-1 cursor-pointer select-none transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none animate-fadeIn">
                    {errors.password}
                  </span>
                )}

                {/* Password Strength Meter */}
                <div className="flex gap-1.5 mt-2 h-[4px] w-full">
                  {[1, 2, 3, 4].map((barIndex) => (
                    <div
                      key={barIndex}
                      className={cn(
                        "h-full flex-1 rounded-full transition-all duration-300",
                        formData.password.length > 0 && barIndex <= passwordStrength
                          ? passwordStrength <= 1
                            ? "bg-red-500"
                            : passwordStrength === 2
                            ? "bg-amber-500"
                            : passwordStrength === 3
                            ? "bg-yellow-400"
                            : "bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                          : "bg-[rgba(212,175,55,0.15)]"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Confirm Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl pl-4 pr-12 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.confirmPassword && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69B82] hover:text-[#D4AF37] p-1 cursor-pointer select-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none animate-fadeIn">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Encryption Banner */}
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.2)] p-3.5 rounded-xl flex items-center gap-3 select-none">
                <svg className="w-5 h-5 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <p className="font-sans text-xs text-[#A69B82] leading-normal">
                  Your breaker account is encrypted and protected with UK compliance protocols.
                </p>
              </div>

              {/* Bottom Nav Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 pt-2">
                <span className="text-xs text-[#A69B82]">
                  Already have a Host account?{" "}
                  <Link href="/login" className="font-semibold text-[#D4AF37] hover:underline">
                    Log in
                  </Link>
                </span>
                <button
                  type="submit"
                  className="btn-gold-metallic w-full sm:w-auto font-heading font-black text-xs uppercase tracking-wider px-7 py-3 rounded-xl cursor-pointer"
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Host Profile */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Step Title Header */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-[rgba(212,175,55,0.2)]">
                <div className="flex items-center justify-between text-xs font-medium text-[#A69B82]">
                  <span>Step 2 of 4</span>
                  <span className="text-[10px] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.3)] px-2.5 py-0.5 rounded-full text-[#D4AF37] font-bold uppercase tracking-wider">
                    Host Profile
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl md:text-2xl text-[#F4EBD9] mt-1">
                  Set Up Your Host Profile
                </h2>
                <p className="font-sans text-xs md:text-sm text-[#A69B82]">
                  Configure your primary breaker classification and public contact location.
                </p>
              </div>

              {/* Host Type Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Host Classification
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, hostType: "individual" }))}
                    className={cn(
                      "flex-1 font-heading text-xs font-bold py-3 rounded-xl border text-center transition-all cursor-pointer select-none uppercase tracking-wider",
                      formData.hostType === "individual"
                        ? "btn-gold-metallic border-transparent"
                        : "btn-dark-metallic border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#F4EBD9]"
                    )}
                  >
                    Private Breaker / Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, hostType: "business" }))}
                    className={cn(
                      "flex-1 font-heading text-xs font-bold py-3 rounded-xl border text-center transition-all cursor-pointer select-none uppercase tracking-wider",
                      formData.hostType === "business"
                        ? "btn-gold-metallic border-transparent"
                        : "btn-dark-metallic border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#F4EBD9]"
                    )}
                  >
                    Card Shop / Registered Business
                  </button>
                </div>
                <span className="font-sans text-[11px] text-[#A69B82]/70">
                  {formData.hostType === "individual"
                    ? "Hosting as a verified private card collector or independent streamer."
                    : "Hosting as an established hobby shop, brick-and-mortar store, or registered company."}
                </span>
              </div>

              {/* First Name & Last Name (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Ash"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.firstName && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.firstName && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Ketchum"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.lastName && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.lastName && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+44 7700 900000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                    errors.phone && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                  )}
                />
                {errors.phone && (
                  <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                    {errors.phone}
                  </span>
                )}
                <span className="font-sans text-[11px] text-[#A69B82]/70">
                  Used for draw completion alerts and host verification only.
                </span>
              </div>

              {/* City & Country (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    City / Town
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    placeholder="London"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.city && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.city && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.city}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="country" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    Country
                  </label>
                  <div className="relative w-full">
                    <select
                      id="country"
                      name="country"
                      autoComplete="country-name"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm text-[#F4EBD9] outline-none transition-all appearance-none cursor-pointer bg-[#0C0E14]"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Ireland">Ireland</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69B82]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(212,175,55,0.2)]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-dark-metallic font-heading font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="btn-gold-metallic font-heading font-black text-xs uppercase tracking-wider px-7 py-3 rounded-xl cursor-pointer"
                >
                  Save &amp; Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Business Information */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Step Title Header */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-[rgba(212,175,55,0.2)]">
                <div className="flex items-center justify-between text-xs font-medium text-[#A69B82]">
                  <span>Step 3 of 4</span>
                  <span className="text-[10px] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.3)] px-2.5 py-0.5 rounded-full text-[#D4AF37] font-bold uppercase tracking-wider">
                    Shop &amp; Breaker Info
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl md:text-2xl text-[#F4EBD9] mt-1">
                  Card Shop &amp; Breaker Details
                </h2>
                <p className="font-sans text-xs md:text-sm text-[#A69B82]">
                  Information used for public host verification and escrow payouts.
                </p>
              </div>

              {/* Business Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="businessName" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Shop / Channel Brand Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  autoComplete="organization"
                  placeholder="e.g. Pallet Town Card Vault / Rare Candies TCG"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                    errors.businessName && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                  )}
                />
                {errors.businessName && (
                  <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                    {errors.businessName}
                  </span>
                )}
              </div>

              {/* Contact Full Name & Job Role (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contactFullName" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    Contact Full Name
                  </label>
                  <input
                    type="text"
                    id="contactFullName"
                    name="contactFullName"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    value={formData.contactFullName}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.contactFullName && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.contactFullName && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.contactFullName}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="businessRole" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    id="businessRole"
                    name="businessRole"
                    placeholder="Lead Breaker / Store Owner"
                    value={formData.businessRole}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.businessRole && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.businessRole && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.businessRole}
                    </span>
                  )}
                </div>
              </div>

              {/* Business Email & Business Phone (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="businessEmail" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    Business / Channel Email
                  </label>
                  <input
                    type="email"
                    id="businessEmail"
                    name="businessEmail"
                    placeholder="breaker@tcgdraws.co.uk"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.businessEmail && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.businessEmail && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.businessEmail}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="businessPhone" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    Business Phone Number
                  </label>
                  <input
                    type="tel"
                    id="businessPhone"
                    name="businessPhone"
                    placeholder="+44 20 7946 0123"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none",
                      errors.businessPhone && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  {errors.businessPhone && (
                    <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                      {errors.businessPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* VAT Number */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 select-none">
                  <label htmlFor="vatNumber" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                    VAT Number
                  </label>
                  <span className="text-[10px] bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] px-2.5 py-0.5 rounded-full text-[#D4AF37] uppercase font-bold">
                    optional
                  </span>
                </div>
                <input
                  type="text"
                  id="vatNumber"
                  name="vatNumber"
                  placeholder="GB123456789"
                  value={formData.vatNumber}
                  onChange={handleInputChange}
                  className="w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none"
                />
                <span className="font-sans text-[11px] text-[#A69B82]/70">
                  Leave blank if your business is not registered for VAT.
                </span>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(212,175,55,0.2)]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-dark-metallic font-heading font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="btn-gold-metallic font-heading font-black text-xs uppercase tracking-wider px-7 py-3 rounded-xl cursor-pointer"
                >
                  Save &amp; Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Logo & Branding */}
          {step === 4 && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Step Title Header */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-[rgba(212,175,55,0.2)]">
                <div className="flex items-center justify-between text-xs font-medium text-[#A69B82]">
                  <span>Step 4 of 4</span>
                  <span className="text-[10px] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.3)] px-2.5 py-0.5 rounded-full text-[#D4AF37] font-bold uppercase tracking-wider">
                    Branding &amp; Bio
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl md:text-2xl text-[#F4EBD9] mt-1">
                  Upload Logo &amp; Breaker Bio
                </h2>
                <p className="font-sans text-xs md:text-sm text-[#A69B82]">
                  Showcase your brand icon and intro to entrants on your competition pages.
                </p>
              </div>

              {/* Logo Upload Box */}
              <div className="flex flex-col gap-2">
                <label className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Channel / Shop Logo
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div
                    onClick={() => businessLogoInputRef.current?.click()}
                    className="relative w-32 h-32 bg-[#0C0E14] border border-dashed border-[rgba(212,175,55,0.35)] hover:border-[#D4AF37] rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden text-center transition-all shadow-md group"
                  >
                    {isUploadingLogo ? (
                      <div className="flex flex-col items-center gap-2 p-2">
                        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-[#A69B82]">Uploading...</span>
                      </div>
                    ) : formData.businessLogo ? (
                      <img
                        alt="Business Logo preview"
                        src={formData.businessLogo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-3 flex flex-col items-center gap-1 select-none text-[#A69B82] group-hover:text-[#D4AF37] transition-colors">
                        <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className="text-[11px] font-semibold">Upload Logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={businessLogoInputRef}
                    onChange={(e) => handlePhotoUpload(e, "businessLogo")}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                  />
                  <p className="font-sans text-xs md:text-sm text-[#A69B82] leading-normal max-w-sm pt-2">
                    PNG or JPG, square aspect ratio recommended. This appears on your public Host Profile and verified draw listings.
                  </p>
                </div>
              </div>

              {/* Short Business Bio */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="businessBio" className="font-sans font-medium text-xs md:text-sm text-[#A69B82]">
                  Breaker / Shop Bio
                </label>
                <div className="relative w-full">
                  <textarea
                    id="businessBio"
                    name="businessBio"
                    maxLength={300}
                    placeholder="Tell entrants about your Pokémon card breaks, slab grading standards, and live streams..."
                    value={formData.businessBio}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full input-obsidian rounded-xl px-4 py-3 h-28 font-sans text-xs md:text-sm placeholder:text-[#6E6655] transition-all outline-none resize-none",
                      errors.businessBio && "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    )}
                  />
                  <span className="absolute bottom-2.5 right-3 font-sans text-[10px] text-[#A69B82]/70 select-none">
                    {formData.businessBio.length} / 300
                  </span>
                </div>
                {errors.businessBio && (
                  <span className="font-sans text-[11px] text-red-400 mt-0.5 self-start select-none">
                    {errors.businessBio}
                  </span>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(212,175,55,0.2)]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-dark-metallic font-heading font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="btn-gold-metallic font-heading font-black text-xs uppercase tracking-wider px-7 py-3 rounded-xl cursor-pointer"
                >
                  Review Application &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Ready to Go Live Review */}
          {step === 8 && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Step Title Header */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-[rgba(212,175,55,0.2)]">
                <div className="flex items-center justify-between text-xs font-medium text-[#A69B82]">
                  <span>Step 4 of 4</span>
                  <span className="text-[10px] bg-[rgba(16,185,129,0.15)] border border-[#10B981] px-2.5 py-0.5 rounded-full text-[#34D399] font-bold uppercase tracking-wider">
                    Final Verification
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl md:text-2xl text-[#F4EBD9] mt-1">
                  Ready to Launch Your Vault?
                </h2>
                <p className="font-sans text-xs md:text-sm text-[#A69B82]">
                  Review your breaker setup and activate your host registration on TCG DRAWS.
                </p>
              </div>

              {/* Onboarding Checklist Summary Box */}
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.25)] p-5 rounded-2xl flex flex-col gap-3 select-none">
                <p className="font-heading font-black text-xs md:text-sm text-[#D4AF37] uppercase tracking-wider">
                  Onboarding Checklist
                </p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-xs md:text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <span className="text-[#F4EBD9] font-medium">Account credentials configured</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs md:text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <span className="text-[#F4EBD9] font-medium">Host classification &amp; location verified</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs md:text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <span className="text-[#F4EBD9] font-medium">Brand identity &amp; details submitted</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs md:text-sm">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      !
                    </span>
                    <span className="text-[#F4EBD9] font-medium">Admin review pending (24h turnaround)</span>
                  </div>
                </div>
              </div>

              {/* Public Profile Preview Card */}
              <div className="bg-[#0C0E14] border border-[rgba(212,175,55,0.25)] p-5 rounded-2xl flex flex-col gap-3">
                <p className="font-heading font-bold text-xs uppercase tracking-wider text-[#A69B82] select-none">
                  Public Host Preview
                </p>
                <div className="flex items-center gap-4 bg-[#141722] p-4 rounded-xl border border-[rgba(212,175,55,0.2)]">
                  {/* Logo Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#0C0E14] border border-[rgba(212,175,55,0.3)] overflow-hidden flex items-center justify-center select-none shrink-0">
                    {formData.businessLogo ? (
                      <img src={formData.businessLogo} alt="Business logo preview" className="w-full h-full object-cover" />
                    ) : formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile photo preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">✨</span>
                    )}
                  </div>
                  {/* Name and Meta */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-heading font-bold text-sm md:text-base text-[#F4EBD9] truncate">
                      {formData.businessName || `${formData.firstName} ${formData.lastName}` || "Your Breaker Name"}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-[#A69B82] select-none">
                      <span className="inline-flex items-center gap-1 text-[#D4AF37]">
                        ★ New Host
                      </span>
                      <span>•</span>
                      <span>{formData.country}</span>
                    </div>
                  </div>
                  {/* Verified badge */}
                  <div className="ml-auto select-none bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.35)] px-3 py-1 rounded-full shrink-0">
                    <span className="font-sans font-bold text-[9px] md:text-[10px] text-[#D4AF37] whitespace-nowrap uppercase tracking-wider">
                      Verified Breaker
                    </span>
                  </div>
                </div>
              </div>

              {/* Guidelines Agreement Alert */}
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.25)] p-4.5 rounded-xl flex gap-3 items-start shadow-sm">
                <div className="pt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    id="acceptedTerms"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    disabled={formState.isSubmitting}
                    className="w-4 h-4 rounded border border-[rgba(212,175,55,0.3)] bg-[#0C0E14] text-[#D4AF37] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#D4AF37] transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor="acceptedTerms" className="font-sans text-xs md:text-sm text-[#D6CEBC] font-medium leading-relaxed select-none cursor-pointer">
                  By launching, you confirm that all Pokémon card descriptions will be accurate, authentic, and agree to the{" "}
                  <Link href="/terms" className="text-[#D4AF37] hover:underline font-bold">Host Guidelines</Link>
                  {" "}and{" "}
                  <Link href="/terms" className="text-[#D4AF37] hover:underline font-bold">Platform Rules</Link>.
                </label>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(212,175,55,0.2)]">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={formState.isSubmitting}
                  className={cn(
                    "btn-dark-metallic font-heading font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer",
                    formState.isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="btn-gold-metallic font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {formState.isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-[#090A0E]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>🚀 Launch Host Profile</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
