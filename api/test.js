// Simple test endpoint
exports.default = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    env: {
      hasStripe: !!process.env.STRIPE_SECRET_KEY,
      hasSendGrid: !!process.env.SENDGRID_API_KEY
    }
  });
};