'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { FactuurData } from '@/types';

export function OverdueAlert() {
  const documenten = useDocumentsStore((s) => s.documenten);

  const verlopen = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return documenten.filter((d) => {
      if (d.type !== 'factuur') return false;
      if (d.status === 'betaald' || d.status === 'vervallen') return false;
      const vd = (d.data as FactuurData).vervaldatum;
      return vd && vd < today;
    });
  }, [documenten]);

  if (verlopen.length === 0) return null;

  const totalOpenstaand = verlopen.reduce((s, d) => s + (d.bedrag || 0), 0);

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
            <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#92400e' }}>
              {verlopen.length} verlopen factuur{verlopen.length !== 1 ? 'en' : ''} — {formatCurrency(totalOpenstaand)} openstaand
            </p>
            <div className="mt-2 space-y-1">
              {verlopen.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-[12px]" style={{ color: '#92400e' }}>
                  <span className="font-medium tabular-nums">{doc.nummer}</span>
                  <span style={{ color: '#b45309' }}>·</span>
                  <span>{doc.klantNaam}</span>
                  <span style={{ color: '#b45309' }}>·</span>
                  <span>{formatCurrency(doc.bedrag || 0)}</span>
                  <span style={{ color: '#b45309' }}>·</span>
                  <span className="tabular-nums">verval {formatDate((doc.data as FactuurData).vervaldatum || '')}</span>
                </div>
              ))}
              {verlopen.length > 3 && (
                <p className="text-[11px]" style={{ color: '#b45309' }}>+{verlopen.length - 3} meer</p>
              )}
            </div>
          </div>
        </div>
        <Link href="/facturen" className="flex items-center gap-1 text-[12px] font-semibold shrink-0" style={{ color: '#d97706' }}>
          Bekijk <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
