'use client';

import { Menu } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const bedrijf = useCompanyStore((s) => s.bedrijf);

  const initial = bedrijf.naam ? bedrijf.naam.charAt(0).toUpperCase() : 'D';

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-6 h-14 flex-shrink-0"
      style={{
        backgroundColor: 'rgba(7, 12, 24, 0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden btn-ghost p-2 cursor-pointer"
        aria-label="Menu openen"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        {bedrijf.naam ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {bedrijf.naam}
            </span>
            <span
              className="badge badge-blue hidden sm:inline-flex"
              style={{ fontSize: '10px', padding: '2px 6px' }}
            >
              Actief
            </span>
          </div>
        ) : (
          <a
            href="/instellingen"
            className="text-[13px] transition-colors hover:text-white cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Stel je bedrijfsnaam in →
          </a>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #5040EE 100%)',
            boxShadow: '0 2px 8px rgba(108, 99, 255, 0.4)',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
