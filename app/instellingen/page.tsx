'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Download } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useClientsStore } from '@/stores/clientsStore';
import { useDocumentsStore } from '@/stores/documentsStore';
import { BedrijfForm } from '@/components/documents/BedrijfForm';
import { FormField, Input, Select } from '@/components/documents/FormField';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate } from '@/lib/formatters';
import { BTW_TARIEVEN, BETALINGSTERMIJNEN } from '@/lib/constants';
import { exportDataAsJSON } from '@/lib/utils';
import { Klant } from '@/types';

type Tab = 'bedrijf' | 'nummering' | 'klanten' | 'standaard' | 'export';
const TABS: { id: Tab; label: string }[] = [
  { id: 'bedrijf', label: 'Bedrijfsprofiel' },
  { id: 'nummering', label: 'Nummering' },
  { id: 'klanten', label: 'Klantenbeheer' },
  { id: 'standaard', label: 'Standaarden' },
  { id: 'export', label: 'Export & Import' },
];

export default function InstellingenPage() {
  const [activeTab, setActiveTab] = useState<Tab>('bedrijf');
  const [saved, setSaved] = useState(false);
  const [newKlantMode, setNewKlantMode] = useState(false);
  const [newKlant, setNewKlant] = useState<Partial<Klant>>({ adres: { straat: '', huisnummer: '', postcode: '', stad: '', land: 'Nederland' } });

  const { bedrijf, instellingen, setBedrijf, setInstellingen, setNummering } = useCompanyStore();
  const { klanten, addKlant, deleteKlant } = useClientsStore();
  const { documenten } = useDocumentsStore();

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleExport = () => {
    exportDataAsJSON({ bedrijf, instellingen, klanten, documenten, exportDatum: new Date().toISOString() }, `docuforge-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleAddKlant = () => {
    if (!newKlant.bedrijfsnaam || !newKlant.email) return;
    addKlant({ bedrijfsnaam: newKlant.bedrijfsnaam || '', contactpersoon: newKlant.contactpersoon || '', adres: newKlant.adres!, email: newKlant.email || '', telefoon: newKlant.telefoon || '', btwNummer: newKlant.btwNummer });
    setNewKlant({ adres: { straat: '', huisnummer: '', postcode: '', stad: '', land: 'Nederland' } });
    setNewKlantMode(false);
  };

  return (
    <div>
      <PageHeader title="Instellingen" description="Bedrijfsprofiel, klanten en voorkeuren" />

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 -mb-px`}
            style={{ borderBottomColor: activeTab === tab.id ? '#5746EA' : 'transparent', color: activeTab === tab.id ? '#5746EA' : 'var(--text-secondary)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>

        {activeTab === 'bedrijf' && (
          <div className="card p-6 space-y-6">
            <BedrijfForm value={bedrijf} onChange={(b) => setBedrijf(b as any)} />
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleSave} className="btn-primary">
                <Save className="w-3.5 h-3.5" />{saved ? 'Opgeslagen!' : 'Opslaan'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'nummering' && (
          <div className="card p-6 space-y-6">
            {[
              { label: 'Facturen', prefix: instellingen.nummering.factuurPrefix, volgnr: instellingen.nummering.factuurVolgnummer, setPrefix: (v: string) => setNummering({ factuurPrefix: v }), setVolgNr: (v: number) => setNummering({ factuurVolgnummer: v }) },
              { label: 'Offertes', prefix: instellingen.nummering.offertePrefix, volgnr: instellingen.nummering.offerteVolgnummer, setPrefix: (v: string) => setNummering({ offertePrefix: v }), setVolgNr: (v: number) => setNummering({ offerteVolgnummer: v }) },
              { label: 'Rapporten', prefix: instellingen.nummering.rapportPrefix, volgnr: instellingen.nummering.rapportVolgnummer, setPrefix: (v: string) => setNummering({ rapportPrefix: v }), setVolgNr: (v: number) => setNummering({ rapportVolgnummer: v }) },
            ].map((item, i) => (
              <div key={item.label} className={i > 0 ? 'pt-6 border-t' : ''} style={{ borderColor: 'var(--border)' }}>
                <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Prefix"><Input value={item.prefix} onChange={(e) => item.setPrefix(e.target.value)} placeholder="INV" /></FormField>
                  <FormField label="Huidig volgnummer"><Input type="number" value={item.volgnr} onChange={(e) => item.setVolgNr(parseInt(e.target.value) || 1)} min="1" /></FormField>
                  <FormField label="Voorbeeld">
                    <div className="input-base font-mono text-[13px]" style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--muted)', cursor: 'default' }}>
                      {item.prefix}-{new Date().getFullYear()}-{String(item.volgnr).padStart(4, '0')}
                    </div>
                  </FormField>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleSave} className="btn-primary"><Save className="w-3.5 h-3.5" />{saved ? 'Opgeslagen!' : 'Opslaan'}</button>
            </div>
          </div>
        )}

        {activeTab === 'klanten' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setNewKlantMode(true)} className="btn-primary"><Plus className="w-3.5 h-3.5" />Klant toevoegen</button>
            </div>
            {newKlantMode && (
              <div className="card p-5 space-y-4">
                <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Nieuwe klant</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Bedrijfsnaam" required><Input value={newKlant.bedrijfsnaam || ''} onChange={(e) => setNewKlant(p => ({ ...p, bedrijfsnaam: e.target.value }))} /></FormField>
                  <FormField label="Contactpersoon"><Input value={newKlant.contactpersoon || ''} onChange={(e) => setNewKlant(p => ({ ...p, contactpersoon: e.target.value }))} /></FormField>
                  <FormField label="E-mailadres" required><Input type="email" value={newKlant.email || ''} onChange={(e) => setNewKlant(p => ({ ...p, email: e.target.value }))} /></FormField>
                  <FormField label="Telefoonnummer"><Input value={newKlant.telefoon || ''} onChange={(e) => setNewKlant(p => ({ ...p, telefoon: e.target.value }))} /></FormField>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setNewKlantMode(false)} className="btn-secondary">Annuleren</button>
                  <button onClick={handleAddKlant} className="btn-primary"><Plus className="w-3.5 h-3.5" />Opslaan</button>
                </div>
              </div>
            )}
            {klanten.length === 0 && !newKlantMode ? (
              <div className="card p-8 text-center">
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Nog geen klanten — voeg je eerste klant toe.</p>
              </div>
            ) : klanten.length > 0 && (
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead><tr><th>Bedrijfsnaam</th><th>Contactpersoon</th><th>E-mail</th><th>Stad</th><th>Aangemaakt</th><th></th></tr></thead>
                  <tbody>
                    {klanten.map((klant) => (
                      <tr key={klant.id}>
                        <td className="font-medium text-[13px]" style={{ color: 'var(--text-primary)' }}>{klant.bedrijfsnaam}</td>
                        <td className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{klant.contactpersoon}</td>
                        <td className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{klant.email}</td>
                        <td className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{klant.adres.stad}</td>
                        <td className="text-[13px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{formatDate(klant.aangemaakt)}</td>
                        <td>
                          <button onClick={() => deleteKlant(klant.id)} className="btn-ghost p-1.5 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'standaard' && (
          <div className="card p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Standaard BTW-tarief">
                <Select options={BTW_TARIEVEN} value={instellingen.standaardBTWTarief} onChange={(e) => setInstellingen({ standaardBTWTarief: parseInt(e.target.value) as any })} />
              </FormField>
              <FormField label="Standaard betalingstermijn">
                <Select options={BETALINGSTERMIJNEN} value={instellingen.standaardBetalingstermijn} onChange={(e) => setInstellingen({ standaardBetalingstermijn: parseInt(e.target.value) as any })} />
              </FormField>
            </div>
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleSave} className="btn-primary"><Save className="w-3.5 h-3.5" />{saved ? 'Opgeslagen!' : 'Opslaan'}</button>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="card p-6">
              <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Gegevens exporteren</p>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>Exporteer alle data als JSON-bestand voor backup of migratie.</p>
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg mb-4 text-center" style={{ backgroundColor: 'var(--muted)' }}>
                {[{ n: documenten.length, l: 'Documenten' }, { n: klanten.length, l: 'Klanten' }, { n: 1, l: 'Bedrijfsprofiel' }].map((item) => (
                  <div key={item.l}>
                    <p className="text-[20px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{item.n}</p>
                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{item.l}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleExport} className="btn-primary"><Download className="w-3.5 h-3.5" />Exporteren als JSON</button>
            </div>
            <div className="card p-6">
              <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Alle gegevens wissen</p>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>Wis alle lokaal opgeslagen gegevens. Kan niet ongedaan worden gemaakt.</p>
              <button
                onClick={() => { if (confirm('Weet je zeker dat je alle gegevens wilt wissen?')) { if (typeof window !== 'undefined') { localStorage.clear(); window.location.reload(); } } }}
                className="btn-secondary text-[13px]"
                style={{ color: 'var(--error)', borderColor: 'rgba(224,32,32,0.3)' }}>
                <Trash2 className="w-3.5 h-3.5" />Alle gegevens wissen
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
