import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AppData {
  bedrijf: Record<string, unknown>;
  documenten: Array<Record<string, unknown>>;
  klanten: Array<Record<string, unknown>>;
}

function fmtEur(n: number): string {
  const [int, dec] = n.toFixed(2).split('.');
  return `€ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('nl-NL');
  } catch {
    return d;
  }
}

function buildSystemPrompt(data: AppData): string {
  const { bedrijf, documenten, klanten } = data;
  const now = new Date();

  const facturen = documenten.filter((d) => d.type === 'factuur');
  const offertes = documenten.filter((d) => d.type === 'offerte');
  const rapporten = documenten.filter((d) => d.type === 'rapport');

  const totalFacturenBedrag = facturen.reduce((s, d) => s + ((d.bedrag as number) || 0), 0);
  const betaald = facturen.filter((d) => d.status === 'betaald');
  const openstaand = facturen.filter((d) => d.status !== 'betaald' && d.status !== 'vervallen');
  const totalBetaald = betaald.reduce((s, d) => s + ((d.bedrag as number) || 0), 0);
  const totalOpenstaand = openstaand.reduce((s, d) => s + ((d.bedrag as number) || 0), 0);

  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const factuurDezeM = facturen.filter((d) => {
    const dt = new Date(d.aangemaakt as string);
    return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
  });

  let p = `Je bent een slimme bedrijfsassistent voor ${(bedrijf.naam as string) || 'dit bedrijf'}.
Je hebt volledig inzicht in alle facturen, offertes, rapporten en klanten van het systeem.
Vandaag is het: ${now.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

GEDRAGSREGELS:
- Geef GEEN financieel, belasting- of juridisch advies. Verwijs daarvoor naar een gecertificeerde professional.
- Geef wel algemene zakelijke inzichten, trends en overzichten op basis van de data.
- Antwoord altijd in het Nederlands, tenzij de gebruiker in een andere taal schrijft.
- Wees bondig maar volledig. Gebruik markdown voor overzichten en lijsten.
- Wees eerlijk als iets onduidelijk of onvolledig is in de data.

---

## BEDRIJF
Naam: ${(bedrijf.naam as string) || 'Niet ingesteld'}
E-mail: ${(bedrijf.email as string) || '—'}
Telefoon: ${(bedrijf.telefoon as string) || '—'}
KVK: ${(bedrijf.kvkNummer as string) || '—'}
BTW: ${(bedrijf.btwNummer as string) || '—'}
IBAN: ${(bedrijf.iban as string) || '—'}

---

## STATISTIEKEN OVERZICHT
- Facturen totaal: ${facturen.length} | waarde: ${fmtEur(totalFacturenBedrag)}
- Betaald: ${betaald.length} facturen | ${fmtEur(totalBetaald)}
- Openstaand: ${openstaand.length} facturen | ${fmtEur(totalOpenstaand)}
- Facturen deze maand: ${factuurDezeM.length}
- Offertes: ${offertes.length}
- Rapporten: ${rapporten.length}
- Klanten: ${klanten.length}

---
`;

  if (facturen.length > 0) {
    p += `\n## FACTUREN (${facturen.length})\n\n`;
    for (const doc of facturen) {
      const d = doc.data as Record<string, unknown>;
      p += `**${doc.nummer}** — ${doc.klantNaam} — ${fmtDate(doc.datum as string)} — ${doc.bedrag !== undefined ? fmtEur(doc.bedrag as number) : '—'} — *${doc.status}*`;
      if (d?.vervaldatum) p += ` — verval: ${fmtDate(d.vervaldatum as string)}`;
      p += '\n';
      if (d?.notities) p += `  ↳ Notities: ${d.notities}\n`;
      if (d?.referentienummer) p += `  ↳ Ref: ${d.referentienummer}\n`;
      const regels = d?.regels as Array<Record<string, unknown>> | undefined;
      if (regels?.length) {
        p += `  ↳ Regels: ${regels.map((r) => `${r.omschrijving} (${r.aantal}× ${fmtEur(r.prijsPerEenheid as number)})`).join(', ')}\n`;
      }
    }
  }

  if (offertes.length > 0) {
    p += `\n## OFFERTES (${offertes.length})\n\n`;
    for (const doc of offertes) {
      const d = doc.data as Record<string, unknown>;
      p += `**${doc.nummer}** — ${doc.klantNaam} — ${fmtDate(doc.datum as string)} — ${doc.bedrag !== undefined ? fmtEur(doc.bedrag as number) : '—'} — *${doc.status}*\n`;
      if (d?.projectnaam) p += `  ↳ Project: ${d.projectnaam}\n`;
      if (d?.geldigTot) p += `  ↳ Geldig tot: ${fmtDate(d.geldigTot as string)}\n`;
      if (d?.projectomschrijving) p += `  ↳ ${d.projectomschrijving}\n`;
    }
  }

  if (rapporten.length > 0) {
    p += `\n## MAANDRAPPORTEN (${rapporten.length})\n\n`;
    for (const doc of rapporten) {
      const d = doc.data as Record<string, unknown>;
      p += `**${doc.nummer}** — ${fmtDate(doc.datum as string)} — *${doc.status}*\n`;
      if (d?.titel) p += `  ↳ Titel: ${d.titel}\n`;
      if (d?.periode) p += `  ↳ Periode: ${d.periode}\n`;
      if (d?.samenvatting) {
        const samenvatting = d.samenvatting as string;
        p += `  ↳ Samenvatting: ${samenvatting.length > 300 ? samenvatting.slice(0, 300) + '…' : samenvatting}\n`;
      }
    }
  }

  if (klanten.length > 0) {
    p += `\n## KLANTEN (${klanten.length})\n\n`;
    for (const k of klanten) {
      const klant = k as Record<string, unknown>;
      const factuurCount = facturen.filter((d) => {
        const fd = d.data as Record<string, unknown>;
        const fklant = fd?.klant as Record<string, unknown> | undefined;
        return fklant?.id === klant.id;
      }).length;
      p += `**${klant.bedrijfsnaam}** — ${(klant.contactpersoon as string) || '—'} — ${(klant.email as string) || '—'} — ${factuurCount} facturen\n`;
    }
  }

  return p;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY is niet geconfigureerd in .env.local' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { messages: Array<{ role: string; content: string }>; appData: AppData };
  try {
    body = await req.json();
  } catch {
    return new Response('Ongeldig verzoek', { status: 400 });
  }

  const { messages, appData } = body;
  const systemPrompt = buildSystemPrompt(appData);

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
