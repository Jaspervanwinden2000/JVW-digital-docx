'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Calendar, Clock } from 'lucide-react';
import { Document, OfferteData } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface OfferteDetailProps {
  doc: Document | null;
  onClose: () => void;
  onMarkAanvaard: (id: string) => void;
}

export function OfferteDetail({ doc, onClose, onMarkAanvaard }: OfferteDetailProps) {
  const data = doc?.data as OfferteData | undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (doc) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [doc]);

  return (
    <AnimatePresence>
      {doc && data && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] overflow-y-auto flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Offerte</p>
                  <p className="text-[17px] font-semibold tabular-nums leading-tight" style={{ color: 'var(--text-primary)' }}>{doc.nummer}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <button type="button" onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 py-5 space-y-5">

              {/* Project */}
              {data.projectnaam && (
                <div className="card p-3">
                  <p className="section-label mb-1">Project</p>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{data.projectnaam}</p>
                  {data.projectomschrijving && (
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>{data.projectomschrijving}</p>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3 flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="section-label mb-0.5">Datum</p>
                    <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatDate(doc.datum)}</p>
                  </div>
                </div>
                <div className="card p-3 flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="section-label mb-0.5">Geldig tot</p>
                    <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {data.geldigTot ? formatDate(data.geldigTot) : '—'}
                    </p>
                  </div>
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
                </div>
              </div>

              {/* Inleiding */}
              {data.inleiding && (
                <div className="card p-3">
                  <p className="section-label mb-1">Inleiding</p>
                  <p className="text-[13px] whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{data.inleiding}</p>
                </div>
              )}

              {/* Line items */}
              {data.regels?.length > 0 && (
                <div>
                  <p className="section-label mb-2">Offerteregels</p>
                  <div className="card overflow-hidden">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                          <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Omschrijving</th>
                          <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Aantal</th>
                          <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Prijs</th>
                          <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Totaal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.regels.map((regel, i) => (
                          <tr key={regel.id} style={{ borderBottom: i < data.regels.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{regel.omschrijving}</td>
                            <td className="text-right px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{regel.aantal} {regel.eenheid}</td>
                            <td className="text-right px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(regel.prijsPerEenheid, data.valuta)}</td>
                            <td className="text-right px-3 py-2.5 tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(regel.totaalInclBTW, data.valuta)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totaal */}
              {doc.bedrag !== undefined && (
                <div className="flex justify-end">
                  <div className="w-48">
                    <div className="border-t pt-2 flex justify-between" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Totaal incl. BTW</span>
                      <span className="text-[15px] font-bold tabular-nums" style={{ color: data.accentKleur || '#2563EB' }}>
                        {formatCurrency(doc.bedrag, data.valuta)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pakketten */}
              {data.pakketten && data.pakketten.length > 0 && (
                <div>
                  <p className="section-label mb-2">Optionele pakketten</p>
                  <div className="space-y-2">
                    {data.pakketten.map((p, i) => (
                      <div key={i} className="card p-3 flex justify-between items-start">
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{p.naam}</p>
                          {p.omschrijving && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.omschrijving}</p>}
                        </div>
                        <span className="text-[13px] font-bold tabular-nums ml-4" style={{ color: data.accentKleur || '#2563EB' }}>
                          {formatCurrency(p.prijs, data.valuta)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voorwaarden */}
              {data.voorwaarden && (
                <div className="card p-3">
                  <p className="section-label mb-1">Voorwaarden</p>
                  <p className="text-[12px] whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{data.voorwaarden}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-5 py-4 border-t space-y-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              {doc.status !== 'definitief' && doc.status !== 'vervallen' && (
                <button
                  type="button"
                  onClick={() => { onMarkAanvaard(doc.id); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  Markeer als aanvaard
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
