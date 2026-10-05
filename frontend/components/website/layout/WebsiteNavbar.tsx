'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthUser } from '../../../hooks/useAuthHooks';
import { useBasket } from '../../../features/basket/BasketContext';
import { NAV_LINKS, SOCIAL_LINKS } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import FairwayDrawsLogo from '../shared/FairwayDrawsLogo';
import PrimaryButton from '../shared/PrimaryButton';

/**
 * Global website navigation navbar with sticky backdrop blur and responsive mobile slide-out sidebar y.
 */
export default function WebsiteNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: user } = useAuthUser();
  const { itemCount } = useBasket();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header
        className='fixed top-0 left-0 z-45 w-full border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E]/90 py-3 backdrop-blur-md transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.7)]'
      >
        <div className='container-custom flex items-center justify-between'>
          {/* Branding Logo */}
          <FairwayDrawsLogo variant="dark" size="md" priority />
          {/* Desktop Navigation Links */}
          <nav className='hidden xl:flex items-center gap-7'>
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200',
                    isActive
                      ? 'text-[#D4AF37] font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                      : 'text-[#A69B82] hover:text-[#D4AF37]',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action & Auth Buttons */}
          <div className='hidden xl:flex items-center gap-4'>
            {/* Basket Button */}
            <Link
              href='/basket'
              className='relative flex items-center justify-center p-2 rounded-xl text-[#F4EBD9] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] transition-all duration-200 cursor-pointer'
              aria-label={`Shopping Basket (${itemCount} items)`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2}
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z'
                />
              </svg>
              {itemCount > 0 && (
                <span className='absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] px-1 text-[10px] font-bold shadow-xs'>
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                href='/dashboard'
                className='btn-gold-metallic px-5 py-2 text-xs rounded-xl font-heading font-black tracking-wider uppercase flex items-center gap-1.5'
              >
                Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href='/login'
                  className='font-sans text-xs font-semibold text-[#F4EBD9] hover:text-[#D4AF37] uppercase tracking-wider transition-colors duration-200 px-3 py-2'
                >
                  Log In
                </Link>
                <Link
                  href='/host/register'
                  className='btn-gold-metallic px-5 py-2 text-xs rounded-xl font-heading font-black tracking-wider uppercase shadow-[0_2px_12px_rgba(212,175,55,0.25)]'
                >
                  Start Hosting
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Icons (Basket + Hamburger Toggle) */}
          <div className='xl:hidden flex items-center gap-2.5'>
            <Link
              href='/basket'
              className='relative flex items-center justify-center p-2 rounded-xl text-[#F4EBD9] hover:text-[#D4AF37] transition-all duration-200 cursor-pointer bg-[#0C0E14] border border-[rgba(212,175,55,0.25)]'
              aria-label={`Shopping Basket (${itemCount} items)`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2}
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z'
                />
              </svg>
              {itemCount > 0 && (
                <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] px-1 text-[9px] font-bold shadow-xs'>
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className='flex items-center justify-center p-2.5 rounded-xl btn-dark-metallic border border-[rgba(212,175,55,0.35)] text-[#D4AF37] transition-all duration-200 cursor-pointer active:scale-95'
              aria-label='Toggle Navigation Menu'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2.5}
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/80 backdrop-blur-sm z-45 xl:hidden transition-opacity duration-300'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Slide-out Drawer Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[290px] max-w-[85vw] bg-[#0C0E14] z-50 xl:hidden shadow-2xl transition-transform duration-300 ease-in-out border-l border-[rgba(212,175,55,0.25)] flex flex-col justify-between p-6',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div>
          {/* Header Inside Sidebar */}
          <div className='flex items-center justify-between pb-5 border-b border-[rgba(212,175,55,0.2)] mb-6'>
            <span className='font-heading font-black text-xs text-[#D4AF37] uppercase tracking-[0.2em]'>
              TCG DRAWS MENU
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className='p-1.5 text-[#A69B82] hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer'
              aria-label='Close Menu'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2.5}
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Links list */}
          <nav className='flex flex-col gap-3'>
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'font-heading font-semibold text-sm uppercase tracking-wider transition-colors duration-200 py-2 border-b border-[rgba(212,175,55,0.1)]',
                    isActive ? 'text-[#D4AF37] font-bold' : 'text-[#F4EBD9] hover:text-[#D4AF37]',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Login and Host Buttons */}
        <div className='flex flex-col gap-3.5 pt-6 border-t border-[rgba(212,175,55,0.2)] mt-auto'>
          {user ? (
            <Link
              href='/dashboard'
              onClick={() => setMobileMenuOpen(false)}
              className='btn-gold-metallic py-3 text-xs rounded-xl font-heading font-black tracking-wider uppercase text-center'
            >
              Enter Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link
                href='/login'
                onClick={() => setMobileMenuOpen(false)}
                className='flex items-center justify-center font-sans font-semibold text-xs text-[#F4EBD9] hover:text-[#D4AF37] uppercase tracking-wider py-3 border border-[rgba(212,175,55,0.3)] bg-[#12151F] rounded-xl transition-colors duration-200'
              >
                Log In
              </Link>
              <Link
                href='/host/register'
                onClick={() => setMobileMenuOpen(false)}
                className='btn-gold-metallic py-3 text-xs rounded-xl font-heading font-black tracking-wider uppercase text-center'
              >
                Start Hosting
              </Link>
            </>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-[rgba(212,175,55,0.15)]">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.platform}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#12151F] border border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all shadow-xs"
                aria-label={`${link.platform} Profile`}
              >
                {link.platform.toLowerCase() === 'facebook' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
