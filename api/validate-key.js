// License Key Validation Endpoint
// Validates license keys against the database

exports.config = {
  maxDuration: 10,
};

// In-memory license database (replace with Vercel KV/Supabase later)
// For MVP, we'll load from a JSON file or maintain a simple list
const VALID_LICENSES = {
  // Format: "KEY": { email, status, created, product }
  "SKATTPRO-PRO-2026F-6246": {
    email: "hankawsproduction@gmail.com",
    status: "active",
    created: "2026-06-07",
    product: "skattpro-pro"
  }
  // Add more licenses here as they're generated
};

// Rate limiting - max 5 attempts per IP per minute
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = rateLimitStore.get(ip) || [];
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  recentAttempts.push(now);
  rateLimitStore.set(ip, recentAttempts);
  return true;
}

exports.default = async (req, res) => {
  // Get client IP (from header or connection)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   'unknown';
  
  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    console.log('Rate limit exceeded for IP:', clientIp);
    return res.status(429).json({ 
      valid: false, 
      error: 'For mange forsøk',
      message: 'Vennligst prøv igjen om et øyeblikk.'
    });
  }
  
  // CORS headers - restricted to allowed domains only
  const allowedOrigins = ['https://skattpro.vercel.app', 'https://skattpro.no', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { key, email } = body;

  if (!key) {
    return res.status(400).json({ 
      valid: false, 
      error: 'License key required' 
    });
  }

  // Normalize key (uppercase, trim whitespace)
  const normalizedKey = key.trim().toUpperCase();

  // Check if key exists in database
  const license = VALID_LICENSES[normalizedKey];

  if (!license) {
    console.log('Invalid license key:', normalizedKey);
    return res.status(200).json({ 
      valid: false, 
      error: 'Ugyldig lisensnøkkel',
      message: 'Lisensnøkkelen finnes ikke i systemet vårt.'
    });
  }

  // Check if email matches (optional, for extra security)
  if (email && email.toLowerCase() !== license.email.toLowerCase()) {
    console.log('Email mismatch for key:', normalizedKey);
    return res.status(200).json({ 
      valid: false, 
      error: 'E-post samsvarer ikke',
      message: 'Lisensnøkkelen er registrert på en annen e-postadresse.'
    });
  }

  // Check status
  if (license.status !== 'active') {
    return res.status(200).json({ 
      valid: false, 
      error: 'Lisensen er ikke aktiv',
      message: `Status: ${license.status}`,
      status: license.status
    });
  }

  // Key is valid!
  console.log('Valid license:', normalizedKey, 'for', license.email);
  
  return res.status(200).json({ 
    valid: true,
    key: normalizedKey,
    email: license.email,
    product: license.product,
    activated: license.created,
    features: [
      'unlimited_calculations',
      'pdf_csv_export',
      'unlimited_employees',
      'expense_tracking',
      'deadline_alerts',
      'priority_support'
    ]
  });
};