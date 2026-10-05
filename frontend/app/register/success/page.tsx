import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import UserAuthLayout from "../../../components/user-auth/UserAuthLayout";
import PrimaryButton from "../../../components/website/shared/PrimaryButton";

export const metadata: Metadata = {
  title: "Registration Successful | Fairway Draws",
  description: "Your account has been created successfully.",
};

export default function RegisterSuccessPage() {
  return (
    <UserAuthLayout mode="register">
      <div className="flex flex-col items-center justify-center space-y-6 rounded-[20px] border border-[#bdd3ba] bg-[#edf5e9] p-8 text-center shadow-[0_12px_28px_rgba(11,77,53,.12)] md:p-12">
        <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#4ade80]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="font-heading text-3xl font-bold text-text-primary">
          Account Created!
        </h2>
        <p className="max-w-sm text-text-secondary">
          Welcome to Fairway Draws. Your account is fully set up. You can now browse live competitions and purchase tickets.
        </p>
        <Link href="/login" className="w-full">
          <PrimaryButton className="w-full">Go to Login</PrimaryButton>
        </Link>
      </div>
    </UserAuthLayout>
  );
}
