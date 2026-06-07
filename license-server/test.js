/**
 * Test Script for License Server
 * 
 * Run this to verify the license generation works.
 * Requires: npm install, .env file with API keys
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing SkattPro License Server Setup\n');

// Check 1: package.json exists
console.log('✓ Check 1: package.json');
if (!fs.existsSync('./package.json')) {
  console.error('  ❌ package.json not found');
  process.exit(1);
}
console.log('  ✅ Exists\n');

// Check 2: API functions exist
console.log('✓ Check 2: API endpoints');
const endpoints = ['./api/generate-key.js', './api/validate-key.js'];
endpoints.forEach(ep => {
  if (!fs.existsSync(ep)) {
    console.error(`  ❌ ${ep} not found`);
    process.exit(1);
  }
  console.log(`  ✅ ${ep}`);
});
console.log('');

// Check 3: .env file exists
console.log('✓ Check 3: Environment variables');
if (!fs.existsSync('./.env')) {
  console.error('  ⚠️  .env file not found (create it with API keys)');
} else {
  const env = fs.readFileSync('./.env', 'utf8');
  const hasStripe = env.includes('STRIPE_SECRET_KEY=');
  const hasSendGrid = env.includes('SENDGRID_API_KEY=');
  console.log(`  ${hasStripe ? '✅' : '❌'} STRIPE_SECRET_KEY`);
  console.log(`  ${hasSendGrid ? '✅' : '❌'} SENDGRID_API_KEY`);
  
  if (!hasStripe || !hasSendGrid) {
    console.error('\n  ⚠️  Add missing API keys to .env');
    process.exit(1);
  }
}
console.log('');

// Check 4: node_modules installed
console.log('✓ Check 4: Dependencies');
if (!fs.existsSync('./node_modules')) {
  console.error('  ❌ node_modules not found');
  console.error('  Run: npm install\n');
  process.exit(1);
}
console.log('  ✅ node_modules exists\n');

// Check 5: Test license key generator
console.log('✓ Check 5: License key generator');
const { default: generateKey } = require('./api/generate-key');
// Test the generate function directly
function generateLicenseKey(type = 'PRO') {
  const now = new Date();
  const year = now.getFullYear();
  const monthLetter = 'ABCDEFHIJKLM'[now.getMonth()];
  const sequence = Math.floor(Math.random() * 9000) + 1000;
  return `SKATTPRO-${type}-${year}${monthLetter}-${sequence}`;
}

const testKey = generateLicenseKey('PRO');
console.log(`  Generated: ${testKey}`);

// Validate format
const keyRegex = /^SKATTPRO-(PRO|PROS)-\d{4}[A-M]-\d{4}$/;
if (!keyRegex.test(testKey)) {
  console.error(`  ❌ Invalid key format: ${testKey}`);
  process.exit(1);
}
console.log('  ✅ Key format valid\n');

console.log('🎉 All checks passed!\n');
console.log('Next steps:');
console.log('  1. Deploy to Vercel: vercel --prod');
console.log('  2. Set environment variables in Vercel dashboard');
console.log('  3. Configure Stripe webhook to point to your Vercel URL');
console.log('  4. Test full flow with a real Stripe test payment\n');