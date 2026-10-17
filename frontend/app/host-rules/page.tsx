import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export const metadata: Metadata = {
  title: "Host Rules & Guidelines | TCG Draws",
  description: "Mandatory guidelines, authenticity standards, escrow terms, and draw protocols for Verified Hosts on TCG Draws.",
};

export default function HostRulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E]">
      <WebsiteNavbar />
      
      <main className="flex-grow pt-28 pb-20">
        <div className="container-custom max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="text-xs font-heading font-bold text-[#A69B82] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 mb-8 w-fit uppercase tracking-wider"
          >
            ← Back to Home
          </Link>
          
          <div className="art-deco-card rounded-2xl p-6 sm:p-10 md:p-12 shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4">
              <span>🛡️ Host Code of Conduct &amp; Compliance</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-[#F4EBD9] mb-4 tracking-tight uppercase">
              Host Rules &amp; Guidelines
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#C8BFAD] leading-relaxed mb-8">
              As a Verified Host on <strong className="text-[#F4EBD9]">TCG Draws</strong>, you are expected to maintain the highest standards of integrity, transparency, authenticity, and customer service. Please review our mandatory guidelines and operating standards below.
            </p>
            
            <div className="space-y-8 font-sans text-sm text-[#A69B82] leading-relaxed">
              {/* Important Platform Standards Notice */}
              <div className="bg-[#181C28] border border-[rgba(212,175,55,0.25)] p-6 rounded-xl space-y-2">
                <h3 className="font-heading font-bold text-base text-[#D4AF37] uppercase tracking-wide flex items-center gap-2">
                  <span>⚡ Verified Host Commitment</span>
                </h3>
                <p className="text-xs text-[#C8BFAD] leading-relaxed">
                  All competitions on TCG Draws are legally binding under UK consumer competition laws. Hosts must uphold strict Escrow terms, timely prize dispatch with trackable delivery, and verified draw procedures. Failure to comply leads to immediate revocation of host status and forfeiture of Escrow funds.
                </p>
              </div>

              {/* Rule 1 */}
              <div className="space-y-3">
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#F4EBD9] uppercase tracking-wide flex items-center gap-2 border-b border-[rgba(212,175,55,0.15)] pb-2">
                  <span className="text-[#D4AF37]">1.</span> Authenticity &amp; Product Condition
                </h3>
                <p>
                  All collectible cards, booster boxes, tins, cases, and memorabilia offered as prizes must be 100% authentic, tamper-free, and exactly as represented in the competition listing.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#C8BFAD] pl-2">
                  <li><strong>Graded Cards (Slabs):</strong> Must be authenticated by recognised grading authorities (PSA, BGS, CGC, or ACE). Certification numbers and high-resolution photos of both front and reverse must be visible.</li>
                  <li><strong>Sealed Product:</strong> Booster boxes, packs, and collection boxes must have intact factory shrink-wrap with official publisher logos where applicable (Pokémon, Bandai, Konami, Wizards of the Coast). No resealed product is tolerated.</li>
                  <li><strong>Raw / Single Cards:</strong> Accurate condition grading (Mint, Near Mint, Lightly Played) must be explicitly stated. Any whitening, surface scratches, or print lines must be photographed clearly.</li>
                </ul>
              </div>

              {/* Rule 2 */}
              <div className="space-y-3">
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#F4EBD9] uppercase tracking-wide flex items-center gap-2 border-b border-[rgba(212,175,55,0.15)] pb-2">
                  <span className="text-[#D4AF37]">2.</span> Draw Procedure &amp; Provable Randomness
                </h3>
                <p>
                  All live draws must be conducted strictly with fairness and transparent verification:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#C8BFAD] pl-2">
                  <li>Main draws must use audited random number generation (RNG) live on stream (YouTube, Facebook, or Twitch).</li>
                  <li>Ticket spreadsheets with entrant numbers must be displayed transparently on-screen prior to generating winning numbers.</li>
                  <li>Live stream recordings must be archived and publicly accessible for a minimum of 30 days after draw conclusion.</li>
                  <li>Instant Win prizes are automatically allocated at time of ticket purchase by the verified TCG Draws system.</li>
                </ul>
              </div>

              {/* Rule 3 */}
              <div className="space-y-3">
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#F4EBD9] uppercase tracking-wide flex items-center gap-2 border-b border-[rgba(212,175,55,0.15)] pb-2">
                  <span className="text-[#D4AF37]">3.</span> Packaging, Courier Dispatch &amp; Insurance
                </h3>
                <p>
                  Trading cards and collectible memorabilia are sensitive, high-value assets requiring protective handling:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#C8BFAD] pl-2">
                  <li>Hosts are required to dispatch physical prizes within <strong>7 business days</strong> of winner identity verification.</li>
                  <li>Single cards must be secured in penny sleeves, semi-rigid / toploaders, and cardboard 'cardboard sandwiches' with bubble-mailer protection.</li>
                  <li>High-value prizes (over £150) must be shipped via tracked and insured courier services (Royal Mail Special Delivery, DPD, DHL Express) requiring signature upon delivery.</li>
                  <li>Tracking codes must be uploaded to the TCG Draws Host Portal to trigger escrow payout release.</li>
                </ul>
              </div>

              {/* Rule 4 */}
              <div className="space-y-3">
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#F4EBD9] uppercase tracking-wide flex items-center gap-2 border-b border-[rgba(212,175,55,0.15)] pb-2">
                  <span className="text-[#D4AF37]">4.</span> Escrow, Fees &amp; Payout Release
                </h3>
                <p>
                  To protect entrants and maintain community trust, host competition revenue is held securely in platform Escrow:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#C8BFAD] pl-2">
                  <li>Ticket sales revenue is released only after the winner has confirmed delivery or tracking demonstrates verified delivery to the winner&apos;s address.</li>
                  <li>Platform commission fees are deducted per your verified Host subscription tier.</li>
                  <li>Any verified dispute regarding counterfeits or non-delivery will result in an immediate refund to ticket buyers and permanent account ban.</li>
                </ul>
              </div>

              <div className="mt-12 pt-8 border-t border-[rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#A69B82]">
                  Need clarification on host eligibility or competition approvals?{" "}
                  <Link href="/contact" className="text-[#D4AF37] hover:underline font-bold">
                    Contact Host Relations
                  </Link>
                </p>

                <Link
                  href="/pricing"
                  className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <span>Explore Host Plans</span>
                  <span>→</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
