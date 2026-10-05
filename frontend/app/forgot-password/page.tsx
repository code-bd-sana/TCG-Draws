import React from "react";
import { Metadata } from "next";
import UserAuthLayout from "../../components/user-auth/UserAuthLayout";
import ForgotPasswordForm from "../../components/user-auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | TCG DRAWS",
  description: "Recover access to your TCG DRAWS collector account.",
};

export default function ForgotPasswordPage() {
  return (
    <UserAuthLayout mode="login">
      <ForgotPasswordForm />
    </UserAuthLayout>
  );
}
