"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import { useBasket } from "../../features/basket/BasketContext";
import { useAuthUser } from "../../hooks/useAuthHooks";
import { ticketService } from "../../services/ticket.service";
import { userService } from "../../services/user.service";
import { toast } from "sonner";
import DobCalendarPicker from "../../components/ui/DobCalendarPicker";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { items, itemCount, totalTickets, totalPrice, clearBasket, isInitialized } = useBasket();
  const isOrderCompletedRef = useRef(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    saveToProfile: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-fill form once user data is loaded
  useEffect(() => {
    if (user) {
      // If address is stored as "Line 1, City, Postcode", split reasonably
      let street = user.address || "";
      let town = user.location || "";
      let code = "";

      if (street.includes(",")) {
        const parts = street.split(",").map((p) => p.trim());
        street = parts[0] || street;
        if (parts.length >= 2 && !town) town = parts[1];
        if (parts.length >= 3) code = parts[2];
      }

      let formattedDob = "";
      if (user.dateOfBirth) {
        try {
          const d = new Date(user.dateOfBirth);
          if (!isNaN(d.getTime())) {
            formattedDob = d.toISOString().split("T")[0];
          }
        } catch {}
      }

      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        dateOfBirth: prev.dateOfBirth || formattedDob,
        addressLine1: prev.addressLine1 || street,
        city: prev.city || town,
        postcode: prev.postcode || code,
      }));
    }
  }, [user]);

  // Redirect if basket is empty (except when completing/redirecting an order)
  useEffect(() => {
    if (isInitialized && items.length === 0 && !isSubmitting && !isOrderCompletedRef.current) {
      router.replace("/basket");
    }
  }, [isInitialized, items.length, router, isSubmitting]);

  // Auto-save Date of Birth to user profile on blur if 18+
  const handleDobBlur = async (dobOverride?: string) => {
    const dobToSave = dobOverride || formData.dateOfBirth;
    if (!user || !dobToSave) return;
    const age = calculateAge(dobToSave);
    if (age >= 18) {
      try {
        await userService.updateProfile({ dateOfBirth: dobToSave });
      } catch (err) {
        console.error("Auto-save DOB error:", err);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required for prize delivery";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required to verify age (18+ only)";
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old. Processing refused.";
      }
    }

    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "Town or City is required";
    if (!formData.postcode.trim()) newErrors.postcode = "Postal code is required";

    setErrors(newErrors);

    if (newErrors.dateOfBirth && newErrors.dateOfBirth.includes("refused")) {
      toast.error("You must be at least 18 years of age to purchase tickets. Processing refused.");
      return false;
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (!errors.dateOfBirth?.includes("refused")) {
        toast.error("Please fill in all required fields");
      }
      return;
    }

    if (items.length === 0) {
      toast.error("Your basket is empty");
      router.push("/live-raffles");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        items: items.map((i) => ({
          raffleId: i.raffleId,
          quantity: i.quantity,
        })),
        shippingDetails: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          dateOfBirth: formData.dateOfBirth,
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2?.trim() || undefined,
          city: formData.city.trim(),
          postcode: formData.postcode.trim().toUpperCase(),
          country: formData.country,
          saveToProfile: formData.saveToProfile,
        },
      };

      isOrderCompletedRef.current = true;
      const res = await ticketService.checkout(payload);

      // ALWAYS clear basket upon ordering & payment initiation
      clearBasket();

      // If gateway returns redirect URL (Cashflows)
      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      // If simulated/test payment completed immediately
      toast.success("Order confirmed successfully! Revealing ticket entries...");

      const orderRef = res.orderNumber || res.transaction?.id || "COMPLETED";
      router.push(`/checkout/success?payment=success&ordernumber=${orderRef}`);
    } catch (err: any) {
      isOrderCompletedRef.current = false;
      console.error("Checkout error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to process your order. Please check ticket availability.";
      setServerError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  if (!isInitialized || (isUserLoading && !user)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf6]">
        <WebsiteNavbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf6]">
      <WebsiteNavbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header Title */}
          <div className="mb-8 pb-6 border-b border-[#e2eadf]">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary uppercase tracking-tight">
              Checkout & Delivery Details
            </h1>
            <p className="font-sans text-xs text-text-muted mt-1">
              Provide your delivery address so we know where to ship your prizes when you win.
            </p>
          </div>

          {/* Unauthenticated User Notice */}
          {!user && (
            <div className="mb-6 p-4 rounded-xl bg-[#ecf5ee] border border-[#bbf7d0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
              <div className="flex items-center gap-2.5 text-[#15803d]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                <span>
                  Already have a Fairway Draws account? Log in to auto-fill your saved address details.
                </span>
              </div>
              <Link
                href="/login?redirect=/checkout"
                className="btn-glossy-red px-4 py-1.5 rounded-lg text-white font-bold uppercase text-[10px] tracking-wider self-start sm:self-auto shrink-0 shadow-xs"
              >
                Log In
              </Link>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-[#fee2e2] border border-[#fecaca] text-xs font-sans text-[#991b1b]">
              <strong>Checkout Alert:</strong> {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form: Contact & Shipping */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
              {/* Contact Information */}
              <div className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-text-primary pb-2 border-b border-divider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all ${
                        errors.firstName ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.firstName && (
                      <span className="text-[10px] text-red-500">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all ${
                        errors.lastName ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.lastName && (
                      <span className="text-[10px] text-red-500">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Email Address (Ticket Confirmation) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all ${
                        errors.email ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.email && (
                      <span className="text-[10px] text-red-500">{errors.email}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Contact Phone (Delivery Notifications) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+44 7700 900123"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all ${
                        errors.phone ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.phone && (
                      <span className="text-[10px] text-red-500">{errors.phone}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                        Date of Birth (18+ Only) <span className="text-red-500">*</span>
                      </label>
                      {formData.dateOfBirth && (
                        <span
                          className={`text-[10px] font-sans font-bold ${
                            calculateAge(formData.dateOfBirth) < 18
                              ? "text-red-600"
                              : "text-[#15803d]"
                          }`}
                        >
                          {calculateAge(formData.dateOfBirth) < 18
                            ? `Age: ${calculateAge(formData.dateOfBirth)} (Under 18 — Processing Refused)`
                            : `Age: ${calculateAge(formData.dateOfBirth)} (Eligible)`}
                        </span>
                      )}
                    </div>
                    <DobCalendarPicker
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(val) => {
                        setFormData((prev) => ({ ...prev, dateOfBirth: val }));
                        if (errors.dateOfBirth) {
                          setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
                        }
                        if (serverError) setServerError(null);
                      }}
                      onBlur={(val) => handleDobBlur(val)}
                      hasError={!!errors.dateOfBirth}
                      maxDate={new Date().toISOString().split("T")[0]}
                    />
                    {errors.dateOfBirth ? (
                      <span className="text-[10px] text-red-500 font-bold">{errors.dateOfBirth}</span>
                    ) : (
                      <span className="text-[10px] text-text-muted">
                        You must be 18 years or older to participate. Automatically saved to your profile.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-text-primary pb-2 border-b border-divider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  Prize Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="House number and street name"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all ${
                        errors.addressLine1 ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.addressLine1 && (
                      <span className="text-[10px] text-red-500">{errors.addressLine1}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, building floor"
                      className="h-11 px-3.5 rounded-xl border border-border-medium bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Town / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Manchester"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary transition-all ${
                        errors.city ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.city && (
                      <span className="text-[10px] text-red-500">{errors.city}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      placeholder="e.g. M1 1AA"
                      className={`h-11 px-3.5 rounded-xl border bg-elevated text-xs font-sans text-text-primary outline-none focus:border-primary uppercase transition-all ${
                        errors.postcode ? "border-red-500" : "border-border-medium"
                      }`}
                    />
                    {errors.postcode && (
                      <span className="text-[10px] text-red-500">{errors.postcode}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-text-muted">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="h-11 px-3.5 rounded-xl border border-border-medium/60 bg-elevated text-xs font-sans text-text-muted outline-none cursor-not-allowed"
                    />
                  </div>

                  {user && (
                    <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                      <input
                        type="checkbox"
                        id="saveToProfile"
                        name="saveToProfile"
                        checked={formData.saveToProfile}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#15803d] cursor-pointer"
                      />
                      <label htmlFor="saveToProfile" className="text-xs font-sans text-text-primary cursor-pointer select-none">
                        Save this shipping address to my profile for future competitions
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA (Desktop only, mobile will trigger from sidebar) */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    items.length === 0 ||
                    (!!formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18)
                  }
                  className="btn-glossy-red w-full h-14 rounded-xl font-heading font-bold text-sm uppercase tracking-wider text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Securing Your Tickets...</span>
                    </div>
                  ) : formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 ? (
                    <span>Entry Refused (Must be 18+)</span>
                  ) : totalPrice === 0 ? (
                    <span>Claim Free Entry</span>
                  ) : (
                    <span>Confirm & Pay — £{totalPrice.toFixed(2)}</span>
                  )}
                </button>
              </div>
            </form>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
              <div className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-divider">
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-text-primary">
                    Order Summary
                  </h3>
                  <Link
                    href="/basket"
                    className="font-sans text-xs text-text-brand hover:underline font-bold"
                  >
                    Edit Basket
                  </Link>
                </div>

                {/* Items in basket */}
                <div className="flex flex-col divide-y divide-divider max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.raffleId} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-accent-bg shrink-0 border border-border">
                          <Image
                            src={
                              item.image ||
                              "https://placehold.co/400x300/1a230a/8cb34a?text=Competition"
                            }
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-heading font-bold text-xs text-text-primary truncate">
                            {item.title}
                          </span>
                          <span className="font-sans text-[11px] text-text-muted">
                            {item.quantity} × £{item.pricePerTicket.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-heading font-bold text-xs text-text-primary shrink-0">
                        £{(item.pricePerTicket * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing summary */}
                <div className="pt-3 border-t border-divider flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-semibold text-text-primary">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-text-muted">Transaction Fee</span>
                    <span className="font-semibold text-[#15803d]">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-divider flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-text-primary uppercase">
                      Total Due
                    </span>
                    <span className="font-heading font-black text-xl text-text-brand">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Mobile visible submit button */}
                <div className="lg:hidden pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      items.length === 0 ||
                      (!!formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18)
                    }
                    className="btn-glossy-red w-full h-12 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18
                      ? "Entry Refused (Must be 18+)"
                      : totalPrice === 0
                      ? "Claim Free Entry"
                      : `Confirm & Pay — £${totalPrice.toFixed(2)}`}
                  </button>
                </div>

                <div className="pt-4 border-t border-divider text-[10px] text-text-muted flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#15803d] font-bold">🔒</span>
                    <span>
                      {totalPrice === 0
                        ? "100% Free Entry — No Payment Gateway Required"
                        : "256-Bit SSL Encrypted & Cashflows Protected Checkout"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#15803d] font-bold">🎯</span>
                    <span>Random ticket numbers generated immediately upon receipt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
