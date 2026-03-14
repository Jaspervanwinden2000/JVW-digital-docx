'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step { number: number; label: string; }

interface WizardStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardSteps({ steps, currentStep, onStepClick }: WizardStepsProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isDone = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => isDone && onStepClick?.(step.number)}
              disabled={!isDone}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all"
                style={{
                  backgroundColor: isDone ? '#18A058' : isActive ? '#5746EA' : 'var(--muted)',
                  color: isDone || isActive ? 'white' : 'var(--text-tertiary)',
                  border: isActive ? '2px solid #5746EA' : isDone ? '2px solid #18A058' : '2px solid var(--border)',
                }}
              >
                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : step.number}
              </div>
              <span className="text-[11.5px] font-medium hidden sm:block whitespace-nowrap" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mt-[-14px] sm:mt-[-22px]" style={{ backgroundColor: isDone ? '#18A058' : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
