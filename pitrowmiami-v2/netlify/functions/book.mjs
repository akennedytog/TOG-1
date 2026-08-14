// Pit Row Miami booking form handler
// Sends booking requests via email

const RESEND_API = 'https://api.resend.com/emails';


async function sendNewsletter(email, json) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(503, { success: false, message: 'Subscription temporarily unavailable. Please email us at info@pitrowmiami.com' });
  }
  const to = process.env.RESEND_TO_EMAIL || 'akennedy@theonegroup.info';
  const from = process.env.RESEND_FROM_EMAIL || 'Pit Row Miami <onboarding@resend.dev>';
  const subject = 'New Pit Row Miami newsletter subscriber';
  const text = [
    'New Newsletter Subscriber — Pit Row Miami',
    '====================================',
    '',
    `Email: ${email}`,
    `Submitted: ${new Date().toISOString()}`,
    '===================================='
  ].join('\n');
  try {
    const response = await fetch(RESEND_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, text })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(body));
      throw new Error(body.message || `Resend error (${response.status})`);
    }
    return json(200, { success: true, message: 'Subscribed! We\'ll keep you posted.' });
  } catch (error) {
    console.error('Newsletter notification failed:', error.message);
    return json(502, { success: false, message: 'Could not subscribe. Please try again or email us at info@pitrowmiami.com.' });
  }
}



function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' });
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  if (rawBody.length > 32768) {
    return json(413, { success: false, message: 'Request too large' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    return json(400, { success: false, message: 'Invalid JSON' });
  }

  // Honeypot check
  if (String(payload.website || '').trim()) {
    return json(400, { success: false, message: 'Invalid submission' });
  }

  const formType = String(payload.form_type || 'booking').trim();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const phone = String(payload.phone || '').trim();
  const eventType = String(payload.event_type || '').trim();
  const eventDate = String(payload.event_date || '').trim();
  const eventTime = String(payload.event_time || '').trim();
  const guests = String(payload.guests || '').trim();
  const location = String(payload.location || '').trim();
  const message = String(payload.message || '').trim();

  if (!validEmail(email)) {
    return json(400, { success: false, message: 'A valid email address is required' });
  }

  // Newsletter subscription: only email required
  if (formType === 'newsletter') {
    return await sendNewsletter(email, json);
  }

  if (!name || !phone || !eventDate) {
    return json(400, { success: false, message: 'Name, email, phone, and event date are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return json(503, { success: false, message: 'Booking is temporarily unavailable. Please email us directly at info@pitrowmiami.com' });
  }

  const to = process.env.RESEND_TO_EMAIL || 'akennedy@theonegroup.info';
  const from = process.env.RESEND_FROM_EMAIL || 'Pit Row Miami <onboarding@resend.dev>';

  const subject = `New Pit Row Miami booking request from ${name}`;
  const text = [
    `New Booking Request — Pit Row Miami`,
    `====================================`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    ``,
    `Event Type: ${eventType || 'Not specified'}`,
    `Event Date: ${eventDate}`,
    `Preferred Time: ${eventTime || 'Not specified'}`,
    `Estimated Guests: ${guests || 'Not specified'}`,
    `Location: ${location || 'Not specified'}`,
    ``,
    `Message:`,
    `${message || 'No additional message'}`,
    ``,
    `Submitted: ${new Date().toISOString()}`,
    `====================================`,
    `Reply to this email to respond to ${name}`
  ].join('\n');

  try {
    const response = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text
      })
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(body));
      throw new Error(body.message || `Resend error (${response.status})`);
    }

    return json(200, { success: true, message: 'Booking request received! We will reach out to confirm.' });
  } catch (error) {
    console.error('Booking notification failed:', error.message);
    return json(502, { success: false, message: 'Could not send your request. Please try again or email us directly at info@pitrowmiami.com.' });
  }
}
