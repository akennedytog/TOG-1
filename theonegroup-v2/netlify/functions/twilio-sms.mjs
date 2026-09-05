// Twilio SMS auto-reply for The One Group (754) 799-8676
// Netlify Function: /api/twilio-sms
// Auto-replies to texts with business info + booking link.
const BRAND = 'The One Group';
const BOOKING_URL = 'https://calendly.com/akennedy-theonegroup/30min';
const SITE_URL = 'https://theonegroup.info';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'text/xml' }, body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>' };
  }
  const params = new URLSearchParams(event.body || '');
  const from = params.get('From') || 'unknown';
  const body = (params.get('Body') || '').trim().toLowerCase();

  // Detect booking intent
  const bookingKeywords = ['book', 'schedule', 'call', 'appointment', 'meeting', 'audit', 'consult', 'quote', 'price', 'pricing', 'cost', 'hire', 'start'];
  const wantsBooking = bookingKeywords.some((k) => body.includes(k));

  let reply;
  if (wantsBooking) {
    reply = `Thanks for reaching out to ${BRAND}! 👋\n\nAlec would love to help. Book a free 30-min strategy call here: ${BOOKING_URL}\n\nOr reply with your name + what you need and we'll get back to you.`;
  } else {
    reply = `Thanks for texting ${BRAND}! 👋\n\nWe help businesses automate with AI — lead gen, scheduling, follow-ups, bookkeeping, and more.\n\n👉 Book a free strategy call: ${BOOKING_URL}\n\nOr check us out: ${SITE_URL}\n\nReply with your name + what you're looking for and Alec will follow up.`;
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>\n</Response>`;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: twiml,
  };
}
