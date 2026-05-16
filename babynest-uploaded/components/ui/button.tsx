import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'soft';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: [
        'bg-gradient-to-r from-primary-600 to-primary-500 text-white',
        'shadow-soft hover:shadow-glow',
        'hover:from-primary-700 hover:to-primary-600',
        'hover:-translate-y-0.5 active:translate-y-0',
        'focus:ring-primary-500',
      ],
      gradient: [
        'bg-gradient-to-r from-accent-500 to-accent-600 text-white',
        'shadow-soft hover:shadow-soft-lg',
        'hover:from-accent-600 hover:to-accent-700',
        'hover:-translate-y-0.5 active:translate-y-0',
        'focus:ring-accent-500',
      ],
      secondary: [
        'bg-white text-warm-700 border border-warm-200',
        'shadow-soft hover:shadow-soft-lg',
        'hover:border-accent-300 hover:text-accent-700',
        'hover:-translate-y-0.5 active:translate-y-0',
        'focus:ring-warm-400',
      ],
      outline: [
        'bg-transparent text-primary-700 border-2 border-primary-600',
        'hover:bg-primary-50',
        'hover:-translate-y-0.5 active:translate-y-0',
        'focus:ring-primary-500',
      ],
      soft: [
        'bg-primary-100 text-primary-700',
        'hover:bg-primary-200',
        'hover:-translate-y-0.5 active:translate-y-0',
        'focus:ring-primary-400',
      ],
      ghost: [
        'bg-transparent text-warm-600',
        'hover:bg-warm-100 hover:text-warm-900',
        'focus:ring-warm-400',
      ],
      danger: [
        'bg-gradient-to-r from-red-500 to-red-600 text-white',
        'shadow-soft hover:shadow-soft-lg',
        'hover:from-red-600 hover:to-red-700',
        'hover:-translate-y-0.5 active:translate-y-0',
        'focus:ring-red-500',
      ],
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-2xl',
      xl: 'px-8 py-4 text-base rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-50',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };