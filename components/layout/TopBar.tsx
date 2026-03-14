'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useCompanyStore } from '@/stores/companyStore';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const bedrijf = useCompanyStore((s) => s.bedrijf);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex items-center gap-3 px-4 sm:px-6 h-14 border-b flex-shrink-0" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <button onClick={onMenuClick} className="md:hidden btn-ghost p-2" aria-label="Menu openen">
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        {bedrijf.naam ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{bedrijf.naam}</span>
            <span className="badge badge-gray hidden sm:inline-flex">Actief</span>
          </div>
        ) : (
          <a href="/instellingen" className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            Stel je bedrijfsnaam in →
          </a>
        )}
      </div>

      <div className="flex items-center gap-1">
        {mounted && (
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-ghost p-2" aria-label="Thema wisselen">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ml-1" style={{ backgroundColor: '#5746EA' }}>
          {bedrijf.naam ? bedrijf.naam.charAt(0).toUpperCase() : 'D'}
        </div>
      </div>
    </header>
  );
}
