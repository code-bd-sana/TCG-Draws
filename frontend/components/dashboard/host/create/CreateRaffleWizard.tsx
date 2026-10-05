"use client";

import React, { useState } from "react";
import CreateRaffleStepper from "./CreateRaffleStepper";
import CreateRaffleStep1 from "./CreateRaffleStep1";
import CreateRaffleStep2 from "./CreateRaffleStep2";
import CreateRaffleStep3 from "./CreateRaffleStep3";
import CreateRaffleStep4 from "./CreateRaffleStep4";
import CreateRaffleStep5 from "./CreateRaffleStep5";
import CreateRaffleStep6 from "./CreateRaffleStep6";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMySubscription } from "../../../../hooks/useSubscriptionHooks";
import { useCreateRaffle, useUploadRaffleImage, useHostRaffles } from "../../../../hooks/useRaffleHooks";
import { extractApiError } from "../../../../lib/utils";
import { parseUkDateTimeToUtc } from "../../../../lib/uk-time";

export interface RaffleFormData {
  // Step 1
  title: string;
  category: string;
  description: string;
  // Step 2
  mainPrizeValue: string;
  totalTickets: string;
  ticketPrice: string;
  minTickets: string;
  maxTickets: string;
  // Step 3
  coverImage: string | null; // URL or mock path
  gallery: string[];
  // Step 4 (Instant Wins)
  hasInstantWins: boolean;
  instantWins: { prizeName: string; imageFile: File | null; imageUrl: string | null; rrpValue: string; }[];
  // Step 5
  startDate: string;
  endDate: string;
  isAutoDraw: boolean;
  autoDrawDate: boolean;
  autoDrawSoldOut: boolean;
}

const initialData: RaffleFormData = {
  title: "",
  category: "Golf Drivers",
  description: "",
  mainPrizeValue: "",
  totalTickets: "",
  ticketPrice: "",
  minTickets: "1",
  maxTickets: "",
  coverImage: null,
  gallery: [],
  hasInstantWins: false,
  instantWins: [],
  startDate: "",
  endDate: "",
  isAutoDraw: false,
  autoDrawDate: false,
  autoDrawSoldOut: false,
};

