'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../features/auth/AuthContext';
import { cn } from '../../../lib/utils';

export default function MobileBottomDock() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Determine user role dashboard path
  const getDashboardHome = () => {
    if (!user) return '/dashboard/user';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'HOST') return '/dashboard/host';
    return '/dashboard/user';
  };

  const dashboardHome = getDashboardHome();

  return (
    <div className='fixed bottom-0 left-0 right-0 z-40 block lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2EADF] shadow-[0_-5px_25px_rgba(11,77,53,0.1)]'>
      <div className='flex items-center justify-around h-16 px-2 max-w-md mx-auto'>
        {/* Tab 1: Home */}
        <Link
          href='/'
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200',
            pathname === '/'
              ? 'text-[#b91c1c] font-bold scale-105'
              : 'text-[#5e766c] hover:text-[#0b4d35]',
          )}
        >
          <svg
            className='w-5 h-5 mb-0.5'
            fill={pathname === '/' ? 'currentColor' : 'none'}
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v4.875h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
            />
          </svg>
          <span className='text-[10px] font-sans tracking-tight'>Home</span>
        </Link>

        {/* Tab 2: Competitions */}
        <Link
          href='/live-raffles'
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200',
            pathname === '/live-raffles' || pathname.startsWith('/live-raffles')
              ? 'text-[#b91c1c] font-bold scale-105'
              : 'text-[#5e766c] hover:text-[#0b4d35]',
          )}
        >
          <svg
            className='w-5 h-5 mb-0.5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h12c.621 0 1.125.504 1.125 1.125v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0-1.125 1.125H7.5a1.125 1.125 0 0 1-1.125-1.125v-1.757a1.5 1.5 0 0 0 0-2.236V11.23a1.5 1.5 0 0 0 0-2.236V7.125A1.125 1.125 0 0 1 7.5 6Z'
            />
          </svg>
          <span className='text-[10px] font-sans tracking-tight'>Competitions</span>
        </Link>

        {/* Tab 3: Center Floating Switcher (Public Site <-> Dashboard) */}
        <Link
          href={isDashboardRoute ? '/' : isAuthenticated ? dashboardHome : '/login'}
          className='flex flex-col items-center justify-center relative -top-3 shrink-0 group'
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform group-active:scale-95 border shadow-lg',
              isDashboardRoute
                ? 'bg-[#ECF5EE] border-[#0b4d35]/30 text-[#0b4d35]'
                : 'btn-glossy-red text-white border-white/20 shadow-[0_6px_20px_rgba(185,28,28,0.45)]',
            )}
          >
            <svg
              className='w-6 h-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.2}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 5.25v2.25m7.5-2.25v2.25M6 9.75h12M7.5 19.5h9M8.25 15.75h7.5M12 3.75c-1.036 0-1.875.84-1.875 1.875v.75h3.75v-.75C13.875 4.59 13.036 3.75 12 3.75ZM6 9.75h12l-1.125 8.25a1.5 1.5 0 0 1-1.486 1.298H8.611A1.5 1.5 0 0 1 7.125 18L6 9.75Z' />
            </svg>
          </div>
          <span className='text-[9px] font-sans font-black uppercase tracking-wider text-[#b91c1c] mt-0.5'>
            {isDashboardRoute ? 'Public Site' : 'DASHBOARD'}
          </span>
        </Link>

        {/* Tab 4: Winners */}
        <Link
          href='/winners'
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200',
            pathname === '/winners'
              ? 'text-[#b91c1c] font-bold scale-105'
              : 'text-[#5e766c] hover:text-[#0b4d35]',
          )}
        >
          <svg
            className='w-5 h-5 mb-0.5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 6v12m-3-6h6'
            />
          </svg>
          <span className='text-[10px] font-sans tracking-tight'>Winners</span>
        </Link>

        {/* Tab 5: Account / My Tickets */}
        <Link
          href={isAuthenticated ? '/dashboard/user/tickets' : '/login'}
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200',
            pathname === '/dashboard/user/tickets' || pathname === '/login'
              ? 'text-[#b91c1c] font-bold scale-105'
              : 'text-[#5e766c] hover:text-[#0b4d35]',
          )}
        >
          <svg
            className='w-5 h-5 mb-0.5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
            />
          </svg>
          <span className='text-[10px] font-sans tracking-tight'>
            {isAuthenticated ? 'My Tickets' : 'Account'}
          </span>
        </Link>
      </div>
    </div>
  );
}
