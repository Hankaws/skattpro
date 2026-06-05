export const config = { runtime: 'nodejs' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing STRIPE_WEBHOOK_SECRET' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET, {
    apiVersion: '2025-04-30.basil',
  });

  let event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(
      JSON.stringify({ received: true, ignored: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const session = event.data.object;
  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Missing customer email in checkout session' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const key = issueProKey(session.id, email);
  await sendLicenseEmail(email, key);

  return new Response(
    JSON.stringify({ received: true, fulfilled: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

function issueProKey(sessionId, email) {
  const token = `${sessionId}:${email}:${Date.now()}`;
  return `SKATTPRO-PRO-${token.slice(-6).toUpperCase()}`;
}

async function sendLicenseEmail(email, key) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY ?? '');
    await resend.emails.send({
      from: 'SkattPro <onboarding@resend.dev>',
      to: email,
      subject: 'Your SkattPro Pro license key',
      html: `<p>Thanks for upgrading to SkattPro Pro.</p>
             <p>Your license key is: <strong>${escapeHtml(key)}</strong></p>
             <p>Activate it at <a href="https://Hankaws.github.io/skattpro/pro-activate.html">skattpro.no/pro-activate</a>.</p>`
    });
  } catch (error) {
    console.error('license_email_failed', error);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return map[char] ?? char;
  });
}
