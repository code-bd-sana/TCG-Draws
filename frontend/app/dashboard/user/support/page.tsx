"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthHooks";
import { contactService } from "@/services/contact.service";
import { UserSupportTopicCards } from "@/components/dashboard/user/UserSupportTopicCards";
import { SupportTicketSuccessModal } from "@/components/dashboard/user/SupportTicketSuccessModal";

const TOPIC_OPTIONS = [
  { value: "", label: "Select inquiry topic..." },
  { value: "Questions about a Draw", label: "Questions about a Draw / Raffle" },
  { value: "Ticket Order & Entries", label: "Ticket Order & Entry Confirmation" },
  { value: "Prize Claim & Delivery", label: "Prize Claim & Dispatch Tracking" },
  { value: "Payment & Transaction Issue", label: "Payment & Transaction Query" },
  { value: "Technical & Account Support", label: "Technical Support & Account Issues" },
  { value: "Other Inquiry", label: "Other Inquiries" },
];

const FAQS = [
  {
    q: "How do I claim my prize if I win?",
    a: "When you win a competition, you will receive an immediate email and dashboard notification. Our customer support team will contact you within 24 hours to verify delivery details or arrange your direct bank transfer.",
  },
  {
    q: "Can I get a refund on tickets?",
    a: "As outlined in our competition terms, once ticket numbers are allocated into an active draw, purchases are final and non-refundable unless a draw is cancelled.",
  },
  {
    q: "How are winning tickets drawn?",
    a: "All draws are conducted transparently using an audited, cryptographically secure random number generator (RNG) and recorded live on our official channels.",
  },
  {
    q: "When will my physical prize be dispatched?",
    a: "Physical graded cards and booster boxes are packaged in secure protective armor and dispatched via Royal Mail Special Delivery within 48 to 72 hours of verification.",
  },
];

