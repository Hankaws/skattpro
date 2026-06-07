/**
 * SkattPro AI - Receipt OCR Processor
 * 
 * Extracts structured data from receipt images using Tesseract.js
 * 
 * Features:
 * - Norwegian receipt parsing
 * - VAT detection
 * - Merchant identification
 * - Date/amount extraction
 * - Auto-categorization
 */

const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Parse receipt image and extract transaction data
 * @param {string} imagePath - Path to receipt image
 * @returns {Promise<Object>} Extracted transaction data
 */
async function parseReceipt(imagePath) {
  console.log(`📷 Parsing receipt: ${imagePath}`);
  
  try {
    // Step 1: OCR with Tesseract
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'nor+eng',  // Norwegian + English
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`   OCR progress: ${(m.progress * 100).toFixed(0)}%`);
          }
        }
      }
    );
    
    console.log('   ✓ OCR complete');
    
    // Step 2: Extract structured data
    const extracted = extractReceiptData(text);
    
    return {
      success: true,
      text,
      ...extracted
    };
  } catch (error) {
    console.error('❌ Receipt parsing failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract structured data from OCR text
 */
function extractReceiptData(text) {
  const lines = text.split('\n');
  
  // Extract merchant (usually first few lines)
  const merchant = extractMerchant(lines);
  
  // Extract date
  const date = extractDate(text);
  
  // Extract total amount
  const amount = extractAmount(text);
  
  // Extract VAT
  const vat = extractVAT(text);
  
  // Suggest category based on merchant
  const category = suggestCategory(merchant, text);
  
  return {
    merchant,
    date,
    amount,
    vat,
    category,
    confidence: calculateConfidence(merchant, date, amount)
  };
}

/**
 * Extract merchant name from receipt
 */
function extractMerchant(lines) {
  // First 1-3 lines usually contain merchant name
  const candidateLines = lines.slice(0, 5).filter(line => {
    return line.length > 3 && line.length < 50 && /\S/.test(line);
  });
  
  return candidateLines[0] || 'Ukjent';
}

/**
 * Extract date from receipt text
 */
function extractDate(text) {
  // Norwegian date formats: DD.MM.YYYY, DD.MM.YY, DD/MM/YYYY
  const datePatterns = [
    /(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})/,  // DD.MM.YYYY
    /(\d{2})[.\-\/](\d{2})[.\-\/](\d{2})/,   // DD.MM.YY
    /(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/,  // YYYY.MM.DD
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Normalize to YYYY-MM-DD
      let year = match[3];
      if (year.length === 2) {
        year = '20' + year;
      }
      return `${year}-${match[2]}-${match[1]}`;
    }
  }
  
  return null;
}

/**
 * Extract total amount from receipt
 */
function extractAmount(text) {
  // Look for TOTAL, SUM, or total amount patterns
  const totalPatterns = [
    /TOTAL[:\s]*([\d\s,\.]+)/i,
    /SUM[:\s]*([\d\s,\.]+)/i,
    /BELØP[:\s]*([\d\s,\.]+)/i,
    /Å BETALE[:\s]*([\d\s,\.]+)/i,
    /TOTALT[:\s]*([\d\s,\.]+)/i,
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/\s/g, '').replace(',', '.');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) {
        return -amount;  // Expenses are negative
      }
    }
  }
  
  // Fallback: look for largest number on receipt (often the total)
  const numbers = text.match(/[\d,\.]+/g);
  if (numbers) {
    const amounts = numbers.map(n => parseFloat(n.replace(',', '.'))).filter(n => !isNaN(n));
    const maxAmount = Math.max(...amounts);
    if (maxAmount > 0) {
      return -maxAmount;
    }
  }
  
  return null;
}

/**
 * Extract VAT amount/percentage
 */
function extractVAT(text) {
  // Look for VAT/MVA patterns
  const vatPatterns = [
    /MVA[:\s]*([\d\s,\.]+)/i,
    /VAT[:\s]*([\d\s,\.]+)/i,
    /MERVERDIAVGIFT[:\s]*([\d\s,\.]+)/i,
  ];
  
  for (const pattern of vatPatterns) {
    const match = text.match(pattern);
    if (match) {
      const vatStr = match[1].replace(/\s/g, '').replace(',', '.');
      return parseFloat(vatStr);
    }
  }
  
  // Check for VAT rate (25%, 15%, etc.)
  const rateMatch = text.match(/(\d{2})\s*%/);
  if (rateMatch) {
    return parseInt(rateMatch[1]);
  }
  
  return null;
}

