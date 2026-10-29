import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import ContactHero from "../../components/website/contact/ContactHero";
import ContactForm from "../../components/website/contact/ContactForm";
import ContactInfoCards from "../../components/website/contact/ContactInfoCards";
import ContactFaqSection from "../../components/website/contact/ContactFaqSection";

export const metadata: Metadata = {
  title: "Contact Concierge & Support | TCG Draws",
  description:
    "Get in touch with the TCG Draws customer service team. Direct WhatsApp desk, email concierge, postal entry information, and instant support.",
};

/**
 * Public 'Contact' page route at `/contact`.
 * Elevated with dark Art-Deco Obsidian & Metallic Gold styling, fast-action channels,
 * interactive contact form, live operating hours, and comprehensive instant FAQ.
 */
export default function ContactPage() {
  return (
    <>
      {/* Sticky top navbar */}
      <WebsiteNavbar />

      <main className="min-h-screen flex flex-col bg-[#090A0E] relative isolate overflow-hidden">
        {/* Page Hero subheaders */}
        <ContactHero />

        {/* Quick Action Channels Bar */}
        <section className="relative z-10 -mt-6 sm:-mt-8 container-custom max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* WhatsApp Quick Channel */}
            <a
              href="https://wa.me/447466347548?text=Hello%20TCG%20Draws%20Customer%20Service%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366] hover:shadow-[0_10px_25px_rgba(37,211,102,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-xl">
                  💬
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-xs uppercase tracking-wider text-[#F4EBD9]">
                    WhatsApp Desk
                  </span>
                  <span className="font-sans text-[11px] text-[#A69B82]">
                    Direct messaging support
                  </span>
                </div>
              </div>
              <span className="font-heading text-xs font-bold text-[#25D366] group-hover:translate-x-1 transition-transform">
                Chat &rarr;
              </span>
            </a>

            {/* Email Quick Channel */}
            <a
              href="mailto:support@tcgdraws.com"
              className="group flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_10px_25px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#181C28] border border-[rgba(212,175,55,0.35)] text-[#D4AF37] text-xl">
                  ✉️
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-xs uppercase tracking-wider text-[#F4EBD9]">
                    Email Support
                  </span>
                  <span className="font-sans text-[11px] text-[#A69B82]">
                    support@tcgdraws.com
                  </span>
                </div>
              </div>
              <span className="font-heading text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                Write &rarr;
              </span>
            </a>

            {/* Host Partner Fast Track */}
            <Link
              href="/host/register"
              className="group flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_10px_25px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#181C28] border border-[rgba(212,175,55,0.35)] text-[#D4AF37] text-xl">
                  🏆
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-xs uppercase tracking-wider text-[#F4EBD9]">
                    Breaker Onboarding
                  </span>
                  <span className="font-sans text-[11px] text-[#A69B82]">
                    Launch card competitions
                  </span>
                </div>
              </div>
              <span className="font-heading text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                Apply &rarr;
              </span>
            </Link>
          </div>
        </section>

        {/* Form and Support Info section */}
        <section className="relative w-full py-14 sm:py-20">
          <div className="container-custom relative max-w-6xl z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
              
              {/* Left Column: Interactive Contact Form */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              {/* Right Column: Support Info cards */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <ContactInfoCards />
              </div>

            </div>

            {/* Instant Help & FAQ Section */}
            <ContactFaqSection />
          </div>
        </section>
      </main>

      {/* Global website footer */}
      <WebsiteFooter />
    </>
  );
}
