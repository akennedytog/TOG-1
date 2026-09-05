// Twilio SMS auto-reply for Pit Row Miami (954) 800-2162
// Netlify Function: /api/twilio-sms
// Auto-replies to texts with booking info.
const BRAND = 'Pit Row Miami';
const BOOKING_URL = 'https://pitrowmiami.com';
const SITE_URL = 'https://pitrowmiami.com';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'text/xml' }, body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>' };
  }
  const params = new URLSearchParams(event.body || '');
  const body = (params.get('Body') || '').trim().toLowerCase();

  const bookingKeywords = ['book', 'schedule', 'rent', 'rental', 'price', 'cost', 'quote', 'party', 'event', 'corporate', 'sim', 'simulator', 'race', 'f1', 'formula', 'bachelor', 'birthday'];
  const wantsBooking = bookingKeywords.some((k) => body.includes(k));

  let reply;
  if (wantsBooking) {
    reply = `Thanks for reaching out to ${BRAND}! 🏎️\n\nWe bring pro-grade racing simulators to your event — corporate, parties, team building, and more.\n\n👉 Check availability + pricing: ${BOOKING_URL}\n\nOr reply with your name, event type, and date and we'll get back to you.`;
  } else {
    reply = `Thanks for texting ${BRAND}! 🏎️\n\nWe bring pro-grade racing simulators to events across South Florida — corporate team building, parties, and more.\n\n👉 See options + book: ${SITE_URL}\n\nReply with your name + event details and we'll follow up.`;
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>\n</Response>`;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: twiml,
  };
}
