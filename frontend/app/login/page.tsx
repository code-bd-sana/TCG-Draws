import React from "react";
import { Metadata } from "next";
import UserAuthLayout from "../../components/user-auth/UserAuthLayout";
import UserLoginForm from "../../components/user-auth/UserLoginForm";

export const metadata: Metadata = {
  title: "Collector Login | TCG DRAWS",
  description: "Log in to your TCG DRAWS vault account to enter exclusive Pokémon card draws, track your entries, and view authenticated slab winners.",
};

/**
 * Customer/User Login Page. Composes UserAuthLayout and UserLoginForm.
 */
export default function UserLoginPage() {
  return (
    <UserAuthLayout mode="login">
      <UserLoginForm />
    </UserAuthLayout>
  );
}
