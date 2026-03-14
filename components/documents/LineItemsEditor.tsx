'use client';

import { Trash2, Plus } from 'lucide-react';
import { FactuurRegel, BTWTarief, Eenheid } from '@/types';
import { berekenRegel, berekenTotalen } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import { EENHEDEN, BTW_TARIEVEN } from '@/lib/constants';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface LineItemsEditorProps {
  regels: FactuurRegel[];
  onChange: (regels: FactuurRegel[]) => void;
  valuta?: string;
}

export function LineItemsEditor({ regels, onChange, valuta = 'EUR' }: LineItemsEditorProps) {
  const updateRegel = (id: string, updates: Partial<FactuurRegel>) => {
    onChange(regels.map((r) => {
      if (r.id !== id) return r;
      const merged = { ...r, ...updates };
      return { ...merged, ...berekenRegel(merged.aantal, merged.prijsPerEenheid, merged.btwTarief) };
    }));
  };

  const addRegel = () => {
    onChange([...regels, { id: generateId(), omschrijving: '', aantal: 1, eenheid: 'stuk', prijsPerEenheid: 0, btwTarief: 21, totaalExclBTW: 0, btwBedrag: 0, totaalInclBTW: 0 }]);
  };

  const deleteRegel = (id: string) => {
    if (regels.length <= 1) return;
    onChange(regels.filter((r) => r.id !== id));
  };

  const totalen = berekenTotalen(regels);

  return (
    <div className="space-y-3">
      {/* Column headers - desktop only */}
      <div className="hidden md:grid gap-2 px-1" style={{ gridTemplateColumns: '1fr 90px 100px 120px 80px 100px 36px' }}>
        {['Omschrijving', 'Aantal', 'Eenheid', 'Prijs/eenheid', 'BTW', 'Totaal (excl.)', ''].map((h) => (
          <span key={h} className="section-label">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {regels.map((regel) => (
          <div key={regel.id} className="card p-3 space-y-3 md:space-y-0 md:grid md:gap-2 md:items-start" style={{ gridTemplateColumns: '1fr 90px 100px 120px 80px 100px 36px' }}>
            <div>
              <label className="md:hidden section-label mb-1 block">Omschrijving</label>
              <textarea value={regel.omschrijving} onChange={(e) => updateRegel(regel.id, { omschrijving: e.target.value })} placeholder="Omschrijving..." rows={2} className="input-base resize-none text-[13.5px]" />
            </div>

            <div>
              <label className="md:hidden section-label mb-1 block">Aantal</label>
              <div className="flex items-center border rounded-md overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <button type="button" onClick={() => updateRegel(regel.id, { aantal: Math.max(0, regel.aantal - 1) })} className="px-2 py-2 text-sm transition-colors hover:bg-[var(--muted)]" style={{ color: 'var(--text-secondary)' }}>−</button>
                <input type="number" value={regel.aantal} onChange={(e) => updateRegel(regel.id, { aantal: parseFloat(e.target.value) || 0 })} className="flex-1 text-center text-[13px] py-2 outline-none bg-transparent tabular-nums min-w-0" style={{ color: 'var(--text-primary)' }} step="0.5" min="0" />
                <button type="button" onClick={() => updateRegel(regel.id, { aantal: regel.aantal + 1 })} className="px-2 py-2 text-sm transition-colors hover:bg-[var(--muted)]" style={{ color: 'var(--text-secondary)' }}>+</button>
              </div>
            </div>

            <div>
              <label className="md:hidden section-label mb-1 block">Eenheid</label>
              <select value={regel.eenheid} onChange={(e) => updateRegel(regel.id, { eenheid: e.target.value as Eenheid })} className="input-base text-[13px]" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
                {EENHEDEN.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <div>
              <label className="md:hidden section-label mb-1 block">Prijs per eenheid</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>€</span>
                <input type="number" value={regel.prijsPerEenheid} onChange={(e) => updateRegel(regel.id, { prijsPerEenheid: parseFloat(e.target.value) || 0 })} className="input-base pl-6 tabular-nums text-[13px]" step="0.01" min="0" />
              </div>
            </div>

            <div>
              <label className="md:hidden section-label mb-1 block">BTW</label>
              <select value={regel.btwTarief} onChange={(e) => updateRegel(regel.id, { btwTarief: parseInt(e.target.value) as BTWTarief })} className="input-base text-[13px]" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
                {BTW_TARIEVEN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="flex items-center md:pt-2">
              <label className="md:hidden section-label mr-2">Totaal:</label>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(regel.totaalExclBTW, valuta)}</span>
            </div>

            <div className="flex justify-end md:justify-center md:pt-2">
              <button type="button" onClick={() => deleteRegel(regel.id)} disabled={regels.length <= 1} className="p-1.5 rounded transition-colors disabled:opacity-30 hover:bg-red-50 hover:text-red-500" style={{ color: 'var(--text-tertiary)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button type="button" onClick={addRegel} className="w-full py-2.5 border-2 border-dashed rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2 hover:border-[#5746EA] hover:text-[#5746EA]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
        <Plus className="w-3.5 h-3.5" />Regel toevoegen
      </button>

      {/* Totals */}
      <div className="ml-auto max-w-xs w-full card p-4 space-y-2">
        <div className="flex justify-between text-[13px]">
          <span style={{ color: 'var(--text-secondary)' }}>Subtotaal excl. BTW</span>
          <span className="tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalen.subtotaalExclBTW, valuta)}</span>
        </div>
        {totalen.btwSpecificaties.map((spec) => (
          <div key={spec.tarief} className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--text-secondary)' }}>BTW {spec.tarief}%</span>
            <span className="tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(spec.bedrag, valuta)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Totaal incl. BTW</span>
          <span className="text-[18px] font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{formatCurrency(totalen.totaalInclBTW, valuta)}</span>
        </div>
      </div>
    </div>
  );
}
