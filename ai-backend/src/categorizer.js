/**
 * SkattPro AI - Transaction Categorizer
 * 
 * Phase 1: Rule-based prototype (Week 1-2)
 * Phase 2: LLM-powered (Week 3-4)
 * Phase 3: Fine-tuned model (Week 5-8)
 */

// Norwegian accounting categories (Standard contoplan for ENK)
const CATEGORIES = {
  // Revenue
  '3000': { name: 'Salgsinntekt varer', type: 'revenue', vat_default: 'H1' },
  '3010': { name: 'Salgsinntekt tjenester', type: 'revenue', vat_default: 'H1' },
  '3040': { name: 'Salgsinntekt eksport', type: 'revenue', vat_default: 'H0' },
  
  // Operating expenses
  '5050': { name: 'Varekjøp', type: 'expense', vat_default: 'H1' },
  '5400': { name: 'Kontorutstyr', type: 'expense', vat_default: 'H1' },
  '5420': { name: 'Datautstyr', type: 'expense', vat_default: 'H1' },
  '5440': { name: 'Litteratur og fagtidsskrifter', type: 'expense', vat_default: 'H1' },
  '6050': { name: 'Husleie', type: 'expense', vat_default: 'I' },
  '6100': { name: 'Strøm', type: 'expense', vat_default: 'H1' },
  '6110': { name: 'Telefon og porto', type: 'expense', vat_default: 'H1' },
  '6130': { name: 'Edb-utgifter', type: 'expense', vat_default: 'H1' },
  '6190': { name: 'Kontorrekvisita', type: 'expense', vat_default: 'H1' },
  '6200': { name: 'Reklame og annonsering', type: 'expense', vat_default: 'H1' },
  '6210': { name: 'Webutvikling og hosting', type: 'expense', vat_default: 'H1' },
  '6290': { name: 'Møter og representasjon', type: 'expense', vat_default: 'F' },
  '6300': { name: 'Kontingenter', type: 'expense', vat_default: 'F' },
  '6350': { name: 'Trygdeavgift', type: 'expense', vat_default: 'I' },
  '6400': { name: 'Reise og diett', type: 'expense', vat_default: 'F' },
  '6450': { name: 'Bil og transport', type: 'expense', vat_default: 'H1' },
  '6470': { name: 'Drivstoff', type: 'expense', vat_default: 'H1' },
  '7100': { name: 'Lønnskostnader', type: 'expense', vat_default: 'I' },
  '8000': { name: 'Finanskostnader', type: 'expense', vat_default: 'I' },
  
  // Assets
  '1240': { name: 'Kundefordringer', type: 'asset' },
  '1400': { name: 'Bankinnskudd', type: 'asset' },
  '1920': { name: 'Merverdiavgift', type: 'liability' },
};

