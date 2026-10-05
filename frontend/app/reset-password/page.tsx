import React, { Suspense } from "react";
import { Metadata } from "next";
import UserAuthLayout from "../../components/user-auth/UserAuthLayout";
import ResetPasswordForm from "../../components/user-auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | TCG DRAWS",
  description: "Enter your new password to secure and access your TCG DRAWS vault account.",
};

export default function ResetPasswordPage() {
  return (
    <UserAuthLayout mode="login">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </UserAuthLayout>
  );
}
