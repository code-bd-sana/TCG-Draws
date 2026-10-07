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
      <div className="min-h-screen flex flex-col bg-[#090A0E]">
        <WebsiteNavbar />
        <div className="flex-1 flex items-center justify-center pt-28">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E]">
      <WebsiteNavbar />

      <main className="relative isolate flex-1 pt-28 pb-20 sm:pt-32 md:pb-24 overflow-hidden">
        {/* Ambient Luxury Lighting */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] opacity-35" />
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
          <div className="absolute top-1/2 right-10 h-[450px] w-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#090A0E] to-transparent" />
        </div>

        <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 font-sans text-xs font-semibold text-[#A69B82] mb-6">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/live-raffles" className="hover:text-[#D4AF37] transition-colors">
              Competitions
            </Link>
            <span>/</span>
            <Link href="/basket" className="hover:text-[#D4AF37] transition-colors">
              Basket
            </Link>
            <span>/</span>
            <span className="text-[#F4EBD9] font-bold">Checkout</span>
          </nav>

          {/* Header Title */}
          <div className="mb-8 pb-6 border-b border-[rgba(212,175,55,0.2)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-3.5 py-1.5 font-sans text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] mb-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              SECURE PRIZE DISPATCH DETAILS
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#F4EBD9] uppercase tracking-tight">
              CHECKOUT &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">
                DELIVERY DETAILS
              </span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-1.5">
              Provide your delivery address so we know where to ship your prizes when you win.
            </p>
          </div>

          {/* Unauthenticated User Notice */}
          {!user && (
            <div className="mb-6 p-4.5 rounded-2xl bg-[#12151F] border border-[rgba(212,175,55,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans shadow-lg">
              <div className="flex items-center gap-3 text-[#D6CEBC]">
                <div className="w-8 h-8 rounded-xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </div>
                <span>
                  Already have a <strong className="text-[#F4EBD9]">TCG Draws</strong> account? Log in to auto-fill your saved address details.
                </span>
              </div>
              <Link
                href="/login?redirect=/checkout"
                className="btn-gold-metallic px-4 py-2 rounded-xl text-[#090A0E] font-heading font-black uppercase text-[10px] tracking-wider self-start sm:self-auto shrink-0 shadow-sm transition-all"
              >
                Log In
              </Link>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs font-sans text-red-300 shadow-lg">
              <strong className="text-red-400 font-bold">Checkout Alert:</strong> {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form: Contact & Shipping */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
              {/* Step 1: Contact Information */}
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.22)] rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex flex-col gap-5">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-[#F4EBD9] pb-3 border-b border-[rgba(212,175,55,0.15)] flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] flex items-center justify-center text-xs font-black shadow-sm">
                    1
                  </span>
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all ${
                        errors.firstName ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.firstName && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all ${
                        errors.lastName ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.lastName && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Email Address (Ticket Confirmation) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all ${
                        errors.email ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.email && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.email}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Contact Phone (Delivery Notifications) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+44 7700 900123"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all ${
                        errors.phone ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.phone && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.phone}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                        Date of Birth (18+ Only) <span className="text-red-400">*</span>
                      </label>
                      {formData.dateOfBirth && (
                        <span
                          className={`text-[10px] font-sans font-bold ${
                            calculateAge(formData.dateOfBirth) < 18
                              ? "text-red-400"
                              : "text-emerald-400"
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
                      <span className="text-[10px] text-red-400 font-bold">{errors.dateOfBirth}</span>
                    ) : (
                      <span className="text-[10px] text-[#A69B82]">
                        You must be 18 years or older to participate. Automatically saved to your profile.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.22)] rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex flex-col gap-5">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-[#F4EBD9] pb-3 border-b border-[rgba(212,175,55,0.15)] flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] flex items-center justify-center text-xs font-black shadow-sm">
                    2
                  </span>
                  Prize Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Address Line 1 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="House number and street name"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all ${
                        errors.addressLine1 ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.addressLine1 && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.addressLine1}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, building floor"
                      className="h-11 px-3.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Town / City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Manchester"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] transition-all ${
                        errors.city ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.city && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.city}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Postal Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      placeholder="e.g. M1 1AA"
                      className={`h-11 px-3.5 rounded-xl border bg-[#181C28] text-xs font-sans text-[#F4EBD9] placeholder:text-[#A69B82]/50 outline-none focus:border-[#D4AF37] uppercase transition-all ${
                        errors.postcode ? "border-red-500 bg-red-950/20" : "border-[rgba(212,175,55,0.2)]"
                      }`}
                    />
                    {errors.postcode && (
                      <span className="text-[10px] text-red-400 font-semibold">{errors.postcode}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-[#A69B82]">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="h-11 px-3.5 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#141722] text-xs font-sans text-[#A69B82] outline-none cursor-not-allowed"
                    />
                  </div>

                  {user && (
                    <div className="flex items-center gap-2.5 pt-2 sm:col-span-2">
                      <input
                        type="checkbox"
                        id="saveToProfile"
                        name="saveToProfile"
                        checked={formData.saveToProfile}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37] cursor-pointer"
                      />
                      <label htmlFor="saveToProfile" className="text-xs font-sans text-[#F4EBD9] cursor-pointer select-none">
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
                  className="btn-gold-metallic w-full h-14 rounded-xl font-heading font-black text-sm uppercase tracking-wider text-[#090A0E] shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#090A0E] border-t-transparent rounded-full animate-spin" />
                      <span>Securing Your Tickets...</span>
                    </div>
                  ) : formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 ? (
                    <span>Entry Refused (Must be 18+)</span>
                  ) : totalPrice === 0 ? (
                    <span>Claim Free Entry →</span>
                  ) : (
                    <span>Confirm &amp; Pay — £{totalPrice.toFixed(2)} →</span>
                  )}
                </button>
              </div>
            </form>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
              <div className="bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(212,175,55,0.18)]">
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#F4EBD9]">
                    Order Summary
                  </h3>
                  <Link
                    href="/basket"
                    className="font-heading font-bold text-xs text-[#D4AF37] hover:text-[#FFF0D4] transition-colors uppercase tracking-wider"
                  >
                    Edit Basket
                  </Link>
                </div>

                {/* Items in basket */}
                <div className="flex flex-col divide-y divide-[rgba(212,175,55,0.12)] max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.raffleId} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#090A0E] shrink-0 border border-[rgba(212,175,55,0.25)] shadow-inner">
                          <Image
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop"
                            }
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-heading font-black text-xs text-[#F4EBD9] truncate uppercase tracking-tight">
                            {item.title}
                          </span>
                          <span className="font-sans text-[11px] text-[#A69B82] mt-0.5">
                            {item.quantity} × £{item.pricePerTicket.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-heading font-black text-xs text-[#D4AF37] shrink-0">
                        £{(item.pricePerTicket * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing summary */}
                <div className="pt-3.5 border-t border-[rgba(212,175,55,0.18)] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-sans text-[#A69B82]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#F4EBD9]">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans text-[#A69B82]">
                    <span>Transaction Fee</span>
                    <span className="font-bold text-emerald-400">FREE</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans text-[#A69B82]">
                    <span>Delivery &amp; Insured Shipping</span>
                    <span className="font-bold text-emerald-400">FREE TRACKED</span>
                  </div>
                  <div className="pt-3.5 border-t border-[rgba(212,175,55,0.18)] flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#F4EBD9] uppercase tracking-wide">
                      Total Due
                    </span>
                    <span className="font-heading font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Mobile visible submit button */}
                <div className="lg:hidden pt-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      items.length === 0 ||
                      (!!formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18)
                    }
                    className="btn-gold-metallic w-full h-12 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18
                      ? "Entry Refused (Must be 18+)"
                      : totalPrice === 0
                      ? "Claim Free Entry →"
                      : `Confirm & Pay — £${totalPrice.toFixed(2)} →`}
                  </button>
                </div>

                <div className="mt-3 pt-4 border-t border-[rgba(212,175,55,0.15)] text-[10px] text-[#A69B82] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">🔒</span>
                    <span>
                      {totalPrice === 0
                        ? "100% Free Entry — No Payment Gateway Required"
                        : "256-Bit SSL Encrypted & Cashflows Protected Checkout"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">🎯</span>
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
