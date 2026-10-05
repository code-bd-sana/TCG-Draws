import React from "react";
import EditRaffleForm from "../../../../../../components/dashboard/host/edit/EditRaffleForm";

export const metadata = {
  title: "Edit Competition | Host Dashboard",
};

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex-1 w-full max-w-[960px] mx-auto py-6 md:py-8 px-4 sm:px-6">
      <EditRaffleForm raffleId={id} />
    </div>
  );
}
