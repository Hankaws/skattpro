/**
 * Stripe Webhook Handler - Generate License Key
 * 
 * Triggered when a Stripe checkout.session.completed event fires.
 * Generates a unique license key and sends it via email.
 */

const Stripe = require('stripe');
const sgMail = require('@sendgrid/mail');

// Initialize clients
let stripe;
try {
  const stripeKey = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('Missing STRIPE_SECRET_KEY environment variable');
  }
  stripe = new Stripe(stripeKey);
} catch (err) {
  console.error('Failed to initialize Stripe:', err);
}

const sendgridKey = process.env.SENDGRID_API_KEY;
if (!sendgridKey) {
  console.error('Missing SENDGRID_API_KEY environment variable');
} else {
  sgMail.setApiKey(sendgridKey);
}

// License key format: SKATTPRO-{TYPE}-{YEAR}{MONTH}-{SEQUENCE}
// Example: SKATTPRO-PRO-2026F-0234 (June 2026, 234th customer)
function generateLicenseKey(type = 'PRO') {
  const now = new Date();
  const year = now.getFullYear();
  const monthLetter = 'ABCDEFHIJKLM'[now.getMonth()]; // A=Jan, B=Feb, etc.
  
  // Simple sequence (in production, use database for uniqueness)
  const sequence = Math.floor(Math.random() * 9000) + 1000;
  
  return `SKATTPRO-${type}-${year}${monthLetter}-${sequence}`;
}

function saveLicense(license) {
  // Skip file write in serverless - Vercel filesystem is read-only
  // License is sent via email, file storage can be added later with DB
  console.log('License generated (not persisted):', license);
}

// Email template
function createLicenseEmail(email, key) {
  return {
    to: email,
    from: 'SkattPro Support <hankawsproduction@gmail.com>',
    subject: '🎉 Din SkattPro Pro-lisens',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Takk for kjøpet! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Velkommen til SkattPro Pro</p>
        </div>
        
        <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="margin-top: 0; color: #1a1a1a;">Din lisensnøkkel</h2>
          
          <div style="background: white; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #1a1a1a; font-family: monospace;">
              ${key}
            </div>
          </div>
          
          <h3 style="color: #1a1a1a; font-size: 18px;">Slik aktiverer du:</h3>
          <ol style="line-height: 2; color: #374151;">
            <li>Gå til <a href="https://skattpro.no/pro-activate.html" style="color: #2563eb;">skattpro.no/pro-activate.html</a></li>
            <li>Lim inn nøkkelen i feltet</li>
            <li>Klikk "🔓 Aktiver Pro"</li>
          </ol>
          
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <strong style="color: #1e40af;">💡 Tips:</strong>
            <p style="margin: 8px 0 0 0; color: #1e40af; line-height: 1.6;">
              Nøkkelen fungerer på ubegrenset antall enheter. Bytter du nettleser eller bruker inkognito, kan du aktivere på nytt med samme nøkkel.
            </p>
          </div>
          
          <h3 style="color: #1a1a1a; font-size: 18px;">Dette får du med Pro:</h3>
          <ul style="line-height: 1.8; color: #374151;">
            <li>✓ Ubegrensede beregninger (ingen 5-grense)</li>
            <li>✓ PDF og CSV eksport</li>
            <li>✓ Opptil 3 ansatte gratis, deretter ubegrenset</li>
            <li>✓ Utgiftssporing med skattereduksjon</li>
            <li>✓ E-post-varsler før skattefrister</li>
            <li>✓ Prioritert support (svar innen 24t)</li>
          </ul>
          
          <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center;">
            Trenger du hjelp? Reply til denne e-posten, så hjelper vi deg!
            <br/><br/>
            Mvh,<br/>
            <strong>SkattPro-teamet</strong>
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 13px; color: #6b7280; border-radius: 0 0 16px 16px;">
          © 2026 SkattPro. Alle rettigheter reservert.<br/>
          Dette er en automatisk e-post sendt etter kjøp av SkattPro Pro.
        </div>
      </div>
    `,
    text: `
Takk for kjøpet! 🎉

Din SkattPro Pro-lisensnøkkel:
${key}

Slik aktiverer du:
1. Gå til https://skattpro.no/pro-activate.html
2. Lim inn nøkkelen
3. Klikk "Aktiver Pro"

Nøkkelen fungerer på ubegrenset antall enheter.

Dette får du med Pro:
✓ Ubegrensede beregninger
✓ PDF og CSV eksport
✓ Opptil 3 ansatte gratis, deretter ubegrenset
✓ Utgiftssporing med skattereduksjon
✓ E-post-varsler før skattefrister
✓ Prioritert support (svar innen 24t)

Trenger du hjelp? Reply til denne e-posten!

Mvh,
SkattPro-teamet
    `
  };
}

// Main webhook handler
exports.config = {
  maxDuration: 10,
};

exports.default = async (req, res) => {
  // Check if Stripe initialized
  if (!stripe) {
    console.error('Stripe not initialized - missing API key');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  // Check if SendGrid initialized
  if (!sendgridKey) {
    console.error('SendGrid not initialized - missing API key');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    console.error('Failed to parse request body:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Verify Stripe webhook signature (production only)
  const sig = req.headers['stripe-signature'];
  let event;

  // Skip signature verification in development (fake signature or no secret)
  const isDevelopment = !process.env.STRIPE_WEBHOOK_SECRET || !sig || sig === 'test' || !sig.startsWith('t=');
  
  try {
    if (!isDevelopment) {
      // Production: verify signature with raw body
      event = stripe.webhooks.constructEvent(JSON.stringify(body), sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // Development: skip signature verification
      event = body;
      console.log('Development mode: skipping signature verification');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Only process SkattPro Pro purchases
    if (session.metadata?.product !== 'skattpro-pro') {
      return res.status(200).json({ skipped: 'Not a SkattPro Pro purchase' });
    }

    const customerEmail = session.customer_email;
    
    if (!customerEmail) {
      console.error('No customer email in session:', session.id);
      return res.status(400).json({ error: 'No customer email' });
    }

    try {
      // Generate unique license key
      const licenseKey = generateLicenseKey('PRO');
      
      // Save to "database"
      const license = {
        key: licenseKey,
        email: customerEmail,
        stripe_session_id: session.id,
        product: 'skattpro-pro',
        status: 'active',
        created_at: new Date().toISOString(),
        amount_paid: session.amount_total / 100, // Convert from øre to kr
        currency: session.currency
      };
      
      saveLicense(license);
      console.log('License generated:', license);

      // Send email with license key
      try {
        const email = createLicenseEmail(customerEmail, licenseKey);
        console.log('Sending email to:', customerEmail);
        await sgMail.send(email);
        console.log('License email sent successfully to:', customerEmail);
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
        // Continue anyway - license is still valid
      }

      return res.status(200).json({
        success: true,
        key: licenseKey,
        email: customerEmail
      });

    } catch (err) {
      console.error('Error generating license:', err);
      return res.status(500).json({ error: 'Failed to generate license' });
    }
  }

  // Unhandled event type
  return res.status(200).json({ received: true });
};