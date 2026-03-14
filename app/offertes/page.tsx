'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileSpreadsheet, Eye, Copy, Search, Filter } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useCompanyStore } from '@/stores/companyStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { OfferteDetail } from '@/components/offertes/OfferteDetail';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Document, OfferteData } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Alle statussen' },
  { value: 'concept', label: 'Concept' },
  { value: 'definitief', label: 'Definitief' },
  { value: 'verzonden', label: 'Verzonden' },
  { value: 'vervallen', label: 'Vervallen' },
];

export default function OffertesPage() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [zoekterm, setZoekterm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const allDocumenten = useDocumentsStore((s) => s.documenten);
  const updateStatus = useDocumentsStore((s) => s.updateStatus);
  const duplicateDocument = useDocumentsStore((s) => s.duplicateDocument);
  const getOfferteNummer = useCompanyStore((s) => s.getOfferteNummer);
  const incrementOfferteNummer = useCompanyStore((s) => s.incrementOfferteNummer);

  const documenten = useMemo(() => {
    return allDocumenten
      .filter((d) => d.type === 'offerte')
      .filter((d) => {
        const q = zoekterm.toLowerCase();
        if (q && !d.nummer.toLowerCase().includes(q) && !d.klantNaam.toLowerCase().includes(q) &&
          !((d.data as OfferteData).projectnaam || '').toLowerCase().includes(q)) return false;
        if (statusFilter && d.status !== statusFilter) return false;
        return true;
      });
  }, [allDocumenten, zoekterm, statusFilter]);

  const handleDuplicate = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const nummer = getOfferteNummer();
    await duplicateDocument(doc.id, nummer);
    await incrementOfferteNummer();
  };

  return (
    <div>
      <PageHeader
        title="Offertes"
        description={`${documenten.length} offerte${documenten.length !== 1 ? 's' : ''}`}
        actions={
          <Link href="/offertes/nieuw" className="btn-primary">
            <Plus className="w-3.5 h-3.5" />Nieuwe offerte
          </Link>
        }
      />

      {allDocumenten.filter(d => d.type === 'offerte').length > 0 && (
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Zoek op nummer, klant of project..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="input pl-9 w-full text-[13px]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-9 pr-8 text-[13px] appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {documenten.length === 0 ? (
        <div className="card">
          {zoekterm || statusFilter ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Geen resultaten</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Pas je zoekopdracht aan.</p>
            </div>
          ) : (
            <EmptyState icon={FileSpreadsheet} title="Nog geen offertes" description="Maak je eerste professionele offerte aan en win meer opdrachten." action={{ label: 'Eerste offerte maken', href: '/offertes/nieuw' }} />
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Nummer</th><th>Klant</th><th>Project</th><th>Datum</th><th className="text-right">Bedrag</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {documenten.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedDoc(doc)}
                    className="cursor-pointer hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="font-medium tabular-nums text-[13px]" style={{ color: 'var(--text-primary)' }}>{doc.nummer}</td>
                    <td className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{doc.klantNaam}</td>
                    <td className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{(doc.data as OfferteData).projectnaam || '—'}</td>
                    <td className="text-[13px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatDate(doc.datum)}</td>
                    <td className="text-right text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {doc.bedrag !== undefined ? formatCurrency(doc.bedrag) : '—'}
                    </td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button className="btn-ghost p-1.5" title="Bekijken" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="btn-ghost p-1.5" title="Dupliceren" onClick={(e) => handleDuplicate(doc, e)}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <OfferteDetail
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onMarkAanvaard={(id) => updateStatus(id, 'definitief')}
      />
    </div>
  );
}
