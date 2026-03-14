'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Square, Trash2, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeStore, TimeSessie } from '@/stores/timeStore';
import { formatCurrency } from '@/lib/formatters';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDuur(minuten: number) {
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  return h > 0 ? `${h}u ${pad(m)}m` : `${m} min`;
}

function formatElapsed(startTijd: string) {
  const diff = Math.floor((Date.now() - new Date(startTijd).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function berekenBedrag(sessie: TimeSessie) {
  const minuten = sessie.duurMinuten ?? 0;
  return (minuten / 60) * sessie.uurtarief;
}

export function TimeTracker() {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState('');
  const [uurtarief, setUurtarief] = useState(85);
  const [elapsed, setElapsed] = useState('00:00');
  const [gekopieerd, setGekopieerd] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { sessies, actieveSessieId, startTimer, stopTimer, deleteSessie, clearVoltooid } = useTimeStore();
  const actieveSessie = sessies.find((s) => s.id === actieveSessieId);
  const voltooide = sessies.filter((s) => s.eindTijd);

  useEffect(() => {
    if (actieveSessie) {
      intervalRef.current = setInterval(() => {
        setElapsed(formatElapsed(actieveSessie.startTijd));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed('00:00');
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [actieveSessie]);

  const handleStart = () => {
    if (!project.trim()) return;
    startTimer(project.trim(), uurtarief);
    setProject('');
  };

  const handleCopyAsLines = () => {
    const lines = voltooide.map((s) => {
      const uren = ((s.duurMinuten ?? 0) / 60).toFixed(2);
      return `${s.project}: ${uren} uur × €${s.uurtarief} = ${formatCurrency(berekenBedrag(s))}`;
    }).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    });
  };

  const totalVoltooide = voltooide.reduce((s, sess) => s + berekenBedrag(sess), 0);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: actieveSessie ? '#f97316' : '#374151' }}
        title="Tijdregistratie"
      >
        {actieveSessie ? (
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        ) : (
          <Timer className="w-5 h-5 text-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="tt-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="tt-panel"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] flex flex-col shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" style={{ color: '#f97316' }} />
                  <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Tijdregistratie</span>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {/* Actieve timer */}
                {actieveSessie ? (
                  <div className="card p-4 space-y-3" style={{ border: '2px solid #f97316' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{actieveSessie.project}</span>
                    </div>
                    <div className="text-[36px] font-bold tabular-nums tracking-tight" style={{ color: '#f97316', fontVariantNumeric: 'tabular-nums' }}>
                      {elapsed}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                        €{actieveSessie.uurtarief}/uur
                      </span>
                      <button
                        type="button"
                        onClick={stopTimer}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white"
                        style={{ backgroundColor: '#f97316' }}
                      >
                        <Square className="w-3 h-3 fill-white" />
                        Stop
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card p-4 space-y-3">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Nieuwe taak starten</p>
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder="Projectnaam / omschrijving..."
                      className="input-base text-[13px] w-full"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
                    />
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>€</span>
                        <input
                          type="number"
                          value={uurtarief}
                          onChange={(e) => setUurtarief(parseFloat(e.target.value) || 0)}
                          className="input-base pl-6 text-[13px] w-full tabular-nums"
                          placeholder="85"
                          min="0"
                          step="5"
                        />
                      </div>
                      <span className="text-[12px] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>/uur</span>
                      <button
                        type="button"
                        onClick={handleStart}
                        disabled={!project.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity"
                        style={{ backgroundColor: '#f97316' }}
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Start
                      </button>
                    </div>
                  </div>
                )}

                {/* Voltooide sessies */}
                {voltooide.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="section-label">Geregistreerde tijd</p>
                      <button type="button" onClick={clearVoltooid} className="text-[11px] hover:text-red-500 transition-colors" style={{ color: 'var(--text-tertiary)' }}>Alles wissen</button>
                    </div>

                    {voltooide.map((s) => (
                      <div key={s.id} className="card p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.project}</p>
                          <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                            {formatDuur(s.duurMinuten ?? 0)} · {formatCurrency(berekenBedrag(s))}
                          </p>
                        </div>
                        <button type="button" onClick={() => deleteSessie(s.id)} className="p-1 rounded hover:text-red-500 transition-colors shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Totaal */}
                    <div className="card p-3 flex items-center justify-between">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Totaal ({voltooide.length} sessie{voltooide.length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-[15px] font-bold tabular-nums" style={{ color: '#f97316' }}>
                        {formatCurrency(totalVoltooide)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Naar factuur */}
                {voltooide.length > 0 && (
                  <div className="space-y-2">
                    <p className="section-label">Omzetten naar factuur</p>
                    <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      Kopieer de regels en plak ze in het AI-invulveld bij een nieuwe factuur.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyAsLines}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: gekopieerd ? '#16a34a' : '#5746EA', color: 'white' }}
                    >
                      {gekopieerd ? 'Gekopieerd!' : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Kopieer als factuurregels
                        </>
                      )}
                    </button>
                    <a
                      href="/facturen/nieuw"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:opacity-90 border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      onClick={() => setOpen(false)}
                    >
                      Nieuwe factuur maken
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {voltooide.length === 0 && !actieveSessie && (
                  <div className="text-center py-8">
                    <Timer className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Start een taak om tijd bij te houden.</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Uren worden automatisch omgezet naar factuurregels.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
