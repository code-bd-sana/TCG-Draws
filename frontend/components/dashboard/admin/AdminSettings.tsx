"use client";

import React from "react";

export default function AdminSettings() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[800px] animate-fadeIn">
      
      {/* Profile Settings */}
      <div className="bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-2xl p-8 flex flex-col gap-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
        <div>
          <h2 className="font-heading font-black text-lg text-[#F4EBD9] uppercase tracking-wide">Profile Details</h2>
          <p className="font-sans text-xs text-[#A69B82] mt-1">Update your administrative profile information.</p>
        </div>
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-[#D4AF37]">Full Name</label>
            <input 
              type="text" 
              defaultValue="Admin Sarah K." 
              className="w-full h-11 bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 text-sm text-[#F4EBD9] outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-[#D4AF37]">Email Address</label>
            <input 
              type="email" 
              defaultValue="admin@tcgdraws.com" 
              className="w-full h-11 bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 text-sm text-[#F4EBD9] outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-2 pt-4 border-t border-[rgba(212,175,55,0.15)]">
          <button className="btn-gold-metallic h-11 px-8 rounded-xl text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer">
            Save Changes
          </button>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-2xl p-8 flex flex-col gap-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
        <div>
          <h2 className="font-heading font-black text-lg text-[#F4EBD9] uppercase tracking-wide">Change Password</h2>
          <p className="font-sans text-xs text-[#A69B82] mt-1">Ensure your admin account uses a strong, random password for platform security.</p>
        </div>
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-[#D4AF37]">Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              className="w-full h-11 bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 text-sm text-[#F4EBD9] placeholder:text-[#6B7280] outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-[#D4AF37]">New Password</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              className="w-full h-11 bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 text-sm text-[#F4EBD9] placeholder:text-[#6B7280] outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-[#D4AF37]">Confirm New Password</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              className="w-full h-11 bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 text-sm text-[#F4EBD9] placeholder:text-[#6B7280] outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-2 pt-4 border-t border-[rgba(212,175,55,0.15)]">
          <button className="btn-dark-metallic border border-[rgba(212,175,55,0.3)] hover:border-[#D4AF37] h-11 px-8 rounded-xl text-[#D4AF37] font-heading font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer">
            Update Password
          </button>
        </div>
      </div>
      
    </div>
  );
}
