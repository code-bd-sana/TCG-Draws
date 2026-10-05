import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '../../../lib/utils';
import logoLight from '../../../public/logo_transparent.png';
import logoDark from '../../../public/logo_dark_transparent.png';

interface FairwayDrawsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // 'light' for light backgrounds, 'dark' for dark backgrounds
  href?: string;
  priority?: boolean;
  showText?: boolean;
}

/**
 * Official TCG DRAWS logo component using authentic brand logo asset and luxury gold typography.
 */
export default function FairwayDrawsLogo({
  className,
  size = 'md',
  variant = 'dark',
  href = '/',
  priority = false,
  showText = false,
}: FairwayDrawsLogoProps) {
  const logoSrc = variant === 'light' ? logoLight : logoDark;

  const heightMap = {
    sm: 'h-9 sm:h-10',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-32',
  };

  const textMap = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const logoContent = (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      <div className="relative flex items-center justify-center">
        <Image
          alt="TCG DRAWS Logo"
          src={logoSrc}
          priority={priority}
          className={cn(
            'w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]',
            heightMap[size] || heightMap.md
          )}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-heading font-black tracking-[0.18em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#A37B24] drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]',
              textMap[size] || textMap.md
            )}
          >
            TCG DRAWS
          </span>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-medium text-[#A69B82]">
            POKÉMON CARDS & COLLECTABLES
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex focus:outline-none">{logoContent}</Link>;
  }

  return logoContent;
}

