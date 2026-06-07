/**
 * License Key Validation API
 * 
 * Validates if a license key is active and legitimate.
 * Used optionally by client for extra verification.
 */

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'licenses.json');

function loadLicenses() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading licenses:', err);
  }
  return [];
}

// Rate limiting: 100 requests per minute per IP
const rateLimitStore = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore.get(ip).filter(timestamp => now - timestamp < windowMs);
  
  if (requests.length >= maxRequests) {
    return false;
  }

  requests.push(now);
  rateLimitStore.set(ip, requests);
  return true;
}

exports.config = {
  maxDuration: 5,
};

exports.default = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ valid: false, error: 'No key provided' });
  }

  const licenses = loadLicenses();
  const license = licenses.find(l => l.key === key);

  if (!license) {
    return res.status(200).json({ 
      valid: false, 
      error: 'Ugyldig lisensnøkkel' 
    });
  }

  if (license.status !== 'active') {
    return res.status(200).json({ 
      valid: false, 
      status: license.status,
      error: 'Lisensen er ikke aktiv' 
    });
  }

  // Update last_validated timestamp
  license.last_validated = new Date().toISOString();
  fs.writeFileSync(dbPath, JSON.stringify(licenses, null, 2));

  return res.status(200).json({
    valid: true,
    status: 'active',
    product: license.product,
    activated_at: license.created_at,
    email: license.email.split('@')[0] + '@***' // Mask email for privacy
  });
};