// Rule-based categorization (Phase 1)
// Will be replaced by LLM in Phase 2
const RULES = [
  // === REVENUE (3xxx) ===
  {
    pattern: /vipps.*bedrift|vipps.*betaling|bankaksjon|inngående betaling/i,
    category: '3000',
    confidence: 0.88,
    explanation: 'Vipps Bedrift payment is sales revenue'
  },
  {
    pattern: /vipps.*[0-9]{9}|vipps.*payment/i,
    category: '3010',
    confidence: 0.85,
    explanation: 'Vipps payment likely service revenue'
  },
  {
    pattern: /klarna.*merchant|stripe.*payment|paypal.*payment/i,
    category: '3000',
    confidence: 0.82,
    explanation: 'Payment processor settlement is sales revenue'
  },
  {
    pattern: /faktura.*betaling|invoice.*payment|banktransfer.*from/i,
    category: '3000',
    confidence: 0.80,
    explanation: 'Bank transfer from customer is sales revenue'
  },
  
  // === OFFICE & IT (54xx) ===
  {
    pattern: /apple store|app store|itunes|apple\.com/i,
    category: '5420',
    confidence: 0.90,
    explanation: 'Apple purchase is computer equipment/software'
  },
  {
    pattern: /power|elkjøp|komplett|proshop|thansen|låsåsen/i,
    category: '5400',
    confidence: 0.87,
    explanation: 'Electronics retailer is office equipment'
  },
  {
    pattern: /microsoft.*office|office.*365|adobe.*creative|adobe.*cloud|jetbrains|github.*copilot/i,
    category: '5420',
    confidence: 0.92,
    explanation: 'Software subscription is computer equipment/software'
  },
  {
    pattern: /google.*workspace|dropbox.*business|slack.*technologies|zoom.*video|teams.*microsoft/i,
    category: '5420',
    confidence: 0.88,
    explanation: 'SaaS subscription is computer software'
  },
  {
    pattern: /bokhandel|akademika|adlibris|Møllerpris|gavekort.*bok/i,
    category: '5440',
    confidence: 0.85,
    explanation: 'Book purchase is literature/professional materials'
  },
  {
    pattern: /gaver.*kunde|blomster.*kunde|champagne.*representasjon/i,
    category: '6290',
    confidence: 0.75,
    explanation: 'Client gift is entertainment/representation'
  },
  
  // === WEB & CLOUD (62xx) ===
  {
    pattern: /aws.*emea|amazon.*web.*services|lambda|s3.*storage/i,
    category: '6210',
    confidence: 0.95,
    explanation: 'AWS is web hosting/cloud infrastructure'
  },
  {
    pattern: /azure.*microsoft|heroku.*salesforce|digitalocean.*com/i,
    category: '6210',
    confidence: 0.93,
    explanation: 'Cloud provider is web hosting'
  },
  {
    pattern: /vercel.*inc|netlify.*inc|cloudflare.*inc|iis.*server/i,
    category: '6210',
    confidence: 0.94,
    explanation: 'Hosting platform is web hosting expense'
  },
  {
    pattern: /gandi.*net|namecheap.*com|godaddy.*com|domain.*no|iwww.*no/i,
    category: '6210',
    confidence: 0.90,
    explanation: 'Domain registrar is web hosting expense'
  },
  {
    pattern: /google.*ads|facebook.*ads|linkedin.*ads|tiktok.*for.*business/i,
    category: '6200',
    confidence: 0.96,
    explanation: 'Ad platform is advertising expense'
  },
  {
    pattern: /canva.*pro|figma.*design|sketch.*app|invision.*app/i,
    category: '6200',
    confidence: 0.85,
    explanation: 'Design tool is marketing/advertising expense'
  },
  
  // === TRAVEL & TRANSPORT (64xx) ===
  {
    pattern: /vy\b|vy.*tog|nsb.*as|flytoget.*as/i,
    category: '6400',
    confidence: 0.90,
    explanation: 'Vy/NSB train service is travel expense'
  },
  {
    pattern: /sas.*skandinaviska|norwegian.*air|wizz.*air|ryanair.*dac/i,
    category: '6400',
    confidence: 0.93,
    explanation: 'Airline is travel expense'
  },
  {
    pattern: /hilton.*hotels|scandic.*hotels|choice.*hotels|radisson.*hospitality|thon.*hotels/i,
    category: '6400',
    confidence: 0.90,
    explanation: 'Hotel is travel expense'
  },
  {
    pattern: /airbnb.*payment|booking.*com|hotels.*com/i,
    category: '6400',
    confidence: 0.88,
    explanation: 'Accommodation booking is travel expense'
  },
  {
    pattern: /\bshell\b.*driv|ykk.*energi|espresso.*drivt|circle.*k|bunker.*holding|okq8.*norge|shell.*stasjon/i,
    category: '6470',
    confidence: 0.92,
    explanation: 'Gas station is fuel expense'
  },
  {
    pattern: /parkering.*as|easy.*park|zep.*parking|park4night/i,
    category: '6450',
    confidence: 0.88,
    explanation: 'Parking service is car/transport expense'
  },
  {
    pattern: /bompenger.*oslo|autostart.*dk|flegstad.*autostart/i,
    category: '6450',
    confidence: 0.90,
    explanation: 'Toll road payment is transport expense'
  },
  {
    pattern: /uber.*technologies|bolt.*technology|kabuki.*taxify/i,
    category: '6400',
    confidence: 0.85,
    explanation: 'Ride-sharing is travel expense'
  },
  
  // === FOOD & ENTERTAINMENT (6290/6400) ===
  {
    pattern: /norgesgruppen.*meny|coop.*norges|remagraph.*rema|kiwi.*butikk/i,
    category: '6290',
    confidence: 0.70,
    explanation: 'Grocery store likely food for meetings (review needed)'
  },
  {
    pattern: /restaurant.*besøk|utested.*servering|bar.*restaurant|kafé.*besøk/i,
    category: '6290',
    confidence: 0.80,
    explanation: 'Restaurant visit is entertainment/representation'
  },
  {
    pattern: /pizza.*hut|domino.*pizza|foodora.*delivery|wolt.*oga/i,
    category: '6290',
    confidence: 0.75,
    explanation: 'Food delivery likely business meal (review needed)'
  },
  {
    pattern: /vinmonopolet.*butikk|alkohol.*salg/i,
    category: '6290',
    confidence: 0.65,
    explanation: 'Alcohol purchase needs manual review (likely entertainment)'
  },
  
  // === FINANCIAL (8xxx) ===
  {
    pattern: /dnb.*bank.*gebyr|nordea.*gebyr|vipps.*gebyr|spleis.*gebyr/i,
    category: '8000',
    confidence: 0.96,
    explanation: 'Bank fee is financial expense'
  },
  {
    pattern: /rente.*bank|rente.*lån|rent.*expense/i,
    category: '8000',
    confidence: 0.98,
    explanation: 'Interest expense is financial cost'
  },
  {
    pattern: /valuta.*tap|fx.*loss|kurs.*tap/i,
    category: '8000',
    confidence: 0.90,
    explanation: 'Currency loss is financial expense'
  },
  
  // === TAXES & FEES (63xx) ===
  {
    pattern: /skatteetaten.*betaling|altinn.*avgift|brønnøysund.*register/i,
    category: '6350',
    confidence: 0.98,
    explanation: 'Government agency is tax/fee expense'
  },
  {
    pattern: /nav.*arbeidsgiver.*avgift|trygde.*avgift/i,
    category: '6350',
    confidence: 0.97,
    explanation: 'NAV payment is social security tax'
  },
  {
    pattern: /kommune.*eiendomsskatt|eiendom.*skatt|formue.*skatt/i,
    category: '6350',
    confidence: 0.95,
    explanation: 'Property/wealth tax is tax expense'
  },
  
  // === INSURANCE (6190/8000) ===
  {
    pattern: /if.*skadeforsikring|gjengjelder.*forsikring|dnb.*forsikring|codan.*forsikring/i,
    category: '6190',
    confidence: 0.88,
    explanation: 'Business insurance is office expense'
  },
  {
    pattern: /a.*ss.*arbeidsskade|yrkesskade.*forsikring/i,
    category: '6190',
    confidence: 0.92,
    explanation: 'Workers compensation insurance is office expense'
  },
  
  // === PROFESSIONAL SERVICES (6190/6300) ===
  {
    pattern: /revisor.*honorar|regnskap.*byrå|Økonomi.*konsulent/i,
    category: '6190',
    confidence: 0.95,
    explanation: 'Accountant/auditor is professional service'
  },
  {
    pattern: /advokat.*honorar|juridisk.*rådgivning|rette.*gebyr/i,
    category: '6190',
    confidence: 0.93,
    explanation: 'Legal services is professional service'
  },
  {
    pattern: /nho.*kontigent|virke.*medlemskap|ks.*bedrift/i,
    category: '6300',
    confidence: 0.90,
    explanation: 'Industry association is membership fee'
  },
  
  // === PAYROLL (7100) ===
  {
    pattern: /lønn.*utbetaling|salary.*payment|wage.*payment/i,
    category: '7100',
    confidence: 0.97,
    explanation: 'Salary payment is wage expense'
  },
  {
    pattern: /feriepenger.*utbetaling|bonus.*ansatt|provisjon.*lønn/i,
    category: '7100',
    confidence: 0.94,
    explanation: 'Holiday pay/bonus is wage expense'
  },
  
  // === UNKNOWN FALLBACKS ===
  {
    pattern: /ukjent.*transaksjon|unknown.*transaction|gebyr.*ukjent/i,
    category: '6190',
    confidence: 0.40,
    explanation: 'Unknown transaction - needs manual categorization'
  }
];

