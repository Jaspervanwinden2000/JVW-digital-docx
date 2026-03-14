'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, CheckCircle, Building2, User } from 'lucide-react';
import { Document, FactuurData } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadFactuurPdf, getFactuurMailtoLink } from '@/lib/factuurPdf';
import { AppInstellingen } from '@/types';

interface FactuurDetailProps {
  doc: Document | null;
  onClose: () => void;
  onMarkBetaald: (id: string) => void;
  emailTemplate: AppInstellingen['emailTemplate'];
}

export function FactuurDetail({ doc, onClose, onMarkBetaald, emailTemplate }: FactuurDetailProps) {
  const data = doc?.data as FactuurData | undefined;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (doc) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [doc]);

  const handleEmail = () => {
    if (!doc || !data) return;
    window.location.href = getFactuurMailtoLink(data, doc.nummer, emailTemplate);
  };

  return (
    <AnimatePresence>
      {doc && data && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] overflow-y-auto flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Factuur</p>
                  <p className="text-[17px] font-semibold tabular-nums leading-tight" style={{ color: 'var(--text-primary)' }}>{doc.nummer}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <button type="button" onClick={onClose} className="btn-ghost p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 py-5 space-y-5">

              {/* Dates row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3">
                  <p className="section-label mb-1">Datum</p>
                  <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatDate(doc.datum)}</p>
                </div>
                <div className="card p-3">
                  <p className="section-label mb-1">Vervaldatum</p>
                  <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {data.vervaldatum ? formatDate(data.vervaldatum) : '—'}
                  </p>
                </div>
                <div className="card p-3">
                  <p className="section-label mb-1">Betalingstermijn</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {data.betalingstermijn === 0 ? 'Direct' : `${data.betalingstermijn} dagen`}
                  </p>
                </div>
              </div>

              {/* Van / Aan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                    <p className="section-label">Van</p>
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{data.bedrijf.naam}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{data.bedrijf.adres.straat} {data.bedrijf.adres.huisnummer}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{data.bedrijf.adres.postcode} {data.bedrijf.adres.stad}</p>
                  {data.bedrijf.kvkNummer && <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>KVK: {data.bedrijf.kvkNummer}</p>}
                  {data.bedrijf.btwNummer && <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>BTW: {data.bedrijf.btwNummer}</p>}
                </div>
                <div className="card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <User className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                    <p className="section-label">Aan</p>
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{data.klant.bedrijfsnaam}</p>
                  {data.klant.contactpersoon && <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{data.klant.contactpersoon}</p>}
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{data.klant.adres.straat} {data.klant.adres.huisnummer}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{data.klant.adres.postcode} {data.klant.adres.stad}</p>
                  {data.klant.btwNummer && <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>BTW: {data.klant.btwNummer}</p>}
                </div>
              </div>

              {/* Reference */}
              {data.referentienummer && (
                <div className="card p-3">
                  <p className="section-label mb-1">Referentienummer</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{data.referentienummer}</p>
                </div>
              )}

              {/* Line items */}
              <div>
                <p className="section-label mb-2">Factuurregels</p>
                <div className="card overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Omschrijving</th>
                        <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Aantal</th>
                        <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Prijs</th>
                        <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>BTW</th>
                        <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.regels.map((regel, i) => (
                        <tr
                          key={regel.id}
                          style={{ borderBottom: i < data.regels.length - 1 ? '1px solid var(--border)' : 'none' }}
                        >
                          <td className="px-3 py-2.5" style={{ color: 'var(--text-primary)' }}>
                            <span className="font-medium">{regel.omschrijving}</span>
                            <span className="ml-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              {regel.aantal} {regel.eenheid}
                            </span>
                          </td>
                          <td className="text-right px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{regel.aantal}</td>
                          <td className="text-right px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(regel.prijsPerEenheid, data.valuta)}</td>
                          <td className="text-right px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{regel.btwTarief}%</td>
                          <td className="text-right px-3 py-2.5 tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(regel.totaalInclBTW, data.valuta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-60 space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotaal excl. BTW</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.subtotaalExclBTW, data.valuta)}</span>
                  </div>
                  {data.korting && (
                    <div className="flex justify-between text-[12px]">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Korting {data.korting.type === 'percentage' ? `(${data.korting.waarde}%)` : ''}
                      </span>
                      <span className="tabular-nums text-green-600">
                        -{formatCurrency(
                          data.korting.type === 'percentage'
                            ? data.subtotaalExclBTW * (data.korting.waarde / 100)
                            : data.korting.waarde,
                          data.valuta
                        )}
                      </span>
                    </div>
                  )}
                  {data.btwSpecificaties.map((btw) => (
                    <div key={btw.tarief} className="flex justify-between text-[12px]">
                      <span style={{ color: 'var(--text-secondary)' }}>BTW {btw.tarief}%</span>
                      <span className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(btw.bedrag, data.valuta)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex justify-between">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Totaal incl. BTW</span>
                      <span className="text-[15px] font-bold tabular-nums" style={{ color: data.accentKleur || '#2563EB' }}>
                        {formatCurrency(data.totaalInclBTW, data.valuta)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {data.notities && (
                <div className="card p-3">
                  <p className="section-label mb-1">Notities</p>
                  <p className="text-[13px] whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{data.notities}</p>
                </div>
              )}

              {/* IBAN */}
              {data.bedrijf.iban && (
                <div className="card p-3">
                  <p className="section-label mb-1">Bankgegevens</p>
                  <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{data.bedrijf.iban}</p>
                  {data.bedrijf.bic && <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>BIC: {data.bedrijf.bic}</p>}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div
              className="sticky bottom-0 px-5 py-4 border-t space-y-2"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {doc.status !== 'betaald' && doc.status !== 'vervallen' && (
                <button
                  type="button"
                  onClick={() => { onMarkBetaald(doc.id); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Markeer als betaald
                </button>
              )}
              {doc.status === 'betaald' && (
                <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold text-green-700 bg-green-50">
                  <CheckCircle className="w-4 h-4" />
                  Betaald
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadFactuurPdf(data, doc.nummer)}
                  className="btn-secondary flex-1 justify-center text-[13px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF downloaden
                </button>
                <button
                  type="button"
                  onClick={handleEmail}
                  className="btn-secondary flex-1 justify-center text-[13px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  E-mail sturen
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
