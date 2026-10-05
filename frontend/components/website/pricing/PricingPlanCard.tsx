"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingPlan, BillingCycle } from "../../../types/pricing.types";
import PrimaryButton from "../shared/PrimaryButton";
import SecondaryButton from "../shared/SecondaryButton";
import { cn } from "../../../lib/utils";
import { useAuthUser } from "../../../hooks/useAuthHooks";
import { useCreateCheckoutSessionMutation } from "../../../hooks/useSubscriptionHooks";
import { SubscriptionPlan } from "../../../services/subscription.service";
import { toast } from "sonner";

interface PricingPlanCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  dbPlan?: SubscriptionPlan; // Passed from backend if available
}

/**
 * Pricing plan card component matching the Figma layouts.
 * Highlights the Premium plan. Handles pricing calculations.
 */
export default function PricingPlanCard({ plan, billingCycle, dbPlan }: PricingPlanCardProps) {
  const isYearly = billingCycle === "yearly";
  const price = isYearly && plan.yearlyPrice !== undefined ? plan.yearlyPrice : plan.monthlyPrice;
  const router = useRouter();
  const { data: user } = useAuthUser();
  const createCheckout = useCreateCheckoutSessionMutation();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubscribe = () => {
    if (!user) {
      router.push('/host/register');
      return;
    }
    if (user.role !== 'HOST') {
      toast.error('Only Host accounts can activate subscriptions. Please create a Host account.');
      return;
    }

    const targetPlanId = dbPlan?.id || plan.id;
    if (!targetPlanId) {
      toast.error('Subscription plan not found in database.');
      return;
    }

    setLoading(true);
    createCheckout.mutate(targetPlanId, {
      onSuccess: (data: any) => {
        if (data.isFree) {
          toast.success(data.message || 'Free subscription activated!');
          window.location.href = data.url || '/dashboard/host/billing?status=success';
        } else if (data.isTest) {
          setTimeout(() => {
            setLoading(false);
            setShowSuccessModal(true);
          }, 2500); // Simulate network loading
        } else if (data.url) {
          window.location.href = data.url;
        } else {
          setLoading(false);
          toast.error('No checkout URL returned.');
        }
      },
      onError: (err: any) => {
        setLoading(false);
        const msg = err?.response?.data?.message || 'Failed to process subscription.';
        toast.error(msg);
      }
    });
  };

  return (
    <div
      className={cn(
        "relative flex w-full flex-col rounded-[24px] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1.5",
        plan.isFeatured
          ? "border-2 border-[#0b4d35] bg-white ring-4 ring-[#0b4d35]/12 shadow-2xl"
          : "border border-[#bdd3ba] bg-[#f8faf6] hover:border-[#0b4d35]/45 hover:shadow-2xl"
      )}
    >
      {/* Featured Ribbon Badge */}
      {plan.isFeatured && plan.badgeLabel && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white rounded-full px-4 py-1 shadow-md font-sans font-black text-[10px] tracking-widest uppercase flex items-center gap-1">
          <span>🔥</span>
          <span>{plan.badgeLabel}</span>
        </div>
      )}

      {/* Plan Header */}
      <div className="flex flex-col items-start mb-6">
        <h3 className="font-heading font-black text-xl text-[#0b4d35] uppercase tracking-wide">
          {plan.name}
        </h3>
        
        {/* Price Tag */}
        <div className="flex items-baseline gap-1.5 mt-3">
          <span className="font-heading font-black text-4xl sm:text-5xl text-[#0b4d35] select-none tracking-tight">
            £{price}
          </span>
          <span className="font-sans text-xs font-bold text-[#5e766c] select-none">
            {price === 0 ? " forever" : "/month"}
          </span>
        </div>
        
        {isYearly && plan.monthlyPrice > 0 ? (
          <span className="font-sans font-semibold text-[11px] text-[#16a34a] mt-1.5 select-none bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
            £{price * 12}/yr billed annually (Save 20%)
          </span>
        ) : !isYearly && plan.monthlyPrice > 0 ? (
          <span className="font-sans text-[11px] text-[#5e766c] mt-1.5 select-none">
            Billed monthly
          </span>
        ) : null}
      </div>

      {/* Commission Level Label */}
      <div className="inline-flex items-center bg-[#0b4d35]/8 border border-[#0b4d35]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0b4d35] select-none w-fit mb-6">
        {plan.commissionLabel}
      </div>

      {/* Divider */}
      <div className="h-px bg-divider w-full mb-6" />

      {/* Feature List */}
      <ul className="flex-1 flex flex-col gap-3.5 mb-8">
        {plan.features.map((feature) => (
          <li
            key={feature.id}
            className={cn(
              "flex items-center gap-3 font-sans text-xs md:text-sm font-medium transition-all duration-200",
              feature.included ? "text-[#101811]" : "text-[#5e766c]/50 line-through"
            )}
          >
            {/* Check or Dash SVG icon */}
            {feature.included ? (
              <div className="w-5 h-5 rounded-full bg-[#0b4d35]/12 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 text-[#0b4d35]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 text-black/25"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </div>
            )}
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      {/* CTA Action Button */}
      <div className="mt-auto">
        {plan.isFeatured ? (
          <PrimaryButton 
            className="w-full py-3 text-sm tracking-wide flex justify-center items-center gap-2" 
            onClick={handleSubscribe} 
            disabled={loading}
          >
            {loading ? 'Processing...' : plan.ctaLabel}
          </PrimaryButton>
        ) : (
          <SecondaryButton 
            className="w-full py-3 text-sm tracking-wide flex justify-center items-center gap-2" 
            onClick={handleSubscribe} 
            disabled={loading}
          >
            {loading ? 'Processing...' : plan.ctaLabel}
          </SecondaryButton>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-border p-8 rounded-[24px] shadow-glow w-[90%] max-w-md flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-2xl text-text-primary mb-3">Payment Successful</h2>
            <p className="font-sans text-sm text-text-secondary mb-8">Your subscription has been activated successfully.</p>
            <PrimaryButton 
              className="w-full py-3" 
              onClick={() => {
                window.location.href = '/dashboard/host/billing?status=success';
              }}
            >
              Continue to Dashboard
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
