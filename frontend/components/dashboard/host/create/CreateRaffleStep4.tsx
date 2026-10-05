import React, { useState } from "react";
import { RaffleFormData } from "./CreateRaffleWizard";
import { useMySubscription } from "../../../../hooks/useSubscriptionHooks";
import { cn } from "../../../../lib/utils";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep4({ formData, updateForm, onNext, onPrev }: Props) {
  const { data: subscription } = useMySubscription();
  const isFreePlan = !subscription || subscription.status !== 'ACTIVE' || subscription.plan?.name?.toLowerCase() === 'free' || Number(subscription.plan?.price) === 0;

  const [numInstantWins, setNumInstantWins] = useState(
    formData.instantWins.length > 0 ? formData.instantWins.length.toString() : "1"
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFreePlan) return;
    const hasInstantWins = e.target.checked;
    updateForm({ hasInstantWins });
    if (hasInstantWins && formData.instantWins.length === 0) {
      updateForm({
        instantWins: Array(parseInt(numInstantWins) || 1).fill({ prizeName: "", imageFile: null, imageUrl: null, rrpValue: "" })
      });
    }
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumInstantWins(val);
    const num = parseInt(val) || 0;
    
    if (formData.hasInstantWins) {
      const currentLength = formData.instantWins.length;
      if (num > currentLength) {
        // add more
        const toAdd = Array(num - currentLength).fill({ prizeName: "", imageFile: null, imageUrl: null, rrpValue: "" });
        updateForm({ instantWins: [...formData.instantWins, ...toAdd] });
      } else if (num < currentLength) {
        // remove some
        updateForm({ instantWins: formData.instantWins.slice(0, num) });
      }
    }
  };

  const updateInstantWin = (index: number, field: string, value: any) => {
    const updated = [...formData.instantWins];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === "imageFile") {
      updated[index].imageUrl = value ? URL.createObjectURL(value) : null;
    }
    
    updateForm({ instantWins: updated });
  };

  const applyToAll = (index: number) => {
    const source = formData.instantWins[index];
    const updated = formData.instantWins.map(iw => ({
      ...iw,
      prizeName: source.prizeName,
      imageFile: source.imageFile,
      imageUrl: source.imageUrl,
      rrpValue: source.rrpValue,
    }));
    updateForm({ instantWins: updated });
  };

  const applyFromFirst = (index: number) => {
    const source = formData.instantWins[0];
    const updated = [...formData.instantWins];
    updated[index] = {
      ...updated[index],
      prizeName: source.prizeName,
      imageFile: source.imageFile,
      imageUrl: source.imageUrl,
      rrpValue: source.rrpValue,
    };
    updateForm({ instantWins: updated });
  };

  const isValid = isFreePlan || !formData.hasInstantWins || formData.instantWins.every(iw => iw.prizeName.trim() !== "");

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
          Instant Wins
        </h2>
        <p className="font-sans text-sm text-text-muted">
          Would you like to offer instant wins for this competition?
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Free Plan Locked Upgrade Banner matching requested design */}
        {isFreePlan && (
          <div className="bg-[#1e1b0d] border border-[#d97706]/70 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              {/* Padlock Icon */}
              <div className="w-9 h-9 rounded-xl bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-1.5 0h12a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 013 19.5v-7.5a1.5 1.5 0 011.5-1.5z" />
                </svg>
              </div>
              <p className="font-sans text-xs md:text-sm text-amber-100/90 leading-relaxed">
                Instant Wins is a <strong className="text-white font-bold">Premium &amp; Pro feature</strong>. Upgrade your subscription to add instant wins to your competition.
              </p>
            </div>
            <a
              href="/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-[#f59e0b] hover:bg-[#d97706] text-black font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap text-center"
            >
              Upgrade Plan
            </a>
          </div>
        )}

        <label className={cn("flex items-center gap-3 select-none", isFreePlan ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
          <input 
            type="checkbox" 
            disabled={isFreePlan}
            className="w-5 h-5 rounded border-border-medium text-primary focus:ring-primary accent-[#0b4d35] disabled:cursor-not-allowed cursor-pointer"
            checked={isFreePlan ? false : formData.hasInstantWins}
            onChange={handleToggle}
          />
          <span className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
            Enable Instant Wins
          </span>
        </label>

        {formData.hasInstantWins && (
          <div className="flex flex-col gap-6 mt-2 border-t border-divider pt-6">
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
                Number of Instant Wins
              </label>
              <input
                type="number"
                min="1"
                max={formData.totalTickets || "1000"}
                value={numInstantWins}
                onChange={handleNumChange}
                className="w-full sm:w-[200px] h-[48px] bg-elevated border border-border-medium rounded-xl px-4 text-text-primary font-sans font-medium text-sm focus:outline-none focus:border-primary focus:bg-surface transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.instantWins.map((iw, idx) => (
                <div key={idx} className="bg-elevated border border-border-medium rounded-xl p-5 flex flex-col gap-4 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="text-text-brand font-heading font-bold text-sm uppercase">Prize #{idx + 1}</h4>
                    {idx === 0 && formData.instantWins.length > 1 && (
                      <button
                        onClick={() => applyToAll(0)}
                        className="text-xs text-text-brand font-bold uppercase tracking-wider hover:text-primary-hover cursor-pointer"
                        title="Copy this prize's name and image to all other instant wins"
                      >
                        Apply to all
                      </button>
                    )}
                    {idx > 0 && formData.instantWins[0].prizeName && (
                      <button
                        onClick={() => applyFromFirst(idx)}
                        className="text-xs text-text-brand font-bold uppercase tracking-wider hover:text-primary-hover cursor-pointer"
                        title="Copy the details from Prize #1"
                      >
                        Copy from 1st
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase text-text-muted">Prize Name*</label>
                    <input
                      type="text"
                      value={iw.prizeName}
                      onChange={(e) => updateInstantWin(idx, "prizeName", e.target.value)}
                      placeholder="e.g. Titleist Pro V1 Box"
                      className="w-full h-[42px] bg-surface border border-border-medium rounded-xl px-3 text-text-primary font-sans font-medium text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase text-text-muted">RRP Value (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={iw.rrpValue}
                      onChange={(e) => updateInstantWin(idx, "rrpValue", e.target.value)}
                      placeholder="e.g. 50.00"
                      className="w-full h-[42px] bg-surface border border-border-medium rounded-xl px-3 text-text-primary font-sans font-medium text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase text-text-muted">Prize Image</label>
                    <div className="flex items-center gap-3">
                      {iw.imageUrl && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={iw.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateInstantWin(idx, "imageFile", e.target.files?.[0] || null)}
                        className="text-xs text-text-muted file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-surface file:text-text-primary hover:file:bg-accent-bg cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-divider">
        <button
          onClick={onPrev}
          className="w-full sm:w-auto h-[46px] px-6 rounded-xl bg-elevated border border-border hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="btn-glossy-red w-full sm:w-auto h-[46px] px-8 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next Step →</span>
        </button>
      </div>
    </div>
  );
}
