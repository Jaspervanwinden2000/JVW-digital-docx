import { FactuurRegel, BTWSpecificatie, BTWTarief, Korting } from '@/types';

export function berekenRegel(
  aantal: number,
  prijsPerEenheid: number,
  btwTarief: BTWTarief
): Pick<FactuurRegel, 'totaalExclBTW' | 'btwBedrag' | 'totaalInclBTW'> {
  const totaalExclBTW = Math.round(aantal * prijsPerEenheid * 100) / 100;
  const btwBedrag = Math.round(totaalExclBTW * (btwTarief / 100) * 100) / 100;
  const totaalInclBTW = Math.round((totaalExclBTW + btwBedrag) * 100) / 100;
  return { totaalExclBTW, btwBedrag, totaalInclBTW };
}

export function berekenTotalen(regels: FactuurRegel[], korting?: Korting) {
  const subtotaalExclBTW = Math.round(
    regels.reduce((sum, r) => sum + r.totaalExclBTW, 0) * 100
  ) / 100;

  let kortingBedrag = 0;
  if (korting) {
    if (korting.type === 'percentage') {
      kortingBedrag = Math.round(subtotaalExclBTW * (korting.waarde / 100) * 100) / 100;
    } else {
      kortingBedrag = korting.waarde;
    }
  }

  const subtotaalNaKorting = Math.round((subtotaalExclBTW - kortingBedrag) * 100) / 100;
  const kortingFactor = subtotaalExclBTW > 0 ? subtotaalNaKorting / subtotaalExclBTW : 1;

  // Group BTW by tarief
  const btwGroepen = new Map<BTWTarief, number>();
  for (const regel of regels) {
    const huidigBedrag = btwGroepen.get(regel.btwTarief) || 0;
    const aangepastBasis = Math.round(regel.totaalExclBTW * kortingFactor * 100) / 100;
    const btw = Math.round(aangepastBasis * (regel.btwTarief / 100) * 100) / 100;
    btwGroepen.set(regel.btwTarief, Math.round((huidigBedrag + btw) * 100) / 100);
  }

  const btwSpecificaties: BTWSpecificatie[] = Array.from(btwGroepen.entries())
    .filter(([, bedrag]) => bedrag >= 0)
    .map(([tarief, bedrag]) => ({
      tarief,
      basis: Math.round(
        regels
          .filter((r) => r.btwTarief === tarief)
          .reduce((sum, r) => sum + r.totaalExclBTW * kortingFactor, 0) * 100
      ) / 100,
      bedrag,
    }))
    .sort((a, b) => a.tarief - b.tarief);

  const totaalBTW = Math.round(
    btwSpecificaties.reduce((sum, s) => sum + s.bedrag, 0) * 100
  ) / 100;

  const totaalInclBTW = Math.round((subtotaalNaKorting + totaalBTW) * 100) / 100;

  return {
    subtotaalExclBTW,
    kortingBedrag,
    subtotaalNaKorting,
    btwSpecificaties,
    totaalBTW,
    totaalInclBTW,
  };
}
