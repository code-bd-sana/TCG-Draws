"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "../../../../hooks/useUserHooks";
import { extractApiError } from "../../../../lib/utils";

export default function ProfileSettings() {
  const { data: user, isLoading } = useAuthUser();
  const updateMutation = useUpdateProfileMutation();
  const avatarMutation = useUploadAvatarMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
  });

  const [errors, setErrors] = useState<{ form?: string }>({});
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setErrors({});
    setSuccessMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    try {
      await updateMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        location: formData.location,
      });
      setSuccessMsg("Profile details updated successfully.");
    } catch (err: any) {
      setErrors({ form: extractApiError(err, "Failed to update profile.") });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors({});
    setSuccessMsg("");

    try {
      await avatarMutation.mutateAsync(file);
      setSuccessMsg("Profile picture updated successfully.");
    } catch (err: any) {
      setErrors({ form: extractApiError(err, "Failed to upload image.") });
    }
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return <div className="p-8 text-text-muted font-sans text-sm animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card animate-fadeIn">
      <div>
        <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">Profile Details</h2>
        <p className="font-sans text-xs text-text-muted mt-1">Manage your public profile and contact information.</p>
      </div>

      <div className="h-px w-full bg-divider" />

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

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative w-20 h-20 rounded-full bg-elevated border border-border-medium flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
          {user?.avatarUrl ? (
            <Image 
              src={user.avatarUrl} 
              alt="Avatar" 
              fill 
              className="object-cover"
              unoptimized={true} 
            />
          ) : (
            <span className="font-heading font-black text-2xl text-text-brand">
              {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </span>
          )}
          {avatarMutation.isPending && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">Uploading</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileSelect}
            />
            <button 
              type="button"
              disabled={avatarMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="h-[36px] px-4 rounded-xl bg-accent-bg border border-primary/30 hover:bg-primary hover:text-white text-text-brand font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Upload New Picture
            </button>
          </div>
          <p className="font-sans text-[11px] text-text-muted">Recommended: Square JPG, PNG. Max 5MB.</p>
        </div>
      </div>

      <div className="h-px w-full bg-divider" />
      
      {/* Form Fields */}
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">First Name</label>
            <input 
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={updateMutation.isPending}
              className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={updateMutation.isPending}
              className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            value={user?.email || ""} 
            disabled 
            className="w-full h-11 bg-elevated border border-border-medium/60 rounded-xl px-4 text-sm text-text-muted cursor-not-allowed opacity-75"
          />
          <span className="text-[11px] text-text-muted">Email address cannot be changed directly.</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">Location</label>
          <input 
            type="text" 
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g. London, UK"
            disabled={updateMutation.isPending}
            className="w-full h-11 bg-elevated border border-border-medium rounded-xl px-4 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
          />
        </div>
        
        <div className="flex justify-end pt-4 border-t border-divider mt-2">
          <button 
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-glossy-red h-[42px] px-8 rounded-xl bg-[#dc2626] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
