"use client";

import React from "react";
import HostProfileForm from "../../../../components/dashboard/host/profile/HostProfileForm";

export default function HostProfilePage() {
  return (
    <div className="flex-1 w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Host Brand Profile
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Manage your public brand identity, logo, contact details, and host verification status.
        </p>
      </div>

      <HostProfileForm />
    </div>
  );
}
