/**
 * SkattPro - Forskuddsskatt Calculator
 * 
 * Calculates advance tax payments for Norwegian ENK (sole proprietorship)
 * 
 * Rules (2026):
 * - 4 quarterly payments: March 15, May 15, September 15, November 15
 * - Based on previous year's income or estimated current year
 * - Interest if underpaid (3.5% p.a.)
 * - Refund if overpaid
 */

/**
 * Calculate forskuddsskatt for ENK
 * @param {Object} params
 * @param {number} params.income - Expected annual business income (before tax)
 * @param {number} params.expenses - Expected annual business expenses
 * @param {number} params.personalIncome - Other personal income (salary, etc.)
 * @param {boolean} params.isOslo - True if living in Oslo (different rates)
 * @returns {Object} Tax calculation breakdown
 */
function calculateForskuddsskatt({
  income,
  expenses,
  personalIncome = 0,
  isOslo = true
}) {
  // Step 1: Calculate business profit
  const businessProfit = income - expenses;
  
  // Step 2: Calculate personal taxable income
  const taxableIncome = businessProfit + personalIncome;
  
  // Step 3: Calculate tax (2026 rates)
  const tax = calculateIncomeTax(taxableIncome, isOslo);
  
  // Step 4: Calculate self-employment tax (trygdeavgift)
  const selfEmploymentTax = calculateTrygdeavgift(businessProfit);
  
  // Step 5: Total annual tax
  const totalAnnualTax = tax.total + selfEmploymentTax;
  
  // Step 6: Quarterly payments
  const quarterlyPayment = Math.round(totalAnnualTax / 4);
  
  // Step 7: Payment schedule
  const schedule = [
    { date: '2026-03-15', amount: quarterlyPayment, quarter: 'Q1' },
    { date: '2026-05-15', amount: quarterlyPayment, quarter: 'Q2' },
    { date: '2026-09-15', amount: quarterlyPayment, quarter: 'Q3' },
    { date: '2026-11-15', amount: quarterlyPayment, quarter: 'Q4' },
  ];
  
  return {
    businessProfit,
    taxableIncome,
    tax,
    selfEmploymentTax,
    totalAnnualTax,
    quarterlyPayment,
    schedule,
    monthlyEquivalent: Math.round(totalAnnualTax / 12)
  };
}

/**
 * Calculate Norwegian income tax (2026 rates)
 */
function calculateIncomeTax(income, isOslo) {
  // Personal deduction (minimum 46% of income, max 103,750 kr in 2026)
  const personalDeductionRate = 0.46;
  const maxPersonalDeduction = 103750;
  const personalDeduction = Math.min(
    income * personalDeductionRate,
    maxPersonalDeduction
  );
  
  // Taxable income after personal deduction
  const ordinaryIncome = Math.max(0, income - personalDeduction);
  
  // Base tax (22% flat)
  const baseTax = ordinaryIncome * 0.22;
  
  // Progressive tax brackets (2026, estimated)
  const brackets = isOslo ? [
    { threshold: 205000, rate: 0.174 },
    { threshold: 280000, rate: 0.207 },
    { threshold: 360000, rate: 0.237 },
    { threshold: 440000, rate: 0.267 },
    { threshold: 660000, rate: 0.167 }  // Top bracket
  ] : [
    { threshold: 195000, rate: 0.174 },
    { threshold: 265000, rate: 0.207 },
    { threshold: 340000, rate: 0.237 },
    { threshold: 415000, rate: 0.267 },
    { threshold: 625000, rate: 0.167 }
  ];
  
  let progressiveTax = 0;
  let remainingIncome = ordinaryIncome;
  
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const nextThreshold = brackets[i + 1]?.threshold || Infinity;
    const bracketIncome = Math.min(
      remainingIncome - bracket.threshold,
      nextThreshold - bracket.threshold
    );
    
    if (bracketIncome > 0) {
      progressiveTax += bracketIncome * bracket.rate;
    }
  }
  
  const totalTax = baseTax + progressiveTax;
  
  return {
    ordinaryIncome,
    personalDeduction,
    baseTax: Math.round(baseTax),
    progressiveTax: Math.round(progressiveTax),
    total: Math.round(totalTax),
    effectiveRate: income > 0 ? (totalTax / income * 100) : 0
  };
}

/**
 * Calculate trygdeavgift (social security contribution)
 * Rate: 23.3% for self-employed (2026)
 */
function calculateTrygdeavgift(profit) {
  const rate = 0.233;
  return Math.round(profit * rate);
}

/**
 * Calculate interest on underpayment/overpayment
 */
function calculateInterest(amount, days, isUnderpayment = true) {
  const rate = isUnderpayment ? 0.035 : 0.025;  // 3.5% under, 2.5% over
  const dailyRate = rate / 365;
  return Math.round(amount * dailyRate * days);
}

module.exports = {
  calculateForskuddsskatt,
  calculateIncomeTax,
  calculateTrygdeavgift,
  calculateInterest
};

// Demo if run directly
if (require.main === module) {
  console.log('🧮 SkattPro - Forskuddsskatt Calculator Demo\n');
  
  const example = {
    income: 600000,      // 600k revenue
    expenses: 150000,    // 150k expenses
    personalIncome: 0,   // No other income
    isOslo: true
  };
  
  const result = calculateForskuddsskatt(example);
  
  console.log('💼 Business:');
  console.log(`   Revenue: ${example.income.toLocaleString('no-NO')} kr`);
  console.log(`   Expenses: ${example.expenses.toLocaleString('no-NO')} kr`);
  console.log(`   Profit: ${result.businessProfit.toLocaleString('no-NO')} kr`);
  console.log('');
  
  console.log('💰 Tax Breakdown:');
  console.log(`   Ordinary Income: ${result.tax.ordinaryIncome.toLocaleString('no-NO')} kr`);
  console.log(`   Personal Deduction: ${result.tax.personalDeduction.toLocaleString('no-NO')} kr`);
  console.log(`   Base Tax (22%): ${result.tax.baseTax.toLocaleString('no-NO')} kr`);
  console.log(`   Progressive Tax: ${result.tax.progressiveTax.toLocaleString('no-NO')} kr`);
  console.log(`   Income Tax Total: ${result.tax.total.toLocaleString('no-NO')} kr`);
  console.log(`   Trygdeavgift (23.3%): ${result.selfEmploymentTax.toLocaleString('no-NO')} kr`);
  console.log('');
  
  console.log('📅 Payment Schedule:');
  console.log(`   Total Annual Tax: ${result.totalAnnualTax.toLocaleString('no-NO')} kr`);
  console.log(`   Quarterly Payment: ${result.quarterlyPayment.toLocaleString('no-NO')} kr`);
  console.log(`   Monthly Equivalent: ${result.monthlyEquivalent.toLocaleString('no-NO')} kr`);
  console.log('');
  
  result.schedule.forEach(p => {
    console.log(`   ${p.date} (${p.quarter}): ${p.amount.toLocaleString('no-NO')} kr`);
  });
  
  console.log('');
  console.log(`   Effective Tax Rate: ${result.tax.effectiveRate.toFixed(1)}%`);
}