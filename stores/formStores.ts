import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FactuurData, OfferteData, RapportData, FactuurRegel, RapportSectie } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function defaultRegel(): FactuurRegel {
  return {
    id: generateId(),
    omschrijving: '',
    aantal: 1,
    eenheid: 'stuk',
    prijsPerEenheid: 0,
    btwTarief: 21,
    totaalExclBTW: 0,
    btwBedrag: 0,
    totaalInclBTW: 0,
  };
}

// Invoice form store
interface InvoiceFormStore {
  currentStep: number;
  data: Partial<FactuurData>;
  setStep: (step: number) => void;
  setData: (data: Partial<FactuurData>) => void;
  reset: () => void;
}

export const useInvoiceFormStore = create<InvoiceFormStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: {
        regels: [defaultRegel()],
        status: 'concept',
        template: 'modern',
        accentKleur: '#2563EB',
        valuta: 'EUR',
        betalingstermijn: 30,
      },
      setStep: (step) => set({ currentStep: step }),
      setData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
      reset: () =>
        set({
          currentStep: 1,
          data: {
            regels: [defaultRegel()],
            status: 'concept',
            template: 'modern',
            accentKleur: '#2563EB',
            valuta: 'EUR',
            betalingstermijn: 30,
          },
        }),
    }),
    { name: 'docuforge-invoice-form' }
  )
);

// Quote form store
interface QuoteFormStore {
  currentStep: number;
  data: Partial<OfferteData>;
  setStep: (step: number) => void;
  setData: (data: Partial<OfferteData>) => void;
  reset: () => void;
}

export const useQuoteFormStore = create<QuoteFormStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: {
        regels: [defaultRegel()],
        pakketten: [],
        status: 'concept',
        template: 'modern',
        accentKleur: '#2563EB',
        valuta: 'EUR',
        geldigheidsduur: 30,
      },
      setStep: (step) => set({ currentStep: step }),
      setData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
      reset: () =>
        set({
          currentStep: 1,
          data: {
            regels: [defaultRegel()],
            pakketten: [],
            status: 'concept',
            template: 'modern',
            accentKleur: '#2563EB',
            valuta: 'EUR',
            geldigheidsduur: 30,
          },
        }),
    }),
    { name: 'docuforge-quote-form' }
  )
);

// Report form store
interface ReportFormStore {
  data: Partial<RapportData>;
  setData: (data: Partial<RapportData>) => void;
  addSectie: () => void;
  updateSectie: (id: string, sectie: Partial<RapportSectie>) => void;
  deleteSectie: (id: string) => void;
  reorderSecties: (secties: RapportSectie[]) => void;
  reset: () => void;
}

export const useReportFormStore = create<ReportFormStore>()(
  persist(
    (set) => ({
      data: {
        secties: [],
        status: 'concept',
        template: 'modern',
        accentKleur: '#2563EB',
      },
      setData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
      addSectie: () =>
        set((state) => {
          const secties = state.data.secties || [];
          const newSectie: RapportSectie = {
            id: generateId(),
            titel: 'Nieuwe sectie',
            type: 'tekst',
            tekst: '',
            volgorde: secties.length,
          };
          return { data: { ...state.data, secties: [...secties, newSectie] } };
        }),
      updateSectie: (id, sectieData) =>
        set((state) => ({
          data: {
            ...state.data,
            secties: (state.data.secties || []).map((s) =>
              s.id === id ? { ...s, ...sectieData } : s
            ),
          },
        })),
      deleteSectie: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            secties: (state.data.secties || []).filter((s) => s.id !== id),
          },
        })),
      reorderSecties: (secties) =>
        set((state) => ({ data: { ...state.data, secties } })),
      reset: () =>
        set({
          data: {
            secties: [],
            status: 'concept',
            template: 'modern',
            accentKleur: '#2563EB',
          },
        }),
    }),
    { name: 'docuforge-report-form' }
  )
);
