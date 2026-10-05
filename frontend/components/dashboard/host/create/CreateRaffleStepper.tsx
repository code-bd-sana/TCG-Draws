import React from "react";
import { cn } from "../../../../lib/utils";

interface CreateRaffleStepperProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "Basic Info",
  "Prize Details",
  "Media",
  "Ticket Settings",
  "Review & Submit",
];

export default function CreateRaffleStepper({ currentStep, totalSteps }: CreateRaffleStepperProps) {
  return (
    <div className="w-full flex items-start justify-between relative mb-8 px-2 md:px-5">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isPending = stepNum > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={label}>
            {/* Step Item */}
            <div className="flex flex-col items-center gap-2 relative z-10 w-[74px] sm:w-[90px] shrink-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-xs transition-all border shadow-xs",
                  isCompleted && "bg-accent-bg border-primary/40 text-text-brand",
                  isActive && "bg-primary border-primary text-white shadow-md scale-105",
                  isPending && "bg-elevated border-border-medium text-text-muted"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "font-heading font-bold text-[11px] text-center uppercase tracking-wide truncate max-w-full",
                  (isCompleted || isActive) ? "text-text-primary" : "text-text-muted"
                )}
              >
                {stepNum}. {label}
              </span>
            </div>

            {/* Connecting Line */}
            {!isLast && (
              <div className="flex-1 h-[2px] mt-4 mx-1 sm:mx-2 shrink">
                <div 
                  className={cn(
                    "w-full h-full transition-colors",
                    isCompleted ? "bg-primary" : "bg-border-medium"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
