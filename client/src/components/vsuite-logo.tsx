import { Wrench } from "lucide-react";

interface GigsterLogoProps {
  size?: 'mini' | 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function GigsterLogo({ size = 'medium', showText = true, className = '' }: GigsterLogoProps) {
  const sizeClasses = {
    mini: 'gigster-logo-mini',
    small: 'gigster-logo',
    medium: 'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg',
    large: 'gigster-logo-large'
  };

  const textSizes = {
    mini: 'text-sm',
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={sizeClasses[size]} style={{ background: 'var(--gigster-gradient)' }}>
        <img 
          src="@assets/GG Logo 2.png_1756021117553.png" 
          alt="Gigster Garage"
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
        <Wrench className={`hidden ${
          size === 'mini' ? 'w-4 h-4' : 
          size === 'small' ? 'w-5 h-5' : 
          size === 'large' ? 'w-8 h-8' : 'w-6 h-6'
        }`} />
      </div>
      
      {showText && (
        <div>
          <h1 className={`brand-heading ${textSizes[size]}`}>Gigster Garage</h1>
          {size !== 'mini' && (
            <p className="text-xs brand-tagline">Smarter tools for bolder dreams</p>
          )}
        </div>
      )}
    </div>
  );
}