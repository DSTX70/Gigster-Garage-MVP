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

// Additional Gigster Garage Icons
export function PadlockIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M9 11V8a3 3 0 1 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x="5" y="11" width="14" height="9" rx="2" fill="url(#gg-gradient-teal-amber)" />
          <path d="M9 11V8a3 3 0 1 1 6 0v3" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function CalendarIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x="4" y="6" width="16" height="14" rx="2" fill="url(#gg-gradient-teal-amber)" />
          <path d="M8 3v4M16 3v4M4 10h16" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function FlagIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M6 4v16M6 4h8l-2 3 2 3H6" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <g>
          <path d="M6 4h8l-2 3 2 3H6Z" fill="url(#gg-gradient-teal-amber)" />
          <path d="M6 4v16" stroke="currentColor" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

// Complete Gigster Garage Icon Set (30 icons)
export function ClipboardIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <rect x="6" y="5" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M9 5h6v2H9zM8 11h8M8 15h8" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x="6" y="5" width="12" height="16" rx="2" fill="url(#gg-gradient-teal-amber)" />
          <path d="M9 5h6v2H9zM8 11h8M8 15h8" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function MessageIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M4 6h16v10H8l-4 4V6Z" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M4 6h16v10H8l-4 4V6Z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function UsersIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M2 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="url(#gg-gradient-teal-amber)" />
          <path d="M2 20a7 7 0 0 1 14 0" stroke="url(#gg-gradient-teal-amber)" strokeWidth="2" fill="none" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function InvoiceIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 9h8M8 13h8M8 17h6M8 7h4" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x="5" y="4" width="14" height="16" rx="2" fill="url(#gg-gradient-teal-amber)" />
          <path d="M8 9h8M8 13h8M8 17h6M8 7h4" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function GearIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6v2m0 16v2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <g>
          <circle cx="12" cy="12" r="4" fill="url(#gg-gradient-teal-amber)" />
          <path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" stroke="currentColor" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

// Additional Icons from Complete Gigster Garage Set
export function DatabaseIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <ellipse cx="12" cy="6" rx="7" ry="3" fill="url(#gg-gradient-teal-amber)" />
          <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" stroke="url(#gg-gradient-teal-amber)" strokeWidth="2" fill="none" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function UploadIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="4" y="16" width="16" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="#fff" strokeWidth="2" />
          <rect x="4" y="16" width="16" height="4" rx="2" fill="url(#gg-gradient-teal-amber)" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function ChartIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <g>
          <path d="M4 20V4m0 16h16" stroke="currentColor" strokeWidth="2" />
          <rect x="7" y="12" width="2" height="4" fill="url(#gg-gradient-teal-amber)" />
          <rect x="11" y="8" width="2" height="8" fill="url(#gg-gradient-teal-amber)" />
          <rect x="15" y="10" width="2" height="6" fill="url(#gg-gradient-teal-amber)" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function SearchIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="11" cy="11" r="7" fill="url(#gg-gradient-teal-amber)" />
          <path d="M16.5 16.5 21 21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function HomeIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M3 11 12 4l9 7v8H3zM9 19v-4h6v4" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <g>
          <path d="M3 11 12 4l9 7v8H3z" fill="url(#gg-gradient-teal-amber)" />
          <path d="M9 19v-4h6v4" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function BellIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M6 16h12l-1-2v-4a5 5 0 0 0-10 0v4l-1 2Zm6 4a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <g>
          <path d="M6 16h12l-1-2v-4a5 5 0 0 0-10 0v4l-1 2Z" fill="url(#gg-gradient-teal-amber)" />
          <circle cx="12" cy="20" r="2" fill="#fff" />
        </g>
      )}
    </GigsterIcon>
  );
}

// Final 11 Icons to Complete the 30-Icon Set
export function IdBadgeIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <rect x="6" y="4" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M8 16h8" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x="6" y="4" width="12" height="16" rx="2" fill="url(#gg-gradient-teal-amber)" />
          <circle cx="12" cy="11" r="2" fill="#fff" />
          <path d="M8 16h8" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function PaperIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <path d="M6 4h9l3 3v13H6z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M15 4v3h3" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <path d="M6 4h9l3 3v13H6z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function ToolboxIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <rect x="4" y="8" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M9 8V6h6v2" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x="4" y="8" width="16" height="10" rx="2" fill="url(#gg-gradient-teal-amber)" />
          <path d="M9 8V6h6v2" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function LightbulbIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <path d="M9 14c0-3 3-5 3-8a4 4 0 1 1 8 0c0 3-3 5-3 8" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M10 20h8" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M9 14c0-3 3-5 3-8a4 4 0 1 1 8 0c0 3-3 5-3 8" fill="url(#gg-gradient-teal-amber)" />
          <rect x="10" y="19" width="8" height="2" fill="url(#gg-gradient-teal-amber)" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function ShieldIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M12 3l8 3v5c0 5-4 8-8 10C8 19 4 16 4 11V6l8-3Z" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M12 3l8 3v5c0 5-4 8-8 10C8 19 4 16 4 11V6l8-3Z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function TargetIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <circle cx="12" cy="12" r="8" fill="url(#gg-gradient-teal-amber)" />
          <circle cx="12" cy="12" r="3" fill="#fff" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function LinkIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <g>
          <path d="M10 13a4 4 0 0 1 0-6l2-2a4 4 0 1 1 6 6l-1 1" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M14 11a4 4 0 0 1 0 6l-2 2a4 4 0 1 1-6-6l1-1" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M10 13a4 4 0 0 1 0-6l2-2a4 4 0 1 1 6 6l-1 1" stroke="url(#gg-gradient-teal-amber)" strokeWidth="2" fill="none" />
          <path d="M14 11a4 4 0 0 1 0 6l-2 2a4 4 0 1 1-6-6l1-1" stroke="url(#gg-gradient-teal-amber)" strokeWidth="2" fill="none" />
        </g>
      )}
    </GigsterIcon>
  );
}

export function InboxIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M4 6h16v12H4zM4 14h5a3 3 0 0 0 6 0h5" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M4 6h16v12H4zM4 14h5a3 3 0 0 0 6 0h5" stroke="#fff" strokeWidth="2" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function BoltIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M10 2v9H6l8 11-2-9h4L10 2Z" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M10 2v9H6l8 11-2-9h4L10 2Z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function TagIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M3 12l9-9h6v6l-9 9-6-6Z" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M3 12l9-9h6v6l-9 9-6-6Z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}

export function StarIcon({ variant = 'outline', ...props }: Omit<GigsterIconProps, 'children'>) {
  return (
    <GigsterIcon variant={variant} {...props}>
      {variant === 'outline' ? (
        <path d="M12 3l2.8 5.6 6.2.9-4.5 4.4 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.2-.9L12 3Z" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M12 3l2.8 5.6 6.2.9-4.5 4.4 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.2-.9L12 3Z" fill="url(#gg-gradient-teal-amber)" />
      )}
    </GigsterIcon>
  );
}