/**
 * SkattPro - PDF Report Generator
 * 
 * Generates professional PDF reports:
 * - Årsoppgave (annual report)
 * - Månedsrapport (monthly summary)
 * - Skatterapport (tax report for submission)
 * 
 * Uses PDFKit for PDF generation
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.logoPath = path.join(__dirname, '../../assets/logo.png');
  }

  /**
   * Generate årsoppgave (annual report) for ENK
   */
  async generateArsoppgave(user, transactions, year = 2026) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const filePath = `/tmp/arsoppgave-${user.enkNumber || user.email}-${year}.pdf`;
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      this.addHeader(doc, user);
      
      // Title
      doc.moveDown(1);
      doc.fontSize(24).text(`Årsoppgave ${year}`, { align: 'center' });
      doc.fontSize(12).text(`ENK: ${user.enkNumber || 'Ikke oppgitt'}`, { align: 'center' });
      doc.moveDown(0.5);
      
      // Summary box
      const summary = this.calculateSummary(transactions);
      this.addSummaryBox(doc, summary);
      
      // Income section
      doc.moveDown(2);
      doc.fontSize(18).text('Inntekter', { underline: true });
      doc.moveDown(0.5);
      this.addTransactionTable(doc, transactions.filter(t => t.amount > 0), 'income');
      
      // Expense section
      doc.moveDown(2);
      doc.fontSize(18).text('Utgifter', { underline: true });
      doc.moveDown(0.5);
      this.addTransactionTable(doc, transactions.filter(t => t.amount < 0), 'expense');
      
      // Tax calculation
      doc.moveDown(2);
      doc.fontSize(18).text('Skatteberegning', { underline: true });
      doc.moveDown(0.5);
      this.addTaxCalculation(doc, summary, year);
      
      // Footer
      doc.moveDown(3);
      this.addFooter(doc, year);
      
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Add header with logo and company info
   */
  addHeader(doc, user) {
    // Logo placeholder
    doc.rect(50, 50, 40, 40).stroke('#667eea');
    doc.fontSize(10).text('SkattPro', 55, 60);
    
    // Company info
    doc.fontSize(14).font('Helvetica-Bold').text(user.name || 'ENK', 120, 50, {
      align: 'left'
    });
    
    doc.fontSize(10).font('Helvetica').text(
      user.email + (user.enkNumber ? `\nENK: ${user.enkNumber}` : ''),
      120,
      65
    );
    
    // Report metadata
    doc.fontSize(9).text(
      `Generert: ${new Date().toLocaleDateString('no-NO')}\nSide 1 av 1`,
      500,
      50,
      { align: 'right' }
    );
    
    doc.moveDown(1);
    doc.moveTo(50, 100).lineTo(550, 100).stroke('#ddd');
  }

  /**
   * Add summary box
   */
  addSummaryBox(doc, summary) {
    doc.save();
    
    // Background
    doc.rect(50, 120, 500, 120).fill('#f8f9fa');
    
    // Rows
    const rows = [
      { label: 'Total inntekt', value: summary.totalIncome, color: '#28a745' },
      { label: 'Total utgifter', value: summary.totalExpenses, color: '#dc3545' },
      { label: 'Overskudd før skatt', value: summary.netProfit, color: '#0066cc', bold: true }
    ];
    
    let y = 130;
    rows.forEach(row => {
      doc.fontSize(12).font('Helvetica').text(row.label, 70, y);
      doc.fontSize(14).font('Helvetica-Bold').fill(row.color).text(
        `${row.value > 0 ? '+' : ''}${row.value.toLocaleString('no-NO', { minimumFractionDigits: 2 })} kr`,
        400,
        y,
        { align: 'right' }
      );
      y += 30;
    });
    
    doc.restore();
  }

  /**
   * Add transaction table
   */
  addTransactionTable(doc, transactions, type) {
    if (transactions.length === 0) {
      doc.fontSize(11).text('Ingen transaksjoner.', 70, doc.y);
      return;
    }
    
    // Limit to first 20 per section
    const displayTransactions = transactions.slice(0, 20);
    
    // Table header
    doc.fontSize(10).font('Helvetica-Bold').text('Dato', 70, doc.y);
    doc.text('Beskrivelse', 130, doc.y);
    doc.text('Kategori', 300, doc.y, { width: 120 });
    doc.text('Beløp', 450, doc.y, { align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(70, doc.y).lineTo(530, doc.y).stroke('#ddd');
    doc.moveDown(0.3);
    
    // Transaction rows
    displayTransactions.forEach(t => {
      doc.fontSize(9).font('Helvetica').text(
        new Date(t.date).toLocaleDateString('no-NO'),
        70,
        doc.y
      );
      doc.text(t.description?.substring(0, 25) || 'N/A', 130, doc.y, { width: 160, ellipsis: true });
      doc.text(t.category || 'Ukategorisert', 300, doc.y, { width: 120 });
      doc.fill(type === 'income' ? '#28a745' : '#dc3545');
      doc.text(
        `${t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)} kr`,
        450,
        doc.y,
        { align: 'right' }
      );
      doc.fill('#000');
      doc.moveDown(0.4);
    });
    
    if (transactions.length > 20) {
      doc.fontSize(9).fill('#666').text(
        `... og ${transactions.length - 20} flere transaksjoner`,
        70,
        doc.y
      );
      doc.moveDown(0.5);
    }
  }

  /**
   * Add tax calculation section
   */
  addTaxCalculation(doc, summary, year) {
    const { calculateForskuddsskatt } = require('../tax/forskuddsskatt');
    
    const taxCalc = calculateForskuddsskatt({
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      isOslo: true
    });
    
    doc.fontSize(11).font('Helvetica').text(`Overskudd: ${summary.netProfit.toLocaleString('no-NO')} kr`, 70, doc.y);
    doc.moveDown(0.3);
    doc.text(`Personfradrag (46%): -${taxCalc.tax.personalDeduction.toLocaleString('no-NO')} kr`, 70, doc.y);
    doc.moveDown(0.3);
    doc.text(`Alminnelig inntekt: ${taxCalc.tax.ordinaryIncome.toLocaleString('no-NO')} kr`, 70, doc.y);
    doc.moveDown(0.3);
    doc.text(`Grunnskatt (22%): ${taxCalc.tax.baseTax.toLocaleString('no-NO')} kr`, 70, doc.y);
    doc.moveDown(0.3);
    doc.text(`Trygdeavgift (23.3%): ${taxCalc.selfEmploymentTax.toLocaleString('no-NO')} kr`, 70, doc.y);
    doc.moveDown(0.3);
    doc.text(`Toppskatt: ${taxCalc.tax.progressiveTax.toLocaleString('no-NO')} kr`, 70, doc.y);
    doc.moveDown(0.5);
    
    doc.fontSize(13).font('Helvetica-Bold').text(
      `Total skatt: ${taxCalc.totalAnnualTax.toLocaleString('no-NO')} kr`,
      70,
      doc.y
    );
    doc.fontSize(10).font('Helvetica').fill('#666').text(
      `(Effektiv skattesats: ${taxCalc.tax.effectiveRate.toFixed(1)}%)`,
      350,
      doc.y - 3
    );
  }

  /**
   * Add footer
   */
  addFooter(doc, year) {
    doc.fontSize(8).fill('#999').text(
      'Denne rapporten er generert av SkattPro AI og erstatter ikke offisielle dokumenter fra Skatteetaten.',
      50,
      750,
      { width: 500, align: 'center' }
    );
    
    doc.text(
      `Rapport for regnskapsåret ${year} | Generert ${new Date().toLocaleDateString('no-NO')} | skattpro.no`,
      50,
      765,
      { width: 500, align: 'center' }
    );
  }

  /**
   * Calculate summary from transactions
   */
  calculateSummary(transactions) {
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      count: transactions.length
    };
  }
}

module.exports = PDFGenerator;