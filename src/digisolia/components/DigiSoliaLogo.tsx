import React from 'react';
import { DigiSoliaAppConfig } from '../types';

interface DigiSoliaLogoProps {
  config?: DigiSoliaAppConfig;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
  showTagline?: boolean;
}

export const DigiSoliaLogo: React.FC<DigiSoliaLogoProps> = ({
  config,
  size = 'md',
  inverted = false,
  showTagline = false
}) => {
  const brandName = config?.brand.name || 'DIGISOLIA';
  const tagline = config?.brand.tagline || 'La technologie au service de vos activités.';
  const logoUrl = config?.brand.logoUrl;

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  if (logoUrl) {
    return (
      <div className="inline-flex items-center gap-2.5">
        <img
          src={logoUrl}
          alt={brandName}
          className={`${iconSizes[size]} object-contain rounded-lg`}
        />
        <div className="min-w-0">
          <div
            className={`font-extrabold tracking-tight leading-none ${titleSizes[size]} ${
              inverted ? 'text-white' : 'text-[#163B65] dark:text-white'
            }`}
          >
            {brandName}
          </div>
          {showTagline && (
            <p
              className={`text-[11px] font-medium mt-0.5 truncate ${
                inverted ? 'text-sky-200' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {tagline}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Geometric Provisional SVG Mark */}
      <div
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
          inverted
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-[#163B65] border-[#163B65] text-white dark:bg-[#2783C7] dark:border-[#2783C7]'
        }`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-3/5 h-3/5"
          aria-hidden="true"
        >
          <path
            d="M7 7H17.5C22.1944 7 26 10.8056 26 15.5C26 20.1944 22.1944 24 17.5 24H7V7Z"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 12.5H17C18.6569 12.5 20 13.8431 20 15.5C20 17.1569 18.6569 18.5 17 18.5H12.5V12.5Z"
            fill="#2783C7"
            className={inverted ? 'fill-sky-300' : 'fill-[#2783C7] dark:fill-white'}
          />
        </svg>
      </div>

      <div className="min-w-0">
        <div
          className={`font-extrabold tracking-tight leading-none flex items-center gap-1 ${titleSizes[size]} ${
            inverted ? 'text-white' : 'text-[#163B65] dark:text-white'
          }`}
        >
          <span>DIGI</span>
          <span className={inverted ? 'text-sky-300' : 'text-[#2783C7] dark:text-sky-400'}>
            SOLIA
          </span>
        </div>
        {showTagline && (
          <p
            className={`text-[11px] font-medium mt-0.5 truncate ${
              inverted ? 'text-sky-200/90' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
};