/**
 * Categorize a single transaction
 * @param {Object} txn - Transaction object
 * @returns {Object} Categorization result
 */
function categorizeTransaction(txn) {
  const description = `${txn.description || ''} ${txn.merchant || ''}`.trim();
  const amount = txn.amount || 0;
  
  // Determine if revenue or expense based on amount sign
  const isRevenue = amount > 0;
  
  // Try rule-based matching
  for (const rule of RULES) {
    if (rule.pattern.test(description)) {
      const category = CATEGORIES[rule.category];
      return {
        id: txn.id,
        category: category.name,
        account: rule.category,
        confidence: rule.confidence,
        vat_code: category.vat_default || 'H1',
        explanation: rule.explanation,
        method: 'rule-based'
      };
    }
  }
  
  // Fallback heuristics
  if (isRevenue) {
    return {
      id: txn.id,
      category: 'Salgsinntekt varer',
      account: '3000',
      confidence: 0.60,
      vat_code: 'H1',
      explanation: 'Positive amount assumed to be revenue (low confidence - needs review)',
      method: 'heuristic'
    };
  }
  
  // Default to office supplies for expenses
  return {
    id: txn.id,
    category: 'Kontorutstyr',
    account: '5400',
    confidence: 0.50,
    vat_code: 'H1',
    explanation: 'Unknown expense categorized as office supplies (needs manual review)',
    method: 'fallback'
  };
}

