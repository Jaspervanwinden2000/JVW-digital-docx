'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Users, Star, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useClientsStore } from '@/stores/clientsStore';
import { useCompanyStore } from '@/stores/companyStore';
import { FactuurData } from '@/types';

interface Insight {
  icon: 'trend' | 'alert' | 'clients' | 'star' | 'tip';
  titel: string;
  beschrijving: string;
  kleur: string;
}

function parseInsights(tekst: string): Insight[] {
  const regels = tekst.split('\n').filter((r) => r.trim().startsWith('•') || r.trim().startsWith('-') || r.trim().match(/^\d\./));
  if (regels.length === 0) {
    return [{ icon: 'tip', titel: 'Analyse', beschrijving: tekst.slice(0, 300), kleur: '#5746EA' }];
  }
  const icoonMap: Record<number, Insight['icon']> = { 0: 'star', 1: 'trend', 2: 'alert', 3: 'clients', 4: 'tip' };
  const kleurMap: Record<Insight['icon'], string> = { star: '#f59e0b', trend: '#16a34a', alert: '#ef4444', clients: '#2563eb', tip: '#5746EA' };
  return regels.slice(0, 5).map((r, i) => {
    const tekst = r.replace(/^[•\-\d.]\s*/, '').trim();
    const [titel, ...rest] = tekst.split(':');
    const icon = icoonMap[i] ?? 'tip';
    return { icon, titel: rest.length > 0 ? titel.trim() : 'Inzicht', beschrijving: rest.length > 0 ? rest.join(':').trim() : titel.trim(), kleur: kleurMap[icon] };
  });
}

const ICON_MAP = {
  trend: TrendingUp,
  alert: AlertTriangle,
  clients: Users,
  star: Star,
  tip: Lightbulb,
};

export function SmartInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [gegenereerd, setGegenereerd] = useState(false);

  const documenten = useDocumentsStore((s) => s.documenten);
  const klanten = useClientsStore((s) => s.klanten);
  const bedrijf = useCompanyStore((s) => s.bedrijf);

  const handleGenereer = async () => {
    setLoading(true);
    setExpanded(true);
    try {
      const facturen = documenten.filter((d) => d.type === 'factuur');
      const betaald = facturen.filter((d) => d.status === 'betaald');
      const openstaand = facturen.filter((d) => d.status !== 'betaald' && d.status !== 'vervallen');
      const totalOmzet = betaald.reduce((s, d) => s + (d.bedrag ?? 0), 0);
      const totalOpen = openstaand.reduce((s, d) => s + (d.bedrag ?? 0), 0);

      // Bereken betalingstijd per factuur
      const betalingstijden = betaald
        .filter((d) => {
          const fd = d.data as FactuurData;
          return fd?.factuurdatum && d.bijgewerkt;
        })
        .map((d) => {
          const fd = d.data as FactuurData;
          return Math.round((new Date(d.bijgewerkt).getTime() - new Date(fd.factuurdatum).getTime()) / 86400000);
        })
        .filter((t) => t >= 0 && t <= 365);

      const gemBetalingstijd = betalingstijden.length > 0
        ? Math.round(betalingstijden.reduce((a, b) => a + b, 0) / betalingstijden.length)
        : null;

      // Top klant
      const klantOmzet: Record<string, number> = {};
      betaald.forEach((d) => { klantOmzet[d.klantNaam] = (klantOmzet[d.klantNaam] ?? 0) + (d.bedrag ?? 0); });
      const topKlant = Object.entries(klantOmzet).sort((a, b) => b[1] - a[1])[0];

      // Maandelijkse trend
      const maandOmzet: Record<string, number> = {};
      betaald.forEach((d) => {
        const m = d.datum.slice(0, 7);
        maandOmzet[m] = (maandOmzet[m] ?? 0) + (d.bedrag ?? 0);
      });
      const maandData = Object.entries(maandOmzet).sort().slice(-6);

      const context = `
Bedrijf: ${bedrijf.naam || 'Onbekend'}
Totaal facturen: ${facturen.length} (betaald: ${betaald.length}, openstaand: ${openstaand.length})
Totale omzet betaald: €${totalOmzet.toFixed(2)}
Totaal openstaand: €${totalOpen.toFixed(2)}
Aantal klanten: ${klanten.length}
${topKlant ? `Beste klant: ${topKlant[0]} (€${topKlant[1].toFixed(2)})` : ''}
${gemBetalingstijd !== null ? `Gemiddelde betalingstijd: ${gemBetalingstijd} dagen` : ''}
Maandelijkse omzet (laatste 6 maanden): ${maandData.map(([m, v]) => `${m}: €${v.toFixed(0)}`).join(', ') || 'geen data'}
Verlopen facturen: ${documenten.filter((d) => d.status === 'vervallen').length}
      `.trim();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appData: { bedrijf, documenten, klanten },
          messages: [{
            role: 'user',
            content: `Analyseer mijn bedrijfsdata en geef mij 5 concrete, actiegerichte zakelijke inzichten. Gebruik deze data:\n\n${context}\n\nGeef elk inzicht als een bullet punt (•) met format: "• Titel: Beschrijving (max 2 zinnen)". Wees specifiek en gebruik de echte cijfers. Focus op: omzettrends, betalingsgedrag, klantrelaties, risico's en groeikansen.`,
          }],
        }),
      });

      if (!res.body) throw new Error('Geen response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let tekst = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        tekst += decoder.decode(value);
      }
      setInsights(parseInsights(tekst));
      setGegenereerd(true);
    } catch {
      setInsights([{ icon: 'alert', titel: 'Fout', beschrijving: 'Kon inzichten niet laden. Controleer je API-sleutel.', kleur: '#ef4444' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => gegenereerd ? setExpanded(!expanded) : handleGenereer()}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5746EA20' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#5746EA' }} /> : <Sparkles className="w-4 h-4" style={{ color: '#5746EA' }} />}
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>AI Bedrijfsinzichten</p>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {loading ? 'Analyseren...' : gegenereerd ? 'Klik om te verbergen/tonen' : 'Analyseer je bedrijfsprestaties met AI'}
            </p>
          </div>
        </div>
        {gegenereerd && !loading && (
          expanded ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
        )}
        {!gegenereerd && !loading && (
          <span className="text-[12px] font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: '#5746EA', color: 'white' }}>Analyseren</span>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
              {loading ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: '#5746EA' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>AI analyseert je bedrijfsdata...</p>
                </div>
              ) : (
                insights.map((insight, i) => {
                  const Icon = ICON_MAP[insight.icon];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: `${insight.kleur}10` }}
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${insight.kleur}20` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: insight.kleur }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{insight.titel}</p>
                        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.beschrijving}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              {gegenereerd && !loading && (
                <button
                  type="button"
                  onClick={handleGenereer}
                  className="text-[12px] font-medium transition-colors hover:opacity-70"
                  style={{ color: '#5746EA' }}
                >
                  Opnieuw analyseren
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
