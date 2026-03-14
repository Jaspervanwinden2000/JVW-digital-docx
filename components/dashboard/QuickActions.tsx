'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, FileSpreadsheet, BarChart3, ArrowRight } from 'lucide-react';

const actions = [
  { href: '/facturen/nieuw', icon: FileText, label: 'Nieuwe factuur', description: 'Professionele factuur in seconden', accent: '#5746EA' },
  { href: '/offertes/nieuw', icon: FileSpreadsheet, label: 'Nieuwe offerte', description: 'Win meer opdrachten met strakke offertes', accent: '#E68C00' },
  { href: '/rapporten/nieuw', icon: BarChart3, label: 'Nieuw rapport', description: 'Houd klanten op de hoogte', accent: '#18A058' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.2 }}>
            <Link href={action.href} className="card card-hover flex items-start gap-3 p-4 group block" style={{ textDecoration: 'none' }}>
              <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${action.accent}12` }}>
                <Icon className="w-[15px] h-[15px]" style={{ color: action.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>{action.description}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: action.accent }} />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