export default function UserSupportPage() {
  const { data: user } = useAuthUser();
  const formRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Success modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState("");

  // Pre-fill user data when loaded
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (!name) setName(fullName || user.email || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  const handleSelectTopicFromCard = (topicValue: string) => {
    setSubject(topicValue);
    if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) errs.email = "Valid email address is required.";
    if (!subject) errs.subject = "Please select an inquiry topic.";
    if (!message.trim() || message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters long.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const ticketNumber = `#SUP-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullSubject = `[Support Ticket: ${subject}]${orderRef.trim() ? ` (Ref: ${orderRef.trim()})` : ""} - ${ticketNumber}`;
    const fullMessage = orderRef.trim()
      ? `Ticket ID: ${ticketNumber}\nRelated Order/Ref: ${orderRef.trim()}\n\n${message.trim()}`
      : `Ticket ID: ${ticketNumber}\n\n${message.trim()}`;

    try {
      await contactService.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: fullSubject,
        message: fullMessage,
      });

      setGeneratedTicketId(ticketNumber);
      setIsSuccessModalOpen(true);
      toast.success("Support ticket submitted! Reference generated.");
      setMessage("");
      setOrderRef("");
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send support ticket. Please try again or chat with us on WhatsApp.";
      setSubmitError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-8 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn min-h-screen">
      {/* Ambient Art-Deco Lighting Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb Navigation & Real-time Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(212,175,55,0.15)] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted">
          <Link href="/dashboard/user" className="hover:text-[#D4AF37] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-text-muted">User</span>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-[#D4AF37]">Help &amp; Support</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Support Concierge Online</span>
          </div>

          <a
            href="https://wa.me/447466347548?text=Hello%20TCG%20Draws%20Support%2C%20I%20have%20an%20inquiry%20regarding%20my%20account"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all cursor-pointer"
            title="Chat on WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
            Collector Desk &amp; Inquiries
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-tight mt-1">
            Help &amp; Support Center
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Need assistance with a ticket order, prize dispatch tracking, or draw verification? Submit a support ticket or contact our VIP team.
          </p>
        </div>

        <Link href="/dashboard/user/competitions">
          <button className="btn-gold-metallic px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
            <span>Browse Competitions</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Quick Topic Shortcut Cards */}
      <UserSupportTopicCards onSelectTopic={handleSelectTopicFromCard} />

      {/* Main Two-Column Layout */}
      <div ref={formRef} className="flex flex-col lg:flex-row gap-8 w-full items-start">
        {/* Left Column: Support Ticket Form */}
        <div className="flex-1 art-deco-card rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-xl w-full">
          <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.15)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] block">
                Official Helpdesk Channel
              </span>
              <h2 className="font-heading font-black text-lg sm:text-xl text-text-primary uppercase tracking-tight mt-0.5">
                Submit a Support Ticket
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Turnaround &lt; 24h</span>
            </div>
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
              <span>⚠️ {submitError}</span>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="text-rose-400 hover:text-white font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs text-text-muted uppercase tracking-wider">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Your Full Name"
                  className={`input-obsidian w-full h-11 px-4 text-xs sm:text-sm ${
                    errors.name ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.name && <span className="text-rose-400 text-[11px] font-mono">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs text-text-muted uppercase tracking-wider">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="your@email.com"
                  className={`input-obsidian w-full h-11 px-4 text-xs sm:text-sm ${
                    errors.email ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.email && <span className="text-rose-400 text-[11px] font-mono">{errors.email}</span>}
              </div>
            </div>

            {/* Row 2: Topic & Optional Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs text-text-muted uppercase tracking-wider">
                  Inquiry Topic <span className="text-rose-400">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
                  }}
                  className={`input-obsidian w-full h-11 px-4 text-xs sm:text-sm cursor-pointer pr-8 ${
                    errors.subject ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                >
                  {TOPIC_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.subject && <span className="text-rose-400 text-[11px] font-mono">{errors.subject}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs text-text-muted uppercase tracking-wider">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 07466 347548"
                  className="input-obsidian w-full h-11 px-4 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Related Order / Transaction ID */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs text-text-muted uppercase tracking-wider">
                Related Order ID / Ticket Reference (Optional)
              </label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="e.g. #ORD-9281, #TKT-4892 or Competition Name"
                className="input-obsidian w-full h-11 px-4 text-xs sm:text-sm font-mono"
              />
            </div>

            {/* Message Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-heading font-bold text-xs text-text-muted uppercase tracking-wider">
                  Detailed Inquiry Message <span className="text-rose-400">*</span>
                </label>
                <span className="font-mono text-[10px] text-text-muted">
                  {message.length} characters
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                }}
                rows={5}
                placeholder="Please describe your question or issue in detail. Include any relevant draw links or reference numbers..."
                className={`input-obsidian w-full p-4 text-xs sm:text-sm resize-none rounded-xl ${
                  errors.message ? "border-rose-500 focus:border-rose-500" : ""
                }`}
              />
              {errors.message && <span className="text-rose-400 text-[11px] font-mono">{errors.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold-metallic w-full h-12 text-[#090A0E] rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] active:scale-98 cursor-pointer disabled:opacity-60 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#090A0E] border-t-transparent rounded-full animate-spin" />
                  <span>Logging Support Ticket...</span>
                </>
              ) : (
                <>
                  <span>Submit Support Ticket</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Direct Contact Channels & Quick FAQs */}
        <div className="w-full lg:w-[460px] flex flex-col gap-6 shrink-0">
          {/* Quick Contact Cards */}
          <div className="art-deco-card rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="font-heading font-black text-base uppercase tracking-tight text-text-primary border-b border-[rgba(212,175,55,0.15)] pb-3">
              Direct Concierge Channels
            </h2>

            {/* Email Support Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#090A0E]/70 border border-white/5 hover:border-[rgba(212,175,55,0.3)] transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#D4AF37]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
                    Email Desk
                  </span>
                  <a
                    href="mailto:support@tcgdraws.com"
                    className="font-mono text-xs text-[#F5E5C0] hover:text-[#D4AF37] hover:underline truncate mt-0.5"
                  >
                    support@tcgdraws.com
                  </a>
                </div>
              </div>
              <a
                href="mailto:support@tcgdraws.com"
                className="px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#141720] text-xs font-mono font-bold text-[#F5E5C0] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all shrink-0"
              >
                Email
              </a>
            </div>

            {/* WhatsApp Support Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#090A0E]/70 border border-white/5 hover:border-[#25D366]/40 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
                    WhatsApp Concierge
                  </span>
                  <span className="font-mono text-xs text-text-muted mt-0.5">
                    07466 347548
                  </span>
                </div>
              </div>
              <a
                href="https://wa.me/447466347548?text=Hello%20TCG%20Draws%20Support%2C%20I%20have%20an%20inquiry%20regarding%20my%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#25D366] text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shrink-0 shadow-sm"
              >
                Chat
              </a>
            </div>

            {/* Operating Hours Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#090A0E]/60 border border-white/5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#141720] border border-white/10 flex items-center justify-center text-[#D4AF37]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
                  Live Operating Hours
                </span>
                <span className="font-mono text-xs text-text-muted mt-0.5">
                  Mon – Sun: 8:00 AM – 10:00 PM GMT
                </span>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="art-deco-card rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.15)] pb-3">
              <h2 className="font-heading font-black text-base uppercase tracking-tight text-text-primary">
                Quick Answers
              </h2>
              <Link
                href="/how-it-works"
                className="text-xs font-mono text-[#D4AF37] hover:underline"
              >
                How It Works →
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-white/5">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer"
                    >
                      <span className="font-heading font-bold text-xs text-text-primary group-hover:text-[#D4AF37] transition-colors pr-2">
                        {faq.q}
                      </span>
                      <span className="text-[#D4AF37] font-mono text-sm font-bold shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="font-sans text-xs text-text-muted leading-relaxed pl-1 pt-1 animate-in fade-in duration-150">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Ticket Success Modal */}
      <SupportTicketSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        ticketId={generatedTicketId}
        email={email}
        subject={subject}
      />
    </div>
  );
}
