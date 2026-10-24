"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CompetitionSelector from "@/components/dashboard/admin/ticket-assignment/CompetitionSelector";
import InstantWinVisualizer from "@/components/dashboard/admin/ticket-assignment/InstantWinVisualizer";
import TicketNumberSelector from "@/components/dashboard/admin/ticket-assignment/TicketNumberSelector";
import RecipientUserSearch from "@/components/dashboard/admin/ticket-assignment/RecipientUserSearch";
import AccountingSummary from "@/components/dashboard/admin/ticket-assignment/AccountingSummary";
import {
  ConfirmationModal,
  SuccessModal,
} from "@/components/dashboard/admin/ticket-assignment/AssignmentModals";
import AssignmentHistoryTab from "@/components/dashboard/admin/ticket-assignment/AssignmentHistoryTab";
import {
  useAdminCompetitions,
  useAdminCompetitionDetails,
  useAdminAssignTicketsMutation,
} from "@/hooks/useAdminTicketAssignment";
import {
  CompetitionItem,
  RecipientUser,
  AssignTicketsResult,
} from "@/services/admin-ticket-assignment.service";
import { toast } from "sonner";

function AdminTicketAssignmentContent() {
  const searchParams = useSearchParams();
  const urlCompId = searchParams.get("competitionId");
  const [activeTab, setActiveTab] = useState<"assign" | "history">("assign");

  // Workflow states
  const [selectedCompetitionSummary, setSelectedCompetitionSummary] =
    useState<CompetitionItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<RecipientUser | null>(null);
  const [mode, setMode] = useState<"specific" | "random">("specific");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [randomQuantity, setRandomQuantity] = useState<number>(1);
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successResult, setSuccessResult] = useState<AssignTicketsResult | null>(null);

  // Queries & Mutations
  const { data: competitions = [], isLoading: isCompetitionsLoading } =
    useAdminCompetitions();

  useEffect(() => {
    if (urlCompId && competitions.length > 0 && !selectedCompetitionSummary) {
      const match = competitions.find((c) => c.id === urlCompId);
      if (match) {
        setSelectedCompetitionSummary(match);
      }
    }
  }, [urlCompId, competitions, selectedCompetitionSummary]);

  const { data: fullCompetition, isLoading: isDetailsLoading } =
    useAdminCompetitionDetails(selectedCompetitionSummary?.id);

  const assignMutation = useAdminAssignTicketsMutation();

  const handleSelectCompetition = (comp: CompetitionItem) => {
    setSelectedCompetitionSummary(comp);
    setSelectedNumbers([]);
    setRandomQuantity(1);
  };

  const handleToggleInstantWinNumber = (num: number) => {
    setMode("specific");
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleOpenConfirm = () => {
    if (!selectedCompetitionSummary) {
      toast.error("Please select an active competition.");
      return;
    }
    if (!selectedUser) {
      toast.error("Please select a recipient user.");
      return;
    }
    const count = mode === "specific" ? selectedNumbers.length : randomQuantity;
    if (count <= 0) {
      toast.error("Please select at least 1 ticket to assign.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleExecuteAssignment = async () => {
    if (!selectedCompetitionSummary || !selectedUser) return;

    try {
      const payload = {
        raffleId: selectedCompetitionSummary.id,
        userId: selectedUser.id,
        ticketNumbers: mode === "specific" ? selectedNumbers : undefined,
        quantity: mode === "random" ? randomQuantity : undefined,
        adminNotes: adminNotes.trim() || undefined,
      };

      const result = await assignMutation.mutateAsync(payload);
      setIsConfirmModalOpen(false);
      setSuccessResult(result);
      setIsSuccessModalOpen(true);

      // Reset form selection
      setSelectedNumbers([]);
      setRandomQuantity(1);
      setAdminNotes("");

      toast.success(result.message || "Tickets successfully allocated!");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to assign tickets. Please check constraints.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-lg font-bold">
              🛡️
            </span>
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
              Admin Manual Ticket Assignment
            </h1>
          </div>
          <p className="font-sans text-xs text-text-muted">
            Issue competition tickets directly to users with 100% financial consistency, host wallet crediting, and instant win prize automation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-surface p-1 border border-border shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("assign")}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "assign"
                ? "bg-primary text-black font-black shadow-xs"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Assign Tickets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-primary text-black font-black shadow-xs"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Assignment History
          </button>
        </div>
      </div>

      {/* TAB 1: ASSIGN TICKETS WORKFLOW */}
      {activeTab === "assign" && (
        <div className="flex flex-col gap-6">
          {/* Step 1: Competition Selection */}
          <CompetitionSelector
            competitions={competitions}
            selectedCompetition={selectedCompetitionSummary}
            onSelectCompetition={handleSelectCompetition}
            isLoading={isCompetitionsLoading}
          />

          {/* Loading details state */}
          {selectedCompetitionSummary && isDetailsLoading && (
            <div className="py-8 text-center text-xs text-text-muted font-sans flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading ticket inventory and instant win data...
            </div>
          )}

          {/* Step 2, 3, 4, 5: Shown once competition details loaded */}
          {selectedCompetitionSummary && fullCompetition && !isDetailsLoading && (
            <>
              {/* Step 2: Instant Win Visualizer */}
              {fullCompetition.instantWins && fullCompetition.instantWins.length > 0 && (
                <InstantWinVisualizer
                  instantWins={fullCompetition.instantWins}
                  selectedTicketNumbers={selectedNumbers}
                  onToggleTicketNumber={handleToggleInstantWinNumber}
                />
              )}

              {/* Step 3: Ticket Number Selector */}
              <TicketNumberSelector
                competition={fullCompetition}
                mode={mode}
                onModeChange={setMode}
                selectedNumbers={selectedNumbers}
                onSelectedNumbersChange={setSelectedNumbers}
                randomQuantity={randomQuantity}
                onRandomQuantityChange={setRandomQuantity}
              />

              {/* Step 4: Recipient User Search */}
              <RecipientUserSearch
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
                onClearUser={() => setSelectedUser(null)}
              />

              {/* Step 5: Accounting Breakdown & Action */}
              <AccountingSummary
                competition={fullCompetition}
                recipient={selectedUser}
                mode={mode}
                selectedNumbers={selectedNumbers}
                randomQuantity={randomQuantity}
                adminNotes={adminNotes}
                onAdminNotesChange={setAdminNotes}
                onSubmit={handleOpenConfirm}
                isSubmitting={assignMutation.isPending}
              />
            </>
          )}

          {/* Empty Prompt if no competition selected */}
          {!selectedCompetitionSummary && (
            <div className="py-16 text-center text-xs text-text-muted font-sans bg-surface border border-border border-dashed rounded-card flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🎟️</span>
              <p className="font-heading font-bold text-sm text-text-primary">
                Select a Competition to Begin
              </p>
              <p className="max-w-sm text-text-muted">
                Choose an active competition above to load its ticket grid, instant win prizes, and recipient selector.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNMENT HISTORY AUDIT TAB */}
      {activeTab === "history" && <AssignmentHistoryTab />}

      {/* MODALS */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecuteAssignment}
        competition={fullCompetition || null}
        recipient={selectedUser}
        mode={mode}
        selectedNumbers={selectedNumbers}
        randomQuantity={randomQuantity}
        adminNotes={adminNotes}
        isSubmitting={assignMutation.isPending}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        result={successResult}
      />
    </div>
  );
}

export default function AdminTicketAssignmentPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-12 text-center text-text-muted font-sans text-xs font-bold animate-pulse">
          Loading ticket assignment system...
        </div>
      }
    >
      <AdminTicketAssignmentContent />
    </Suspense>
  );
}
