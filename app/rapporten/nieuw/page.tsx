'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Download, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useReportFormStore } from '@/stores/formStores';
import { useDocumentsStore } from '@/stores/documentsStore';
import { FormField, Input, Select, Textarea } from '@/components/documents/FormField';
import { MAANDEN, SECTIE_TYPE_LABELS, ACCENT_KLEUREN, TEMPLATE_OPTIONS } from '@/lib/constants';
import { RapportData, SectieType, KPICard, RapportSectie, TemplateName } from '@/types';
import { getPeriodeString } from '@/lib/formatters';
import { generateId } from '@/lib/utils';

const huidigJaar = new Date().getFullYear();
const JAREN = Array.from({ length: 5 }, (_, i) => ({ value: huidigJaar - i, label: String(huidigJaar - i) }));

const SECTIE_TYPEN = Object.entries(SECTIE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function NieuwRapportPage() {
  const router = useRouter();
  const { bedrijf, getRapportNummer, incrementRapportNummer } = useCompanyStore();
  const { data, setData, addSectie, updateSectie, deleteSectie, reset } = useReportFormStore();
  const { addDocument } = useDocumentsStore();

  useEffect(() => {
    if (!data.rapportnummer) {
      const now = new Date();
      setData({
        rapportnummer: getRapportNummer(),
        bedrijf,
        periodeJaar: now.getFullYear(),
        periodeMaand: now.getMonth() + 1,
        periode: getPeriodeString(now.getMonth() + 1, now.getFullYear()),
        aangemaakt: now.toISOString(),
      });
    }
  }, []);

  const updatePeriode = (maand: number, jaar: number) => {
    setData({
      periodeMaand: maand,
      periodeJaar: jaar,
      periode: getPeriodeString(maand, jaar),
    });
  };

  const handleSave = async (status: 'concept' | 'definitief') => {
    await addDocument({
      type: 'rapport',
      nummer: data.rapportnummer!,
      klantNaam: data.klant?.bedrijfsnaam || 'Intern',
      datum: data.aangemaakt || new Date().toISOString(),
      status,
      data: { ...data, status } as RapportData,
    });
    await incrementRapportNummer();
    reset();
    router.push('/rapporten');
  };

  const addKPI = (sectieId: string) => {
    const sectie = (data.secties || []).find(s => s.id === sectieId);
    if (!sectie) return;
    const newKPI: KPICard = { id: generateId(), label: 'KPI', waarde: '0' };
    updateSectie(sectieId, { kpis: [...(sectie.kpis || []), newKPI] });
  };

  const updateKPI = (sectieId: string, kpiId: string, updates: Partial<KPICard>) => {
    const sectie = (data.secties || []).find(s => s.id === sectieId);
    if (!sectie) return;
    updateSectie(sectieId, { kpis: (sectie.kpis || []).map(k => k.id === kpiId ? { ...k, ...updates } : k) });
  };

  const addHighlight = (sectieId: string) => {
    const sectie = (data.secties || []).find(s => s.id === sectieId);
    if (!sectie) return;
    updateSectie(sectieId, { highlights: [...(sectie.highlights || []), ''] });
  };

  const updateHighlight = (sectieId: string, index: number, value: string) => {
    const sectie = (data.secties || []).find(s => s.id === sectieId);
    if (!sectie) return;
    const highlights = [...(sectie.highlights || [])];
    highlights[index] = value;
    updateSectie(sectieId, { highlights });
  };

  const addTabelRow = (sectieId: string) => {
    const sectie = (data.secties || []).find(s => s.id === sectieId);
    if (!sectie) return;
    const cols = sectie.tabel?.headers?.length || 3;
    updateSectie(sectieId, {
      tabel: {
        headers: sectie.tabel?.headers || ['Kolom 1', 'Kolom 2', 'Kolom 3'],
        rijen: [...(sectie.tabel?.rijen || []), Array(cols).fill('')],
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/rapporten" className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Nieuw maandrapport</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Stel een professioneel rapport op</p>
        </div>
      </div>

      {/* Basisinfo */}
      <div className="card p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Rapportgegevens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Rapporttitel" required>
            <Input value={data.titel || ''} onChange={(e) => setData({ titel: e.target.value })} placeholder="Maandrapport Maart 2026" />
          </FormField>
          <FormField label="Rapportnummer">
            <Input value={data.rapportnummer || ''} onChange={(e) => setData({ rapportnummer: e.target.value })} />
          </FormField>
          <FormField label="Maand">
            <Select
              options={MAANDEN}
              value={data.periodeMaand || new Date().getMonth() + 1}
              onChange={(e) => updatePeriode(parseInt(e.target.value), data.periodeJaar || new Date().getFullYear())}
            />
          </FormField>
          <FormField label="Jaar">
            <Select
              options={JAREN}
              value={data.periodeJaar || new Date().getFullYear()}
              onChange={(e) => updatePeriode(data.periodeMaand || new Date().getMonth() + 1, parseInt(e.target.value))}
            />
          </FormField>
        </div>
      </div>

      {/* Secties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Secties</h2>
          <button type="button" onClick={addSectie} className="btn-primary">
            <Plus className="w-4 h-4" />Sectie toevoegen
          </button>
        </div>

        {(data.secties || []).length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Nog geen secties — klik op "Sectie toevoegen" om te beginnen.
            </p>
          </div>
        )}

        {(data.secties || []).map((sectie, idx) => (
          <motion.div
            key={sectie.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
                <Input
                  value={sectie.titel}
                  onChange={(e) => updateSectie(sectie.id, { titel: e.target.value })}
                  placeholder="Sectietitel"
                />
                <select
                  value={sectie.type}
                  onChange={(e) => updateSectie(sectie.id, { type: e.target.value as SectieType })}
                  className="input-base text-sm"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                >
                  {SECTIE_TYPEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => deleteSectie(sectie.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sectie content based on type */}
            {sectie.type === 'tekst' && (
              <Textarea
                rows={4}
                value={sectie.tekst || ''}
                onChange={(e) => updateSectie(sectie.id, { tekst: e.target.value })}
                placeholder="Schrijf hier de inhoud van deze sectie..."
              />
            )}

            {sectie.type === 'statistieken' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(sectie.kpis || []).map((kpi) => (
                    <div key={kpi.id} className="p-3 rounded-lg border space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <Input value={kpi.label} onChange={(e) => updateKPI(sectie.id, kpi.id, { label: e.target.value })} placeholder="KPI naam" />
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={kpi.waarde} onChange={(e) => updateKPI(sectie.id, kpi.id, { waarde: e.target.value })} placeholder="Waarde (bijv. 1.234)" />
                        <div className="relative">
                          <Input
                            type="number"
                            value={kpi.verandering ?? ''}
                            onChange={(e) => updateKPI(sectie.id, kpi.id, { verandering: parseFloat(e.target.value) || undefined })}
                            placeholder="% verandering"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addKPI(sectie.id)} className="btn-secondary text-sm w-full justify-center">
                  <Plus className="w-3.5 h-3.5" />KPI toevoegen
                </button>
              </div>
            )}

            {sectie.type === 'highlights' && (
              <div className="space-y-2">
                {(sectie.highlights || []).map((h, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <Input value={h} onChange={(e) => updateHighlight(sectie.id, i, e.target.value)} placeholder={`Hoogtepunt ${i + 1}`} />
                  </div>
                ))}
                <button type="button" onClick={() => addHighlight(sectie.id)} className="btn-secondary text-sm w-full justify-center">
                  <Plus className="w-3.5 h-3.5" />Punt toevoegen
                </button>
              </div>
            )}

            {sectie.type === 'tabel' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {(sectie.tabel?.headers || ['Kolom 1', 'Kolom 2', 'Kolom 3']).map((h, i) => (
                          <th key={i} className="p-1">
                            <Input value={h} onChange={(e) => {
                              const headers = [...(sectie.tabel?.headers || [])];
                              headers[i] = e.target.value;
                              updateSectie(sectie.id, { tabel: { ...sectie.tabel!, headers } });
                            }} placeholder={`Kolom ${i + 1}`} className="text-xs" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(sectie.tabel?.rijen || []).map((rij, ri) => (
                        <tr key={ri}>
                          {rij.map((cel, ci) => (
                            <td key={ci} className="p-1">
                              <Input value={cel} onChange={(e) => {
                                const rijen = sectie.tabel!.rijen.map((r, rIdx) =>
                                  rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? e.target.value : c) : r
                                );
                                updateSectie(sectie.id, { tabel: { ...sectie.tabel!, rijen } });
                              }} placeholder="—" className="text-sm" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => addTabelRow(sectie.id)} className="btn-secondary text-sm w-full justify-center">
                  <Plus className="w-3.5 h-3.5" />Rij toevoegen
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Samenvatting */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Samenvatting & Conclusie</h2>
        <FormField label="Samenvatting">
          <Textarea rows={4} value={data.samenvatting || ''} onChange={(e) => setData({ samenvatting: e.target.value })} placeholder="Overzicht van de belangrijkste ontwikkelingen deze periode..." />
        </FormField>
        <FormField label="Volgende stappen">
          <Textarea rows={3} value={data.volgendeStappen || ''} onChange={(e) => setData({ volgendeStappen: e.target.value })} placeholder="Actiepunten en doelen voor de komende periode..." />
        </FormField>
      </div>

      {/* Template & opslaan */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Opmaak</h2>
        <div>
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
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Accentkleur</p>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_KLEUREN.map((kleur) => (
              <button key={kleur} type="button" onClick={() => setData({ accentKleur: kleur })}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: kleur, borderColor: data.accentKleur === kleur ? 'var(--text-primary)' : 'transparent' }} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => handleSave('concept')} className="btn-secondary flex-1 justify-center">
            <Save className="w-4 h-4" />Opslaan als concept
          </button>
          <button type="button" onClick={() => handleSave('definitief')} className="btn-primary flex-1 justify-center">
            <Download className="w-4 h-4" />Rapport genereren
          </button>
        </div>
      </div>
    </div>
  );
}
