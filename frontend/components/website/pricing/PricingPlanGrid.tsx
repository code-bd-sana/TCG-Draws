"use client";
import React from "react";
import { PRICING_PLANS } from "../../../data/pricing/pricing-plans.data";
import { BillingCycle } from "../../../types/pricing.types";
import PricingPlanCard from "./PricingPlanCard";
import { useSubscriptionPlans } from "../../../hooks/useSubscriptionHooks";

interface PricingPlanGridProps {
  billingCycle: BillingCycle;
}

/**
 * Centered layout holding subscription plans (Free, Premium, and Pro).
 */
export default function PricingPlanGrid({ billingCycle }: PricingPlanGridProps) {
  const { data: dbPlans } = useSubscriptionPlans();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl mx-auto px-4 md:px-0">
      {PRICING_PLANS.map((plan) => {
        const dbPlan = dbPlans?.find(p => p.name.toLowerCase() === plan.name.toLowerCase());
        return (
          <div key={plan.id} className="w-full mx-auto flex">
            <PricingPlanCard plan={plan} billingCycle={billingCycle} dbPlan={dbPlan} />
          </div>
        );
      })}
    </div>
  );
}
