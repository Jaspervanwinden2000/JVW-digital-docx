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
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #5040EE 100%)',
            boxShadow: '0 4px 12px rgba(108, 99, 255, 0.4)',
          }}
        >
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold leading-none" style={{ color: '#EEF2FF', fontFamily: 'Poppins, sans-serif' }}>
            DocuForge Pro
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(108, 99, 255, 0.7)' }}>Enterprise</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-md transition-colors hover:bg-white/5 cursor-pointer"
          style={{ color: '#3D4A6B' }}
          aria-label="Navigatie sluiten"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#1E2840' }}>
          Navigatie
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer group"
              style={{
                color: active ? '#EEF2FF' : '#3D4A6B',
                backgroundColor: active ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                border: active ? '1px solid rgba(108, 99, 255, 0.25)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#9AA5C8';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#3D4A6B';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon
                className="w-[15px] h-[15px] flex-shrink-0 transition-colors"
                style={{ color: active ? '#6C63FF' : 'inherit' }}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#6C63FF', boxShadow: '0 0 6px rgba(108, 99, 255, 0.8)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(108, 99, 255, 0.06)', border: '1px solid rgba(108, 99, 255, 0.12)' }}
        >
          <p className="text-[11px] font-medium" style={{ color: 'rgba(108, 99, 255, 0.6)' }}>v1.0 · Lokaal opgeslagen</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarStyle: React.CSSProperties = {
    backgroundColor: 'rgba(4, 7, 16, 0.85)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  return (
    <>
      <aside
        className="hidden md:flex flex-col w-[220px] flex-shrink-0"
        style={sidebarStyle}
      >
        <SidebarContent onClose={onClose} />
      </aside>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-30 w-[220px] flex flex-col md:hidden"
            style={sidebarStyle}
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
