// Test email sending endpoint
const sgMail = require('@sendgrid/mail');

exports.config = {
  maxDuration: 10,
};

exports.default = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const sendgridKey = process.env.SENDGRID_API_KEY;
  
  if (!sendgridKey) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY not set' });
  }
  
  sgMail.setApiKey(sendgridKey);
  
  const testEmail = {
    to: req.query.email || 'hankawsproduction@gmail.com',
    from: 'SkattPro Support <hankawsproduction@gmail.com>',
    subject: '🧪 Test Email from SkattPro',
    text: 'This is a test email to verify SendGrid is working.',
    html: '<h1>Test Email</h1><p>If you receive this, SendGrid is working!</p>'
  };
  
  try {
    console.log('Sending test email to:', testEmail.to);
    const result = await sgMail.send(testEmail);
    console.log('Success! Status:', result[0].statusCode);
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      to: testEmail.to,
      from: testEmail.from,
      statusCode: result[0].statusCode
    });
  } catch (err) {
    console.error('SendGrid error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
      response: err.response?.body || null
    });
  }
};