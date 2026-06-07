/**
 * SkattPro - Vipps Bedrift API Integration
 * 
 * Fetches real-time payments from Vipps Bedrift
 * Docs: https://developer.vippsmobilepay.com/docs/
 * 
 * Requirements:
 * - Vipps Bedrift account
 * - API credentials (subscription key, client ID, client secret)
 * - Business account number linked
 */

const https = require('https');

class VippsClient {
  constructor(options = {}) {
    this.baseUrl = options.environment === 'test'
      ? 'https://apitest.vipps.no'
      : 'https://api.vipps.no';
    
    this.subscriptionKey = options.subscriptionKey;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    
    this.accessToken = null;
    this.tokenExpires = null;
  }

  /**
   * Get OAuth2 access token
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpires && Date.now() < this.tokenExpires) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ grant_type: 'client_credentials' });

      const options = {
        hostname: this.baseUrl.replace('https://', ''),
        path: '/accessToken/get',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(responseData);
            this.accessToken = result.access_token;
            // Token expires in 1 hour, refresh 5 min early
            this.tokenExpires = Date.now() + (result.expires_in - 300) * 1000;
            resolve(this.accessToken);
          } else {
            reject(new Error(`Vipps auth failed: ${res.statusCode} ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Get recent payments (last 30 days)
   */
  async getPayments(options = {}) {
    const token = await this.getAccessToken();
    const { limit = 100, offset = 0 } = options;

    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const reqOptions = {
        hostname: this.baseUrl.replace('https://', ''),
        path: `/paymentprovider/v1/payments?${params}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Vipps-System-Name': 'skattpro-ai',
          'Vipps-System-Version': '0.3.0',
          'Vipps-System-Plugin-Name': 'skattpro-categorizer',
          'Vipps-System-Plugin-Version': '0.3.0'
        }
      };

      const req = https.request(reqOptions, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(responseData);
            resolve(this.normalizePayments(result.payments));
          } else {
            reject(new Error(`Vipps API error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Normalize Vipps payments to SkattPro format
   */
  normalizePayments(vippsPayments) {
    return vippsPayments.map(payment => ({
      id: `vipps_${payment.paymentId}`,
      amount: payment.amount / 100,  // Vipps uses øre, we use kroner
      description: payment.paymentDescription || `Vipps payment ${payment.paymentId}`,
      merchant: payment.merchantName || 'Vipps Bedrift',
      date: new Date(payment.created),
      type: 'vipps',
      status: payment.status,
      customerPhone: payment.customer?.phone || null,
      original: payment  // Keep full Vipps object for reference
    }));
  }

  /**
   * Get single payment details
   */
  async getPaymentById(paymentId) {
    const token = await this.getAccessToken();

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl.replace('https://', ''),
        path: `/paymentprovider/v1/payments/${paymentId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(responseData);
            resolve(this.normalizePayments([result])[0]);
          } else {
            reject(new Error(`Vipps API error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }
}

module.exports = VippsClient;

// Demo if run directly
if (require.main === module) {
  console.log('🧪 Vipps Bedrift Integration Demo\n');
  
  if (!process.env.VIPPS_SUBSCRIPTION_KEY) {
    console.log('⚠️  Vipps credentials not set.\n');
    console.log('To test, set environment variables:');
    console.log('  export VIPPS_SUBSCRIPTION_KEY="..."');
    console.log('  export VIPPS_CLIENT_ID="..."');
    console.log('  export VIPPS_CLIENT_SECRET="..."');
    console.log('\nGet credentials from: https://portal.vipps.no\n');
    process.exit(0);
  }

  const vipps = new VippsClient({
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
    clientId: process.env.VIPPS_CLIENT_ID,
    clientSecret: process.env.VIPPS_CLIENT_SECRET,
    environment: 'test'  // Use 'production' for live
  });

  console.log('Fetching recent Vipps payments...\n');

  vipps.getPayments({ limit: 5 }).then(payments => {
    console.log(`✅ Retrieved ${payments.length} payments:\n`);
    
    payments.forEach((p, i) => {
      console.log(`${i + 1}. ${p.merchant}`);
      console.log(`   Amount: ${p.amount.toFixed(2)} kr`);
      console.log(`   Date: ${p.date.toISOString().split('T')[0]}`);
      console.log(`   Status: ${p.status}`);
      console.log(`   ID: ${p.id}\n`);
    });

    // Auto-categorize
    const { categorizeBatch } = require('../categorizer');
    const categorized = categorizeBatch(payments);
    
    console.log('🤖 Auto-categorization:\n');
    categorized.forEach((c, i) => {
      console.log(`${i + 1}. ${c.category} (${c.account})`);
      console.log(`   Confidence: ${(c.confidence * 100).toFixed(0)}%`);
      console.log(`   Explanation: ${c.explanation}\n`);
    });
  }).catch(err => {
    console.error('❌ Error:', err.message);
  });
}