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
}

/**
 * Official Fairway Draws logo component using authentic brand logo asset.
 */
export default function FairwayDrawsLogo({
  className,
  size = 'md',
  variant = 'light',
  href = '/',
  priority = false,
}: FairwayDrawsLogoProps) {
  const logoSrc = variant === 'light' ? logoLight : logoDark;

  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12 md:h-14',
    lg: 'h-14 sm:h-16 md:h-20',
    xl: 'h-20 sm:h-24 md:h-32',
  };

  const logoContent = (
    <div className={cn('inline-flex items-center select-none group', className)}>
      <Image
        alt="Fairway Draws Logo"
        src={logoSrc}
        priority={priority}
        className={cn(
          'w-auto object-contain transition-transform duration-200 group-hover:scale-105 filter drop-shadow-sm',
          heightMap[size] || heightMap.md
        )}
      />
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex">{logoContent}</Link>;
  }

  return logoContent;
}

