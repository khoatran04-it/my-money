import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('rounded-xl border border-slate-100 bg-surface shadow-sm p-4', className)} 
      {...props} 
    />
  )
);
Card.displayName = 'Card';