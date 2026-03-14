'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Copy, FileText, Mail } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useCompanyStore } from '@/stores/companyStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TypeBadge } from '@/components/shared/TypeBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadFactuurPdf, getFactuurMailtoLink } from '@/lib/factuurPdf';
import { Document, FactuurData } from '@/types';

export function RecentDocuments() {
  const [mounted, setMounted] = useState(false);
  const allDocumenten = useDocumentsStore((s) => s.documenten);
  const duplicateDocument = useDocumentsStore((s) => s.duplicateDocument);
  const emailTemplate = useCompanyStore((s) => s.instellingen.emailTemplate);
  const getFactuurNummer = useCompanyStore((s) => s.getFactuurNummer);
  const getOfferteNummer = useCompanyStore((s) => s.getOfferteNummer);
  const getRapportNummer = useCompanyStore((s) => s.getRapportNummer);
  const incrementFactuurNummer = useCompanyStore((s) => s.incrementFactuurNummer);
  const incrementOfferteNummer = useCompanyStore((s) => s.incrementOfferteNummer);
  const incrementRapportNummer = useCompanyStore((s) => s.incrementRapportNummer);

  useEffect(() => {
    setMounted(true);
  }, []);

  const documenten = useMemo(
    () => (mounted ? allDocumenten.slice(0, 10) : []),
    [mounted, allDocumenten]
  );

  const handleEmail = (doc: Document) => {
    if (doc.type !== 'factuur') return;
    const link = getFactuurMailtoLink(doc.data as FactuurData, doc.nummer, emailTemplate);
    window.location.href = link;
  };

  const handleDuplicate = async (doc: Document) => {
    let nummer = '';
    if (doc.type === 'factuur') { nummer = getFactuurNummer(); await duplicateDocument(doc.id, nummer); await incrementFactuurNummer(); }
    else if (doc.type === 'offerte') { nummer = getOfferteNummer(); await duplicateDocument(doc.id, nummer); await incrementOfferteNummer(); }
    else if (doc.type === 'rapport') { nummer = getRapportNummer(); await duplicateDocument(doc.id, nummer); await incrementRapportNummer(); }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}>
        <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Recente documenten</p>
        {documenten.length > 0 && (
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{documenten.length} item{documenten.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      {documenten.length === 0 ? (
        <EmptyState icon={FileText} title="Nog geen documenten" description="Maak je eerste factuur, offerte of rapport aan." action={{ label: 'Nieuwe factuur', href: '/facturen/nieuw' }} />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nummer</th><th>Type</th><th>Klant</th><th>Datum</th><th className="text-right">Bedrag</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {documenten.map((doc, i) => (
                <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td><span className="font-medium tabular-nums text-[13px]" style={{ color: 'var(--text-primary)' }}>{doc.nummer}</span></td>
                  <td><TypeBadge type={doc.type} /></td>
                  <td><span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{doc.klantNaam}</span></td>
                  <td><span className="text-[13px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatDate(doc.datum)}</span></td>
                  <td className="text-right">
                    {doc.bedrag !== undefined ? (
                      <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(doc.bedrag)}</span>
                    ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button className="btn-ghost p-1.5" title="Bekijken"><Eye className="w-3.5 h-3.5" /></button>
                      {doc.type === 'factuur' && (
                        <>
                          <button
                            className="btn-ghost p-1.5"
                            title="Downloaden"
                            onClick={() => downloadFactuurPdf(doc.data as FactuurData, doc.nummer)}
                          ><Download className="w-3.5 h-3.5" /></button>
                          <button
                            className="btn-ghost p-1.5"
                            title="E-mail sturen"
                            onClick={() => handleEmail(doc)}
                          ><Mail className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                      <button className="btn-ghost p-1.5" title="Dupliceren" onClick={() => handleDuplicate(doc)}><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
