'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, FileSpreadsheet, BarChart3, Palette, Settings, X, Zap,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/facturen', label: 'Facturen', icon: FileText },
  { href: '/offertes', label: 'Offertes', icon: FileSpreadsheet },
  { href: '/rapporten', label: 'Rapporten', icon: BarChart3 },
  { href: '/templates', label: 'Templates', icon: Palette },
  { href: '/instellingen', label: 'Instellingen', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0" style={{ borderBottom: '1px solid #1A1A1E' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7060F2 0%, #5746EA 100%)' }}>
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-none" style={{ color: '#E8E8F0' }}>DocuForge Pro</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#3A3A4C' }}>Enterprise</p>
        </div>
        <button onClick={onClose} className="md:hidden p-1.5 rounded" style={{ color: '#4A4A5A' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: '#2A2A38' }}>Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors"
              style={{
                color: active ? '#E8E8F0' : '#606070',
                backgroundColor: active ? '#1E1E28' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = '#C0C0D0'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = '#606070'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <Icon className="w-[15px] h-[15px] flex-shrink-0" style={{ color: active ? '#7060F2' : 'inherit' }} />
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#5746EA' }} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3" style={{ borderTop: '1px solid #1A1A1E' }}>
        <div className="px-3 py-2 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}>
          <p className="text-[11px]" style={{ color: '#323242' }}>v1.0 · Lokaal opgeslagen</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex flex-col w-[216px] flex-shrink-0" style={{ backgroundColor: '#0C0C0E', borderRight: '1px solid #1A1A1E' }}>
        <SidebarContent onClose={onClose} />
      </aside>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-30 w-[216px] flex flex-col md:hidden"
            style={{ backgroundColor: '#0C0C0E', borderRight: '1px solid #1A1A1E' }}
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
