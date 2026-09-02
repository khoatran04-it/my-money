import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './Input'; // Import Input cơ bản đã tạo ở trên

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, icon, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        <label className="text-sm font-medium text-content">
          {label} {props.required && <span className="text-negative">*</span>}
        </label>
        
        <Input 
          ref={ref} 
          icon={icon} 
          className={cn(error && 'border-negative focus:ring-negative')} 
          {...props} 
        />
        
        {error && (
          <span className="text-xs font-medium text-negative animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);
InputField.displayName = 'InputField';