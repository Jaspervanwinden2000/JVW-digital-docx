'use client';

import { DocumentStatus } from '@/types';
import { DOCUMENT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const statusStyles: Record<DocumentStatus, string> = {
  concept: 'badge-gray',
  definitief: 'badge-blue',
  verzonden: 'badge-yellow',
  betaald: 'badge-green',
  vervallen: 'badge-red',
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={cn('badge', statusStyles[status])}>
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  );
}
