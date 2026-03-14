'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileText, Search, Filter, Copy, AlertTriangle } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useCompanyStore } from '@/stores/companyStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { FactuurDetail } from '@/components/facturen/FactuurDetail';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Document, FactuurData } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Alle statussen' },
  { value: 'concept', label: 'Concept' },
  { value: 'definitief', label: 'Definitief' },
  { value: 'verzonden', label: 'Verzonden' },
  { value: 'betaald', label: 'Betaald' },
  { value: 'vervallen', label: 'Vervallen' },
];

export default function FacturenPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [zoekterm, setZoekterm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const allDocumenten = useDocumentsStore((s) => s.documenten);
  const updateStatus = useDocumentsStore((s) => s.updateStatus);
  const duplicateDocument = useDocumentsStore((s) => s.duplicateDocument);
  const emailTemplate = useCompanyStore((s) => s.instellingen.emailTemplate);
  const getFactuurNummer = useCompanyStore((s) => s.getFactuurNummer);
  const incrementFactuurNummer = useCompanyStore((s) => s.incrementFactuurNummer);

  useEffect(() => { setMounted(true); }, []);

  // Auto-mark overdue invoices
  useEffect(() => {
    if (!mounted) return;
    const today = new Date().toISOString().split('T')[0];
    allDocumenten
      .filter((d) => d.type === 'factuur' && d.status !== 'betaald' && d.status !== 'vervallen')
      .forEach((d) => {
        const vd = (d.data as FactuurData).vervaldatum;
        if (vd && vd < today) updateStatus(d.id, 'vervallen');
      });
  }, [mounted, allDocumenten, updateStatus]);

  const facturen = useMemo(() => {
    if (!mounted) return [];
    return allDocumenten
      .filter((d) => d.type === 'factuur')
      .filter((d) => {
        const q = zoekterm.toLowerCase();
        if (q && !d.nummer.toLowerCase().includes(q) && !d.klantNaam.toLowerCase().includes(q)) return false;
        if (statusFilter && d.status !== statusFilter) return false;
        return true;
      });
  }, [mounted, allDocumenten, zoekterm, statusFilter]);

  const handleDuplicate = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const nummer = getFactuurNummer();
    await duplicateDocument(doc.id, nummer);
    await incrementFactuurNummer();
  };

  const overdueCount = useMemo(
    () => mounted ? allDocumenten.filter((d) => d.type === 'factuur' && d.status === 'vervallen').length : 0,
    [mounted, allDocumenten]
  );

  return (
    <div>
      <PageHeader
        title="Facturen"
        description={`${facturen.length} factuur${facturen.length !== 1 ? 'en' : ''}`}
        actions={
          <Link href="/facturen/nieuw" className="btn-primary">
            <Plus className="w-3.5 h-3.5" />Nieuwe factuur
          </Link>
        }
      />

      {overdueCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-[13px] font-medium"
          style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {overdueCount} factuur{overdueCount !== 1 ? 'en zijn' : ' is'} verlopen en wacht{overdueCount === 1 ? '' : 'en'} op betaling.
        </motion.div>
      )}

      {/* Zoeken & Filteren */}
      {mounted && allDocumenten.filter(d => d.type === 'factuur').length > 0 && (
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Zoek op nummer of klant..."
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

      {facturen.length === 0 ? (
        <div className="card">
          {zoekterm || statusFilter ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Geen resultaten</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Pas je zoekopdracht aan.</p>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nog geen facturen"
              description="Maak je eerste professionele factuur aan in minder dan 60 seconden."
              action={{ label: 'Eerste factuur maken', href: '/facturen/nieuw' }}
            />
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nummer</th><th>Klant</th><th>Datum</th><th>Vervaldatum</th>
                  <th className="text-right">Bedrag</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {facturen.map((doc, i) => {
                  const isVervallen = doc.status === 'vervallen';
                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedDoc(doc)}
                      className="cursor-pointer hover:bg-[var(--muted)] transition-colors"
                      style={isVervallen ? { backgroundColor: '#fff7ed' } : undefined}
                    >
                      <td>
                        <span className="font-medium tabular-nums text-[13px]" style={{ color: 'var(--text-primary)' }}>
                          {doc.nummer}
                        </span>
                      </td>
                      <td className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{doc.klantNaam}</td>
                      <td className="text-[13px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatDate(doc.datum)}</td>
                      <td className="text-[13px] tabular-nums" style={{ color: isVervallen ? '#ea580c' : 'var(--text-secondary)' }}>
                        {(doc.data as FactuurData).vervaldatum ? formatDate((doc.data as FactuurData).vervaldatum) : '—'}
                        {isVervallen && <span className="ml-1.5 text-[11px] font-semibold">VERLOPEN</span>}
                      </td>
                      <td className="text-right">
                        <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {doc.bedrag !== undefined ? formatCurrency(doc.bedrag) : '—'}
                        </span>
                      </td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-ghost p-1.5"
                          title="Dupliceren"
                          onClick={(e) => handleDuplicate(doc, e)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <FactuurDetail
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onMarkBetaald={(id) => updateStatus(id, 'betaald')}
        emailTemplate={emailTemplate}
      />
    </div>
  );
}
