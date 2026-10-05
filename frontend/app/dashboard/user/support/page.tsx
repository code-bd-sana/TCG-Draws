"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthHooks";
import { contactService } from "@/services/contact.service";

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
];

export default function UserSupportPage() {
  const { data: user } = useAuthUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Pre-fill user data when loaded
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (!name) setName(fullName || user.email || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

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

    const fullSubject = `[Support Ticket: ${subject}]${orderRef.trim() ? ` (Ref: ${orderRef.trim()})` : ""}`;
    const fullMessage = orderRef.trim()
      ? `Related Order/Ref: ${orderRef.trim()}\n\n${message.trim()}`
      : message.trim();

    try {
      await contactService.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: fullSubject,
        message: fullMessage,
      });

      toast.success("Support ticket submitted! Our team has received your message.");
      setIsSuccess(true);
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
    <div className="p-6 lg:p-8 max-w-[1660px] mx-auto w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Help &amp; Support Center
        </h1>
        <p className="font-sans text-xs sm:text-sm text-text-muted">
          Need assistance with a ticket order, prize claim, or account issue? Submit a ticket or connect with our support crew.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Left Column: Support Ticket Form */}
        <div className="flex-1 bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card w-full">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <div>
              <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                Submit a Support Ticket
              </h2>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Our support team typically responds to all inquiries within 24 hours via email.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF5EE] border border-[#CBD8C8] text-text-brand text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Support Online</span>
            </div>
          </div>

          {/* Success State Notification */}
          {isSuccess && (
            <div className="p-5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-heading font-bold text-sm">
                <span>✅ Support Ticket Dispatched!</span>
              </div>
              <p className="font-sans text-xs leading-relaxed text-[#166534]">
                Your support ticket has been sent to our customer care team at <strong>info@fairwaydraws.com</strong>.
                We have also queued a confirmation response to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="mt-2 w-fit px-4 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Send Another Ticket
              </button>
            </div>
          )}

          {/* Submit Error Notification */}
          {submitError && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-800 text-red-600 font-sans text-xs flex items-center justify-between">
              <span>⚠️ {submitError}</span>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="text-red-400 hover:text-red-600 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="Your Full Name"
                    className={`w-full h-11 bg-elevated border rounded-xl px-4 text-sm text-text-primary font-sans focus:outline-none focus:border-primary transition-all ${
                      errors.name ? "border-red-500" : "border-border-medium"
                    }`}
                  />
                  {errors.name && <span className="text-red-500 text-[11px]">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="your@email.com"
                    className={`w-full h-11 bg-elevated border rounded-xl px-4 text-sm text-text-primary font-sans focus:outline-none focus:border-primary transition-all ${
                      errors.email ? "border-red-500" : "border-border-medium"
                    }`}
                  />
                  {errors.email && <span className="text-red-500 text-[11px]">{errors.email}</span>}
                </div>
              </div>

              {/* Row 2: Topic & Optional Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                    Inquiry Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
                    }}
                    className={`w-full h-11 bg-elevated border rounded-xl px-4 text-sm text-text-primary font-sans focus:outline-none focus:border-primary transition-all cursor-pointer ${
                      errors.subject ? "border-red-500" : "border-border-medium"
                    }`}
                  >
                    {TOPIC_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <span className="text-red-500 text-[11px]">{errors.subject}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07466 347548"
                    className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary font-sans focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Related Order / Transaction ID (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                  Related Order ID / Ticket Reference (Optional)
                </label>
                <input
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="e.g. #ORDER-1849 or Competition Name"
                  className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Message Field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                  Detailed Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                  }}
                  placeholder="Please describe your question or issue in detail..."
                  className={`w-full h-[160px] bg-elevated border rounded-xl p-4 text-sm text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none ${
                    errors.message ? "border-red-500" : "border-border-medium"
                  }`}
                />
                {errors.message && <span className="text-red-500 text-[11px]">{errors.message}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-glossy-red w-full h-[46px] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer disabled:opacity-60 transition-all mt-1"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Sending Ticket...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Support Ticket</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Contact Channels & Quick FAQs (matching /contact) */}
        <div className="w-full lg:w-[460px] flex flex-col gap-6 shrink-0">
          {/* Quick Contact Cards */}
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-4 shadow-card">
            <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight border-b border-divider pb-3">
              Direct Contact Channels
            </h2>

            {/* Email Support Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-elevated border border-border-medium hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full bg-accent-bg border border-primary/20 flex items-center justify-center text-text-brand">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
                    Email Support
                  </span>
                  <a
                    href="mailto:info@fairwaydraws.com"
                    className="font-sans text-xs text-text-brand hover:underline truncate mt-0.5"
                  >
                    info@fairwaydraws.com
                  </a>
                </div>
              </div>
              <a
                href="mailto:info@fairwaydraws.com"
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-sans font-semibold text-text-primary hover:bg-elevated transition-all shrink-0"
              >
                Email
              </a>
            </div>

            {/* WhatsApp Support Card */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-elevated border border-border-medium hover:border-[#25D366]/40 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
                    Customer Service WhatsApp
                  </span>
                  <span className="font-sans text-xs text-text-muted mt-0.5">
                    07466 347548
                  </span>
                </div>
              </div>
              <a
                href="https://wa.me/447466347548?text=Hello%20Fairway%20Draws%20Support%2C%20I%20have%20an%20inquiry%20regarding%20my%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-sans text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <span>Chat</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>

            {/* Operating Hours Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-elevated border border-border-medium">
              <div className="w-10 h-10 shrink-0 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
                  Operating Hours
                </span>
                <span className="font-sans text-xs text-text-muted mt-0.5">
                  Mon – Sun: 8:00 AM – 10:00 PM GMT
                </span>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-4 shadow-card">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                Frequently Asked Questions
              </h2>
              <Link
                href="/faqs"
                className="text-xs font-sans font-bold text-text-brand hover:underline"
              >
                All FAQs →
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-divider">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer"
                    >
                      <span className="font-sans font-bold text-xs text-text-primary group-hover:text-text-brand transition-colors">
                        {faq.q}
                      </span>
                      <span className="text-text-muted text-sm font-bold ml-2">
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
    </div>
  );
}
