// Test webhook endpoint - skips email sending
exports.config = {
  maxDuration: 10,
};

exports.default = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

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

  console.log('Received webhook:', JSON.stringify(body, null, 2));

  // Simulate webhook event
  const event = body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    if (session.metadata?.product !== 'skattpro-pro') {
      return res.status(200).json({ skipped: 'Not a SkattPro Pro purchase' });
    }

    const customerEmail = session.customer_email;
    
    if (!customerEmail) {
      return res.status(400).json({ error: 'No customer email' });
    }

    // Generate license key
    const now = new Date();
    const year = now.getFullYear();
    const monthLetter = 'ABCDEFHIJKLM'[now.getMonth()];
    const sequence = Math.floor(Math.random() * 9000) + 1000;
    const licenseKey = `SKATTPRO-PRO-${year}${monthLetter}-${sequence}`;

    console.log('Generated license:', licenseKey, 'for:', customerEmail);

    return res.status(200).json({
      success: true,
      key: licenseKey,
      email: customerEmail,
      message: 'License generated (email sending not tested)'
    });
  }

  return res.status(200).json({ received: true });
};