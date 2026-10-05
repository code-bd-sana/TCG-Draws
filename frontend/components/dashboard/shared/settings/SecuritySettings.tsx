"use client";

import React, { useState } from "react";
import { useChangePasswordMutation } from "../../../../hooks/useUserHooks";
import { extractApiError } from "../../../../lib/utils";

export default function SecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ form?: string; newPassword?: string; currentPassword?: string }>({});
  const [successMsg, setSuccessMsg] = useState("");
  
  const mutation = useChangePasswordMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
    }
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

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

      setSuccessMsg("Password updated successfully.");
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
    <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card animate-fadeIn">
      <div>
        <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">Security Settings</h2>
        <p className="font-sans text-xs text-text-muted mt-1">Keep your account secure with a strong, unique password.</p>
      </div>

      <div className="h-px w-full bg-divider" />

      {/* Password Change Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h3 className="font-heading font-bold text-base text-text-primary">Change Account Password</h3>
        
        {errors.form && (
          <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-sans font-semibold p-3 rounded-xl">
            ⚠️ {errors.form}
          </div>
        )}

        {successMsg && (
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] text-xs font-sans font-semibold p-3 rounded-xl">
            ✅ {successMsg}
          </div>
        )}
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">Current Password</label>
            <input 
              type="password" 
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="••••••••" 
              disabled={mutation.isPending}
              className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
            />
            {errors.currentPassword && <span className="text-[#DC2626] text-xs font-semibold">{errors.currentPassword}</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••" 
                disabled={mutation.isPending}
                className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••" 
                disabled={mutation.isPending}
                className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>
          {errors.newPassword && <span className="text-[#DC2626] text-xs font-semibold">{errors.newPassword}</span>}
        </div>
        
        <div className="flex justify-end pt-4 border-t border-divider mt-2">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="btn-glossy-red h-[42px] px-8 rounded-xl bg-[#dc2626] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
