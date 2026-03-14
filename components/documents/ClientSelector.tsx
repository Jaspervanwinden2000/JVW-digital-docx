'use client';

import { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { useClientsStore } from '@/stores/clientsStore';
import { Klant } from '@/types';
import { Input, FormField, Select } from './FormField';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  value?: Klant;
  onChange: (klant: Klant) => void;
}

const LANDEN = [
  { value: 'Nederland', label: 'Nederland' },
  { value: 'België', label: 'België' },
  { value: 'Duitsland', label: 'Duitsland' },
  { value: 'Frankrijk', label: 'Frankrijk' },
  { value: 'Verenigd Koninkrijk', label: 'Verenigd Koninkrijk' },
  { value: 'Overig', label: 'Overig' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function ClientSelector({ value, onChange }: ClientSelectorProps) {
  const { klanten, addKlant } = useClientsStore();
  const [mode, setMode] = useState<'select' | 'new'>(klanten.length === 0 ? 'new' : 'select');
  const [search, setSearch] = useState('');

  const filtered = klanten.filter(
    (k) =>
      k.bedrijfsnaam.toLowerCase().includes(search.toLowerCase()) ||
      k.contactpersoon.toLowerCase().includes(search.toLowerCase())
  );

  const [newKlant, setNewKlant] = useState<Partial<Klant>>({
    adres: { straat: '', huisnummer: '', postcode: '', stad: '', land: 'Nederland' },
  });

  const handleSaveNew = async () => {
    if (!newKlant.bedrijfsnaam || !newKlant.email) return;
    const klant = await addKlant({
      bedrijfsnaam: newKlant.bedrijfsnaam || '',
      contactpersoon: newKlant.contactpersoon || '',
      adres: newKlant.adres || { straat: '', huisnummer: '', postcode: '', stad: '', land: 'Nederland' },
      email: newKlant.email || '',
      telefoon: newKlant.telefoon || '',
      btwNummer: newKlant.btwNummer,
    });
    onChange(klant);
    setMode('select');
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('select')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all',
            mode === 'select'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--muted)]'
          )}
        >
          Bestaande klant
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all',
            mode === 'new'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--muted)]'
          )}
        >
          Nieuwe klant
        </button>
      </div>

      {mode === 'select' ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Zoek op naam of contactpersoon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Geen klanten gevonden</p>
              <button
                type="button"
                onClick={() => setMode('new')}
                className="text-sm text-blue-600 mt-1 hover:underline"
              >
                Nieuwe klant toevoegen
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.map((klant) => (
                <button
                  key={klant.id}
                  type="button"
                  onClick={() => onChange(klant)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    value?.id === klant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]'
                  )}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {klant.bedrijfsnaam}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {klant.contactpersoon} · {klant.email}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Bedrijfsnaam" required>
              <Input
                placeholder="Acme BV"
                value={newKlant.bedrijfsnaam || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, bedrijfsnaam: e.target.value }))}
              />
            </FormField>
            <FormField label="Contactpersoon" required>
              <Input
                placeholder="Jan Jansen"
                value={newKlant.contactpersoon || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, contactpersoon: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Straat" className="col-span-2">
              <Input
                placeholder="Hoofdstraat"
                value={newKlant.adres?.straat || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, adres: { ...p.adres!, straat: e.target.value } }))}
              />
            </FormField>
            <FormField label="Huisnummer">
              <Input
                placeholder="1A"
                value={newKlant.adres?.huisnummer || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, adres: { ...p.adres!, huisnummer: e.target.value } }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Postcode">
              <Input
                placeholder="1234 AB"
                value={newKlant.adres?.postcode || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, adres: { ...p.adres!, postcode: e.target.value } }))}
              />
            </FormField>
            <FormField label="Stad">
              <Input
                placeholder="Amsterdam"
                value={newKlant.adres?.stad || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, adres: { ...p.adres!, stad: e.target.value } }))}
              />
            </FormField>
            <FormField label="Land">
              <Select
                options={LANDEN}
                value={newKlant.adres?.land || 'Nederland'}
                onChange={(e) => setNewKlant((p) => ({ ...p, adres: { ...p.adres!, land: e.target.value } }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="E-mailadres" required>
              <Input
                type="email"
                placeholder="info@acme.nl"
                value={newKlant.email || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, email: e.target.value }))}
              />
            </FormField>
            <FormField label="Telefoonnummer">
              <Input
                placeholder="+31 20 123 4567"
                value={newKlant.telefoon || ''}
                onChange={(e) => setNewKlant((p) => ({ ...p, telefoon: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="BTW-nummer" hint="Verplicht voor EU intracommunautaire transacties">
            <Input
              placeholder="NL123456789B01"
              value={newKlant.btwNummer || ''}
              onChange={(e) => setNewKlant((p) => ({ ...p, btwNummer: e.target.value }))}
            />
          </FormField>
          <button
            type="button"
            onClick={handleSaveNew}
            className="btn-primary w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Klant opslaan en selecteren
          </button>
        </div>
      )}

      {/* Selected client preview */}
      {value && mode === 'select' && (
        <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
          <p className="text-xs font-medium text-blue-600 mb-1">Geselecteerde klant</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value.bedrijfsnaam}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {value.adres.straat} {value.adres.huisnummer}, {value.adres.postcode} {value.adres.stad}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{value.email}</p>
        </div>
      )}
    </div>
  );
}
