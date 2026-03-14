import { create } from 'zustand';
import { Klant } from '@/types';
import { supabase } from '@/lib/supabase';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface ClientsStore {
  klanten: Klant[];
  loaded: boolean;
  init: () => Promise<void>;
  addKlant: (klant: Omit<Klant, 'id' | 'aangemaakt'>) => Promise<Klant>;
  updateKlant: (id: string, klant: Partial<Klant>) => Promise<void>;
  deleteKlant: (id: string) => Promise<void>;
  getKlant: (id: string) => Klant | undefined;
}

export const useClientsStore = create<ClientsStore>()((set, get) => ({
  klanten: [],
  loaded: false,

  init: async () => {
    const { data, error } = await supabase
      .from('klanten')
      .select('klant')
      .order('aangemaakt', { ascending: true });
    if (!error && data) {
      set({ klanten: data.map((r) => r.klant as Klant), loaded: true });
    } else {
      set({ loaded: true });
    }
  },

  addKlant: async (klantData) => {
    const klant: Klant = {
      ...klantData,
      id: generateId(),
      aangemaakt: new Date().toISOString(),
    };
    set((state) => ({ klanten: [...state.klanten, klant] }));
    await supabase.from('klanten').insert({ id: klant.id, aangemaakt: klant.aangemaakt, klant });
    return klant;
  },

  updateKlant: async (id, klantData) => {
    set((state) => ({
      klanten: state.klanten.map((k) => (k.id === id ? { ...k, ...klantData } : k)),
    }));
    const updated = get().klanten.find((k) => k.id === id);
    if (updated) {
      await supabase.from('klanten').update({ klant: updated }).eq('id', id);
    }
  },

  deleteKlant: async (id) => {
    set((state) => ({ klanten: state.klanten.filter((k) => k.id !== id) }));
    await supabase.from('klanten').delete().eq('id', id);
  },

  getKlant: (id) => get().klanten.find((k) => k.id === id),
}));
