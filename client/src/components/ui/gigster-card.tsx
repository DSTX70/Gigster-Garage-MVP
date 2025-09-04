import React from 'react';
import { cn } from '@/lib/utils';

interface GigsterCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'glow';
  className?: string;
  onClick?: () => void;
}

export function GigsterCard({ 
  children, 
  variant = 'default', 
  className = '',
  onClick 
}: GigsterCardProps) {
  const variants = {
    default: 'gg-card',
    muted: 'gg-card-muted',
    glow: 'gg-card gg-btn-glow'
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';
  
  return (
    <div 
      className={cn(variants[variant], interactiveClasses, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}