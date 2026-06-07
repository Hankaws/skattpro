/**
 * Test script for SkattPro AI categorizer
 * Run: node test-categorizer.js
 */

const { categorizeBatch } = require('./src/categorizer');

console.log('🧪 SkattPro AI - Categorization Test Suite\n');

const testCases = [
  {
    name: 'High-confidence revenue',
    transactions: [
      { id: '1', amount: 15000, description: 'VIPPS BEDRIFT 123456789 KUNDE AS' }
    ],
    expectCategory: '3000',
    expectMinConfidence: 0.80
  },
  {
    name: 'High-confidence expense',
    transactions: [
      { id: '2', amount: -2499, description: 'KLARNA *APPLE STORE' }
    ],
    expectCategory: '5420',
    expectMinConfidence: 0.85
  },
  {
    name: 'Mixed batch',
    transactions: [
      { id: '3', amount: -899, description: 'VY FLOGBANE' },
      { id: '4', amount: -450, description: 'SHELL DRIVE' },
      { id: '5', amount: -299, description: 'AWS EMESA' }
    ],
    expectAutoRate: 0.80  // 80% should be auto-categorized
  },
  {
    name: 'Edge case: Unknown merchant',
    transactions: [
      { id: '6', amount: -1234, description: 'RANDOM STORE XYZ' }
    ],
    expectMinConfidence: 0.40,  // Should fallback with low confidence
    expectReview: true
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  console.log(`\n${idx + 1}. ${test.name}`);
  console.log('   ' + '─'.repeat(60));
  
  const results = categorizeBatch(test.transactions);
  
  if (test.expectCategory) {
    const match = results[0].account === test.expectCategory;
    if (match) {
      console.log(`   ✅ Category: ${test.expectCategory} ✓`);
      passed++;
    } else {
      console.log(`   ❌ Category: Expected ${test.expectCategory}, got ${results[0].account}`);
      failed++;
    }
  }
  
  if (test.expectMinConfidence) {
    const match = results[0].confidence >= test.expectMinConfidence;
    if (match) {
      console.log(`   ✅ Confidence: ${(results[0].confidence * 100).toFixed(0)}% >= ${(test.expectMinConfidence * 100).toFixed(0)}% ✓`);
      passed++;
    } else {
      console.log(`   ❌ Confidence: ${(results[0].confidence * 100).toFixed(0)}% < ${(test.expectMinConfidence * 100).toFixed(0)}%`);
      failed++;
    }
  }
  
  if (test.expectReview !== undefined) {
    const needsReview = results[0].confidence < 0.70;
    const match = needsReview === test.expectReview;
    if (match) {
      console.log(`   ✅ Review flag: ${needsReview ? 'Needs review' : 'Auto-approved'} ✓`);
      passed++;
    } else {
      console.log(`   ❌ Review flag: Expected ${test.expectReview ? 'needs review' : 'auto-approved'}`);
      failed++;
    }
  }
  
  if (test.expectAutoRate) {
    const autoCategorized = results.filter(r => r.confidence >= 0.85).length;
    const actualRate = autoCategorized / results.length;
    const match = actualRate >= test.expectAutoRate;
    if (match) {
      console.log(`   ✅ Auto-rate: ${(actualRate * 100).toFixed(0)}% >= ${(test.expectAutoRate * 100).toFixed(0)}% ✓`);
      passed++;
    } else {
      console.log(`   ❌ Auto-rate: ${(actualRate * 100).toFixed(0)}% < ${(test.expectAutoRate * 100).toFixed(0)}%`);
      failed++;
    }
  }
});

console.log('\n' + '═'.repeat(65));
console.log(`📊 Results: ${passed}/${passed + failed} tests passed (${((passed / (passed + failed)) * 100).toFixed(0)}%)`);
console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed}`);
console.log('═'.repeat(65) + '\n');

if (failed > 0) {
  process.exit(1);
}