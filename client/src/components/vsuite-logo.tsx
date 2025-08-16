import { Shield } from "lucide-react";

interface VSuiteLogoProps {
  size?: 'mini' | 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function VSuiteLogo({ size = 'medium', showText = true, className = '' }: VSuiteLogoProps) {
  const sizeClasses = {
    mini: 'vsuite-logo-mini',
    small: 'vsuite-logo',
    medium: 'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg',
    large: 'vsuite-logo-large'
  };

  const textSizes = {
    mini: 'text-sm',
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-blue-700`}>
        <img 
          src="@assets/IMG_3649_1755004491378.jpeg" 
          alt="VSuite HQ"
          className={`${
            size === 'mini' ? 'w-4 h-4' : 
            size === 'small' ? 'w-6 h-6' : 
            size === 'large' ? 'w-8 h-8' : 'w-7 h-7'
          } object-contain`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <Shield className={`hidden ${
          size === 'mini' ? 'w-4 h-4' : 
          size === 'small' ? 'w-5 h-5' : 
          size === 'large' ? 'w-8 h-8' : 'w-6 h-6'
        }`} />
      </div>
      
      {showText && (
        <div>
          <h1 className={`brand-heading ${textSizes[size]}`}>VSuite HQ</h1>
          {size !== 'mini' && (
            <p className="text-xs brand-tagline">Simplified Workflow Hub</p>
          )}
        </div>
      )}
    </div>
  );
}