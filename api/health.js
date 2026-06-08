// Vercel Serverless Function - Health Check
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    version: '0.5.0-alpha',
    timestamp: new Date().toISOString()
  });
}