"use client";

import React, { useState } from "react";
import { RecipientUser } from "../../../../services/admin-ticket-assignment.service";
import { useAdminUserSearch } from "../../../../hooks/useAdminTicketAssignment";

interface RecipientUserSearchProps {
  selectedUser: RecipientUser | null;
  onSelectUser: (user: RecipientUser) => void;
  onClearUser: () => void;
}

export default function RecipientUserSearch({
  selectedUser,
  onSelectUser,
  onClearUser,
}: RecipientUserSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const { data: users, isLoading } = useAdminUserSearch(query);

  return (
    <div className="bg-surface border border-border rounded-card p-4 sm:p-6 flex flex-col gap-4 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-3">
        <div>
          <label className="font-heading font-black text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-mono">
              3
            </span>
            Recipient User
          </label>
          <p className="font-sans text-xs text-text-muted mt-0.5">
            Search for any active customer or host account to receive the assigned tickets.
          </p>
        </div>
      </div>

      {selectedUser ? (
        /* Selected User Card */
        <div className="bg-elevated border-2 border-primary/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center font-heading font-black text-sm text-primary shadow-xs">
              {selectedUser.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedUser.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm text-text-primary">
                  {selectedUser.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-bold uppercase text-text-muted">
                  {selectedUser.role}
                </span>
              </div>
              <span className="font-sans text-xs text-text-muted">{selectedUser.email}</span>
              <span className="font-mono text-[10px] text-text-brand mt-0.5">
                ID: {selectedUser.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearUser}
            className="px-3.5 py-1.5 rounded-xl bg-surface border border-border hover:bg-elevated text-text-secondary hover:text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Change User ✕
          </button>
        </div>
      ) : (
        /* Search Box and Dropdown */
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search user by email, name, or UUID..."
            className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-sans"
          />

          {isFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-card z-30 max-h-64 overflow-y-auto p-2 custom-scrollbar">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-text-muted font-sans flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Searching accounts...
                </div>
              ) : !users || users.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-muted font-sans">
                  No active users found matching &quot;{query}&quot;.
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setIsFocused(false);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-elevated cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-elevated border border-border overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-primary">
                          {user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-heading font-bold text-xs text-text-primary truncate">
                            {user.name}
                          </span>
                          <span className="font-sans text-[11px] text-text-muted truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-elevated border border-border text-[9px] font-bold text-text-muted uppercase">
                          {user.role}
                        </span>
                        <span className="text-xs text-text-brand font-bold">Select →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
