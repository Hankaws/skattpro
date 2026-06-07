/**
 * SkattPro AI - LLM Categorizer (Phase 2)
 * 
 * Integrates Qwen2.5-72B via Groq API for transactions that rules can't handle
 * 
 * Usage:
 *   const llm = new LLMCategorizer();
 *   const result = await llm.categorize(transaction);
 */

const https = require('https');

class LLMCategorizer {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.LLM_API_KEY;
    this.apiURL = options.apiURL || 'https://api.groq.com/openai/v1/chat/completions';
    this.model = options.model || 'qwen2.5-72b-versatile';
    this.timeout = options.timeout || 5000;
  }

  /**
   * Create prompt for LLM categorization
   * Uses few-shot learning with Norwegian accounting examples
   */
  createPrompt(transaction) {
    return `You are an expert Norwegian accountant (registrert revisor). Your task is to categorize bank transactions according to the standard Norwegian accounting plan (standard kontoplan for ENK).

## Transaction to categorize:
- Amount: ${transaction.amount > 0 ? '+' : ''}${transaction.amount} kr
- Description: "${transaction.description}"
- Date: ${transaction.date || 'Unknown'}
- Type: ${transaction.type || 'bank_transaction'}

## Available categories (choose ONE):

**Revenue (3xxx):**
- 3000: Salgsinntekt varer (sales of goods)
- 3010: Salgsinntekt tjenester (sales of services)
- 3040: Salgsinntekt eksport (export sales, no VAT)

**Operating Expenses (5xxx-6xxx):**
- 5050: Varekjøp (inventory for resale)
- 5400: Kontorutstyr (office equipment/supplies)
- 5420: Datautstyr (computer equipment/software)
- 5440: Litteratur og fagtidsskrifter (books/professional materials)
- 6050: Husleie (rent)
- 6100: Strøm (electricity)
- 6110: Telefon og porto (phone/postage)
- 6130: Edb-utgifter (IT expenses)
- 6190: Andre driftskostnader (other operating expenses)
- 6200: Reklame og annonsering (advertising)
- 6210: Webutvikling og hosting (web development/hosting)
- 6290: Møter og representasjon (meetings/entertainment)
- 6300: Kontingenter (membership fees)
- 6350: Trygdeavgift og skatt (social security tax)
- 6400: Reise og diett (travel and per diem)
- 6450: Bil og transport (car and transport)
- 6470: Drivstoff (fuel)
- 7100: Lønnskostnader (wages/salaries)
- 8000: Finanskostnader (financial expenses like interest/fees)

## VAT Codes:
- H1: Høy sats (25% VAT, most common)
- H0: Ingen sats (0% VAT, export)
- F: Fraternert (no VAT deduction, e.g., entertainment)
- I: Ikke mva-pliktig (outside VAT scope, e.g., salaries, taxes)

## Examples:

**Example 1:**
Transaction: -2,499 kr, "KLARNA APPLE STORE"
Answer: {
  "category": "Datautstyr",
  "account": "5420",
  "vat_code": "H1",
  "confidence": 0.92,
  "reasoning": "Apple Store purchase is typically computer equipment or software. High confidence due to clear merchant identification."
}

**Example 2:**
Transaction: -899 kr, "VY FLOGBANE"
Answer: {
  "category": "Reise og diett",
  "account": "6400",
  "vat_code": "F",
  "confidence": 0.90,
  "reasoning": "Vy is Norwegian train company. Travel expenses have reduced VAT deduction (F)."
}

**Example 3:**
Transaction: +15,000 kr, "VIPPS BEDRIFT 123456 KUNDE AS"
Answer: {
  "category": "Salgsinntekt varer",
  "account": "3000",
  "vat_code": "H1",
  "confidence": 0.88,
  "reasoning": "Vipps Bedrift payment from customer is sales revenue. Standard 25% VAT applies."
}

**Example 4:**
Transaction: -1,500 kr, "MENY STAVANGER"
Answer: {
  "category": "Møter og representasjon",
  "account": "6290",
  "vat_code": "F",
  "confidence": 0.65,
  "reasoning": "Grocery store could be food for client meetings OR personal expense. Low confidence - needs manual review. If business, it's entertainment with no VAT deduction."
}

## Instructions:
1. Analyze the transaction description carefully
2. Match to the MOST SPECIFIC category
3. Assign correct VAT code based on category
4. Provide confidence (0.0-1.0):
   - 0.90+: Very clear merchant/purpose
   - 0.75-0.89: Reasonably clear
   - 0.60-0.74: Ambiguous, needs review
   - <0.60: Very uncertain, definitely needs review
5. Explain your reasoning in 1-2 sentences

Return ONLY valid JSON (no markdown, no extra text):
{
  "category": "string",
  "account": "4-digit code",
  "vat_code": "H1|H0|F|I",
  "confidence": number,
  "reasoning": "string"
}`;
  }

  /**
   * Call Groq API to categorize transaction
   */
  async categorize(transaction) {
    const prompt = this.createPrompt(transaction);
    
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that categorizes Norwegian business transactions. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,  // Low temperature for consistency
      max_tokens: 300
    };

    try {
      const response = await this.callAPI(requestBody);
      const content = response.choices[0].message.content.trim();
      
      // Parse JSON response
      const result = JSON.parse(content);
      
      // Add metadata
      return {
        ...result,
        method: 'llm',
        model: this.model,
        id: transaction.id
      };
    } catch (error) {
      console.error('LLM categorization error:', error.message);
      
      // Fallback to rule-based if LLM fails
      return {
        id: transaction.id,
        category: 'Usikker - trenger gjennomgang',
        account: '6190',
        vat_code: 'H1',
        confidence: 0.30,
        reasoning: `LLM failed: ${error.message}. Needs manual review.`,
        method: 'llm-fallback'
      };
    }
  }

  /**
   * Make HTTPS request to Groq API
   */
  callAPI(requestBody) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(requestBody);
      
      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': data.length
        },
        timeout: this.timeout
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(responseData));
          } else {
            reject(new Error(`API error: ${res.statusCode} ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Batch categorize with rate limiting
   */
  async categorizeBatch(transactions, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(transactions.length/batchSize)}`);
      
      const batchPromises = batch.map(txn => this.categorize(txn));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Rate limit: 1 second between batches
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

module.exports = LLMCategorizer;

// Demo/test if run directly
if (require.main === module) {
  console.log('🧪 LLM Categorizer - Demo (requires API key)\n');
  
  if (!process.env.LLM_API_KEY) {
    console.log('⚠️  LLM_API_KEY not set. Set it to test:\n');
    console.log('export LLM_API_KEY="your_groq_api_key"');
    console.log('\nGet free API key at: https://console.groq.com\n');
    process.exit(0);
  }
  
  const llm = new LLMCategorizer();
  
  const testTransactions = [
    { id: '1', amount: -2499, description: 'KLARNA APPLE STORE', date: '2026-06-07' },
    { id: '2', amount: -899, description: 'VY FLOGBANE', date: '2026-06-06' },
    { id: '3', amount: -1500, description: 'MENY STAVANGER', date: '2026-06-05' }
  ];
  
  console.log('Categorizing transactions with LLM...\n');
  
  llm.categorizeBatch(testTransactions, 1).then(results => {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    results.forEach(r => {
      const emoji = r.confidence >= 0.9 ? '✅' : r.confidence >= 0.7 ? '⚠️' : '❓';
      console.log(`│ ${emoji} ${r.account} | ${r.category.padEnd(30)} | ${(r.confidence * 100).toFixed(0).padEnd(3)}% │`);
      console.log(`│    └─ ${r.reasoning.slice(0, 62).padEnd(62)} │`);
    });
    console.log('└─────────────────────────────────────────────────────────────┘');
  }).catch(err => {
    console.error('❌ Error:', err.message);
  });
}