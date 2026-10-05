import React, { useEffect } from "react";
import { RaffleFormData } from "./CreateRaffleWizard";
import { usePublicCategories } from "../../../../hooks/useCategoryHooks";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
}

const DEFAULT_CATEGORIES = [
  "Golf Drivers",
  "Golf Irons",
  "Golf Putters",
  "Golf Bags & Apparel",
  "Rangefinders & Tech",
  "Experiences & Bundles",
];

export default function CreateRaffleStep1({ formData, updateForm, onNext }: Props) {
  const { data: dbCategories } = usePublicCategories();

  const categoryOptions = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map((c) => c.name)
    : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (!formData.category && categoryOptions.length > 0) {
      updateForm({ category: categoryOptions[0] });
    }
  }, [categoryOptions, formData.category, updateForm]);

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
          Basic Details
        </h2>
        <p className="font-sans text-sm text-text-muted">
          Start by giving your competition a catchy title and clear description.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Competition Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            placeholder="e.g. TaylorMade Qi10 LS Driver or Titleist Scotty Cameron Putter"
            className="h-[48px] px-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Category
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => updateForm({ category: e.target.value })}
              className="w-full h-[48px] px-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary outline-none focus:border-primary focus:bg-surface transition-all appearance-none cursor-pointer"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <svg
              className="w-5 h-5 text-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Describe the prize specs, condition, warranty, and rules..."
            className="h-[140px] p-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all resize-none"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end mt-10 pt-6 border-t border-divider">
        <button
          onClick={onNext}
          disabled={!formData.title.trim()}
          className="btn-glossy-red h-[46px] px-8 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next Step →</span>
        </button>
      </div>
    </div>
  );
}
