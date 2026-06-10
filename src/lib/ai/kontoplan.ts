/**
 * SkattPro - Norwegian Standard Kontoplan (for ENK / small companies)
 * Based on standard Norwegian chart of accounts + common practice.
 * Used for auto-categorization, VAT defaulting, and reports.
 */

export type AccountType = 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';

export interface KontoplanEntry {
  code: string;
  name: string;
  type: AccountType;
  vatDefault: string | null; // H1=25% outgoing, H0=0% export, F=free, I=non-deductible, K=capital etc.
  description?: string;
}

export const KONTOPLAN: Record<string, KontoplanEntry> = {
  // === INNTEKTER / REVENUE (3xxx) ===
  '3000': { code: '3000', name: 'Salgsinntekt varer', type: 'revenue', vatDefault: 'H1', description: 'Salg av varer (25% MVA)' },
  '3010': { code: '3010', name: 'Salgsinntekt tjenester', type: 'revenue', vatDefault: 'H1', description: 'Salg av tjenester (25% MVA)' },
  '3040': { code: '3040', name: 'Salgsinntekt eksport', type: 'revenue', vatDefault: 'H0', description: 'Eksport (0% MVA)' },
  '3090': { code: '3090', name: 'Annen salgsinntekt', type: 'revenue', vatDefault: 'H1' },

  // === VAREKOSTNADER (5xxx) ===
  '5050': { code: '5050', name: 'Varekjøp', type: 'expense', vatDefault: 'H1' },

  // === DRIFTSKOSTNADER (54xx - 64xx) ===
  '5400': { code: '5400', name: 'Kontorutstyr', type: 'expense', vatDefault: 'H1' },
  '5420': { code: '5420', name: 'Datautstyr og programvare', type: 'expense', vatDefault: 'H1' },
  '5440': { code: '5440', name: 'Litteratur og fagtidsskrifter', type: 'expense', vatDefault: 'H1' },

  '6050': { code: '6050', name: 'Husleie', type: 'expense', vatDefault: 'I' },
  '6100': { code: '6100', name: 'Strøm og oppvarming', type: 'expense', vatDefault: 'H1' },
  '6110': { code: '6110', name: 'Telefon, internett og porto', type: 'expense', vatDefault: 'H1' },
  '6130': { code: '6130', name: 'EDB-utgifter / IT-tjenester', type: 'expense', vatDefault: 'H1' },
  '6190': { code: '6190', name: 'Kontorrekvisita og forsikring', type: 'expense', vatDefault: 'H1' },

  '6200': { code: '6200', name: 'Reklame og annonsering', type: 'expense', vatDefault: 'H1' },
  '6210': { code: '6210', name: 'Webutvikling, hosting og domener', type: 'expense', vatDefault: 'H1' },
  '6290': { code: '6290', name: 'Møter, representasjon og bevertning', type: 'expense', vatDefault: 'F' },

  '6300': { code: '6300', name: 'Kontingenter og medlemskap', type: 'expense', vatDefault: 'F' },
  '6350': { code: '6350', name: 'Trygdeavgift og offentlige avgifter', type: 'expense', vatDefault: 'I' },

  '6400': { code: '6400', name: 'Reise og diett', type: 'expense', vatDefault: 'F' },
  '6450': { code: '6450', name: 'Bil og transport (ekskl. drivstoff)', type: 'expense', vatDefault: 'H1' },
  '6470': { code: '6470', name: 'Drivstoff', type: 'expense', vatDefault: 'H1' },

  '7100': { code: '7100', name: 'Lønnskostnader', type: 'expense', vatDefault: 'I' },

  // === FINANS (8xxx) ===
  '8000': { code: '8000', name: 'Finanskostnader (renter, gebyrer)', type: 'expense', vatDefault: 'I' },

  // === BALANSEKONTOER (eksempler) ===
  '1240': { code: '1240', name: 'Kundefordringer', type: 'asset', vatDefault: null },
  '1400': { code: '1400', name: 'Bankinnskudd', type: 'asset', vatDefault: null },
  '1920': { code: '1920', name: 'Merverdiavgift (skyldig)', type: 'liability', vatDefault: null },
};

// Helper: Get nice display name + VAT suggestion
export function getKontoplanInfo(code: string) {
  return KONTOPLAN[code] || { code, name: 'Ukjent konto', type: 'expense' as const, vatDefault: 'H1' as string | null };
}

// Common revenue / expense lists for UI selects
export const REVENUE_CODES = Object.values(KONTOPLAN).filter(e => e.type === 'revenue');
export const EXPENSE_CODES = Object.values(KONTOPLAN).filter(e => e.type === 'expense');
