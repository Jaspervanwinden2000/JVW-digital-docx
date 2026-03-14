'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Download } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceFormStore } from '@/stores/formStores';
import { useDocumentsStore } from '@/stores/documentsStore';
import { WizardSteps } from '@/components/documents/WizardSteps';
import { BedrijfForm } from '@/components/documents/BedrijfForm';
import { ClientSelector } from '@/components/documents/ClientSelector';
import { LineItemsEditor } from '@/components/documents/LineItemsEditor';
import { FormField, Input, Select, Textarea } from '@/components/documents/FormField';
import { berekenTotalen } from '@/lib/calculations';
import { formatDate, addDays } from '@/lib/formatters';
import { BETALINGSTERMIJNEN, VALUTA_OPTIONS, ACCENT_KLEUREN, TEMPLATE_OPTIONS } from '@/lib/constants';
import { FactuurData, Valuta, TemplateName } from '@/types';

const STEPS = [
  { number: 1, label: 'Bedrijf' },
  { number: 2, label: 'Klant' },
  { number: 3, label: 'Regels' },
  { number: 4, label: 'Details' },
  { number: 5, label: 'Voorbeeld' },
];

export default function NieuweFactuurPage() {
  const router = useRouter();
  const { bedrijf, setBedrijf, instellingen, getFactuurNummer, incrementFactuurNummer } = useCompanyStore();
  const { currentStep, data, setStep, setData, reset } = useInvoiceFormStore();
  const { addDocument } = useDocumentsStore();

  useEffect(() => {
    if (!data.bedrijf) setData({ bedrijf });
  }, []);

  useEffect(() => {
    if (currentStep === 4 && !data.factuurnummer) {
      const today = new Date();
      const termijn = data.betalingstermijn ?? instellingen.standaardBetalingstermijn;
      setData({
        factuurnummer: getFactuurNummer(),
        factuurdatum: today.toISOString().split('T')[0],
        vervaldatum: termijn === 0 ? today.toISOString().split('T')[0] : addDays(today, termijn).toISOString().split('T')[0],
      });
    }
  }, [currentStep]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!(data.bedrijf?.naam && data.bedrijf?.iban);
      case 2: return !!(data.klant?.bedrijfsnaam);
      case 3: return !!(data.regels?.length && data.regels.every(r => r.omschrijving));
      case 4: return !!(data.factuurnummer && data.factuurdatum);
      default: return true;
    }
  };

  const totalen = berekenTotalen(data.regels || [], data.korting);

  const handleSave = async (status: 'concept' | 'definitief') => {
    if (!data.klant || !data.bedrijf) return;
    await addDocument({
      type: 'factuur',
      nummer: data.factuurnummer!,
      klantNaam: data.klant.bedrijfsnaam,
      datum: data.factuurdatum!,
      bedrag: totalen.totaalInclBTW,
      status,
      data: { ...data, ...totalen, status } as FactuurData,
    });
    await incrementFactuurNummer();
    reset();
    router.push('/facturen');
  };

  const handleBetalingstermijnChange = (termijn: number) => {
    const factuurdatum = data.factuurdatum ? new Date(data.factuurdatum) : new Date();
    const vervaldatum = termijn === 0 ? factuurdatum.toISOString().split('T')[0] : addDays(factuurdatum, termijn).toISOString().split('T')[0];
    setData({ betalingstermijn: termijn as 14 | 30 | 60 | 0, vervaldatum });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="/facturen" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Nieuwe factuur</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Stap {currentStep} van {STEPS.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <WizardSteps steps={STEPS} currentStep={currentStep} onStepClick={setStep} />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }} className="card p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-[16px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Bedrijfsgegevens</h2>
              <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>Automatisch opgeslagen voor toekomstige facturen.</p>
              <BedrijfForm value={data.bedrijf || bedrijf} onChange={(b) => { setData({ bedrijf: b }); setBedrijf(b); }} />
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h2 className="text-[16px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Klantgegevens</h2>
              <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>Selecteer een bestaande klant of voeg een nieuwe toe.</p>
              <ClientSelector value={data.klant} onChange={(klant) => setData({ klant })} />
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h2 className="text-[16px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Factuurregels</h2>
              <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>BTW wordt automatisch berekend per regel.</p>
              <LineItemsEditor regels={data.regels || []} onChange={(regels) => setData({ regels })} valuta={data.valuta} />
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <h2 className="text-[16px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Factuurdetails</h2>
              <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>Nummer, datum en betaaltermijn.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Factuurnummer" required>
                  <Input value={data.factuurnummer || ''} onChange={(e) => setData({ factuurnummer: e.target.value })} placeholder="INV-2026-0001" />
                </FormField>
                <FormField label="Valuta">
                  <Select options={VALUTA_OPTIONS} value={data.valuta || 'EUR'} onChange={(e) => setData({ valuta: e.target.value as Valuta })} />
                </FormField>
                <FormField label="Factuurdatum" required>
                  <Input type="date" value={data.factuurdatum || ''} onChange={(e) => setData({ factuurdatum: e.target.value })} />
                </FormField>
                <FormField label="Betalingstermijn">
                  <Select options={BETALINGSTERMIJNEN} value={data.betalingstermijn ?? 30} onChange={(e) => handleBetalingstermijnChange(parseInt(e.target.value))} />
                </FormField>
                <FormField label="Vervaldatum" required>
                  <Input type="date" value={data.vervaldatum || ''} onChange={(e) => setData({ vervaldatum: e.target.value })} />
                </FormField>
                <FormField label="Referentienummer / PO-nummer" hint="Optioneel">
                  <Input value={data.referentienummer || ''} onChange={(e) => setData({ referentienummer: e.target.value })} placeholder="PO-2026-001" />
                </FormField>
                <FormField label="Notities" className="sm:col-span-2" hint="Zichtbaar op de factuur">
                  <Textarea rows={3} value={data.notities || ''} onChange={(e) => setData({ notities: e.target.value })} placeholder="Betalingsinstructies, referenties..." />
                </FormField>
              </div>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <h2 className="text-[16px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Voorbeeld & Genereer</h2>
              <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>Kies je template en genereer de factuur.</p>

              <div className="mb-5">
                <p className="section-label mb-2.5">Template</p>
                <div className="flex gap-2 flex-wrap">
                  {TEMPLATE_OPTIONS.map((t) => (
                    <button key={t.value} type="button" onClick={() => setData({ template: t.value as TemplateName })}
                      className={`px-3.5 py-1.5 rounded-md border text-[13px] font-medium transition-all ${data.template === t.value ? 'border-[#5746EA] bg-[#EEF0FF] text-[#3D2FBD]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--muted)]'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="section-label mb-2.5">Accentkleur</p>
                <div className="flex gap-2 flex-wrap">
                  {ACCENT_KLEUREN.map((kleur) => (
                    <button key={kleur} type="button" onClick={() => setData({ accentKleur: kleur })}
                      className="w-7 h-7 rounded-full transition-all hover:scale-110"
                      style={{ backgroundColor: kleur, outline: data.accentKleur === kleur ? `2px solid ${kleur}` : 'none', outlineOffset: '2px' }} />
                  ))}
                </div>
              </div>

              {/* Preview card */}
              <div className="card p-5 space-y-4 mb-6" style={{ backgroundColor: 'var(--surface-raised)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="section-label mb-1">Factuur</p>
                    <p className="text-[24px] font-bold tabular-nums" style={{ color: data.accentKleur || '#5746EA' }}>{data.factuurnummer}</p>
                  </div>
                  {data.bedrijf?.logo && <img src={data.bedrijf.logo} alt="Logo" className="h-10 object-contain" />}
                </div>
                <div className="grid grid-cols-2 gap-5 text-[13px]">
                  <div>
                    <p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Van</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{data.bedrijf?.naam}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Aan</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{data.klant?.bedrijfsnaam}</p>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    <p>Datum: {data.factuurdatum ? formatDate(data.factuurdatum) : '—'}</p>
                    <p>Verval: {data.vervaldatum ? formatDate(data.vervaldatum) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="section-label mb-1">Totaal incl. BTW</p>
                    <p className="text-[22px] font-bold tabular-nums" style={{ color: data.accentKleur || '#5746EA' }}>
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: data.valuta || 'EUR' }).format(totalen.totaalInclBTW)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => handleSave('concept')} className="btn-secondary flex-1 justify-center">
                  <Save className="w-3.5 h-3.5" />Concept opslaan
                </button>
                <button type="button" onClick={() => handleSave('definitief')} className="btn-primary flex-1 justify-center">
                  <Download className="w-3.5 h-3.5" />Factuur genereren
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <button type="button" onClick={() => setStep(currentStep - 1)} disabled={currentStep === 1} className="btn-secondary disabled:opacity-40">
            <ArrowLeft className="w-3.5 h-3.5" />Vorige
          </button>
          <button type="button" onClick={() => setStep(currentStep + 1)} disabled={!canGoNext()} className="btn-primary disabled:opacity-40">
            Volgende<ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
