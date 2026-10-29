"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContactFormValues } from "../../../types/contact.types";
import { cn } from "../../../lib/utils";
import { contactService } from "../../../services/contact.service";

interface SubjectOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

const SUBJECT_TOPICS: SubjectOption[] = [
  { value: "draw-query", label: "Competition Query", icon: "🎯", description: "Questions regarding active draws or rules" },
  { value: "instant-wins", label: "Instant Wins & Claims", icon: "⚡", description: "Fulfillment and delivery of instant wins" },
  { value: "hosting", label: "Host & Breaker Partner", icon: "🏆", description: "Apply to host your own card breaks" },
  { value: "billing", label: "Payment & Checkout", icon: "💳", description: "Payment status, receipts, or subscriptions" },
  { value: "bug-report", label: "Technical Assistance", icon: "🛠️", description: "Account access or platform issues" },
  { value: "other", label: "General Inquiry", icon: "✉️", description: "Postal entries, partnerships, other questions" },
];

/**
 * Stateful Luxury Contact Form component with backend SMTP integration,
 * interactive topic pills, real-time validation, and accessible feedback alerts.
 */
export default function ContactForm() {
  const [formValues, setFormValues] = useState<ContactFormValues>({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    agreeToPolicy: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name as keyof ContactFormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectTopic = (val: string) => {
    setFormValues((prev) => ({ ...prev, subject: val }));
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormValues, string>> = {};

    if (!formValues.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formValues.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formValues.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formValues.subject) {
      newErrors.subject = "Please select an inquiry topic.";
    }

    if (!formValues.message.trim()) {
      newErrors.message = "Message content is required.";
    } else if (formValues.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    if (!formValues.agreeToPolicy) {
      newErrors.agreeToPolicy = "You must agree to the privacy policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await contactService.sendContactMessage({
        name: formValues.fullName,
        email: formValues.email,
        subject: formValues.subject,
        message: formValues.message,
      });

      setIsSuccess(true);
      setFormValues({
        fullName: "",
        email: "",
        subject: "",
        message: "",
        agreeToPolicy: false,
      });
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send message. Please try again or chat with us directly on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative isolate w-full rounded-3xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden">
      {/* Corner flare */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-2xl" />

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 relative z-10 border-b border-[rgba(212,175,55,0.12)] pb-6">
        <span className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
          DIRECT DISPATCH
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] uppercase tracking-tight">
          Send Us a Message
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#A69B82]">
          Fill out the details below and a dedicated member of our customer concierge will get back to you promptly.
        </p>
      </div>

      {/* Submit Error Notification */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 font-sans text-xs flex items-center justify-between shadow-lg relative z-10">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{submitError}</span>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            className="text-red-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {isSuccess ? (
        <div className="rounded-2xl border border-[rgba(212,175,55,0.35)] bg-[#181C28]/90 p-8 sm:p-10 flex flex-col items-center text-center animate-fadeIn relative z-10 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#090A0E] border border-[rgba(212,175,55,0.4)] flex items-center justify-center mb-5 text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8 text-emerald-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <span className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1">
            DISPATCH CONFIRMED
          </span>

          <h3 className="font-heading font-black text-2xl text-[#F4EBD9] uppercase tracking-tight mb-2">
            Message Sent to Support!
          </h3>

          <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed max-w-md mb-8">
            Thank you for reaching out to TCG Draws. Your inquiry has been routed to our UK support desk. A representative will review and reply to your email within 24 hours (usually &lt; 2 hours during open hours).
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsSuccess(false)}
              className="btn-dark-metallic w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9] border border-[rgba(212,175,55,0.3)] cursor-pointer select-none"
            >
              Send Another Inquiry
            </button>

            <Link
              href="/live-raffles"
              className="btn-gold-metallic w-full sm:w-auto px-7 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md cursor-pointer select-none"
            >
              Browse Active Draws &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          
          {/* Inquiry Topic Interactive Chips */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="font-heading text-xs font-black uppercase tracking-wider text-[#F4EBD9] select-none">
                Select Inquiry Topic <span className="text-[#D4AF37]">*</span>
              </label>
              <span className="font-sans text-[11px] text-[#A69B82]">
                Helps us route your inquiry faster
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SUBJECT_TOPICS.map((topic) => {
                const isSelected = formValues.subject === topic.value;
                return (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => handleSelectTopic(topic.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none",
                      isSelected
                        ? "bg-gradient-to-br from-[#181C28] to-[#12151F] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#090A0E] border-[rgba(212,175,55,0.18)] hover:border-[#D4AF37]/50 hover:bg-[#181C28]"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{topic.icon}</span>
                      <span className={cn(
                        "font-heading font-black text-xs uppercase tracking-wide",
                        isSelected ? "text-[#D4AF37]" : "text-[#F4EBD9]"
                      )}>
                        {topic.label}
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#A69B82] line-clamp-1">
                      {topic.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {errors.subject && (
              <span className="font-sans text-[11px] text-red-400 font-medium mt-1">
                ⚠️ {errors.subject}
              </span>
            )}
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="font-heading text-xs font-black uppercase tracking-wider text-[#F4EBD9] select-none"
              >
                Full Name <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#A69B82] pointer-events-none">
                  👤
                </span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Liam Anderson"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] pl-11 pr-4 py-3 font-sans text-xs sm:text-sm text-[#F4EBD9] placeholder-[#6E6655] outline-none transition-all duration-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 shadow-inner",
                    errors.fullName && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              {errors.fullName && (
                <span className="font-sans text-[11px] text-red-400 font-medium mt-0.5">
                  ⚠️ {errors.fullName}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="font-heading text-xs font-black uppercase tracking-wider text-[#F4EBD9] select-none"
              >
                Email Address <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#A69B82] pointer-events-none">
                  ✉️
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="liam@example.com"
                  value={formValues.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] pl-11 pr-4 py-3 font-sans text-xs sm:text-sm text-[#F4EBD9] placeholder-[#6E6655] outline-none transition-all duration-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 shadow-inner",
                    errors.email && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              {errors.email && (
                <span className="font-sans text-[11px] text-red-400 font-medium mt-0.5">
                  ⚠️ {errors.email}
                </span>
              )}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="message"
                className="font-heading text-xs font-black uppercase tracking-wider text-[#F4EBD9] select-none"
              >
                Inquiry Message <span className="text-[#D4AF37]">*</span>
              </label>
              <span className="font-mono text-[10px] text-[#A69B82]">
                {formValues.message.length} / 1000
              </span>
            </div>
            <textarea
              id="message"
              name="message"
              rows={5}
              maxLength={1000}
              placeholder="Please provide competition reference numbers, ticket IDs, or specific questions..."
              value={formValues.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#090A0E] p-4 font-sans text-xs sm:text-sm text-[#F4EBD9] placeholder-[#6E6655] outline-none transition-all duration-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 shadow-inner resize-none",
                errors.message && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            />
            {errors.message && (
              <span className="font-sans text-[11px] text-red-400 font-medium mt-0.5">
                ⚠️ {errors.message}
              </span>
            )}
          </div>

          {/* Privacy Policy Agreement */}
          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                name="agreeToPolicy"
                checked={formValues.agreeToPolicy}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-[rgba(212,175,55,0.3)] bg-[#090A0E] text-[#D4AF37] focus:ring-[#D4AF37]/40 cursor-pointer mt-0.5 accent-[#D4AF37]"
              />
              <span className="font-sans text-xs text-[#A69B82] leading-normal group-hover:text-[#F4EBD9] transition-colors">
                I agree to the{" "}
                <Link href="/privacy" className="text-[#D4AF37] hover:underline">
                  Privacy Policy
                </Link>{" "}
                and consent to TCG Draws processing my contact details to resolve this inquiry.
              </span>
            </label>
            {errors.agreeToPolicy && (
              <span className="font-sans text-[11px] text-red-400 font-medium ml-7">
                ⚠️ {errors.agreeToPolicy}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold-metallic w-full py-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-[0_10px_30px_rgba(212,175,55,0.25)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-[#090A0E] border-t-transparent rounded-full animate-spin" />
                <span>Dispatching to Concierge...</span>
              </div>
            ) : (
              <>
                <span>Send Message to Support</span>
                <span className="text-base">&rarr;</span>
              </>
            )}
          </button>

          {/* Trust reassurance footer */}
          <div className="flex items-center justify-between text-[10px] font-sans text-[#A69B82] pt-2 border-t border-[rgba(212,175,55,0.1)]">
            <span className="flex items-center gap-1.5">
              <span>🔒</span> 256-Bit SSL Encrypted
            </span>
            <span>UK Data Protection Compliant</span>
          </div>
        </form>
      )}
    </div>
  );
}
