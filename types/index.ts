export type DocumentType = 'factuur' | 'offerte' | 'rapport';
export type DocumentStatus = 'concept' | 'definitief' | 'verzonden' | 'betaald' | 'vervallen';
export type BTWTarief = 0 | 9 | 21;
export type Valuta = 'EUR' | 'USD' | 'GBP';
export type Eenheid = 'uur' | 'stuk' | 'maand' | 'project' | 'dag' | 'kilometer' | 'overig';
export type TemplateName = 'modern' | 'klassiek' | 'minimaal';

export interface Adres {
  straat: string;
  huisnummer: string;
  postcode: string;
  stad: string;
  land: string;
}

export interface Bedrijf {
  naam: string;
  adres: Adres;
  kvkNummer: string;
  btwNummer: string;
  iban: string;
  bic: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  logo?: string; // base64
  website?: string;
}

export interface Klant {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  adres: Adres;
  email: string;
  telefoon: string;
  btwNummer?: string;
  notities?: string;
  aangemaakt: string; // ISO date
}

export interface FactuurRegel {
  id: string;
  omschrijving: string;
  aantal: number;
  eenheid: Eenheid;
  prijsPerEenheid: number;
  btwTarief: BTWTarief;
  totaalExclBTW: number;
  btwBedrag: number;
  totaalInclBTW: number;
}

export interface BTWSpecificatie {
  tarief: BTWTarief;
  basis: number;
  bedrag: number;
}

export interface Korting {
  type: 'percentage' | 'bedrag';
  waarde: number;
}

export interface FactuurData {
  bedrijf: Bedrijf;
  klant: Klant;
  regels: FactuurRegel[];
  korting?: Korting;
  subtotaalExclBTW: number;
  btwSpecificaties: BTWSpecificatie[];
  totaalBTW: number;
  totaalInclBTW: number;
  factuurnummer: string;
  factuurdatum: string;
  vervaldatum: string;
  betalingstermijn: 14 | 30 | 60 | 0;
  valuta: Valuta;
  notities?: string;
  referentienummer?: string;
  status: DocumentStatus;
  template: TemplateName;
  accentKleur: string;
}

export interface OffertePakket {
  id: string;
  naam: string;
  omschrijving: string;
  prijs: number;
  aanbevolen?: boolean;
}

export interface OfferteData {
  bedrijf: Bedrijf;
  klant: Klant;
  regels: FactuurRegel[];
  pakketten?: OffertePakket[];
  korting?: Korting;
  subtotaalExclBTW: number;
  btwSpecificaties: BTWSpecificatie[];
  totaalBTW: number;
  totaalInclBTW: number;
  offertenummer: string;
  offertedatum: string;
  geldigTot: string;
  geldigheidsduur: number;
  projectnaam: string;
  projectomschrijving?: string;
  inleiding?: string;
  voorwaarden?: string;
  valuta: Valuta;
  status: DocumentStatus;
  template: TemplateName;
  accentKleur: string;
}

export type SectieType = 'tekst' | 'statistieken' | 'tabel' | 'highlights';

export interface KPICard {
  id: string;
  label: string;
  waarde: string;
  verandering?: number; // percentage, positief = groen, negatief = rood
  eenheid?: string;
}

export interface TabelData {
  headers: string[];
  rijen: string[][];
}

export interface RapportSectie {
  id: string;
  titel: string;
  type: SectieType;
  tekst?: string;
  kpis?: KPICard[];
  tabel?: TabelData;
  highlights?: string[];
  volgorde: number;
}

export interface RapportData {
  bedrijf: Bedrijf;
  klant?: Klant;
  titel: string;
  periode: string; // bijv. "Maart 2026"
  periodeJaar: number;
  periodeMaand: number;
  secties: RapportSectie[];
  samenvatting?: string;
  volgendeStappen?: string;
  rapportnummer: string;
  aangemaakt: string;
  status: DocumentStatus;
  template: TemplateName;
  accentKleur: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  nummer: string;
  klantNaam: string;
  datum: string;
  bedrag?: number;
  status: DocumentStatus;
  aangemaakt: string;
  bijgewerkt: string;
  data: FactuurData | OfferteData | RapportData;
}

export interface NummeringInstellingen {
  factuurPrefix: string;
  factuurStartnummer: number;
  factuurVolgnummer: number;
  offertePrefix: string;
  offerteStartnummer: number;
  offerteVolgnummer: number;
  rapportPrefix: string;
  rapportStartnummer: number;
  rapportVolgnummer: number;
}

export interface AppInstellingen {
  standaardBTWTarief: BTWTarief;
  standaardBetalingstermijn: 14 | 30 | 60 | 0;
  standaardValuta: Valuta;
  standaardTemplate: TemplateName;
  standaardAccentKleur: string;
  nummering: NummeringInstellingen;
  emailTemplate: {
    factuurOnderwerp: string;
    factuurBericht: string;
    offerteOnderwerp: string;
    offerteBericht: string;
  };
}
