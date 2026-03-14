import { z } from 'zod';

const adresSchema = z.object({
  straat: z.string().min(1, 'Straat is verplicht'),
  huisnummer: z.string().min(1, 'Huisnummer is verplicht'),
  postcode: z.string().min(4, 'Postcode is verplicht'),
  stad: z.string().min(1, 'Stad is verplicht'),
  land: z.string().min(1, 'Land is verplicht'),
});

export const bedrijfSchema = z.object({
  naam: z.string().min(1, 'Bedrijfsnaam is verplicht'),
  adres: adresSchema,
  kvkNummer: z.string().min(1, 'KVK-nummer is verplicht'),
  btwNummer: z.string().min(1, 'BTW-nummer is verplicht'),
  iban: z.string().min(15, 'Ongeldig IBAN-nummer'),
  bic: z.string().min(8, 'Ongeldige BIC-code'),
  contactpersoon: z.string().min(1, 'Contactpersoon is verplicht'),
  email: z.string().email('Ongeldig e-mailadres'),
  telefoon: z.string().min(1, 'Telefoonnummer is verplicht'),
});

export const klantSchema = z.object({
  bedrijfsnaam: z.string().min(1, 'Bedrijfsnaam is verplicht'),
  contactpersoon: z.string().min(1, 'Contactpersoon is verplicht'),
  adres: adresSchema,
  email: z.string().email('Ongeldig e-mailadres'),
  telefoon: z.string().min(1, 'Telefoonnummer is verplicht'),
  btwNummer: z.string().optional(),
});

export const factuurRegelSchema = z.object({
  omschrijving: z.string().min(1, 'Omschrijving is verplicht'),
  aantal: z.number().min(0.01, 'Aantal moet groter dan 0 zijn'),
  eenheid: z.enum(['uur', 'stuk', 'maand', 'project', 'dag', 'kilometer', 'overig']),
  prijsPerEenheid: z.number().min(0, 'Prijs mag niet negatief zijn'),
  btwTarief: z.union([z.literal(0), z.literal(9), z.literal(21)]),
});

export const factuurDetailsSchema = z.object({
  factuurnummer: z.string().min(1, 'Factuurnummer is verplicht'),
  factuurdatum: z.string().min(1, 'Factuurdatum is verplicht'),
  vervaldatum: z.string().min(1, 'Vervaldatum is verplicht'),
  valuta: z.enum(['EUR', 'USD', 'GBP']),
  notities: z.string().optional(),
  referentienummer: z.string().optional(),
});
