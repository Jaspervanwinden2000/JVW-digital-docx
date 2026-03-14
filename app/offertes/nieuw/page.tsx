'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Download, Plus, Trash2 } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useQuoteFormStore } from '@/stores/formStores';
import { useDocumentsStore } from '@/stores/documentsStore';
import { WizardSteps } from '@/components/documents/WizardSteps';
import { BedrijfForm } from '@/components/documents/BedrijfForm';
import { ClientSelector } from '@/components/documents/ClientSelector';
import { LineItemsEditor } from '@/components/documents/LineItemsEditor';
import { FormField, Input, Select, Textarea } from '@/components/documents/FormField';
import { berekenTotalen } from '@/lib/calculations';
import { formatDate, addDays } from '@/lib/formatters';
import { VALUTA_OPTIONS, ACCENT_KLEUREN, TEMPLATE_OPTIONS } from '@/lib/constants';
import { OfferteData, OffertePakket, Valuta, TemplateName } from '@/types';
import { generateId } from '@/lib/utils';

const STEPS = [
  { number: 1, label: 'Bedrijf' },
  { number: 2, label: 'Klant' },
  { number: 3, label: 'Regels' },
  { number: 4, label: 'Details' },
  { number: 5, label: 'Voorbeeld' },
];

export default function NieuweOffertePage() {
  const router = useRouter();
  const { bedrijf, setBedrijf, instellingen, getOfferteNummer, incrementOfferteNummer } = useCompanyStore();
  const { currentStep, data, setStep, setData, reset } = useQuoteFormStore();
  const { addDocument } = useDocumentsStore();

  useEffect(() => {
    if (!data.bedrijf) setData({ bedrijf });
  }, []);

  useEffect(() => {
    if (currentStep === 4 && !data.offertenummer) {
      const today = new Date();
      setData({
        offertenummer: getOfferteNummer(),
        offertedatum: today.toISOString().split('T')[0],
        geldigTot: addDays(today, data.geldigheidsduur || 30).toISOString().split('T')[0],
      });
    }
  }, [currentStep]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!(data.bedrijf?.naam);
      case 2: return !!(data.klant?.bedrijfsnaam);
      case 3: return !!(data.regels && data.regels.length > 0 && data.regels.every(r => r.omschrijving));
      case 4: return !!(data.offertenummer && data.offertedatum);
      default: return true;
    }
  };

  const totalen = berekenTotalen(data.regels || [], data.korting);

  const handleSave = async (status: 'concept' | 'definitief') => {
    if (!data.klant || !data.bedrijf) return;
    await addDocument({
      type: 'offerte',
      nummer: data.offertenummer!,
      klantNaam: data.klant.bedrijfsnaam,
      datum: data.offertedatum!,
      bedrag: totalen.totaalInclBTW,
      status,
      data: { ...data, ...totalen, status } as OfferteData,
    });
    await incrementOfferteNummer();
    reset();
    router.push('/offertes');
  };

  const addPakket = () => {
    const pakket: OffertePakket = {
      id: generateId(),
      naam: 'Pakket ' + ((data.pakketten?.length || 0) + 1),
      omschrijving: '',
      prijs: 0,
    };
    setData({ pakketten: [...(data.pakketten || []), pakket] });
  };

  const updatePakket = (id: string, updates: Partial<OffertePakket>) => {
    setData({
      pakketten: (data.pakketten || []).map(p => p.id === id ? { ...p, ...updates } : p),
    });
  };

  const deletePakket = (id: string) => {
    setData({ pakketten: (data.pakketten || []).filter(p => p.id !== id) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/offertes" className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Nieuwe offerte</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Stap {currentStep} van {STEPS.length}</p>
        </div>
      </div>

      <div className="card p-5">
        <WizardSteps steps={STEPS} currentStep={currentStep} onStepClick={setStep} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Bedrijfsgegevens</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Gegevens van de afzender.</p>
              <BedrijfForm value={data.bedrijf || bedrijf} onChange={(b) => { setData({ bedrijf: b as import('@/types').Bedrijf }); setBedrijf(b as import('@/types').Bedrijf); }} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Klantgegevens</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Voor wie is deze offerte?</p>
              <ClientSelector value={data.klant} onChange={(klant) => setData({ klant })} />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Kostenopstelling</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Voeg diensten en producten toe.</p>
                <LineItemsEditor regels={data.regels || []} onChange={(regels) => setData({ regels })} valuta={data.valuta} />
              </div>

              {/* Optionele pakketten */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Optionele pakketten</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bied de klant keuzes aan</p>
                  </div>
                  <button type="button" onClick={addPakket} className="btn-secondary text-sm">
                    <Plus className="w-3.5 h-3.5" />
                    Pakket toevoegen
                  </button>
                </div>
                {(data.pakketten || []).map((pakket) => (
                  <div key={pakket.id} className="card p-4 mb-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_36px] gap-3 items-end">
                    <FormField label="Pakketnaam">
                      <Input value={pakket.naam} onChange={(e) => updatePakket(pakket.id, { naam: e.target.value })} placeholder="Basis pakket" />
                    </FormField>
                    <FormField label="Omschrijving">
                      <Input value={pakket.omschrijving} onChange={(e) => updatePakket(pakket.id, { omschrijving: e.target.value })} placeholder="Wat is inbegrepen?" />
                    </FormField>
                    <FormField label="Prijs">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-secondary)' }}>€</span>
                        <Input className="pl-7" type="number" value={pakket.prijs} onChange={(e) => updatePakket(pakket.id, { prijs: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </FormField>
                    <button type="button" onClick={() => deletePakket(pakket.id)} className="p-2 rounded hover:bg-red-50 hover:text-red-500 transition-colors self-end mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Offertedetails</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Projectinfo en geldigheid.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Offertenummer" required>
                  <Input value={data.offertenummer || ''} onChange={(e) => setData({ offertenummer: e.target.value })} placeholder="QUO-2026-0001" />
                </FormField>
                <FormField label="Valuta">
                  <Select options={VALUTA_OPTIONS} value={data.valuta || 'EUR'} onChange={(e) => setData({ valuta: e.target.value as Valuta })} />
                </FormField>
                <FormField label="Projectnaam" required>
                  <Input value={data.projectnaam || ''} onChange={(e) => setData({ projectnaam: e.target.value })} placeholder="Website redesign 2026" />
                </FormField>
                <FormField label="Offertedatum" required>
                  <Input type="date" value={data.offertedatum || ''} onChange={(e) => setData({ offertedatum: e.target.value })} />
                </FormField>
                <FormField label="Geldig tot">
                  <Input type="date" value={data.geldigTot || ''} onChange={(e) => setData({ geldigTot: e.target.value })} />
                </FormField>
                <FormField label="Projectomschrijving" className="sm:col-span-2">
                  <Textarea rows={2} value={data.projectomschrijving || ''} onChange={(e) => setData({ projectomschrijving: e.target.value })} placeholder="Korte omschrijving van het project..." />
                </FormField>
                <FormField label="Inleiding" className="sm:col-span-2" hint="Persoonlijke intro voor de klant">
                  <Textarea rows={3} value={data.inleiding || ''} onChange={(e) => setData({ inleiding: e.target.value })} placeholder="Geachte [naam], ..." />
                </FormField>
                <FormField label="Voorwaarden" className="sm:col-span-2" hint="Algemene voorwaarden of bijzondere bepalingen">
                  <Textarea rows={4} value={data.voorwaarden || ''} onChange={(e) => setData({ voorwaarden: e.target.value })} placeholder="Onze offertes zijn geldig voor 30 dagen na dagtekening..." />
                </FormField>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Voorbeeld & Genereer</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Kies een template en genereer je offerte.</p>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Template</p>
                <div className="flex gap-3 flex-wrap">
                  {TEMPLATE_OPTIONS.map((t) => (
                    <button key={t.value} type="button" onClick={() => setData({ template: t.value as TemplateName })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${data.template === t.value ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--muted)]'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Accentkleur</p>
                <div className="flex gap-2 flex-wrap">
                  {ACCENT_KLEUREN.map((kleur) => (
                    <button key={kleur} type="button" onClick={() => setData({ accentKleur: kleur })}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: kleur, borderColor: data.accentKleur === kleur ? 'var(--text-primary)' : 'transparent' }} />
                  ))}
                </div>
              </div>

              <div className="card p-6 space-y-4" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Offerte</p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: data.accentKleur || '#2563EB' }}>{data.offertenummer}</p>
                    <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>{data.projectnaam}</p>
                  </div>
                  {data.bedrijf?.logo && <img src={data.bedrijf.logo} alt="Logo" className="h-12 object-contain" />}
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Van</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{data.bedrijf?.naam}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Aan</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{data.klant?.bedrijfsnaam}</p>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Totaal incl. BTW</span>
                  <span className="text-lg tabular-nums" style={{ color: data.accentKleur || '#2563EB' }}>
                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: data.valuta || 'EUR' }).format(totalen.totaalInclBTW)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => handleSave('concept')} className="btn-secondary flex-1 justify-center">
                  <Save className="w-4 h-4" />Opslaan als concept
                </button>
                <button type="button" onClick={() => handleSave('definitief')} className="btn-primary flex-1 justify-center">
                  <Download className="w-4 h-4" />Offerte genereren
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {currentStep < 5 && (
        <div className="flex justify-between">
          <button type="button" onClick={() => setStep(currentStep - 1)} disabled={currentStep === 1} className="btn-secondary disabled:opacity-40">
            <ArrowLeft className="w-4 h-4" />Vorige
          </button>
          <button type="button" onClick={() => setStep(currentStep + 1)} disabled={!canGoNext()} className="btn-primary disabled:opacity-40">
            Volgende<ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
