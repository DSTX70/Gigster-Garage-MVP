import React from 'react';

interface GigsterIconProps {
  children: React.ReactNode;
  size?: number;
  className?: string;
  variant?: 'outline' | 'filled';
  gradient?: boolean;
}

export function GigsterIcon({ 
  children, 
  size = 24, 
  className = '', 
  variant = 'outline',
  gradient = false 
}: GigsterIconProps) {
  const baseClasses = `inline-flex items-center justify-center`;
  const sizeClasses = `w-${Math.floor(size/4)} h-${Math.floor(size/4)}`;
  const gradientClasses = gradient ? 'icon-gradient-teal-amber' : '';
  const variantClasses = variant === 'filled' ? 'icon-brand-teal' : '';
  
  return (
    <div className={`${baseClasses} ${sizeClasses} ${gradientClasses} ${variantClasses} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="transition-colors"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gg-gradient-teal-amber" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#008272" />
            <stop offset="100%" stopColor="#FFB200" />
          </linearGradient>
        </defs>
        {children}
      </svg>
    </div>
  );
}

// Icon components with both outline and filled variants
export function SparkIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path 
          d="M12 2l-2 6h5l-3 6 2-6H9l3-6Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinejoin="round"
        />
      ) : (
        <path d="M12 2l-2 6h5l-3 6 2-6H9l3-6Z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function RocketIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path 
          d="M12 3c3 0 6 3 6 6 0 4-6 12-6 12S6 13 6 9c0-3 3-6 6-6Zm0 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        />
      ) : (
        <g>
          <path d="M12 3c3 0 6 3 6 6 0 4-6 12-6 12S6 13 6 9c0-3 3-6 6-6Z" fill="url(#gg-gradient-teal-amber)" />
          <circle cx="12" cy="6" r="2" fill="#fff" opacity=".9" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function CheckIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path 
          d="M5 13l4 4 10-10" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      ) : (
        <g>
          <circle cx="12" cy="12" r="10" fill="url(#gg-gradient-teal-amber)" />
          <path d="M8.5 12.5l2.5 2.5L16 10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function FlameIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path 
          d="M12 5c2.5 3-1 4-1 6 0 1.5 1 2.5 1 2.5S15 12 15 9c0-2-1-3-3-4Zm0 14a5 5 0 0 1-5-5c0-4 5-6 5-6s5 2 5 6a5 5 0 0 1-5 5Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        />
      ) : (
        <g>
          <path d="M12 5c2.5 3-1 4-1 6 0 1.5 1 2.5 1 2.5S15 12 15 9c0-2-1-3-3-4Z" fill="url(#gg-gradient-teal-amber)" />
          <path d="M12 19a5 5 0 0 1-5-5c0-4 5-6 5-6s5 2 5 6a5 5 0 0 1-5 5Z" fill="url(#gg-gradient-teal-amber)" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function ClockIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="12" cy="12" r="9" fill="url(#gg-gradient-teal-amber)" />
          <path d="M12 7v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </GigsterIcon>
  );
}