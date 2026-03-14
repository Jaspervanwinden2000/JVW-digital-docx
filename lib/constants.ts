export const EENHEDEN = [
  { value: 'uur', label: 'Uur' },
  { value: 'stuk', label: 'Stuk' },
  { value: 'maand', label: 'Maand' },
  { value: 'project', label: 'Project' },
  { value: 'dag', label: 'Dag' },
  { value: 'kilometer', label: 'Kilometer' },
  { value: 'overig', label: 'Overig' },
] as const;

export const BTW_TARIEVEN = [
  { value: 0, label: '0%' },
  { value: 9, label: '9%' },
  { value: 21, label: '21%' },
] as const;

export const BETALINGSTERMIJNEN = [
  { value: 0, label: 'Direct' },
  { value: 14, label: '14 dagen' },
  { value: 30, label: '30 dagen' },
  { value: 60, label: '60 dagen' },
] as const;

export const VALUTA_OPTIONS = [
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'GBP', label: 'Brits Pond (£)', symbol: '£' },
] as const;

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  concept: 'Concept',
  definitief: 'Definitief',
  verzonden: 'Verzonden',
  betaald: 'Betaald',
  vervallen: 'Vervallen',
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  factuur: 'Factuur',
  offerte: 'Offerte',
  rapport: 'Rapport',
};

export const TEMPLATE_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'klassiek', label: 'Klassiek' },
  { value: 'minimaal', label: 'Minimaal' },
] as const;

export const ACCENT_KLEUREN = [
  '#2563EB', // Blauw
  '#7C3AED', // Paars
  '#059669', // Groen
  '#DC2626', // Rood
  '#D97706', // Oranje
  '#0891B2', // Cyaan
  '#BE185D', // Roze
  '#374151', // Grijs/Zwart
];

export const MAANDEN = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maart' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Augustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const SECTIE_TYPE_LABELS: Record<string, string> = {
  tekst: 'Tekst',
  statistieken: 'Statistieken',
  tabel: 'Tabel',
  highlights: 'Hoogtepunten',
};
