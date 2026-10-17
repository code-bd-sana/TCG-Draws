import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "../../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../../components/website/layout/WebsiteFooter";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const metadata: Metadata = {
  title: "Free Postal Entry Information | TCG Draws",
  description: "Official free postal entry instructions and requirements for TCG Draws prize competitions.",
};

export default async function FreeEntryPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E]">
      <WebsiteNavbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="container-custom max-w-3xl mx-auto px-4">
          <Link
            href={`/live-raffles/${slug}`}
            className="text-xs font-heading font-bold text-[#A69B82] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 mb-8 w-fit uppercase tracking-wider"
          >
            ← Back to Competition
          </Link>
          
          <div className="art-deco-card rounded-2xl p-6 sm:p-10 md:p-12 shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4">
              <span>✉️ UK Statutory Compliance</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#F4EBD9] mb-4 tracking-tight uppercase">
              Free Postal Entry Route
            </h1>
            
            <p className="font-sans text-sm sm:text-base text-[#C8BFAD] leading-relaxed mb-6">
              In accordance with UK Gambling Commission guidelines and consumer prize competition rules, every competition hosted on <strong className="text-[#F4EBD9]">TCG Draws</strong> provides a free, unencumbered postal entry route.
            </p>

            <div className="space-y-6 text-sm text-[#A69B82] leading-relaxed font-sans">
              <div className="bg-[#181C28] border border-[rgba(212,175,55,0.25)] p-5 rounded-xl space-y-3">
                <h3 className="font-heading font-bold text-sm text-[#D4AF37] uppercase tracking-wide">
                  Postcard Entry Instructions
                </h3>
                <p className="text-xs text-[#C8BFAD] leading-relaxed">
                  To enter this competition for free by post, send an unenclosed postcard by First or Second Class post containing the following clearly handwritten information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs text-[#F4EBD9] pl-1">
                  <li>The exact name and reference of the competition you wish to enter.</li>
                  <li>Your full legal name and date of birth (Entrants must be 18 years or older).</li>
                  <li>Your permanent residential UK address.</li>
                  <li>Your active contact phone number and primary email address.</li>
                  <li>The correct answer to the competition skill-based question (if applicable).</li>
                </ul>
              </div>
              
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.35)] p-6 rounded-xl space-y-2">
                <h3 className="font-heading font-black text-sm text-[#D4AF37] uppercase tracking-wide">
                  Send Your Postal Entry To:
                </h3>
                <div className="text-xs text-[#F4EBD9] font-mono leading-relaxed pt-1">
                  TCG Draws Ltd<br />
                  Free Entry Processing Dept<br />
                  Synergy House, Lawson Street<br />
                  North Shields, NE29 6TG<br />
                  United Kingdom
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <h3 className="font-heading font-bold text-sm text-[#F4EBD9] uppercase tracking-wide">
                  Important Rules &amp; Conditions:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-xs text-[#C8BFAD] pl-1">
                  <li><strong>Active User Account Required:</strong> You must have a registered account on TCG Draws before your postcard arrives so ticket numbers can be digitally assigned to your profile. The details on your postcard must match your account details.</li>
                  <li><strong>One Entry Per Card:</strong> Each postal entry must be sent on an individual unenclosed postcard. Multiple entries inside a single envelope will be counted as only one entry.</li>
                  <li><strong>Timely Delivery:</strong> Entries must be received before the competition Closing Date. Entries arriving after the draw has closed will not be eligible.</li>
                  <li><strong>Legibility:</strong> All information must be clearly readable. Illegible or incomplete postcards will be voided.</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-[rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#A69B82]">
                  Review our complete competition policies in our{" "}
                  <Link href="/terms" className="text-[#D4AF37] hover:underline font-bold">
                    Terms &amp; Conditions
                  </Link>.
                </p>

                <Link
                  href={`/live-raffles/${slug}`}
                  className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <span>Return to Raffle</span>
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
