import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md'
}) => {
  const [hovered, setHovered] = useState<number>(0);

  const dim = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const active = hovered || value;

  return (
    <div
      className="inline-flex items-center gap-1"
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`Note ${value} sur 5`}
    >
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= active;
        if (readonly) {
          return (
            <Star
              key={star}
              className={`${dim} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-[#2783C7] transition-transform hover:scale-110"
          >
            <Star
              className={`${dim} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
