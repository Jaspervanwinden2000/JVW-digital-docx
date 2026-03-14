'use client';

import { motion } from 'framer-motion';
import { useCompanyStore } from '@/stores/companyStore';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { OmzetChart } from '@/components/dashboard/OmzetChart';
import { OverdueAlert } from '@/components/dashboard/OverdueAlert';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { formatDate } from '@/lib/formatters';

export default function Dashboard() {
  const bedrijf = useCompanyStore((s) => s.bedrijf);
  const today = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <p className="section-label mb-1">Overzicht</p>
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {bedrijf.naam ? `Welkom, ${bedrijf.naam}` : 'Welkom bij DocuForge Pro'}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{today}</p>
      </motion.div>

      <OverdueAlert />

      <section>
        <p className="section-label mb-3">Snel starten</p>
        <QuickActions />
      </section>

      <section>
        <p className="section-label mb-3">Statistieken</p>
        <StatsCards />
      </section>

      <section>
        <OmzetChart />
      </section>

      <section>
        <p className="section-label mb-3">AI Inzichten</p>
        <SmartInsights />
      </section>

      <section>
        <RecentDocuments />
      </section>
    </div>
  );
}