/**
 * Suggest accounting category based on merchant and text
 */
function suggestCategory(merchant, text) {
  const lowerText = (merchant + ' ' + text).toLowerCase();
  
  // Rule-based category suggestion
  const categoryRules = [
    { pattern: /mat|matbutikk|meny|rema|kiwi|coop|.xxx|grocery/i, category: '6290', name: 'Møter og representasjon', confidence: 0.60 },
    { pattern: /bensin|drivstoff|shell|ykk|circle k|stasjon/i, category: '6470', name: 'Drivstoff', confidence: 0.85 },
    { pattern: /restaurant|kafé|cafe|utested|bar|pizza/i, category: '6290', name: 'Møter og representasjon', confidence: 0.75 },
    { pattern: /hotell|scandic|hilton|choice|thon|airbnb/i, category: '6400', name: 'Reise og diett', confidence: 0.85 },
    { pattern: /fly|flyreise|sas|norwegian|wizz|flytoget|vy|tog/i, category: '6400', name: 'Reise og diett', confidence: 0.90 },
    { pattern: /kontor|skrivebord|stol|lampe|butikk|ikea/i, category: '5400', name: 'Kontorutstyr', confidence: 0.75 },
    { pattern: /data|pc|laptop|apple|microsoft|software/i, category: '5420', name: 'Datautstyr', confidence: 0.85 },
    { pattern: /bok|bokhandel|akademika|adlibris/i, category: '5440', name: 'Litteratur og fagtidsskrifter', confidence: 0.80 },
  ];
  
  for (const rule of categoryRules) {
    if (rule.pattern.test(lowerText)) {
      return {
        category: rule.name,
        account: rule.category,
        confidence: rule.confidence
      };
    }
  }
  
  // Default fallback
  return {
    category: 'Andre driftskostnader',
    account: '6190',
    confidence: 0.40
  };
}

/**
 * Calculate overall confidence score
 */
function calculateConfidence(merchant, date, amount) {
  let score = 0.5;  // Base confidence
  
  if (merchant && merchant !== 'Ukjent') score += 0.15;
  if (date) score += 0.15;
  if (amount) score += 0.20;
  
  return Math.min(score, 1.0);
}

/**
 * Batch process multiple receipts
 */
async function parseReceiptsBatch(imagePaths) {
  console.log(`📷 Processing ${imagePaths.length} receipts...\n`);
  
  const results = [];
  
  for (let i = 0; i < imagePaths.length; i++) {
    console.log(`[${i + 1}/${imagePaths.length}]`);
    const result = await parseReceipt(imagePaths[i]);
    results.push({
      file: path.basename(imagePaths[i]),
      ...result
    });
    console.log('');
  }
  
  return results;
}

module.exports = { parseReceipt, parseReceiptsBatch, extractReceiptData };

// Demo if run directly
if (require.main === module) {
  console.log('🧪 SkattPro AI - Receipt OCR Demo\n');
  console.log('Usage: node src/receipts/ocr.js <image1.jpg> [image2.jpg ...]\n');
  
  const imagePaths = process.argv.slice(2);
  
  if (imagePaths.length === 0) {
    console.log('No images provided. Example:');
    console.log('  node src/receipts/ocr.js receipt1.jpg receipt2.jpg\n');
    process.exit(0);
  }
  
  parseReceiptsBatch(imagePaths).then(results => {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    results.forEach(r => {
      if (r.success) {
        console.log(`│ ✅ ${r.file.padEnd(30)} | ${(r.confidence * 100).toFixed(0).padEnd(3)}% │`);
        console.log(`│    Merchant: ${r.merchant?.slice(0, 45).padEnd(45)} │`);
        console.log(`│    Amount: ${(r.amount || 0).toFixed(2).padStart(10)} kr | Date: ${(r.date || 'N/A').padEnd(10)} │`);
        console.log(`│    Category: ${r.category?.name?.padEnd(32) || 'N/A'} │`);
      } else {
        console.log(`│ ❌ ${r.file.padEnd(30)} | FAILED │`);
        console.log(`│    Error: ${r.error?.slice(0, 45).padEnd(45)} │`);
      }
    });
    console.log('└─────────────────────────────────────────────────────────────┘');
    
    const successCount = results.filter(r => r.success).length;
    const avgConfidence = results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) / successCount;
    
    console.log(`\n📊 Summary: ${successCount}/${results.length} successful | Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
  });
}