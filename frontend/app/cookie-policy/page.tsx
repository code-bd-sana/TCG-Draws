import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import CookieContent from "../../components/website/legal/CookieContent";

export const metadata: Metadata = {
  title: "Cookie Policy | TCG Draws",
  description:
    "Learn about the cookies and tracking technologies used on TCG Draws to ensure security, site functionality, and optimal performance.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen bg-[#090A0E]">
        <CookieContent />
      </main>
      <WebsiteFooter />
    </>
  );
}
