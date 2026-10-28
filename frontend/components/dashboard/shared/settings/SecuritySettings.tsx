"use client";

import React, { useState } from "react";
import { useChangePasswordMutation } from "../../../../hooks/useUserHooks";
import { extractApiError } from "../../../../lib/utils";
import TwoFactorSetupModal from "./TwoFactorSetupModal";
import { toast } from "sonner";

export default function SecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ form?: string; newPassword?: string; currentPassword?: string }>({});
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  
  const mutation = useChangePasswordMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
    }
  };

  const getPasswordStrength = () => {
    const p = formData.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.currentPassword) {
      setErrors({ currentPassword: "Current password is required" });
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrors({ newPassword: "New password must be at least 8 characters long" });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ newPassword: "Passwords do not match" });
      return;
    }

    try {
      await mutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Account password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setErrors({ form: extractApiError(err, "Failed to change password.") });
    }
  };

  return (
    <div className="art-deco-card rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card animate-fadeIn border border-border">
      {/* Section Header */}
      <div className="pb-4 border-b border-border/80">
        <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
          Security &amp; Authentication
        </h2>
        <p className="font-sans text-xs text-text-muted mt-0.5">
          Safeguard your account credentials, manage encryption keys, and configure multi-factor authentication.
        </p>
      </div>

      {errors.form && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-sans font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>{errors.form}</span>
        </div>
      )}

      {/* Password Change Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider">
            Change Master Password
          </h3>
          <span className="font-mono text-[11px] text-text-muted">Min 8 characters</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="••••••••••••"
            className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
          />
          {errors.currentPassword && (
            <span className="text-[11px] font-sans text-rose-400 font-semibold">{errors.currentPassword}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="••••••••••••"
              className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••••••"
              className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {errors.newPassword && (
          <span className="text-[11px] font-sans text-rose-400 font-semibold">{errors.newPassword}</span>
        )}

        {/* Strength Indicator */}
        {formData.newPassword && (
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

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-gold-metallic h-10 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {mutation.isPending ? "Updating Password..." : "Update Password"}
          </button>
        </div>
      </form>

      <div className="h-px w-full bg-border/80 my-2" />

      {/* Two-Factor Authentication Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface/70 border border-primary/20">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 text-text-brand">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-black text-sm text-text-primary">
              Two-Factor Authentication (2FA)
            </span>
            <span className="font-sans text-xs text-text-muted mt-0.5">
              Secure your account using time-based one-time passcodes (TOTP) from an authenticator app.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIs2FAModalOpen(true)}
          className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm"
        >
          Configure 2FA
        </button>
      </div>

      {/* Draggable 2FA Modal */}
      <TwoFactorSetupModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  );
}
