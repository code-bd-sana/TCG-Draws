"use client";

import React, { useState, useEffect } from "react";
import { Category, categoryService } from "../../../services/category.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Partial<Category> | null;
  isEditMode: boolean;
  onSaveSuccess: () => void;
}

const AVAILABLE_ICONS = [
  "Sparkles",
  "Trophy",
  "Shirt",
  "Watch",
  "ShoppingBag",
  "Star",
  "Tag",
  "Crosshair",
  "Flame",
  "Gift",
];

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
  isEditMode,
  onSaveSuccess,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    icon: "",
    image: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: category?.id || isEditMode,
    onClose,
  });

  useEffect(() => {
    if (isOpen) {
      if (category && isEditMode) {
        setFormData({
          name: category.name || "",
          slug: category.slug || "",
          icon: category.icon || "",
          image: category.image || "",
          isActive: category.isActive !== false,
        });
        setImagePreview(category.image || "");
      } else {
        setFormData({
          name: "",
          slug: "",
          icon: "",
          image: "",
          isActive: true,
        });
        setImagePreview("");
      }
      setImageFile(null);
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, category, isEditMode]);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    const updates: Partial<Category> = { name };
    if (!isEditMode && (!formData.slug || formData.slug === formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) {
      updates.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    const input = document.getElementById("categoryImageInput") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        try {
          const res = await categoryService.uploadImage(imageFile);
          finalImageUrl = res.url;
        } catch (uploadErr: any) {
          setError(uploadErr?.response?.data?.message || "Failed to upload banner image");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
        icon: formData.icon || undefined,
        image: finalImageUrl || undefined,
        isActive: formData.isActive !== false,
      };

      if (isEditMode && category?.id) {
        await categoryService.updateCategory(category.id, payload);
        toast.success(`Category "${payload.name}" updated successfully`);
      } else {
        await categoryService.createCategory(payload);
        toast.success(`Category "${payload.name}" created successfully`);
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[540px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
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
              {isEditMode ? "Edit Competition Category" : "Add Competition Category"}
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
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-sans font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Category Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Vintage Pokémon, Graded Slabs, One Piece"
                className="input-obsidian w-full h-11 px-4 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
                required
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>URL Slug</span>
                <span className="font-mono text-[10px] text-text-brand lowercase">/competitions?cat={formData.slug || "slug"}</span>
              </label>
              <input
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g. vintage-pokemon"
                className="input-obsidian w-full h-11 px-4 rounded-xl font-mono text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Icon Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Homepage Icon
              </label>
              <div className="relative">
                <select
                  value={formData.icon || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  className="input-obsidian w-full h-11 px-4 pr-10 rounded-xl font-sans text-xs text-text-primary focus:outline-none appearance-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="" className="bg-[#141720] text-text-muted">None / Default</option>
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon} className="bg-[#141720] text-text-primary">
                      {icon}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Image Banner Upload Area */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Category Banner Image
              </label>
              <div
                onClick={() => {
                  if (!imagePreview) {
                    document.getElementById("categoryImageInput")?.click();
                  }
                }}
                className={`w-full h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                  imagePreview
                    ? "border-primary/40 bg-elevated/40"
                    : "border-border hover:border-primary/50 hover:bg-elevated/50 cursor-pointer bg-surface/50"
                }`}
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Category banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-[11px] uppercase tracking-wider text-rose-400 hover:text-rose-300 cursor-pointer shadow-md"
                      >
                        Remove Image
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                    <div className="w-9 h-9 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center text-text-brand">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <span className="font-heading font-bold text-xs text-text-primary">
                      Click to upload category card banner
                    </span>
                    <span className="font-sans text-[11px] text-text-muted">
                      Recommended: 600x340 PNG, WEBP or JPG
                    </span>
                  </div>
                )}
                <input
                  id="categoryImageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Public Visibility Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface/80 border border-border">
              <div className="flex flex-col gap-0.5 pr-2">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                  Active Visibility
                </span>
                <span className="font-sans text-[11px] text-text-muted">
                  When enabled, category appears on public filters, navigation, and competition creation.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.isActive ? "bg-primary" : "bg-neutral-700"
                }`}
                role="switch"
                aria-checked={formData.isActive}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold-metallic h-9 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Category" : "Create Category"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
