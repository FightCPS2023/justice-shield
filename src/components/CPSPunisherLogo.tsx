import React from 'react';
import logoImage from 'figma:asset/3ff72041057ebb2453918c5fc4ca98f06cbb9c29.png';

interface CPSPunisherLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'header';
  showText?: boolean;
  variant?: 'image' | 'icon'; // 'image' uses custom logo, 'icon' uses liberty scale
}

export function CPSPunisherLogo({ size = 'md', showText = true, variant = 'image' }: CPSPunisherLogoProps) {
  const imageSizeClasses = {
    sm: 'h-8 sm:h-10',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    header: 'h-10 sm:h-12 md:h-14'
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8 sm:w-10 sm:h-10',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    header: 'w-10 h-10 sm:w-12 sm:h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    header: 'text-base sm:text-lg md:text-xl'
  };

  // Image variant - uses custom logo with enhanced styling
  if (variant === 'image') {
    return (
      <div className="flex items-center gap-3">
        {/* Custom Logo Image with Glow Effect */}
        <div className="relative">
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-red-700/30 blur-xl rounded-full" />
          
          {/* Logo */}
          <img 
            src={logoImage} 
            alt="The CPS Punisher Logo" 
            className={`${imageSizeClasses[size]} relative w-auto object-contain drop-shadow-2xl`}
          />
        </div>
        
        {/* Optional Tagline with Modern Styling */}
        {showText && (
          <div className="hidden sm:flex flex-col">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold tracking-wide uppercase bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              ⚖️ Fight Back With Intelligence
            </p>
          </div>
        )}
      </div>
    );
  }

  // Icon variant - uses liberty scale SVG with enhanced effects
  return (
    <div className="flex items-center gap-3">
      {/* Liberty Scale Logo with Enhanced Effects */}
      <div className={`relative ${iconSizeClasses[size]} flex-shrink-0`}>
        {/* Outer glow effect - animated */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl blur-lg opacity-50 animate-pulse" />
        
        {/* Secondary glow for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-red-800 rounded-xl blur-md opacity-40" />
        
        {/* Logo container with premium gradient */}
        <div className="relative w-full h-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-xl flex items-center justify-center shadow-2xl border-2 border-red-500/40 backdrop-blur-sm">
          {/* Liberty Scale SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3/5 h-3/5 text-white drop-shadow-2xl"
          >
            {/* Scale stand */}
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="8" y1="21" x2="16" y2="21" />
            
            {/* Scale beam */}
            <line x1="4" y1="7" x2="20" y2="7" />
            
            {/* Left scale pan */}
            <path d="M4 7 L2 11 L6 11 Z" fill="currentColor" />
            <line x1="2" y1="11" x2="2" y2="13" />
            <line x1="6" y1="11" x2="6" y2="13" />
            <line x1="2" y1="13" x2="6" y2="13" />
            
            {/* Right scale pan */}
            <path d="M20 7 L18 11 L22 11 Z" fill="currentColor" />
            <line x1="18" y1="11" x2="18" y2="13" />
            <line x1="22" y1="11" x2="22" y2="13" />
            <line x1="18" y1="13" x2="22" y2="13" />
          </svg>
          
          {/* Justice star accent - enhanced */}
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <div className="absolute w-4 h-4 bg-yellow-400/50 rounded-full blur-sm" />
            <div className="relative w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg border border-yellow-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Logo Text with Enhanced Typography */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-black tracking-tight leading-none`}>
            <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-red-500 dark:via-red-600 dark:to-red-700 bg-clip-text text-transparent drop-shadow-sm">
              THE CPS
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent drop-shadow-sm">
              PUNISHER
            </span>
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-bold tracking-wide uppercase mt-0.5 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            ⚖️ Fight Back With Intelligence
          </p>
        </div>
      )}
    </div>
  );
}
