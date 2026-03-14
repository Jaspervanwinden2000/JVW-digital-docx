'use client';

import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--error)' }}>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{hint}</p>}
      {error && <p className="text-[12px]" style={{ color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn('input-base', error && 'border-[var(--error)]', className)}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea className={cn('input-base resize-none', error && 'border-[var(--error)]', className)} {...props} />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: readonly { value: string | number; label: string }[];
}

export function Select({ error, options, className, ...props }: SelectProps) {
  return (
    <select
      className={cn('input-base', error && 'border-[var(--error)]', className)}
      style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
