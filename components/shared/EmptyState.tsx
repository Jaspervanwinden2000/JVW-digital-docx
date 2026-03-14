'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void; };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
        <Icon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-[13px] max-w-[280px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      {action && (
        <div className="mt-5">
          {action.href ? (
            <a href={action.href} className="btn-primary">{action.label}</a>
          ) : (
            <button onClick={action.onClick} className="btn-primary">{action.label}</button>
          )}
        </div>
      )}
    </motion.div>
  );
}
