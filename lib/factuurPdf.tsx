import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { FactuurData } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadBlob } from '@/lib/utils';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', padding: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  companyDetail: { color: '#6b7280', lineHeight: 1.5 },
  invoiceTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 4 },
  invoiceNumber: { color: '#6b7280', textAlign: 'right', marginBottom: 2 },
  accentLine: { height: 2, marginBottom: 24, borderRadius: 1 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  label: { fontSize: 7, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  value: { lineHeight: 1.6 },
  table: { marginBottom: 24 },
  tableHeader: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 3 },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: 'right' },
  colUnit: { width: 44, textAlign: 'right' },
  colPrice: { width: 60, textAlign: 'right' },
  colBtw: { width: 36, textAlign: 'right' },
  colTotal: { width: 68, textAlign: 'right' },
  totalsWrapper: { alignItems: 'flex-end', marginBottom: 28 },
  totalsTable: { width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalsDivider: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginVertical: 4 },
  totalLabel: { color: '#6b7280' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  grandTotalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  grandTotalValue: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  notes: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 4, marginBottom: 24 },
  notesLabel: { fontSize: 7, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  footer: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { color: '#9ca3af', fontSize: 8 },
});

interface FactuurPdfProps {
  data: FactuurData;
  nummer: string;
  accent: string;
}

export function FactuurPdf({ data, nummer, accent }: FactuurPdfProps) {
  const { bedrijf, klant, regels, valuta } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{bedrijf.naam}</Text>
            <Text style={styles.companyDetail}>{bedrijf.adres.straat} {bedrijf.adres.huisnummer}</Text>
            <Text style={styles.companyDetail}>{bedrijf.adres.postcode} {bedrijf.adres.stad}</Text>
            <Text style={styles.companyDetail}>{bedrijf.email}</Text>
            {bedrijf.telefoon ? <Text style={styles.companyDetail}>{bedrijf.telefoon}</Text> : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTUUR</Text>
            <Text style={styles.invoiceNumber}>{nummer}</Text>
          </View>
        </View>

        {/* Accent line */}
        <View style={[styles.accentLine, { backgroundColor: accent }]} />

        {/* Bill to / dates */}
        <View style={styles.twoCol}>
          <View>
            <Text style={styles.label}>Factuur aan</Text>
            <Text style={[styles.value, { fontFamily: 'Helvetica-Bold' }]}>{klant.bedrijfsnaam}</Text>
            {klant.contactpersoon ? <Text style={styles.value}>{klant.contactpersoon}</Text> : null}
            <Text style={styles.value}>{klant.adres.straat} {klant.adres.huisnummer}</Text>
            <Text style={styles.value}>{klant.adres.postcode} {klant.adres.stad}</Text>
            {klant.btwNummer ? <Text style={[styles.value, { color: '#6b7280' }]}>BTW: {klant.btwNummer}</Text> : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ marginBottom: 10, alignItems: 'flex-end' }}>
              <Text style={styles.label}>Factuurdatum</Text>
              <Text style={styles.value}>{formatDate(data.factuurdatum)}</Text>
            </View>
            <View style={{ marginBottom: 10, alignItems: 'flex-end' }}>
              <Text style={styles.label}>Vervaldatum</Text>
              <Text style={styles.value}>{formatDate(data.vervaldatum)}</Text>
            </View>
            {data.referentienummer ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Referentie</Text>
                <Text style={styles.value}>{data.referentienummer}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: accent }]}>
            <Text style={[styles.colDesc, { color: '#fff', fontFamily: 'Helvetica-Bold' }]}>Omschrijving</Text>
            <Text style={[styles.colQty, { color: '#fff', fontFamily: 'Helvetica-Bold' }]}>Aantal</Text>
            <Text style={[styles.colUnit, { color: '#fff', fontFamily: 'Helvetica-Bold' }]}>Eenheid</Text>
            <Text style={[styles.colPrice, { color: '#fff', fontFamily: 'Helvetica-Bold' }]}>Prijs</Text>
            <Text style={[styles.colBtw, { color: '#fff', fontFamily: 'Helvetica-Bold' }]}>BTW</Text>
            <Text style={[styles.colTotal, { color: '#fff', fontFamily: 'Helvetica-Bold' }]}>Totaal</Text>
          </View>
          {regels.map((regel) => (
            <View key={regel.id} style={styles.tableRow}>
              <Text style={styles.colDesc}>{regel.omschrijving}</Text>
              <Text style={styles.colQty}>{regel.aantal}</Text>
              <Text style={styles.colUnit}>{regel.eenheid}</Text>
              <Text style={styles.colPrice}>{formatCurrency(regel.prijsPerEenheid, valuta)}</Text>
              <Text style={styles.colBtw}>{regel.btwTarief}%</Text>
              <Text style={styles.colTotal}>{formatCurrency(regel.totaalInclBTW, valuta)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Subtotaal excl. BTW</Text>
              <Text>{formatCurrency(data.subtotaalExclBTW, valuta)}</Text>
            </View>
            {data.korting ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>
                  Korting {data.korting.type === 'percentage' ? `(${data.korting.waarde}%)` : ''}
                </Text>
                <Text style={{ color: '#16a34a' }}>
                  -{formatCurrency(
                    data.korting.type === 'percentage'
                      ? data.subtotaalExclBTW * (data.korting.waarde / 100)
                      : data.korting.waarde,
                    valuta
                  )}
                </Text>
              </View>
            ) : null}
            {data.btwSpecificaties.map((btw) => (
              <View key={btw.tarief} style={styles.totalsRow}>
                <Text style={styles.totalLabel}>BTW {btw.tarief}%</Text>
                <Text>{formatCurrency(btw.bedrag, valuta)}</Text>
              </View>
            ))}
            <View style={styles.totalsDivider} />
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Totaal incl. BTW</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(data.totaalInclBTW, valuta)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notities ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notities</Text>
            <Text style={{ lineHeight: 1.6 }}>{data.notities}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {bedrijf.kvkNummer ? `KVK: ${bedrijf.kvkNummer}` : ''}
            {bedrijf.kvkNummer && bedrijf.btwNummer ? '  ·  ' : ''}
            {bedrijf.btwNummer ? `BTW: ${bedrijf.btwNummer}` : ''}
          </Text>
          <Text style={styles.footerText}>
            {bedrijf.iban ? `IBAN: ${bedrijf.iban}` : ''}
            {bedrijf.iban && bedrijf.bic ? `  ·  BIC: ${bedrijf.bic}` : ''}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadFactuurPdf(data: FactuurData, nummer: string): Promise<void> {
  const accent = data.accentKleur || '#2563eb';
  const blob = await pdf(<FactuurPdf data={data} nummer={nummer} accent={accent} />).toBlob();
  downloadBlob(blob, `${nummer}.pdf`);
}

export function getFactuurMailtoLink(
  data: FactuurData,
  nummer: string,
  emailTemplate: { factuurOnderwerp: string; factuurBericht: string }
): string {
  const replace = (s: string) =>
    s
      .replace(/\{\{nummer\}\}/g, nummer)
      .replace(/\{\{bedrijf\}\}/g, data.bedrijf.naam)
      .replace(/\{\{contactpersoon\}\}/g, data.klant.contactpersoon || data.klant.bedrijfsnaam);

  return `mailto:${data.klant.email}?subject=${encodeURIComponent(replace(emailTemplate.factuurOnderwerp))}&body=${encodeURIComponent(replace(emailTemplate.factuurBericht))}`;
}
