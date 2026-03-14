import { create } from 'zustand';
import { Document, DocumentType, DocumentStatus } from '@/types';
import { supabase } from '@/lib/supabase';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface DocumentsStore {
  documenten: Document[];
  loaded: boolean;
  init: () => Promise<void>;
  addDocument: (doc: Omit<Document, 'id' | 'aangemaakt' | 'bijgewerkt'>) => Promise<Document>;
  updateDocument: (id: string, doc: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string, nieuwNummer: string) => Promise<Document | null>;
  getDocument: (id: string) => Document | undefined;
  getDocumentenByType: (type: DocumentType) => Document[];
  updateStatus: (id: string, status: DocumentStatus) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsStore>()((set, get) => ({
  documenten: [],
  loaded: false,

  init: async () => {
    const { data, error } = await supabase
      .from('documenten')
      .select('document')
      .order('aangemaakt', { ascending: false });
    if (!error && data) {
      set({ documenten: data.map((r) => r.document as Document), loaded: true });
    } else {
      set({ loaded: true });
    }
  },

  addDocument: async (docData) => {
    const now = new Date().toISOString();
    const doc: Document = {
      ...docData,
      id: generateId(),
      aangemaakt: now,
      bijgewerkt: now,
    };
    set((state) => ({ documenten: [doc, ...state.documenten] }));
    await supabase.from('documenten').insert({ id: doc.id, aangemaakt: doc.aangemaakt, document: doc });
    return doc;
  },

  updateDocument: async (id, docData) => {
    const now = new Date().toISOString();
    set((state) => ({
      documenten: state.documenten.map((d) =>
        d.id === id ? { ...d, ...docData, bijgewerkt: now } : d
      ),
    }));
    const updated = get().documenten.find((d) => d.id === id);
    if (updated) {
      await supabase.from('documenten').update({ document: updated }).eq('id', id);
    }
  },

  deleteDocument: async (id) => {
    set((state) => ({
      documenten: state.documenten.filter((d) => d.id !== id),
    }));
    await supabase.from('documenten').delete().eq('id', id);
  },

  duplicateDocument: async (id, nieuwNummer) => {
    const original = get().documenten.find((d) => d.id === id);
    if (!original) return null;
    const now = new Date().toISOString();
    const copy: Document = {
      ...original,
      id: generateId(),
      nummer: nieuwNummer,
      status: 'concept',
      aangemaakt: now,
      bijgewerkt: now,
    };
    set((state) => ({ documenten: [copy, ...state.documenten] }));
    await supabase.from('documenten').insert({ id: copy.id, aangemaakt: copy.aangemaakt, document: copy });
    return copy;
  },

  getDocument: (id) => get().documenten.find((d) => d.id === id),

  getDocumentenByType: (type) => get().documenten.filter((d) => d.type === type),

  updateStatus: async (id, status) => {
    const now = new Date().toISOString();
    set((state) => ({
      documenten: state.documenten.map((d) =>
        d.id === id ? { ...d, status, bijgewerkt: now } : d
      ),
    }));
    const updated = get().documenten.find((d) => d.id === id);
    if (updated) {
      await supabase.from('documenten').update({ document: updated }).eq('id', id);
    }
  },
}));
