import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export interface TimeSessie {
  id: string;
  project: string;
  startTijd: string; // ISO
  eindTijd?: string; // ISO
  duurMinuten?: number;
  uurtarief: number;
}

interface TimeStore {
  sessies: TimeSessie[];
  actieveSessieId: string | null;
  startTimer: (project: string, uurtarief: number) => void;
  stopTimer: () => void;
  deleteSessie: (id: string) => void;
  clearVoltooid: () => void;
}

export const useTimeStore = create<TimeStore>()(
  persist(
    (set, get) => ({
      sessies: [],
      actieveSessieId: null,

      startTimer: (project, uurtarief) => {
        const { actieveSessieId, sessies } = get();
        // Stop eventuele lopende sessie eerst
        if (actieveSessieId) {
          const eindTijd = new Date().toISOString();
          set({
            sessies: sessies.map((s) => {
              if (s.id !== actieveSessieId) return s;
              const duurMs = new Date(eindTijd).getTime() - new Date(s.startTijd).getTime();
              return { ...s, eindTijd, duurMinuten: Math.max(1, Math.round(duurMs / 60000)) };
            }),
            actieveSessieId: null,
          });
        }
        const sessie: TimeSessie = { id: generateId(), project, startTijd: new Date().toISOString(), uurtarief };
        set((s) => ({ sessies: [sessie, ...s.sessies], actieveSessieId: sessie.id }));
      },

      stopTimer: () => {
        const { actieveSessieId, sessies } = get();
        if (!actieveSessieId) return;
        const eindTijd = new Date().toISOString();
        set({
          sessies: sessies.map((s) => {
            if (s.id !== actieveSessieId) return s;
            const duurMs = new Date(eindTijd).getTime() - new Date(s.startTijd).getTime();
            return { ...s, eindTijd, duurMinuten: Math.max(1, Math.round(duurMs / 60000)) };
          }),
          actieveSessieId: null,
        });
      },

      deleteSessie: (id) =>
        set((s) => ({
          sessies: s.sessies.filter((sess) => sess.id !== id),
          actieveSessieId: s.actieveSessieId === id ? null : s.actieveSessieId,
        })),

      clearVoltooid: () =>
        set((s) => ({
          sessies: s.sessies.filter((sess) => !sess.eindTijd),
        })),
    }),
    { name: 'docuforge-time-tracker' }
  )
);
