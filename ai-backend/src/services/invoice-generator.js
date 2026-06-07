const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../db/prisma');

class InvoiceGenerator {
  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/invoice');
  }

  /**
   * Generate PDF invoice from transaction data
   */
  async generateInvoice(data) {
    const {
      invoiceNumber,
      seller,
      buyer,
      items,
      dueDate,
      paymentTerms = 14
    } = data;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const filePath = `/tmp/invoice-${invoiceNumber}.pdf`;
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      this.addHeader(doc, seller, invoiceNumber);
      
      // Buyer info
      this.addBuyerInfo(doc, buyer);
      
      // Invoice details
      this.addInvoiceDetails(doc, { invoiceNumber, issueDate: new Date(), dueDate });
      
      // Line items
      this.addLineItems(doc, items);
      
      // Totals
      this.addTotals(doc, items);
      
      // Payment info
      this.addPaymentInfo(doc, seller, paymentTerms);
      
      // Footer
      this.addFooter(doc, seller);
      
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  addHeader(doc, seller, invoiceNumber) {
    // Logo placeholder
    doc.rect(50, 50, 40, 40).stroke('#667eea');
    doc.fontSize(10).text(seller.name || 'Faktura', 55, 60);
    
    // Seller info
    doc.fontSize(14).font('Helvetica-Bold').text(seller.name || '', 120, 50);
    doc.fontSize(10).font('Helvetica').text(
      `${seller.address || ''}\n${seller.zip && seller.city ? `${seller.zip} ${seller.city}` : ''}\n${seller.email || ''}\n${seller.phone || ''}\n${seller.enkNumber ? `ENK: ${seller.enkNumber}` : ''}`,
      120,
      65
    );
    
    // Invoice title
    doc.fontSize(24).font('Helvetica-Bold').text('FAKTURA', 400, 50, { align: 'right' });
    doc.fontSize(12).font('Helvetica').text(`Nr. ${invoiceNumber}`, 400, 75, { align: 'right' });
    
    doc.moveDown(1);
    doc.moveTo(50, 110).lineTo(550, 110).stroke('#ddd');
  }

  addBuyerInfo(doc, buyer) {
    doc.fontSize(12).font('Helvetica-Bold').text('Mottaker:', 50, 130);
    doc.fontSize(10).font('Helvetica').text(
      `${buyer.name || ''}\n${buyer.address || ''}\n${buyer.zip && buyer.city ? `${buyer.zip} ${buyer.city}` : ''}\n${buyer.email || ''}\n${buyer.organizationNumber ? `Org.nr: ${buyer.organizationNumber}` : ''}`,
      50,
      145
    );
  }

  addInvoiceDetails(doc, { invoiceNumber, issueDate, dueDate }) {
    doc.fontSize(10).font('Helvetica-Bold').text('Fakturadetaljer:', 350, 130);
    doc.font('Helvetica').text(
      `Fakturanr: ${invoiceNumber}\n` +
      `Dato: ${issueDate.toLocaleDateString('no-NO')}\n` +
      `Forfallsdato: ${dueDate.toLocaleDateString('no-NO')}`,
      350,
      145
    );
  }

  addLineItems(doc, items) {
    doc.moveDown(2);
    
    // Table header
    const y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Beskrivelse', 50, y);
    doc.text('Antall', 300, y);
    doc.text('Pris', 380, y, { align: 'right' });
    doc.text('Total', 460, y, { align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
    doc.moveDown(0.3);
    
    // Items
    let totalExVat = 0;
    items.forEach(item => {
      const lineTotal = (item.quantity || 1) * item.price;
      totalExVat += lineTotal;
      
      doc.fontSize(9).font('Helvetica').text(item.description, 50, doc.y, { width: 240, ellipsis: true });
      doc.text(item.quantity || 1, 300, doc.y);
      doc.text(`${item.price.toFixed(2)} kr`, 380, doc.y, { align: 'right' });
      doc.text(`${lineTotal.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    });
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
  }

  addTotals(doc, items) {
    doc.moveDown(0.5);
    
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity || 1) * item.price, 0
    );
    
    // Calculate VAT (standard 25% for most items)
    const vatRate = 0.25;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;
    
    doc.fontSize(10).font('Helvetica').text('Subtotal:', 380, doc.y, { align: 'right' });
    doc.text(`${subtotal.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
    doc.moveDown(0.4);
    
    doc.text('MVA (25%):', 380, doc.y, { align: 'right' });
    doc.text(`${vatAmount.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
    doc.moveDown(0.4);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Total:', 380, doc.y, { align: 'right' });
    doc.text(`${total.toFixed(2)} kr`, 460, doc.y, { align: 'right' });
    
    // Store for later
    this.totals = { subtotal, vatAmount, total };
  }

  addPaymentInfo(doc, seller, paymentTerms) {
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold').text('Betalingsinformasjon:', 50, doc.y);
    doc.font('Helvetica').text(
      `Bank: ${seller.bankAccount || 'Ikke oppgitt'}\n` +
      `HVORFOR: ${seller.vippsNumber ? `Vipps: ${seller.vippsNumber} | ` : ''}` +
      `Betaling innen ${paymentTerms} dager`,
      50,
      doc.y + 15
    );
  }

  addFooter(doc, seller) {
    doc.moveTo(50, 750).lineTo(550, 750).stroke('#ddd');
    
    doc.fontSize(8).fill('#999').text(
      'Takk for handelen! | ' + (seller.email || 'kontakt@skattpro.no'),
      50,
      760,
      { width: 500, align: 'center' }
    );
    
    doc.text(
      `Faktura generert av SkattPro AI | skattpro.no`,
      50,
      772,
      { width: 500, align: 'center' }
    );
  }

  /**
   * Create invoice from Vipps transaction
   */
  async createFromTransaction(transactionId, seller) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    if (transaction.amount <= 0) {
      throw new Error('Transaction must be income (positive amount)');
    }
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    // Create invoice data
    const invoiceData = {
      invoiceNumber,
      seller: {
        name: seller.name || transaction.user.name,
        email: seller.email || transaction.user.email,
        phone: seller.phone,
        address: seller.address,
        zip: seller.zip,
        city: seller.city,
        enkNumber: seller.enkNumber || transaction.user.enkNumber,
        bankAccount: seller.bankAccount,
        vippsNumber: seller.vippsNumber
      },
      buyer: {
        name: transaction.description?.split(' ')[0] || 'Kunde',
        email: null,
        address: null,
        zip: null,
        city: null,
        organizationNumber: null
      },
      items: [{
        description: transaction.description || 'Betaling mottatt',
        quantity: 1,
        price: transaction.amount
      }],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    
    return this.generateInvoice(invoiceData);
  }
}

module.exports = InvoiceGenerator;