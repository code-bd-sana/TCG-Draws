"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { userService } from "../../../../services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setProfileMessage("Profile saved successfully!");
      queryClient.setQueryData(["user"], data.user);
      setTimeout(() => setProfileMessage(""), 3000);
    },
    onError: () => {
      setProfileMessage("Failed to save profile.");
    },
    onSettled: () => {
      setIsSubmittingProfile(false);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.changePassword(data);
    },
    onSuccess: () => {
      setPasswordMessage("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMessage(""), 3000);
    },
    onError: (error: any) => {
      setPasswordMessage(error.response?.data?.message || "Failed to change password.");
    },
    onSettled: () => {
      setIsSubmittingPassword(false);
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return userService.uploadAvatar(file);
    },
    onSuccess: (data) => {
      setProfileMessage("Avatar updated successfully!");
      queryClient.setQueryData(["user"], data.user);
      setTimeout(() => setProfileMessage(""), 3000);
    },
    onError: () => {
      setProfileMessage("Failed to update avatar.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAvatarMutation.mutate(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

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
        setProfileMessage("You must be at least 18 years of age. Update refused.");
        return;
      }
    }

    setIsSubmittingProfile(true);
    
    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters long.");
      return;
    }
    setIsSubmittingPassword(true);
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return <div className="text-[#8cb34a] animate-pulse">Loading profile...</div>;
  }

  const initials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn items-start">
      {/* Left Column: Profile Summary */}
      <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-card p-8 flex flex-col items-center shadow-card">
          {/* Avatar Area */}
          <div className="relative mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="w-[140px] h-[140px] rounded-full border border-border-medium bg-elevated flex items-center justify-center overflow-hidden shadow-xs">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-black text-4xl text-text-brand">{initials}</span>
              )}
            </div>
            <button 
              type="button"
              onClick={handleUploadClick}
              disabled={uploadAvatarMutation.isPending}
              className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-surface text-white hover:bg-primary/90 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0M18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>
          </div>
          <p 
            onClick={handleUploadClick}
            className="font-sans font-bold text-xs text-text-brand mb-6 cursor-pointer hover:underline transition-all"
          >
            {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Photo"}
          </p>

          {/* Verification Banner */}
          {user?.isEmailVerified && (
            <div className="w-full bg-success-bg border border-[#BBF7D0] rounded-xl py-2.5 px-4 mb-6 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-success-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="font-sans font-bold text-xs text-success-text">Email Verified</span>
            </div>
          )}

          {/* Stats List */}
          <div className="w-full flex flex-col gap-3 pt-4 border-t border-divider">
            <div className="flex justify-between items-center w-full">
              <span className="font-sans text-xs text-text-muted">Member since</span>
              <span className="font-heading font-bold text-xs text-text-primary">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="font-sans text-xs text-text-muted">Account Role</span>
              <div className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30">
                <span className="font-sans font-bold text-[10px] text-text-brand tracking-wider uppercase">
                  {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'HOST' ? 'Host' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Settings Forms */}
      <div className="flex-1 flex flex-col gap-6">
        <form onSubmit={handleProfileSubmit} className="flex-1 min-w-0 w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card">
          
          {/* Account Information */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">Personal Details</h3>
              {profileMessage && (
                <span className={`text-xs font-bold ${profileMessage.includes('Failed') ? 'text-[#DC2626]' : 'text-text-brand'}`}>
                  {profileMessage}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">First Name</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="bg-transparent outline-none w-full text-sm text-text-primary font-sans font-semibold" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Last Name</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="bg-transparent outline-none w-full text-sm text-text-primary font-sans font-semibold" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Email Address</label>
                <div className="bg-elevated border border-border-medium/60 h-10 rounded-xl px-3 flex items-center opacity-75">
                  <input type="email" name="email" value={formData.email} disabled className="bg-transparent outline-none w-full text-sm text-text-muted font-sans cursor-not-allowed" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Phone Number</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+44 7700 900123" className="bg-transparent outline-none w-full text-sm text-text-primary font-sans" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Date of Birth (18+ Only)</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-transparent outline-none w-full text-sm text-text-primary font-sans"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Shipping Address</label>
                <div className="bg-elevated border border-border-medium rounded-xl p-3 flex focus-within:border-primary transition-all">
                  <textarea name="address" value={formData.address} onChange={handleChange} className="bg-transparent outline-none w-full text-sm text-text-primary font-sans resize-none h-[70px]" placeholder="123 Street, City, Postcode" />
                </div>
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="mt-2 flex justify-end w-full pt-4 border-t border-divider">
            <button 
              type="submit" 
              disabled={isSubmittingProfile}
              className="btn-glossy-red h-[42px] px-8 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingProfile ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card">
          {/* Change Password */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">Security &amp; Password</h3>
              {passwordMessage && (
                <span className={`text-xs font-bold ${passwordMessage.includes('Failed') || passwordMessage.includes('not match') || passwordMessage.includes('least') ? 'text-[#DC2626]' : 'text-text-brand'}`}>
                  {passwordMessage}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Current Password</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" className="bg-transparent outline-none w-full text-sm text-text-primary font-sans" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">New Password</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="bg-transparent outline-none w-full text-sm text-text-primary font-sans" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">Confirm New Password</label>
                <div className="bg-elevated border border-border-medium h-10 rounded-xl px-3 flex items-center focus-within:border-primary transition-all">
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="bg-transparent outline-none w-full text-sm text-text-primary font-sans" required />
                </div>
              </div>
            </div>
          </section>
          
          <div className="mt-2 flex justify-end w-full pt-4 border-t border-divider">
            <button 
              type="submit" 
              disabled={isSubmittingPassword}
              className="btn-glossy-red h-[42px] px-8 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
