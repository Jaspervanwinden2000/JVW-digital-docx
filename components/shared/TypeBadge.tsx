'use client';

import { DocumentType } from '@/types';
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const typeStyles: Record<DocumentType, string> = {
  factuur: 'badge-blue',
  offerte: 'badge-yellow',
  rapport: 'badge-gray',
};

export function TypeBadge({ type }: { type: DocumentType }) {
  return (
    <span className={cn('badge', typeStyles[type])}>
      {DOCUMENT_TYPE_LABELS[type]}
    </span>
  );
}
