"use client";

import React from "react";
import { Category } from "../../../services/category.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

interface ConfirmDeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export default function ConfirmDeleteCategoryModal({
  isOpen,
  onClose,
  category,
  onConfirmDelete,
  isDeleting,
}: ConfirmDeleteCategoryModalProps) {
  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: category?.id,
    onClose,
  });

  if (!isOpen || !category) return null;

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
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[460px] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-rose-500/40 select-none cursor-grabbing"
            : "shadow-2xl border border-rose-500/30"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-rose-500/10 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-rose-500/20" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="w-4 h-4 text-rose-400 opacity-90 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <h2 className="font-heading font-black text-sm sm:text-base text-rose-400 uppercase tracking-tight truncate">
              Delete Category Confirmation
            </h2>
            {isMoved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPosition();
                }}
                className="text-[10px] font-mono text-rose-300 hover:underline cursor-pointer ml-1.5 shrink-0 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
                title="Reset to center"
              >
                (Reset)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
            <svg className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <span className="font-heading font-black text-xs uppercase block text-rose-300 mb-1">
                Permanent Deletion Warning
              </span>
              Are you sure you want to delete category{" "}
              <strong className="text-white font-heading font-bold">&quot;{category.name}&quot;</strong>?
              If competitions are currently associated with this category, the deletion will be rejected.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface/70 border border-border text-xs flex items-center justify-between">
            <span className="text-text-muted font-sans">Category Slug:</span>
            <span className="font-mono text-text-primary font-bold">/{category.slug}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm &amp; Delete</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
