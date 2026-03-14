'use client';

import { useState, useRef } from 'react';
import { Upload, X, Building2 } from 'lucide-react';
import { Bedrijf } from '@/types';
import { FormField, Input, Select } from './FormField';
import { fileToBase64 } from '@/lib/utils';

const LANDEN = [
  { value: 'Nederland', label: 'Nederland' },
  { value: 'België', label: 'België' },
  { value: 'Duitsland', label: 'Duitsland' },
  { value: 'Frankrijk', label: 'Frankrijk' },
  { value: 'Verenigd Koninkrijk', label: 'Verenigd Koninkrijk' },
  { value: 'Overig', label: 'Overig' },
];

interface BedrijfFormProps {
  value: Partial<Bedrijf>;
  onChange: (bedrijf: Partial<Bedrijf>) => void;
}

export function BedrijfForm({ value, onChange }: BedrijfFormProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof Bedrijf, val: string) =>
    onChange({ ...value, [field]: val });

  const updateAdres = (field: string, val: string) =>
    onChange({ ...value, adres: { ...value.adres!, [field]: val } });

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    onChange({ ...value, logo: base64 });
  };

  return (
    <div className="space-y-6">
      {/* Logo upload */}
      <FormField label="Bedrijfslogo" hint="PNG, JPG of SVG — max 2MB">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragOver ? 'border-blue-400 bg-blue-50' : ''
          }`}
          style={{ borderColor: isDragOver ? '#3B82F6' : 'var(--border)' }}
          onClick={() => fileRef.current?.click()}
        >
          {value.logo ? (
            <div className="flex items-center justify-center gap-4">
              <img src={value.logo} alt="Logo" className="h-16 object-contain" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange({ ...value, logo: undefined }); }}
                className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sleep je logo hier naartoe of <span className="text-blue-600">klik om te uploaden</span>
              </p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </FormField>

      {/* Bedrijfsinfo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Bedrijfsnaam" required className="sm:col-span-2">
          <Input
            placeholder="Mijn Bedrijf BV"
            value={value.naam || ''}
            onChange={(e) => update('naam', e.target.value)}
          />
        </FormField>
        <FormField label="KVK-nummer" required>
          <Input
            placeholder="12345678"
            value={value.kvkNummer || ''}
            onChange={(e) => update('kvkNummer', e.target.value)}
          />
        </FormField>
        <FormField label="BTW-nummer" required>
          <Input
            placeholder="NL123456789B01"
            value={value.btwNummer || ''}
            onChange={(e) => update('btwNummer', e.target.value)}
          />
        </FormField>
      </div>

      {/* Adres */}
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Straat" className="col-span-2">
            <Input
              placeholder="Hoofdstraat"
              value={value.adres?.straat || ''}
              onChange={(e) => updateAdres('straat', e.target.value)}
            />
          </FormField>
          <FormField label="Huisnummer">
            <Input
              placeholder="1A"
              value={value.adres?.huisnummer || ''}
              onChange={(e) => updateAdres('huisnummer', e.target.value)}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Postcode">
            <Input
              placeholder="1234 AB"
              value={value.adres?.postcode || ''}
              onChange={(e) => updateAdres('postcode', e.target.value)}
            />
          </FormField>
          <FormField label="Stad">
            <Input
              placeholder="Amsterdam"
              value={value.adres?.stad || ''}
              onChange={(e) => updateAdres('stad', e.target.value)}
            />
          </FormField>
          <FormField label="Land">
            <Select
              options={LANDEN}
              value={value.adres?.land || 'Nederland'}
              onChange={(e) => updateAdres('land', e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Betaalgegevens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="IBAN" required>
          <Input
            placeholder="NL91 ABNA 0417 1643 00"
            value={value.iban || ''}
            onChange={(e) => update('iban', e.target.value)}
          />
        </FormField>
        <FormField label="BIC" required>
          <Input
            placeholder="ABNANL2A"
            value={value.bic || ''}
            onChange={(e) => update('bic', e.target.value)}
          />
        </FormField>
      </div>

      {/* Contactgegevens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Contactpersoon" required>
          <Input
            placeholder="Jan Jansen"
            value={value.contactpersoon || ''}
            onChange={(e) => update('contactpersoon', e.target.value)}
          />
        </FormField>
        <FormField label="E-mailadres" required>
          <Input
            type="email"
            placeholder="info@bedrijf.nl"
            value={value.email || ''}
            onChange={(e) => update('email', e.target.value)}
          />
        </FormField>
        <FormField label="Telefoonnummer">
          <Input
            placeholder="+31 20 123 4567"
            value={value.telefoon || ''}
            onChange={(e) => update('telefoon', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
}
