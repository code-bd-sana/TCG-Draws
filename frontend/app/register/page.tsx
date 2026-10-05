import React from "react";
import { Metadata } from "next";
import UserAuthLayout from "../../components/user-auth/UserAuthLayout";
import UserRegistrationForm from "../../components/user-auth/UserRegistrationForm";

export const metadata: Metadata = {
  title: "Collector Registration | TCG DRAWS",
  description: "Create your TCG DRAWS account to join the collector community, enter draws for PSA/BGS graded Pokémon slabs, and win rare grails.",
};

export default function UserRegisterPage() {
  return (
    <UserAuthLayout mode="register">
      <UserRegistrationForm />
    </UserAuthLayout>
  );
}
