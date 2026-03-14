import { create } from 'zustand';
import { Bedrijf, AppInstellingen, NummeringInstellingen } from '@/types';
import { supabase } from '@/lib/supabase';

const defaultBedrijf: Bedrijf = {
  naam: '',
  adres: { straat: '', huisnummer: '', postcode: '', stad: '', land: 'Nederland' },
  kvkNummer: '',
  btwNummer: '',
  iban: '',
  bic: '',
  contactpersoon: '',
  email: '',
  telefoon: '',
};

const defaultNummering: NummeringInstellingen = {
  factuurPrefix: 'INV',
  factuurStartnummer: 1,
  factuurVolgnummer: 1,
  offertePrefix: 'QUO',
  offerteStartnummer: 1,
  offerteVolgnummer: 1,
  rapportPrefix: 'RPT',
  rapportStartnummer: 1,
  rapportVolgnummer: 1,
};

const defaultInstellingen: AppInstellingen = {
  standaardBTWTarief: 21,
  standaardBetalingstermijn: 30,
  standaardValuta: 'EUR',
  standaardTemplate: 'modern',
  standaardAccentKleur: '#2563EB',
  nummering: defaultNummering,
  emailTemplate: {
    factuurOnderwerp: 'Factuur {{nummer}} van {{bedrijf}}',
    factuurBericht: 'Geachte {{contactpersoon}},\n\nHierbij sturen wij u factuur {{nummer}} voor de geleverde diensten.\n\nMet vriendelijke groet,\n{{bedrijf}}',
    offerteOnderwerp: 'Offerte {{nummer}} van {{bedrijf}}',
    offerteBericht: 'Geachte {{contactpersoon}},\n\nHierbij ontvangt u onze offerte {{nummer}}.\n\nMet vriendelijke groet,\n{{bedrijf}}',
  },
};

interface CompanyStore {
  bedrijf: Bedrijf;
  instellingen: AppInstellingen;
  loaded: boolean;
  init: () => Promise<void>;
  setBedrijf: (bedrijf: Partial<Bedrijf>) => Promise<void>;
  setInstellingen: (instellingen: Partial<AppInstellingen>) => Promise<void>;
  setNummering: (nummering: Partial<NummeringInstellingen>) => Promise<void>;
  incrementFactuurNummer: () => Promise<string>;
  incrementOfferteNummer: () => Promise<string>;
  incrementRapportNummer: () => Promise<string>;
  getFactuurNummer: () => string;
  getOfferteNummer: () => string;
  getRapportNummer: () => string;
}

function formatNummer(prefix: string, volgnummer: number, jaar: number): string {
  const padded = String(volgnummer).padStart(4, '0');
  return `${prefix}-${jaar}-${padded}`;
}

async function saveToSupabase(bedrijf: Bedrijf, instellingen: AppInstellingen) {
  await supabase
    .from('instellingen')
    .upsert({ id: 1, bedrijf, instellingen });
}

export const useCompanyStore = create<CompanyStore>()((set, get) => ({
  bedrijf: defaultBedrijf,
  instellingen: defaultInstellingen,
  loaded: false,

  init: async () => {
    const { data, error } = await supabase
      .from('instellingen')
      .select('bedrijf, instellingen')
      .eq('id', 1)
      .single();
    if (!error && data) {
      set({
        bedrijf: (data.bedrijf as Bedrijf) || defaultBedrijf,
        instellingen: (data.instellingen as AppInstellingen) || defaultInstellingen,
        loaded: true,
      });
    } else {
      set({ loaded: true });
    }
  },

  setBedrijf: async (bedrijf) => {
    set((state) => ({ bedrijf: { ...state.bedrijf, ...bedrijf } }));
    const { bedrijf: b, instellingen: i } = get();
    await saveToSupabase(b, i);
  },

  setInstellingen: async (instellingen) => {
    set((state) => ({ instellingen: { ...state.instellingen, ...instellingen } }));
    const { bedrijf: b, instellingen: i } = get();
    await saveToSupabase(b, i);
  },

  setNummering: async (nummering) => {
    set((state) => ({
      instellingen: {
        ...state.instellingen,
        nummering: { ...state.instellingen.nummering, ...nummering },
      },
    }));
    const { bedrijf: b, instellingen: i } = get();
    await saveToSupabase(b, i);
  },

  getFactuurNummer: () => {
    const { instellingen } = get();
    const { factuurPrefix, factuurVolgnummer } = instellingen.nummering;
    return formatNummer(factuurPrefix, factuurVolgnummer, new Date().getFullYear());
  },

  getOfferteNummer: () => {
    const { instellingen } = get();
    const { offertePrefix, offerteVolgnummer } = instellingen.nummering;
    return formatNummer(offertePrefix, offerteVolgnummer, new Date().getFullYear());
  },

  getRapportNummer: () => {
    const { instellingen } = get();
    const { rapportPrefix, rapportVolgnummer } = instellingen.nummering;
    return formatNummer(rapportPrefix, rapportVolgnummer, new Date().getFullYear());
  },

  incrementFactuurNummer: async () => {
    const { instellingen } = get();
    const { factuurPrefix, factuurVolgnummer } = instellingen.nummering;
    const nummer = formatNummer(factuurPrefix, factuurVolgnummer, new Date().getFullYear());
    set((state) => ({
      instellingen: {
        ...state.instellingen,
        nummering: { ...state.instellingen.nummering, factuurVolgnummer: factuurVolgnummer + 1 },
      },
    }));
    const { bedrijf: b, instellingen: i } = get();
    await saveToSupabase(b, i);
    return nummer;
  },

  incrementOfferteNummer: async () => {
    const { instellingen } = get();
    const { offertePrefix, offerteVolgnummer } = instellingen.nummering;
    const nummer = formatNummer(offertePrefix, offerteVolgnummer, new Date().getFullYear());
    set((state) => ({
      instellingen: {
        ...state.instellingen,
        nummering: { ...state.instellingen.nummering, offerteVolgnummer: offerteVolgnummer + 1 },
      },
    }));
    const { bedrijf: b, instellingen: i } = get();
    await saveToSupabase(b, i);
    return nummer;
  },

  incrementRapportNummer: async () => {
    const { instellingen } = get();
    const { rapportPrefix, rapportVolgnummer } = instellingen.nummering;
    const nummer = formatNummer(rapportPrefix, rapportVolgnummer, new Date().getFullYear());
    set((state) => ({
      instellingen: {
        ...state.instellingen,
        nummering: { ...state.instellingen.nummering, rapportVolgnummer: rapportVolgnummer + 1 },
      },
    }));
    const { bedrijf: b, instellingen: i } = get();
    await saveToSupabase(b, i);
    return nummer;
  },
}));
