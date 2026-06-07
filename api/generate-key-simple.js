// Minimal generate-key endpoint for testing
const sgMail = require('@sendgrid/mail');

exports.config = {
  maxDuration: 10,
};

exports.default = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    console.log('Received:', body);

    // Generate key
    const now = new Date();
    const year = now.getFullYear();
    const monthLetter = 'ABCDEFHIJKLM'[now.getMonth()];
    const sequence = Math.floor(Math.random() * 9000) + 1000;
    const key = `SKATTPRO-PRO-${year}${monthLetter}-${sequence}`;

    // Test SendGrid initialization
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey) {
      sgMail.setApiKey(sendgridKey);
      console.log('SendGrid initialized');
    } else {
      console.log('SendGrid key missing');
    }

    return res.status(200).json({
      success: true,
      key: key,
      hasSendGrid: !!sendgridKey
    });

  } catch (err) {
    console.error('Error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};