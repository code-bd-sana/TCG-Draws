import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import TermsContent from "../../components/website/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | TCG Draws",
  description:
    "Read the official Terms and Conditions for TCG Draws prize competitions, free postal entry route, eligibility rules, and Anti-Money Laundering policies.",
};

export default function TermsPage() {
  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen bg-[#090A0E]">
        <TermsContent />
      </main>
      <WebsiteFooter />
    </>
  );
}
