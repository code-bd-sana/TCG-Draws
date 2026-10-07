"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingPlan, BillingCycle } from "../../../types/pricing.types";
import { cn } from "../../../lib/utils";
import { useAuthUser } from "../../../hooks/useAuthHooks";
import { useCreateCheckoutSessionMutation } from "../../../hooks/useSubscriptionHooks";
import { SubscriptionPlan } from "../../../services/subscription.service";
import { toast } from "sonner";

interface PricingPlanCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  dbPlan?: SubscriptionPlan;
}

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
          }, 2500);
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
        "relative flex w-full flex-col rounded-2xl p-8 shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-2",
        plan.isFeatured
          ? "border-2 border-[#D4AF37] bg-[#12151F] shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] hover:border-[#D4AF37]/50"
      )}
    >
      {/* Featured Ribbon Badge */}
      {plan.isFeatured && plan.badgeLabel && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] rounded-full px-4 py-1 shadow-md font-heading font-black text-[10px] tracking-widest uppercase flex items-center gap-1">
          <span>✨</span>
          <span>{plan.badgeLabel}</span>
        </div>
      )}

      {/* Plan Header */}
      <div className="flex flex-col items-start mb-6">
        <h3 className="font-heading font-black text-xl text-[#F4EBD9] uppercase tracking-wide">
          {plan.name}
        </h3>

        {/* Price Tag */}
        <div className="flex items-baseline gap-1.5 mt-3">
          <span className="font-heading font-black text-4xl sm:text-5xl text-[#D4AF37] select-none tracking-tight">
            £{price}
          </span>
          <span className="font-sans text-xs text-[#A69B82]">
            /{billingCycle === "yearly" ? "yr" : "mo"}
          </span>
        </div>

        <p className="font-sans text-xs text-[#A69B82] mt-3 leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* Commission pill */}
      <div className="inline-flex items-center bg-[#181C28] border border-[rgba(212,175,55,0.3)] px-3.5 py-1.5 rounded-full text-xs font-heading font-bold text-[#D4AF37] select-none w-fit mb-6">
        {plan.commissionLabel}
      </div>

      {/* Features List */}
      <div className="flex-grow flex flex-col gap-3.5 mb-8">
        <span className="font-heading text-[11px] font-bold text-[#A69B82] uppercase tracking-wider">
          What&apos;s Included:
        </span>
        {plan.features.map((feature, idx) => (
          <div key={feature.id || idx} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-3 h-3 text-[#D4AF37]"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <span className="font-sans text-xs text-[#F4EBD9] leading-tight">
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-auto">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={cn(
            "w-full py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
            plan.isFeatured
              ? "btn-gold-metallic text-[#090A0E] shadow-md"
              : "btn-dark-metallic text-[#F4EBD9] border border-[rgba(212,175,55,0.3)]"
          )}
        >
          {loading ? "Processing..." : plan.ctaLabel || "Select Plan"}
        </button>
      </div>
    </div>
  );
}
