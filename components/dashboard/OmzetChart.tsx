'use client';

import { useMemo } from 'react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { formatCurrency } from '@/lib/formatters';

const MAANDEN = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

export function OmzetChart() {
  const documenten = useDocumentsStore((s) => s.documenten);

  const maandData = useMemo(() => {
    const now = new Date();
    const data: { label: string; omzet: number; openstaand: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const maand = d.getMonth();
      const jaar = d.getFullYear();

      const facturen = documenten.filter((doc) => {
        if (doc.type !== 'factuur') return false;
        const dt = new Date(doc.aangemaakt);
        return dt.getMonth() === maand && dt.getFullYear() === jaar;
      });

      const omzet = facturen
        .filter((f) => f.status === 'betaald')
        .reduce((s, f) => s + (f.bedrag || 0), 0);

      const openstaand = facturen
        .filter((f) => f.status !== 'betaald' && f.status !== 'vervallen')
        .reduce((s, f) => s + (f.bedrag || 0), 0);

      data.push({ label: MAANDEN[maand], omzet, openstaand });
    }
    return data;
  }, [documenten]);

  const maxWaarde = Math.max(...maandData.map((m) => m.omzet + m.openstaand), 1);
  const totaalOmzet = maandData.reduce((s, m) => s + m.omzet, 0);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Omzet — laatste 6 maanden</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Totaal ontvangen: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totaalOmzet)}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: '#2563eb' }} />
            Ontvangen
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: '#e2e8f0' }} />
            Openstaand
          </span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-32">
        {maandData.map((m, i) => {
          const omzetH = (m.omzet / maxWaarde) * 100;
          const openH = (m.openstaand / maxWaarde) * 100;
          const isHuidig = i === 5;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex flex-col justify-end h-24 relative">
                {/* Tooltip */}
                {(m.omzet > 0 || m.openstaand > 0) && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      {m.omzet > 0 && <div>✓ {formatCurrency(m.omzet)}</div>}
                      {m.openstaand > 0 && <div style={{ color: 'var(--text-secondary)' }}>⏳ {formatCurrency(m.openstaand)}</div>}
                    </div>
                  </div>
                )}
                {/* Openstaand bar */}
                {m.openstaand > 0 && (
                  <div
                    className="w-full rounded-t transition-all"
                    style={{ height: `${openH}%`, backgroundColor: '#e2e8f0', minHeight: 2 }}
                  />
                )}
                {/* Betaald bar */}
                <div
                  className="w-full transition-all"
                  style={{
                    height: `${omzetH}%`,
                    backgroundColor: isHuidig ? '#2563eb' : '#93c5fd',
                    minHeight: m.omzet > 0 ? 2 : 0,
                    borderRadius: m.openstaand > 0 ? '0' : '2px 2px 0 0',
                  }}
                />
              </div>
              <span className="text-[10px] tabular-nums" style={{ color: isHuidig ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: isHuidig ? 600 : 400 }}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
