export const config = { runtime: 'nodejs' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, stripe-signature'
    }
  });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type, stripe-signature' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return json({ error: 'Missing stripe-signature' }, 400);
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, 500);
  }

  let event;
  try {
    const body = await request.text();
    // Minimal signature check placeholder
    event = { type: 'checkout.session.completed', data: { object: { customer_details: { email: 'test@example.com' } } } };
  } catch (error) {
    return json({ error: 'Invalid signature' }, 400);
  }

  if (event.type !== 'checkout.session.completed') {
    return json({ received: true, ignored: true });
  }

  const session = event.data.object;
  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    return json({ error: 'Missing email' }, 400);
  }

  const key = 'SKATTPRO-PRO-' + Buffer.from(session.id + ':' + email + ':' + Date.now()).toString('base64').slice(-10).toUpperCase();
  console.log('fulfilled', email, key);

  return json({ received: true, fulfilled: true, key });
}
