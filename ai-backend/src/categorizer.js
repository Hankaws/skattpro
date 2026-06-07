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
  {
    pattern: /vipps.*bedrift|vipps.*betaling|bankaksjon/i,
    category: '3000',
    confidence: 0.85,
    explanation: 'Vipps payment typically sales revenue'
  },
  {
    pattern: /klarna|stripe|paypal/i,
    category: '3000',
    confidence: 0.80,
    explanation: 'Payment processor likely sales revenue'
  },
  {
    pattern: /apple store|app store|itunes/i,
    category: '5420',
    confidence: 0.88,
    explanation: 'Apple purchase likely computer equipment/software'
  },
  {
    pattern: /power|elkjøp|komplett|proshop/i,
    category: '5400',
    confidence: 0.85,
    explanation: 'Electronics retailer likely office equipment'
  },
  {
    pattern: /vinmonopolet|matbuy|meny|rema 1000|kiwi/i,
    category: '6290',
    confidence: 0.70,
    explanation: 'Grocery likely food for meetings (needs manual review)'
  },
  {
    pattern: /nsb|vy|flytoget|sasd|norwegian/i,
    category: '6400',
    confidence: 0.90,
    explanation: 'Transport company likely travel expense'
  },
  {
    pattern: /shell|ykk|espresso|circleg|bunker|okq8/i,
    category: '6470',
    confidence: 0.92,
    explanation: 'Gas station likely fuel expense'
  },
  {
    pattern: /hilton|scandic|choice|radisson|airbnb/i,
    category: '6400',
    confidence: 0.88,
    explanation: 'Hotel likely travel expense'
  },
  {
    pattern: /google.*ads|facebook.*ads|linkedin.*ads/i,
    category: '6200',
    confidence: 0.95,
    explanation: 'Ad platform definitely advertising'
  },
  {
    pattern: /aws|azure|heroku|vercel|netlify|digitalocean/i,
    category: '6210',
    confidence: 0.93,
    explanation: 'Cloud hosting definitely web hosting'
  },
  {
    pattern: /microsoft.*office|adobe.*creative|jetbrains|github/i,
    category: '5420',
    confidence: 0.90,
    explanation: 'Software subscription likely computer equipment'
  },
  {
    pattern: /nettbank|bank.*gebyr|rente/i,
    category: '8000',
    confidence: 0.95,
    explanation: 'Bank fee/interest definitely financial expense'
  },
  {
    pattern: /skatteetaten|altinn|brønnøysund/i,
    category: '6350',
    confidence: 0.98,
    explanation: 'Government agency definitely tax/fees'
  },
  {
    pattern: /vipps.*lønn|lønn|salary/i,
    category: '7100',
    confidence: 0.95,
    explanation: 'Salary payment definitely wage expense'
  },
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
    { id: '2', amount: -2499, description: 'KLARNA *APPLE STORE' },
    { id: '3', amount: -4999, description: 'POWER STAVANGER' },
    { id: '4', amount: -899, description: 'VY FLOGBANE' },
    { id: '5', amount: -450, description: 'SHELL DRIVE' },
    { id: '6', amount: -299, description: 'AWS EMESA' },
    { id: '7', amount: -1500, description: 'REMA 1000 MAT' },
    { id: '8', amount: -599, description: 'NETFLIX.COM' },
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