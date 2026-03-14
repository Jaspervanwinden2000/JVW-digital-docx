'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, BarChart3, Copy, Search } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useCompanyStore } from '@/stores/companyStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate } from '@/lib/formatters';
import { Document, RapportData } from '@/types';

export default function RapportenPage() {
  const [zoekterm, setZoekterm] = useState('');
  const allDocumenten = useDocumentsStore((s) => s.documenten);
  const duplicateDocument = useDocumentsStore((s) => s.duplicateDocument);
  const getRapportNummer = useCompanyStore((s) => s.getRapportNummer);
  const incrementRapportNummer = useCompanyStore((s) => s.incrementRapportNummer);

  const documenten = useMemo(() => {
    return allDocumenten
      .filter((d) => d.type === 'rapport')
      .filter((d) => {
        const q = zoekterm.toLowerCase();
        if (!q) return true;
        const rd = d.data as RapportData;
        return d.nummer.toLowerCase().includes(q) ||
          (rd.titel || '').toLowerCase().includes(q) ||
          (rd.periode || '').toLowerCase().includes(q);
      });
  }, [allDocumenten, zoekterm]);

  const handleDuplicate = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const nummer = getRapportNummer();
    await duplicateDocument(doc.id, nummer);
    await incrementRapportNummer();
  };

  return (
    <div>
      <PageHeader
        title="Rapporten"
        description={`${documenten.length} rapport${documenten.length !== 1 ? 'en' : ''}`}
        actions={
          <Link href="/rapporten/nieuw" className="btn-primary">
            <Plus className="w-3.5 h-3.5" />Nieuw rapport
          </Link>
        }
      />

      {allDocumenten.filter(d => d.type === 'rapport').length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Zoek op nummer, titel of periode..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="input pl-9 w-full text-[13px]"
            />
          </div>
        </div>
      )}

      {documenten.length === 0 ? (
        <div className="card">
          {zoekterm ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Geen resultaten</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Pas je zoekopdracht aan.</p>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Nog geen rapporten" description="Maak je eerste maandrapport aan en houd klanten op de hoogte." action={{ label: 'Eerste rapport maken', href: '/rapporten/nieuw' }} />
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Nummer</th><th>Titel</th><th>Periode</th><th>Datum</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {documenten.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="font-medium tabular-nums text-[13px]" style={{ color: 'var(--text-primary)' }}>{doc.nummer}</td>
                    <td className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{(doc.data as RapportData).titel || doc.nummer}</td>
                    <td className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{(doc.data as RapportData).periode || '—'}</td>
                    <td className="text-[13px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatDate(doc.datum)}</td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td>
                      <button className="btn-ghost p-1.5" title="Dupliceren" onClick={(e) => handleDuplicate(doc, e)}>
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
