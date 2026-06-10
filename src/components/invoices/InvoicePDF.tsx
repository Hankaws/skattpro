import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Inter font if possible, fallback to Helvetica for PDF
// For simplicity, use built-in fonts. In prod you can load custom.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  companyInfo: {
    fontSize: 9,
    color: '#475569',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0f172a',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'right' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    color: '#475569',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    fontSize: 9,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  norwegianNote: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 20,
  },
});

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  customerOrgNr?: string;
  description: string;
  amountExVat: number;
  vatRate: number;
  total: number;
  sellerName?: string;
  sellerOrgNr?: string;
}

export const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  const vatAmount = Math.round(data.amountExVat * (data.vatRate / 100));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SkattPro</Text>
            <Text style={styles.companyInfo}>Regnskap som holder deg i forkanten</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.companyInfo}>Demo AS</Text>
            <Text style={styles.companyInfo}>Org.nr: 987 654 321</Text>
            <Text style={styles.companyInfo}>Oslo, Norge</Text>
          </View>
        </View>

        <Text style={styles.title}>FAKTURA</Text>

        {/* Invoice meta */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={styles.section}>
            <Text style={styles.label}>Fakturanummer</Text>
            <Text style={styles.value}>{data.invoiceNumber}</Text>
            <Text style={styles.label}>Utstedelsesdato</Text>
            <Text style={styles.value}>{data.issueDate}</Text>
            <Text style={styles.label}>Forfallsdato</Text>
            <Text style={styles.value}>{data.dueDate}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Kunde</Text>
            <Text style={styles.value}>{data.customerName}</Text>
            {data.customerEmail && <Text style={styles.value}>{data.customerEmail}</Text>}
            {data.customerOrgNr && <Text style={styles.value}>Org.nr: {data.customerOrgNr}</Text>}
          </View>
        </View>

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Beskrivelse</Text>
            <Text style={styles.colQty}>Antall</Text>
            <Text style={styles.colPrice}>Pris</Text>
            <Text style={styles.colTotal}>Beløp</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>{data.description}</Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colPrice}>{data.amountExVat.toLocaleString('nb-NO')} kr</Text>
            <Text style={styles.colTotal}>{data.amountExVat.toLocaleString('nb-NO')} kr</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sum eks. MVA</Text>
            <Text style={styles.totalValue}>{data.amountExVat.toLocaleString('nb-NO')} kr</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MVA ({data.vatRate}%)</Text>
            <Text style={styles.totalValue}>{vatAmount.toLocaleString('nb-NO')} kr</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#0f172a', paddingTop: 4 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Å betale</Text>
            <Text style={[styles.totalValue, { fontWeight: 'bold', fontSize: 13 }]}>{data.total.toLocaleString('nb-NO')} kr</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Betales til konto: 1234 56 78901</Text>
          <Text>KID: 1234567890123456</Text>
          <Text style={styles.norwegianNote}>
            MVA-registrert. Alle beløp i NOK. Ved forsinket betaling påløper lovbestemte renter.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
