'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, BarChart3, TrendingUp } from 'lucide-react';
import { useDocumentsStore } from '@/stores/documentsStore';
import { formatCurrency } from '@/lib/formatters';

export function StatsCards() {
  const [mounted, setMounted] = useState(false);
  const allDocumenten = useDocumentsStore((s) => s.documenten);

  useEffect(() => {
    setMounted(true);
  }, []);

  const documenten = mounted ? allDocumenten : [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const facturen = documenten.filter((d) => d.type === 'factuur');
  const offertes = documenten.filter((d) => d.type === 'offerte');
  const rapporten = documenten.filter((d) => d.type === 'rapport');

  const factuurDezeMaand = facturen.filter((d) => {
    const date = new Date(d.aangemaakt);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const omzetDezeMaand = factuurDezeMaand
    .filter((d) => d.status === 'betaald')
    .reduce((sum, d) => sum + (d.bedrag || 0), 0);

  const openstaandeOffertes = offertes.filter((d) => d.status === 'verzonden' || d.status === 'definitief');

  const stats = [
    { title: 'Facturen deze maand', value: `${factuurDezeMaand.length}`, sub: formatCurrency(factuurDezeMaand.reduce((s, d) => s + (d.bedrag || 0), 0)), icon: FileText, color: '#5746EA' },
    { title: 'Openstaande offertes', value: `${openstaandeOffertes.length}`, sub: `${offertes.length} totaal`, icon: FileSpreadsheet, color: '#E68C00' },
    { title: 'Rapporten', value: `${rapporten.length}`, sub: 'Alle periodes', icon: BarChart3, color: '#18A058' },
    { title: 'Omzet deze maand', value: formatCurrency(omzetDezeMaand), sub: 'Betaalde facturen', icon: TrendingUp, color: '#0284C7' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.2 }} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12.5px] font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.title}</p>
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${stat.color}12` }}>
                <Icon className="w-[15px] h-[15px]" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[22px] font-semibold tabular-nums leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{stat.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
