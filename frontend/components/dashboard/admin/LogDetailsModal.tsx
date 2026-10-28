"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { LogData } from "../../../services/admin.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface LogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: LogData | null;
}

export default function LogDetailsModal({
  isOpen,
  onClose,
  log,
}: LogDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: log?.id,
    onClose,
  });

  if (!isOpen || !log) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formattedDate = log.timestamp
    ? format(new Date(log.timestamp), "dd MMM yyyy 'at' HH:mm:ss")
    : "N/A";

  const isSuccess = log.status === "Success";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[580px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : "shadow-2xl border border-primary/30"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-accent-bg/40 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-accent-bg/70" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="w-4 h-4 text-text-muted opacity-70 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
              Audit Event Log Details
            </h2>
            {isMoved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPosition();
                }}
                className="text-[10px] font-mono text-text-brand hover:underline cursor-pointer ml-1.5 shrink-0 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
                title="Reset to center"
              >
                (Reset)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Actor Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface to-elevated border border-primary/20 p-4 shadow-inner">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0">
                <span className="font-heading font-black text-sm text-text-brand">
                  {log.actor.initials}
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-black text-base text-text-primary truncate">
                    {log.actor.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
                    {log.actor.type}
                  </span>
                </div>
                <span className="font-mono text-xs text-text-muted truncate mt-0.5">
                  Actor Type: {log.actor.type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Event Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-heading font-black text-xs ${
                  isSuccess ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-emerald-400" : "bg-rose-400"}`} />
                {log.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/70 border border-border flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Origin IP Address
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-text-primary truncate">
                  {log.ip}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(log.ip, "IP Address")}
                  className="text-[10px] font-bold text-text-brand hover:underline cursor-pointer"
                >
                  {copiedKey === "IP Address" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Timestamp section */}
          <div className="p-3.5 rounded-xl bg-surface/70 border border-border flex items-center justify-between text-xs">
            <span className="text-text-muted font-bold">Timestamp:</span>
            <span className="font-mono text-text-primary font-bold">{formattedDate}</span>
          </div>

          {/* Description Block */}
          <div className="rounded-xl border border-primary/20 bg-surface/80 p-4 space-y-1.5">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary block">
              Event Description &amp; Audit Trail
            </span>
            <p className="font-sans text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
              {log.description}
            </p>
          </div>

          {/* Raw JSON Meta */}
          <div className="rounded-xl border border-border bg-surface/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-[11px] uppercase tracking-wider text-text-muted">
                Audit Record Payload
              </span>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(log, null, 2), "JSON payload")}
                className="text-[10px] font-mono text-text-brand hover:underline cursor-pointer"
              >
                {copiedKey === "JSON payload" ? "Copied Payload" : "Copy JSON"}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-text-muted bg-surface/90 p-2.5 rounded-lg overflow-x-auto border border-border max-h-[140px]">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-[11px] font-mono text-text-muted truncate">
              ID: {log.id}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(log.id, "Log ID")}
              className="text-[10px] font-mono text-text-brand hover:underline cursor-pointer shrink-0"
            >
              {copiedKey === "Log ID" ? "Copied" : "Copy"}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
