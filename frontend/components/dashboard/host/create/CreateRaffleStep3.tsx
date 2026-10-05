import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  setImageFile: (file: File | null) => void;
}

export default function CreateRaffleStep3({ formData, updateForm, onNext, onPrev, setImageFile }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      updateForm({ coverImage: url });
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateForm({ coverImage: null });
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
          Media &amp; Images
        </h2>
        <p className="font-sans text-sm text-text-muted">
          Upload high-quality images of the prize. The main image will serve as the cover card.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Cover Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Cover Image
          </label>
          <div 
            onClick={!formData.coverImage ? handleUploadClick : undefined}
            className={`w-full h-[250px] border-2 border-dashed rounded-card flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
              formData.coverImage 
                ? "border-border bg-surface" 
                : "border-border-medium hover:border-primary hover:bg-accent-bg/40 cursor-pointer bg-elevated"
            }`}
          >
            {formData.coverImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={formData.coverImage} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                  <button 
                    onClick={handleClearImage}
                    className="h-[40px] px-5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Remove Image
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-accent-bg border border-primary/30 flex items-center justify-center mb-4 shadow-xs">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                  Click to upload cover image
                </span>
                <span className="font-sans text-xs text-text-muted mt-1.5 text-center px-4">
                  SVG, PNG, JPG or WEBP (Recommended: 800x600px, 4:3 aspect ratio)
                </span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-divider">
        <button
          onClick={onPrev}
          className="h-[46px] px-6 bg-elevated border border-border hover:bg-surface text-text-primary transition-all rounded-xl font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!formData.coverImage}
          className="btn-glossy-red h-[46px] px-8 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next Step →</span>
        </button>
      </div>
    </div>
  );
}
