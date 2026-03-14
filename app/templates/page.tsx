'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { ACCENT_KLEUREN } from '@/lib/constants';
import { TemplateName } from '@/types';

const TEMPLATES: { id: TemplateName; naam: string; omschrijving: string; }[] = [
  { id: 'modern', naam: 'Modern', omschrijving: 'Gekleurde header met logo. Ideaal voor tech en creatieve bureaus.' },
  { id: 'klassiek', naam: 'Klassiek', omschrijving: 'Formeel en tijdloos. Geschikt voor advocaten, accountants en consultants.' },
  { id: 'minimaal', naam: 'Minimaal', omschrijving: 'Maximale witruimte. Perfect voor designers en premium dienstverleners.' },
];

export default function TemplatesPage() {
  const { instellingen, setInstellingen } = useCompanyStore();
  const currentTemplate = instellingen.standaardTemplate;
  const currentKleur = instellingen.standaardAccentKleur;

  return (
    <div>
      <PageHeader title="Templates" description="Standaard opmaak voor al je documenten" />
      <div className="space-y-8">
        <section>
          <p className="section-label mb-4">Documenttemplate</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMPLATES.map((template, i) => {
              const isActive = currentTemplate === template.id;
              return (
                <motion.button key={template.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => setInstellingen({ standaardTemplate: template.id })}
                  className={`text-left p-5 rounded-lg border-2 transition-all ${isActive ? 'border-[#5746EA]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}
                  style={{ backgroundColor: 'var(--surface)' }}>
                  {/* Mock preview */}
                  <div className="w-full h-28 rounded-md mb-4 overflow-hidden p-3" style={{ backgroundColor: 'var(--muted)' }}>
                    {template.id === 'modern' && (
                      <>
                        <div className="h-7 rounded mb-2" style={{ backgroundColor: currentKleur, opacity: 0.85 }} />
                        <div className="h-1.5 w-3/4 rounded mb-1" style={{ backgroundColor: 'var(--border)' }} />
                        <div className="h-1.5 w-1/2 rounded mb-3" style={{ backgroundColor: 'var(--border)' }} />
                        {[1,1,0.7].map((w, j) => <div key={j} className="h-1 rounded mb-1" style={{ backgroundColor: 'var(--border)', opacity: 0.5, width: `${w * 100}%` }} />)}
                      </>
                    )}
                    {template.id === 'klassiek' && (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--border)' }} />
                          <div className="space-y-1">
                            <div className="h-1.5 w-16 rounded ml-auto" style={{ backgroundColor: 'var(--border)' }} />
                            <div className="h-1 w-10 rounded ml-auto" style={{ backgroundColor: 'var(--border)', opacity: 0.6 }} />
                          </div>
                        </div>
                        <div className="mb-2" style={{ borderTop: `2px solid ${currentKleur}`, opacity: 0.7 }} />
                        {[1,1,0.75].map((w, j) => <div key={j} className="h-1 rounded mb-1" style={{ backgroundColor: 'var(--border)', opacity: 0.5, width: `${w * 100}%` }} />)}
                      </>
                    )}
                    {template.id === 'minimaal' && (
                      <>
                        <div className="mb-4">
                          <div className="h-2 w-24 rounded mb-1" style={{ backgroundColor: 'var(--text-primary)', opacity: 0.7 }} />
                          <div className="h-1.5 w-16 rounded" style={{ backgroundColor: 'var(--border)' }} />
                        </div>
                        {[1,1,0.8].map((w, j) => <div key={j} className="h-1 rounded mb-1.5" style={{ backgroundColor: 'var(--border)', opacity: 0.4, width: `${w * 100}%` }} />)}
                      </>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{template.naam}</p>
                      <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>{template.omschrijving}</p>
                    </div>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5746EA' }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  {isActive && <p className="text-[11.5px] font-medium mt-2" style={{ color: '#5746EA' }}>Standaard ✓</p>}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="section-label mb-4">Accentkleur</p>
          <div className="card p-5">
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>Standaard accentkleur voor nieuwe documenten.</p>
            <div className="flex gap-2.5 flex-wrap mb-4">
              {ACCENT_KLEUREN.map((kleur) => (
                <button key={kleur} onClick={() => setInstellingen({ standaardAccentKleur: kleur })}
                  className="w-9 h-9 rounded-full transition-all hover:scale-110"
                  style={{ backgroundColor: kleur, outline: currentKleur === kleur ? `2.5px solid ${kleur}` : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="w-9 h-9 rounded-lg" style={{ backgroundColor: currentKleur }} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Geselecteerde kleur</p>
                <p className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{currentKleur}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
