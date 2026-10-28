"use client";

import React, { useState, useEffect } from "react";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { userService } from "../../../../services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AvatarUploadModal from "../../shared/settings/AvatarUploadModal";
import { toast } from "sonner";

export default function UserProfileForm() {
  const { data: user, isLoading } = useAuthUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      let formattedDob = "";
      if (user.dateOfBirth) {
        try {
          const d = new Date(user.dateOfBirth);
          if (!isNaN(d.getTime())) {
            formattedDob = d.toISOString().split("T")[0];
          }
        } catch {}
      }

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || user.hostProfile?.phone || "",
        dateOfBirth: formattedDob,
        address: user.address || user.location || user.hostProfile?.address || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.updateProfile(data);
    },
    onSuccess: (data) => {
      toast.success("Profile details and shipping address saved successfully!");
      queryClient.setQueryData(["user"], data.user);
      setProfileError("");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to save profile details.";
      setProfileError(msg);
      toast.error(msg);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.changePassword(data);
    },
    onSuccess: () => {
      toast.success("Account password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to change password.";
      setPasswordError(msg);
      toast.error(msg);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return userService.uploadAvatar(file);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  const handleAvatarUpload = async (file: File) => {
    await uploadAvatarMutation.mutateAsync(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setProfileError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const getPasswordStrength = () => {
    const p = passwordData.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        setProfileError("You must be at least 18 years of age to participate in prize draws.");
        toast.error("Age requirement: Must be at least 18 years old");
        return;
      }
    }

    updateProfileMutation.mutate({
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address.trim() || undefined,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col xl:flex-row gap-6 w-full animate-pulse">
        <div className="w-full xl:w-[360px] h-[380px] art-deco-card rounded-card" />
        <div className="flex-1 h-[520px] art-deco-card rounded-card" />
      </div>
    );
  }

  const initials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "PL";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "N/A";

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full animate-fadeIn items-start font-sans">
      {/* Left Column: Player Identity Card */}
      <div className="w-full xl:w-[360px] shrink-0 flex flex-col gap-5">
        <div className="art-deco-card rounded-card p-6 lg:p-8 flex flex-col items-center shadow-card border border-border">
          {/* Avatar Area */}
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-full border-2 border-primary/40 p-1 bg-surface flex items-center justify-center overflow-hidden shadow-lg">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-accent-bg flex items-center justify-center font-heading font-black text-3xl text-text-brand">
                  {initials}
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-[#090A0E] hover:scale-105 transition-transform cursor-pointer shadow-md"
              title="Change Avatar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
            </button>
          </div>

          <h3 className="font-heading font-black text-lg text-text-primary text-center">
            {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Verified Player"}
          </h3>
          <p className="font-mono text-xs text-text-muted text-center mt-0.5 truncate max-w-[260px]">
            {user?.email}
          </p>

          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="btn-dark-metallic h-8 px-4 rounded-xl font-heading font-bold text-[11px] uppercase tracking-wider mt-4 cursor-pointer"
          >
            Update Avatar
          </button>

          {/* Verification Badge */}
          {user?.isEmailVerified && (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-2 px-3 mt-5 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="font-sans font-bold text-xs text-emerald-400">Email Verified Account</span>
            </div>
          )}

          {/* Player Stats */}
          <div className="w-full flex flex-col gap-3 pt-5 mt-5 border-t border-border/80 text-xs">
            <div className="flex justify-between items-center w-full">
              <span className="text-text-muted font-sans">Member Since</span>
              <span className="font-heading font-bold text-text-primary">{memberSince}</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-text-muted font-sans">Account Tier</span>
              <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30">
                <span className="font-sans font-bold text-[10px] text-text-brand uppercase tracking-wider">
                  {user?.role || "USER"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Profile & Security Forms */}
      <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
        {/* Personal Details & Shipping Address Form */}
        <form
          onSubmit={handleProfileSubmit}
          className="art-deco-card rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card border border-border"
        >
          <div className="flex justify-between items-center pb-4 border-b border-border/80">
            <div>
              <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                Personal Details &amp; Prize Shipping Address
              </h3>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Physical coordinates used by competition hosts for postal courier dispatch.
              </p>
            </div>
          </div>

          {profileError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-sans font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="e.g. Jenkins"
                className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Email Address (Master Account ID)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="input-obsidian w-full h-11 px-4 rounded-xl font-mono text-xs text-text-muted opacity-60 cursor-not-allowed shadow-sm"
                title="Email is locked to your account credentials"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+44 7700 900123"
                className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Date of Birth</span>
                <span className="font-mono text-[10px] text-text-brand">18+ Requirement</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Shipping Address for Prize Dispatches
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Flat / House number, Street name, City, Postcode, Country"
                rows={3}
                className="input-obsidian w-full p-3 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/80">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="btn-gold-metallic h-10 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving Profile..." : "Save Profile & Address"}
            </button>
          </div>
        </form>

        {/* Security & Password Form */}
        <form
          onSubmit={handlePasswordSubmit}
          className="art-deco-card rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card border border-border"
        >
          <div className="flex justify-between items-center pb-4 border-b border-border/80">
            <div>
              <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                Account Security &amp; Password
              </h3>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Update your login password to ensure your tickets and winnings remain secure.
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-sans font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{passwordError}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••••••"
                className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••••••"
                  className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••••••"
                  className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Strength Indicator */}
            {passwordData.newPassword && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${strength >= 1 ? "bg-rose-500" : "bg-neutral-800"}`} />
                  <div className={`h-full flex-1 rounded-full ${strength >= 2 ? "bg-amber-500" : "bg-neutral-800"}`} />
                  <div className={`h-full flex-1 rounded-full ${strength >= 3 ? "bg-primary" : "bg-neutral-800"}`} />
                  <div className={`h-full flex-1 rounded-full ${strength >= 4 ? "bg-emerald-400" : "bg-neutral-800"}`} />
                </div>
                <span className="font-mono text-[10px] text-text-muted uppercase">
                  {strength <= 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong"}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border/80">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-gold-metallic h-10 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? "Updating Password..." : "Update Master Password"}
            </button>
          </div>
        </form>
      </div>

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
