import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import PrivacyContent from "../../components/website/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Fairway Draws",
  description:
    "Learn how Fairway Draws collects, processes, protects, and respects your personal data under UK GDPR and data protection laws.",
};

export default function PrivacyPage() {
  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen bg-[#cfdfcb]">
        <PrivacyContent />
      </main>
      <WebsiteFooter />
    </>
  );
}
