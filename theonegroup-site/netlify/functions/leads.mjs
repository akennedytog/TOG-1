const HUBSPOT_API = 'https://api.hubapi.com/crm/v3/objects';
const requestCounts = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;

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

function cleanProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );
}

function splitName(value = '') {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  return { firstname: parts.shift() || '', lastname: parts.join(' ') };
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function hubspot(path, options = {}) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const response = await fetch(`${HUBSPOT_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || `HubSpot request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return body;
}

async function sendEmail({ to, from, replyTo, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Resend request failed (${response.status})`);
  return body;
}

async function sendLeadNotification({ formType, payload, email, company }) {
  const to = process.env.RESEND_TO_EMAIL || 'akennedy@theonegroup.info';
  const from = process.env.RESEND_FROM_EMAIL || 'The One Group leads <onboarding@resend.dev>';
  const name = String(payload.name || '').trim() || 'Unknown';
  const subject = `${formType === 'audit' ? 'Free AI audit' : 'Qualification'} lead: ${company}`;
  const details = [
    `Form: ${formType}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company}`,
    payload.phone ? `Phone: ${payload.phone}` : '',
    payload.industry ? `Industry: ${payload.industry}` : '',
    payload.painpoint ? `Pain point: ${payload.painpoint}` : '',
    payload.goal ? `Goal: ${payload.goal}` : '',
    payload.budget ? `Budget: ${payload.budget}` : '',
    payload.timeline ? `Timeline: ${payload.timeline}` : '',
    payload.source ? `Source: ${payload.source}` : '',
    `Submitted: ${payload.submittedAt || new Date().toISOString()}`
  ].filter(Boolean).join('\n');

  return sendEmail({ to, from, replyTo: email, subject, text: details });
}

async function sendVisitorConfirmation({ formType, payload, email, company }) {
  const from = process.env.RESEND_FROM_EMAIL || 'The One Group leads <onboarding@resend.dev>';
  const name = String(payload.name || '').trim() || 'there';
  const subject = formType === 'audit' ? 'We received your AI audit request' : 'We received your qualification request';
  const text = `Hi ${name},

We received your request for ${company}. Alec will review it and follow up shortly.

${formType === 'audit' ? 'Your AI audit request is in review. Expect a response within 24–48 hours.' : 'If you have not already booked your strategy call, you can do that here: https://calendly.com/akennedy-theonegroup/30min'}

— The One Group
https://theonegroup.info`;
  return sendEmail({ to: email, from, replyTo: process.env.RESEND_TO_EMAIL || 'akennedy@theonegroup.info', subject, text });
}

async function findContact(email) {
  const result = await hubspot('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email', 'firstname', 'lastname', 'phone', 'company'],
      limit: 1
    })
  });
  return result.results?.[0] || null;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' });
  }
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  if (rawBody.length > 32768) return json(413, { success: false, message: 'Request is too large' });
  const origin = event.headers?.origin || event.headers?.Origin || '';
  if (origin && !/^https:\/\/(www\.)?theonegroup\.info$/i.test(origin)) return json(403, { success: false, message: 'Request origin is not allowed' });
  const ip = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (requestCounts.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return json(429, { success: false, message: 'Too many submissions. Please try again later.' });
  recent.push(now);
  requestCounts.set(ip, recent);
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN is not configured');
    return json(503, { success: false, message: 'Lead capture is temporarily unavailable' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    return json(400, { success: false, message: 'Invalid JSON payload' });
  }

  if (String(payload.website || '').trim()) return json(400, { success: false, message: 'Invalid submission' });

  const formType = String(payload.form_type || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const company = String(payload.company || payload.business || '').trim();
  if (!['audit', 'qualification'].includes(formType)) {
    return json(400, { success: false, message: 'Valid form_type (audit or qualification) is required' });
  }
  if (!validEmail(email)) {
    return json(400, { success: false, message: 'A valid email is required' });
  }
  if (!company) {
    return json(400, { success: false, message: 'Company is required' });
  }

  const name = splitName(payload.name);
  const properties = cleanProperties({
    email,
    firstname: name.firstname,
    lastname: name.lastname,
    phone: payload.phone,
    company
  });

  try {
    const existing = await findContact(email);
    if (existing?.id) {
      await hubspot(`/contacts/${encodeURIComponent(existing.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties })
      });
    } else {
      await hubspot('/contacts', {
        method: 'POST',
        body: JSON.stringify({ properties })
      });
    }

    try {
      await sendLeadNotification({ formType, payload, email, company });
    } catch (error) {
      console.error(`Lead notification failed after HubSpot sync:`, error.message);
      return json(502, { success: false, message: 'Your request was saved, but we could not send the notification. Please try again.' });
    }

    let confirmationSent = false;
    try {
      await sendVisitorConfirmation({ formType, payload, email, company });
      confirmationSent = true;
    } catch (error) {
      console.error('Visitor confirmation failed:', error.message);
    }

    return json(200, { success: true, hubspot: { enabled: true, synced: true }, notification: { sent: true }, confirmation: { sent: confirmationSent } });
  } catch (error) {
    console.error(`HubSpot ${formType} lead sync failed:`, error.message);
    return json(502, { success: false, message: 'We could not save your request right now. Please try again.' });
  }
}
