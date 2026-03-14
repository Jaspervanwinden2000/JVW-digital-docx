'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const bedrijf = useCompanyStore((s) => s.bedrijf);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Gebruiker';
  const email = user?.email || '';
  const photoURL = user?.photoURL;
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.replace('/login');
  }

  // Sluit menu bij klik buiten
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Account dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 cursor-pointer transition-all"
          style={{
            background: menuOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
            border: '1px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (!menuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            if (!menuOpen) e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Account menu"
        >
          {/* Avatar */}
          {photoURL ? (
            <Image
              src={photoURL}
              alt={displayName}
              width={30}
              height={30}
              className="rounded-lg flex-shrink-0 object-cover"
              style={{ boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)' }}
            />
          ) : (
            <div
              className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #5040EE 100%)',
                boxShadow: '0 2px 8px rgba(108, 99, 255, 0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {initial}
            </div>
          )}

          {/* Naam — verborgen op mobiel */}
          <span className="hidden sm:block text-[13px] font-medium max-w-[120px] truncate" style={{ color: 'var(--text-primary)' }}>
            {displayName}
          </span>
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(13, 20, 37, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Profiel header */}
            <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {photoURL ? (
                <Image
                  src={photoURL}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="rounded-xl object-cover flex-shrink-0"
                  style={{ boxShadow: '0 2px 12px rgba(108, 99, 255, 0.35)' }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #6C63FF 0%, #5040EE 100%)',
                    boxShadow: '0 2px 12px rgba(108, 99, 255, 0.4)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
                  {displayName}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {email}
                </p>
              </div>
            </div>

            {/* Acties */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] cursor-pointer transition-colors text-left"
                style={{ color: 'var(--error)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(252,129,129,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Uitloggen
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
