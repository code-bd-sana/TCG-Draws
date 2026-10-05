import React from "react";
import { Metadata } from "next";
import UserAuthLayout from "../../components/user-auth/UserAuthLayout";
import UserRegistrationForm from "../../components/user-auth/UserRegistrationForm";

export const metadata: Metadata = {
  title: "Player Registration | Fairway Draws",
  description: "Create an account to join the Fairway Draws community, purchase tickets, and win premium prizes.",
};

export default function UserRegisterPage() {
  return (
    <UserAuthLayout mode="register">
      <UserRegistrationForm />
    </UserAuthLayout>
  );
}
