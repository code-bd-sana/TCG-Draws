'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRegistrationFormValues, UserAuthFormState } from '../../types/user-auth.types';
import {
  validateRegisterForm,
  getPasswordStrength,
} from '../../lib/validations/user-auth.validation';
import PrimaryButton from '../website/shared/PrimaryButton';
import { cn } from '../../lib/utils';
import { useRegisterMutation, useAuthUser } from '../../hooks/useAuthHooks';
import { extractApiError } from '../../lib/utils';

export default function UserRegistrationForm() {
  const router = useRouter();
  const { data: user } = useAuthUser();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Controlled form values state
  const [formData, setFormData] = useState<UserRegistrationFormValues>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    acceptedMarketing: false,
  });

  // Overall form state
  const [formState, setFormState] = useState<UserAuthFormState<UserRegistrationFormValues>>({
    values: formData,
    isSubmitting: false,
    submitStatus: 'idle',
  });

  // Client-side validation errors state
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const registerMutation = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Perform validation checks
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // 2. Submit form
    try {
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        role: 'CLIENT',
      });

      // The mutation doesn't auto-redirect for registration, we do it here
      showToast('Registration successful! Check your email to verify.');
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 1500);
    } catch (error: any) {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));

      const responseData = error.response?.data;
      const validationErrors = responseData?.errors || responseData?.error;

      if (validationErrors && Array.isArray(validationErrors)) {
        const newErrors: any = {};
        validationErrors.forEach((err: any) => {
          newErrors[
            err.field === 'firstName' || err.field === 'lastName' ? 'fullName' : err.field
          ] = err.errors[0];
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
        showToast('Please fix the validation errors.');
      } else {
        showToast(extractApiError(error, 'Registration failed. Please try again.'));
      }
    }
  };

  // Calculate password strength rating
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className='relative w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn'>
      {/* Toast Alert popup for mock actions */}
      {toastMessage && (
        <div className='fixed top-4 right-4 z-50 bg-[#141722] border border-[#D4AF37] text-[#F5E5C0] px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] text-xs md:text-sm animate-fadeIn'>
          {toastMessage}
        </div>
      )}

      {/* Nav Tabs Selector */}
      <div className='flex items-center justify-start self-start bg-[#12151F] border border-[rgba(212,175,55,0.25)] p-1 rounded-full shadow-inner'>
        <div className='bg-gradient-to-r from-[rgba(212,175,55,0.25)] to-[rgba(180,140,40,0.15)] border border-[#D4AF37] px-4 py-1.5 rounded-full'>
          <span className='font-sans text-[11px] md:text-xs font-bold text-[#F5E5C0] uppercase tracking-wider'>
            Collector Register
          </span>
        </div>
        <button
          type='button'
          onClick={() => router.push('/host/register')}
          className='font-sans text-[11px] md:text-xs font-semibold text-[#A69B82] hover:text-[#F4EBD9] px-4 py-1.5 rounded-full transition-colors duration-200 cursor-pointer select-none'
        >
          Host Register
        </button>
      </div>

      {/* Main Registration Card wrapper */}
      <div className='art-deco-card rounded-2xl p-6 sm:p-8 md:p-10 w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative'>
        {/* Subtle top gold accent light */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80' />

        {/* Header section */}
        <div className='flex flex-col gap-2 mb-7'>
          <div className='flex items-center justify-between'>
            <span className='font-sans font-semibold text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.25em] uppercase'>
              COLLECTOR ENROLLMENT
            </span>
            <span className='text-[10px] text-[#A69B82] bg-[#181C28] px-2.5 py-1 rounded-full border border-[rgba(212,175,55,0.2)]'>
              Instant Access
            </span>
          </div>
          <h2 className='font-heading font-black text-2xl sm:text-3xl md:text-[34px] text-[#F4EBD9] tracking-tight'>
            Create Vault Account
          </h2>
          <div className='flex flex-wrap items-center gap-1.5 text-xs sm:text-sm'>
            <span className='text-[#A69B82]'>Already have an account?</span>
            <Link
              href='/login'
              className='font-semibold text-[#D4AF37] hover:text-[#F5E5C0] hover:underline transition-colors duration-200'
            >
              Log in →
            </Link>
          </div>
        </div>

        {/* Semantic Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 sm:gap-5'>
          {/* Full Name input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='fullName'
              className='font-sans font-medium text-xs sm:text-sm text-[#A69B82]'
            >
              Full Name
            </label>
            <input
              type='text'
              id='fullName'
              name='fullName'
              autoComplete='name'
              placeholder='Ash Ketchum'
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={formState.isSubmitting}
              className={cn(
                'w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none',
                errors.fullName
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : '',
                formState.isSubmitting && 'opacity-50 cursor-not-allowed',
              )}
            />
            {errors.fullName && (
              <span className='font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn'>
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='email'
              className='font-sans font-medium text-xs sm:text-sm text-[#A69B82]'
            >
              Email Address
            </label>
            <input
              type='email'
              id='email'
              name='email'
              autoComplete='email'
              placeholder='you@tcgdraws.com'
              value={formData.email}
              onChange={handleInputChange}
              disabled={formState.isSubmitting}
              className={cn(
                'w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none',
                errors.email
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : '',
                formState.isSubmitting && 'opacity-50 cursor-not-allowed',
              )}
            />
            {errors.email && (
              <span className='font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn'>
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone input field (optional) */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='phone'
              className='font-sans font-medium text-xs sm:text-sm text-[#A69B82]'
            >
              Phone Number{' '}
              <span className='text-[#6E6655] text-[10px] sm:text-xs font-normal'>
                (Optional)
              </span>
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              autoComplete='tel'
              placeholder='+44 7700 900000'
              value={formData.phone}
              onChange={handleInputChange}
              disabled={formState.isSubmitting}
              className={cn(
                'w-full input-obsidian rounded-xl px-4 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none',
                errors.phone
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : '',
                formState.isSubmitting && 'opacity-50 cursor-not-allowed',
              )}
            />
            {errors.phone && (
              <span className='font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn'>
                {errors.phone}
              </span>
            )}
          </div>

          {/* Password input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='password'
              className='font-sans font-medium text-xs sm:text-sm text-[#A69B82]'
            >
              Password
            </label>
            <div className='relative w-full'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                autoComplete='new-password'
                placeholder='••••••••'
                value={formData.password}
                onChange={handleInputChange}
                disabled={formState.isSubmitting}
                className={cn(
                  'w-full input-obsidian rounded-xl pl-4 pr-12 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none',
                  errors.password
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                    : '',
                  formState.isSubmitting && 'opacity-50 cursor-not-allowed',
                )}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69B82] hover:text-[#D4AF37] p-1 cursor-pointer select-none transition-colors duration-200'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className='font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn'>
                {errors.password}
              </span>
            )}

            {/* Password Strength Meter */}
            <div className='flex gap-1.5 mt-2 h-[4px] w-full'>
              {[1, 2, 3, 4].map((barIndex) => (
                <div
                  key={barIndex}
                  className={cn(
                    'h-full flex-1 rounded-full transition-all duration-300',
                    formData.password.length > 0 && barIndex <= passwordStrength
                      ? passwordStrength <= 1
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        : passwordStrength === 2
                          ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                          : passwordStrength === 3
                            ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                            : 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.7)]'
                      : 'bg-[#181C28]',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Confirm Password input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='confirmPassword'
              className='font-sans font-medium text-xs sm:text-sm text-[#A69B82]'
            >
              Confirm Password
            </label>
            <div className='relative w-full'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                name='confirmPassword'
                autoComplete='new-password'
                placeholder='••••••••'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={formState.isSubmitting}
                className={cn(
                  'w-full input-obsidian rounded-xl pl-4 pr-12 py-3 font-sans text-xs sm:text-sm placeholder:text-[#6E6655] transition-all duration-200 outline-none',
                  errors.confirmPassword
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                    : '',
                  formState.isSubmitting && 'opacity-50 cursor-not-allowed',
                )}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69B82] hover:text-[#D4AF37] p-1 cursor-pointer select-none transition-colors duration-200'
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className='font-sans text-[11px] text-red-400 mt-1 self-start animate-fadeIn'>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Guidelines / Terms check */}
          <div className='flex flex-col gap-2.5 mt-1'>
            <label className='flex items-start gap-2.5 text-xs text-[#A69B82] select-none cursor-pointer'>
              <input
                type='checkbox'
                name='acceptedTerms'
                checked={formData.acceptedTerms}
                onChange={handleInputChange}
                disabled={formState.isSubmitting}
                className='w-4 h-4 mt-0.5 rounded border border-[rgba(212,175,55,0.3)] bg-[#0C0E14] text-[#D4AF37] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#D4AF37] transition-all duration-200 cursor-pointer shrink-0'
              />
              <span className='leading-tight'>
                I confirm that I agree to the{' '}
                <Link href='/terms' className='text-[#D4AF37] hover:underline font-semibold'>
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href='/privacy' className='text-[#D4AF37] hover:underline font-semibold'>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.acceptedTerms && (
              <span className='font-sans text-[11px] text-red-400 self-start animate-fadeIn'>
                {errors.acceptedTerms}
              </span>
            )}

            <label className='flex items-start gap-2.5 text-xs text-[#A69B82] select-none cursor-pointer'>
              <input
                type='checkbox'
                name='acceptedMarketing'
                checked={formData.acceptedMarketing}
                onChange={handleInputChange}
                disabled={formState.isSubmitting}
                className='w-4 h-4 mt-0.5 rounded border border-[rgba(212,175,55,0.3)] bg-[#0C0E14] text-[#D4AF37] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#D4AF37] transition-all duration-200 cursor-pointer shrink-0'
              />
              <span className='leading-tight'>
                I want to receive Pokémon grail alerts, live draw notifications, and exclusive vault drops.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={formState.isSubmitting || !isMounted}
            className='btn-gold-metallic w-full py-3.5 mt-2 rounded-xl font-heading font-black text-xs sm:text-sm tracking-[0.15em] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] transition-all flex items-center justify-center gap-2'
          >
            {formState.isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#090A0E]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account &rarr;</span>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Host link */}
      <div className='text-center mt-1 text-xs sm:text-sm'>
        <span className='text-[#A69B82]'>Looking to host card competitions instead? </span>
        <Link
          href='/host/register'
          className='text-[#D4AF37] hover:text-[#F5E5C0] font-semibold hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer select-none'
        >
          Go to Host Register &rarr;
        </Link>
      </div>
    </div>
  );
}