/**
 * Batch categorize transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of categorization results
 */
function categorizeBatch(transactions) {
  return transactions.map(categorizeTransaction);
}

// Export for use in server
module.exports = { categorizeTransaction, categorizeBatch, CATEGORIES, RULES };

// Demo if run directly
if (require.main === module) {
  console.log('🎯 SkattPro AI Categorizer - Demo\n');
  
  const testTransactions = [
    { id: '1', amount: 15000, description: 'VIPPS BEDRIFT 123456789 KUNDE AS' },
    { id: '2', amount: -2499, description: 'KLARNA APPLE STORE' },
    { id: '3', amount: -4999, description: 'POWER STAVANGER' },
    { id: '4', amount: -899, description: 'VY FLOGBANE' },
    { id: '5', amount: -450, description: 'SHELL DRIVE STAVANGER' },
    { id: '6', amount: -299, description: 'AWS EMEA LUXEMBOURG' },
    { id: '7', amount: -1500, description: 'MENY STAVANGER' },
    { id: '8', amount: -599, description: 'GOOGLE WORKSPACE' },
  ];
  
  const results = categorizeBatch(testTransactions);
  
  console.log('┌─────────────────────────────────────────────────────────────────────┐');
  results.forEach(r => {
    const confidenceEmoji = r.confidence >= 0.9 ? '✅' : r.confidence >= 0.7 ? '⚠️' : '❓';
    console.log(`│ ${confidenceEmoji} ${r.account.padEnd(4)} | ${r.category.padEnd(35)} | ${(r.confidence * 100).toFixed(0).padEnd(3)}% │`);
    console.log(`│    └─ ${r.explanation.slice(0, 68).padEnd(68)} │`);
  });
  console.log('└─────────────────────────────────────────────────────────────────────┘');
  
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const highConfidence = results.filter(r => r.confidence >= 0.85).length;
  
  console.log(`\n📊 Stats: ${results.length} transactions | Avg confidence: ${(avgConfidence * 100).toFixed(1)}% | Auto-categorized: ${highConfidence}/${results.length} (${(highConfidence/results.length*100).toFixed(0)}%)`);
}