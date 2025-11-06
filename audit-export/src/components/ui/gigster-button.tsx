import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface GigsterButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'glow';
  children: React.ReactNode;
}

export function GigsterButton({ 
  variant = 'default', 
  className = '',
  children,
  ...props 
}: GigsterButtonProps) {
  const gigsterVariants = {
    primary: 'bg-brand-amber hover:bg-brand-amber-tint text-slateInk font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5',
    secondary: 'bg-brand-teal hover:bg-brand-teal-tint text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5',
    outline: 'border-2 border-brand-teal text-brand-teal bg-transparent hover:bg-brand-teal hover:text-white font-semibold transition-all duration-200',
    glow: 'bg-gradient-to-r from-brand-teal to-brand-amber text-white font-semibold shadow-gigster-glow hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5'
  };
  
  if (variant !== 'default') {
    return (
      <button 
        className={cn('px-6 py-3 rounded-xl', gigsterVariants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  return (
    <Button variant={variant as any} className={className} {...props}>
      {children}
    </Button>
  );
}