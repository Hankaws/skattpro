/**
 * SkattPro - Email Service (SendGrid)
 * 
 * Sends transaction summaries, receipts, and alerts
 * 
 * Features:
 * - Weekly/monthly summaries
 * - Low confidence alerts
 * - Receipt confirmations
 * - Forskuddsskatt reminders
 */

const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor(apiKey, fromEmail) {
    sgMail.setApiKey(apiKey);
    this.fromEmail = fromEmail || 'noreply@skattpro.no';
    this.fromName = 'SkattPro AI';
  }

  /**
   * Send weekly summary email
   */
  async sendWeeklySummary(user, stats) {
    const { transactionsCount, totalIncome, totalExpenses, autoCategorized } = stats;
    const netProfit = totalIncome - totalExpenses;

    const html = `
      <h1>📊 Din ukesoppsummering fra SkattPro</h1>
      
      <p>Hei ${user.name || 'bruker'}!</p>
      
      <p>Her er oversikten for uken:</p>
      
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Inntekter</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; color: #28a745;">+${totalIncome.toLocaleString('no-NO')} kr</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Utgifter</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; color: #dc3545;">-${totalExpenses.toLocaleString('no-NO')} kr</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Netto overskudd</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${netProfit.toLocaleString('no-NO')} kr</td>
        </tr>
      </table>
      
      <h3>🤖 AI-kategorisering</h3>
      <p>Denne uken har vi kategorisert <strong>${transactionsCount} transaksjoner</strong> for deg.</p>
      <p>Automatisk kategorisering: <strong>${autoCategorized}%</strong></p>
      <p>Tid spart: ca. <strong>${Math.round(transactionsCount * 0.5)} minutter</strong> 🎉</p>
      
      ${autoCategorized < 90 ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>⚠️ Noen transaksjoner trenger gjennomgang</strong><br>
          ${Math.round(transactionsCount * (100 - autoCategorized) / 100)} transaksjoner er merket for manuell gjennomgang.
          <br><br>
          <a href="https://skattpro.vercel.app/review" style="background: #ffc107; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Gå til gjennomgang</a>
        </div>
      ` : ''}
      
      <h3>💡 Tips fra SkattPro</h3>
      <ul>
        <li>Husk å laste opp kvitninger for store utgifter</li>
        <li>Sjekk at alle Vipps-betalinger er kategorisert riktig</li>
        <li>Sett av ${Math.round(netProfit * 0.25 / 12).toLocaleString('no-NO')} kr/md til forskuddsskatt</li>
      </ul>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Hilsen SkattPro-teamet<br>
        <a href="https://skattpro.no">skattpro.no</a>
      </p>
    `;

    const msg = {
      to: user.email,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: `📊 Din ukesoppsummering: ${netProfit.toLocaleString('no-NO')} kr i overskudd`,
      html
    };

    return sgMail.send(msg);
  }

  /**
   * Send receipt confirmation
   */
  async sendReceiptConfirmation(user, receipt) {
    const html = `
      <h1>📷 Kvittering mottatt</h1>
      
      <p>Hei ${user.name || 'bruker'}!</p>
      
      <p>Vi har mottatt og behandlet kvitteringen din:</p>
      
      <table style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <tr>
          <td><strong>Butikk:</strong></td>
          <td>${receipt.merchant || 'Ukjent'}</td>
        </tr>
        <tr>
          <td><strong>Dato:</strong></td>
          <td>${receipt.date ? new Date(receipt.date).toLocaleDateString('no-NO') : 'Ukjent'}</td>
        </tr>
        <tr>
          <td><strong>Beløp:</strong></td>
          <td>${receipt.amount ? Math.abs(receipt.amount).toFixed(2) : '?'} kr</td>
        </tr>
        <tr>
          <td><strong>Kategori:</strong></td>
          <td>${receipt.category?.name || 'Behandles...'}</td>
        </tr>
      </table>
      
      <p>Kvitteringen er lagret og transaksjonen er automatisk kategorisert.</p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Hilsen SkattPro-teamet<br>
        <a href="https://skattpro.no">skattpro.no</a>
      </p>
    `;

    const msg = {
      to: user.email,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: `✅ Kvittering mottatt: ${receipt.merchant || 'Din kvittering'}`,
      html
    };

    return sgMail.send(msg);
  }

  /**
   * Send forskuddsskatt reminder
   */
  async sendForskuddsskattReminder(user, payment, daysUntilDue) {
    const html = `
      <h1>💰 Påminnelse: Forskuddsskatt</h1>
      
      <p>Hei ${user.name || 'bruker'}!</p>
      
      <p>Du har en forskuddsskatt som forfaller om <strong>${daysUntilDue} dager</strong>:</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; color: #1976d2;">
          ${payment.amount.toLocaleString('no-NO')} kr
        </div>
        <div style="margin-top: 10px; color: #666;">
          Forfall: ${new Date(payment.date).toLocaleDateString('no-NO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <h3>💡 Slik betaler du:</h3>
      <ol>
        <li>Logg inn på <a href="https://skatteetaten.no">skatteetaten.no</a></li>
        <li>Gå til "Betaling" → "Forskuddsskatt"</li>
        <li>Bruk referanse: ${payment.reference || 'Ditt fødselsnummer'}</li>
      </ol>
      
      <p style="margin-top: 20px;">
        <a href="https://skatteetaten.no/person/skatt/hjelp-til-riktig-skatt/forskuddsskatt/" 
           style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Gå til betaling
        </a>
      </p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Hilsen SkattPro-teamet<br>
        <a href="https://skattpro.no">skattpro.no</a>
      </p>
    `;

    const msg = {
      to: user.email,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: `⏰ Husk forskuddsskatt: ${payment.amount.toLocaleString('no-NO')} kr forfaller ${daysUntilDue === 1 ? 'i morgen' : `om ${daysUntilDue} dager`}`,
      html
    };

    return sgMail.send(msg);
  }

  /**
   * Send low confidence alert (when many transactions need review)
   */
  async sendLowConfidenceAlert(user, count) {
    const html = `
      <h1>⚠️ Transaksjoner trenger gjennomgang</h1>
      
      <p>Hei ${user.name || 'bruker'}!</p>
      
      <p>AI-en vår er usikker på kategoriseringen av <strong>${count} transaksjoner</strong>.</p>
      
      <p>Det tar bare quelques minutter å gjennomgå dem, og hvert svar gjør SkattPro smartere! 🧠</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://skattpro.vercel.app/review" 
           style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;">
          Gå til gjennomgang
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Hilsen SkattPro-teamet<br>
        <a href="https://skattpro.no">skattpro.no</a>
      </p>
    `;

    const msg = {
      to: user.email,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: `🔍 ${count} transaksjoner trenger din gjennomgang`,
      html
    };

    return sgMail.send(msg);
  }
}

module.exports = EmailService;