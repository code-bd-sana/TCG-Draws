import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import TermsContent from "../../components/website/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | Fairway Draws",
  description:
    "Read the official Terms and Conditions for Fairway Draws prize competitions, free postal entry route, eligibility rules, and Anti-Money Laundering policies.",
};

export default function TermsPage() {
  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen bg-[#cfdfcb]">
        <TermsContent />
      </main>
      <WebsiteFooter />
    </>
  );
}