export default function CreateRaffleWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RaffleFormData>(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: mySub, isLoading: isSubLoading } = useMySubscription();
  const { data: hostRafflesData, isLoading: isRafflesLoading } = useHostRaffles({ limit: 100 });
  const createRaffle = useCreateRaffle();
  const uploadImage = useUploadRaffleImage();

  const planName = (mySub?.plan?.name || "").toLowerCase();
  const commissionRate = planName.includes("premium") || planName.includes("pro") ? 10 : 15;

  const updateForm = (data: Partial<RaffleFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, 6));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));
  
  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload instant win images first
      const processedInstantWins = [];
      for (const iw of formData.instantWins) {
        const numericRrp = iw.rrpValue ? Number(iw.rrpValue) : undefined;
        if (iw.imageFile) {
          const res = await fetch('/api/v1/raffles/image', {
            method: 'POST',
            body: (() => {
              const fd = new FormData();
              fd.append('file', iw.imageFile);
              return fd;
            })(),
            headers: {
              Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            processedInstantWins.push({ prizeName: iw.prizeName, image: data.url, rrpValue: numericRrp });
          } else {
            processedInstantWins.push({ prizeName: iw.prizeName, image: iw.imageUrl, rrpValue: numericRrp });
          }
        } else {
          processedInstantWins.push({ prizeName: iw.prizeName, image: iw.imageUrl, rrpValue: numericRrp });
        }
      }

      // 2. Create Raffle
      const minTicketsNum = formData.minTickets ? Math.max(1, Number(formData.minTickets)) : 1;
      const maxTicketsNum = formData.maxTickets && formData.maxTickets.trim() !== "" ? Number(formData.maxTickets) : undefined;

      if (maxTicketsNum !== undefined) {
        if (maxTicketsNum < minTicketsNum) {
          toast.error("Maximum tickets per person must be greater than or equal to minimum tickets.");
          setIsSubmitting(false);
          return;
        }
        if (maxTicketsNum > (Number(formData.totalTickets) || 0)) {
          toast.error("Maximum tickets per person cannot exceed total tickets.");
          setIsSubmitting(false);
          return;
        }
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error("Please provide both start date and draw date (UK Time).");
        setIsSubmitting(false);
        return;
      }

      const utcStart = parseUkDateTimeToUtc(formData.startDate);
      const utcEnd = parseUkDateTimeToUtc(formData.endDate);

      if (!utcStart || isNaN(utcStart.getTime()) || !utcEnd || isNaN(utcEnd.getTime())) {
        toast.error("Please provide valid schedule dates (UK Time).");
        setIsSubmitting(false);
        return;
      }

      if (utcEnd <= utcStart) {
        toast.error("Draw date must be strictly after the start date (UK Time).");
        setIsSubmitting(false);
        return;
      }

      const created = await createRaffle.mutateAsync({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        mainPrizeValue: formData.mainPrizeValue ? Number(formData.mainPrizeValue) : undefined,
        pricePerTicket: Number(formData.ticketPrice) || 0,
        totalTickets: Number(formData.totalTickets) || 0,
        minTickets: minTicketsNum,
        maxTickets: maxTicketsNum,
        startDate: utcStart.toISOString(),
        endDate: utcEnd.toISOString(),
        isAutoDraw: formData.isAutoDraw,
        autoDrawDate: formData.autoDrawDate,
        autoDrawSoldOut: formData.autoDrawSoldOut,
        instantWins: formData.hasInstantWins ? processedInstantWins : [],
      });

      // 3. Upload main image if exists
      if (imageFile && created.id) {
        await uploadImage.mutateAsync({ id: created.id, file: imageFile });
      }

      toast.success("Competition Created and Pending Approval!");
      router.push("/dashboard/host/competitions");
    } catch (err: any) {
      toast.error(extractApiError(err, "Failed to create competition"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubLoading || isRafflesLoading;

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-card min-h-[400px] flex flex-col items-center justify-center p-8 shadow-card">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-border-medium opacity-30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" style={{ animationDuration: '0.8s' }}></div>
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-md"></div>
        </div>
        <h3 className="text-text-brand text-lg font-heading font-black uppercase tracking-tight mb-2">Verifying Host Privileges</h3>
        <p className="text-text-muted text-xs max-w-[280px] text-center font-sans">
          Checking your active plan & competition limits...
        </p>
      </div>
    );
  }

  if (!mySub || mySub.status !== 'ACTIVE') {
    return (
      <div className="w-full bg-surface border border-border rounded-card p-8 md:p-12 text-center shadow-card max-w-lg mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mb-5 shadow-xs shrink-0">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h2 className="text-text-primary font-heading font-black text-xl mb-2 uppercase tracking-tight">Active Subscription Required</h2>
        <p className="text-text-muted text-xs leading-relaxed mb-6 max-w-md">You must have an active host plan to create competitions on Fairway Draws.</p>
        <button 
          onClick={() => router.push('/dashboard/host/billing')} 
          className="btn-glossy-red px-6 h-11 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
        >
          View Host Subscription Plans
        </button>
      </div>
    );
  }

  // Check active competitions limit
  const maxAllowedRaffles = mySub.plan?.maxActiveRaffles;
  const rafflesList = hostRafflesData?.data || [];
  const activeCount = rafflesList.filter((r: any) =>
    ['ACTIVE', 'PENDING_APPROVAL', 'APPROVED'].includes(r.status)
  ).length;

  const isLimitReached =
    maxAllowedRaffles !== null &&
    maxAllowedRaffles !== undefined &&
    activeCount >= maxAllowedRaffles;

  if (isLimitReached) {
    return (
      <div className="w-full bg-surface border border-border rounded-card p-8 md:p-12 text-center shadow-card max-w-lg mx-auto flex flex-col items-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] mb-5 shadow-xs shrink-0">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
          </svg>
        </div>

        <h2 className="text-text-primary font-heading font-black text-xl mb-2 uppercase tracking-tight">
          Active Competitions Limit Reached
        </h2>

        <p className="text-text-muted text-xs leading-relaxed mb-6 max-w-md font-sans">
          You have reached the maximum allowed active competitions (<strong className="text-text-primary">{maxAllowedRaffles}</strong>) for your <strong className="text-text-brand">{mySub.plan?.name || "Free"}</strong> plan. Please upgrade your subscription to create more competitions.
        </p>

        <div className="w-full bg-elevated border border-border-medium rounded-xl p-4 mb-6 flex items-center justify-between font-sans text-xs">
          <span className="text-text-muted font-medium">Active Competitions:</span>
          <span className="font-heading font-bold text-text-primary text-sm">
            {activeCount} / {maxAllowedRaffles}
          </span>
        </div>

        <button 
          onClick={() => router.push('/dashboard/host/billing')} 
          className="btn-glossy-red px-6 h-11 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <span>Upgrade Subscription Plan</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full px-2 sm:px-4">
        <CreateRaffleStepper currentStep={currentStep} totalSteps={6} />
      </div>

      <div className="w-full bg-surface border border-border rounded-card p-6 md:p-10 mt-2 shadow-card">
        {currentStep === 1 && (
          <CreateRaffleStep1 formData={formData} updateForm={updateForm} onNext={nextStep} />
        )}
        {currentStep === 2 && (
          <CreateRaffleStep2 formData={formData} updateForm={updateForm} onNext={nextStep} onPrev={prevStep} />
        )}
        {currentStep === 3 && (
          <CreateRaffleStep3 formData={formData} updateForm={updateForm} onNext={nextStep} onPrev={prevStep} setImageFile={setImageFile} />
        )}
        {currentStep === 4 && (
          <CreateRaffleStep4 formData={formData} updateForm={updateForm} onNext={nextStep} onPrev={prevStep} />
        )}
        {currentStep === 5 && (
          <CreateRaffleStep5 formData={formData} updateForm={updateForm} onNext={nextStep} onPrev={prevStep} />
        )}
        {currentStep === 6 && (
          <CreateRaffleStep6
            formData={formData}
            onPublish={handlePublish}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
            commissionRate={commissionRate}
          />
        )}
      </div>
    </div>
  );
}
