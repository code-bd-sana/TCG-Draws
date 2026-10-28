"use client";

import React, { useState, useEffect } from "react";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "../../../../hooks/useUserHooks";
import { extractApiError } from "../../../../lib/utils";
import AvatarUploadModal from "./AvatarUploadModal";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { data: user, isLoading } = useAuthUser();
  const updateMutation = useUpdateProfileMutation();
  const avatarMutation = useUploadAvatarMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await updateMutation.mutateAsync({
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        location: formData.location.trim() || undefined,
      });
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      setErrorMsg(extractApiError(err, "Failed to update profile details."));
    }
  };

  const handleAvatarUpload = async (file: File) => {
    await avatarMutation.mutateAsync(file);
  };

  if (isLoading) {
    return (
      <div className="art-deco-card rounded-card p-8 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-48 bg-elevated rounded" />
        <div className="h-4 w-72 bg-elevated rounded" />
        <div className="h-28 w-full bg-elevated/40 rounded-xl mt-4" />
      </div>
    );
  }

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase()
    : (user?.email?.[0] || "U").toUpperCase();

  return (
    <div className="art-deco-card rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card animate-fadeIn border border-border">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div>
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            Personal &amp; Public Profile
          </h2>
          <p className="font-sans text-xs text-text-muted mt-0.5">
            Manage your display name, contact coordinates, and public platform avatar.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-xs uppercase self-start sm:self-auto">
          Role: {user?.role || "USER"}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-sans font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Avatar Hero Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-xl bg-surface/70 border border-primary/20">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40 p-1 bg-surface shadow-md">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-accent-bg flex items-center justify-center text-text-brand font-heading font-black text-xl">
                {initials}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-[#090A0E] flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
            title="Update avatar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center sm:items-start min-w-0 flex-1 text-center sm:text-left">
          <h3 className="font-heading font-black text-base text-text-primary">
            {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Unnamed User"}
          </h3>
          <p className="font-mono text-xs text-text-muted mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="e.g. Sarah"
              className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="e.g. Jenkins"
              className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="input-obsidian w-full h-11 px-4 rounded-xl font-mono text-xs text-text-muted opacity-60 cursor-not-allowed shadow-sm"
              title="Email address cannot be modified directly"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Location / Region
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. London, United Kingdom"
              className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-4 border-t border-border/80">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-gold-metallic h-10 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Profile Details</span>
            )}
          </button>
        </div>
      </form>

      {/* Draggable Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={user?.avatarUrl}
        onUpload={handleAvatarUpload}
      />
    </div>
  );
}
