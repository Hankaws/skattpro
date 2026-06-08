// Vercel Serverless Function - Invoice Generation
import PDFDocument from 'pdfkit';

export const config = {
  api: {
    bodyParser: true,
    responseLimit: '8mb'
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { seller, buyer, items, dueDate, paymentTerms = 14 } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item required' });
    }
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    // Create PDF in memory
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('FAKTURA', 400, 50, { align: 'right' });
    doc.fontSize(12).font('Helvetica').text(`Nr. ${invoiceNumber}`, 400, 75, { align: 'right' });
    
    // Seller info
    doc.fontSize(14).font('Helvetica-Bold').text(seller.name || '', 50, 50);
    doc.fontSize(10).font('Helvetica').text(
      `${seller.address || ''}\n${seller.zip && seller.city ? `${seller.zip} ${seller.city}` : ''}\n${seller.email || ''}`,
      50, 65
    );
    
    // Buyer info
    doc.fontSize(12).font('Helvetica-Bold').text('Mottaker:', 50, 130);
    doc.fontSize(10).font('Helvetica').text(
      `${buyer.name || ''}\n${buyer.address || ''}`,
      50, 145
    );
    
    // Invoice details
    doc.fontSize(10).font('Helvetica-Bold').text('Fakturadetaljer:', 350, 130);
    doc.font('Helvetica').text(
      `Fakturanr: ${invoiceNumber}\nDato: ${new Date().toLocaleDateString('no-NO')}\nForfallsdato: ${new Date(dueDate).toLocaleDateString('no-NO')}`,
      350, 145
    );
    
    doc.moveDown(2);
    
    // Line items header
    const y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Beskrivelse', 50, y);
    doc.text('Antall', 300, y);
    doc.text('Pris', 380, y, { align: 'right' });
    doc.text('Total', 460, y, { align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
    doc.moveDown(0.3);
    
    // Items
    let subtotal = 0;
    items.forEach(item => {
      const lineTotal = (item.quantity || 1) * item.price;
      subtotal += lineTotal;
      
      doc.fontSize(9).font('Helvetica').text(item.description, 50, doc.y, { width: 240, ellipsis: true });
      doc.text(item.quantity || 1, 300, doc.y);
      doc.text(`${item.price.toFixed(2)} kr`, 380, doc.y, { align: 'right' });
      doc.text(`${lineTotal.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    });
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
    doc.moveDown(0.5);
    
    // Totals
    const vat = subtotal * 0.25;
    const total = subtotal + vat;
    
    doc.fontSize(10).font('Helvetica').text('Subtotal:', 380, doc.y, { align: 'right' });
    doc.text(`${subtotal.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
    doc.moveDown(0.4);
    
    doc.text('MVA (25%):', 380, doc.y, { align: 'right' });
    doc.text(`${vat.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
    doc.moveDown(0.4);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Total:', 380, doc.y, { align: 'right' });
    doc.text(`${total.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
    
    doc.end();
    
    // Wait for PDF to finish
    const pdfBuffer = Buffer.concat(chunks);
    
    // Return as file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="faktura-${invoiceNumber}.pdf"`);
    res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('Invoice API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate invoice',
      message: error.message 
    });
  }
}