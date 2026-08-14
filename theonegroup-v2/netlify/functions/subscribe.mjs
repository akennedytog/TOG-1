// Newsletter subscribe function
// Stores email and notifies Alec via email
// Can be upgraded to ConvertKit/Mailchimp later

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL || 'akennedy@theonegroup.info';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'The One Group <onboarding@resend.dev>';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sendEmail({ to, from, replyTo, subject, text }) {
  const apiKey = RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const payload = { from, to, subject, text };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error (${res.status}): ${err}`);
  }

  return res.json();
}

export default async (req) => {
  const headers = req.headers;
  const origin = headers.get('origin') || 'https://theonegroup.info';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' });
  }

  try {
    const body = await req.json();
    const { email, form_type } = body;

    if (!email || !email.includes('@')) {
      return json(400, { success: false, message: 'Valid email is required' });
    }

    // Notify Alec
    try {
      await sendEmail({
        to: RESEND_TO_EMAIL,
        from: RESEND_FROM_EMAIL,
        replyTo: email,
        subject: `📬 New newsletter subscriber: ${email}`,
        text: `New newsletter subscriber:\n\nEmail: ${email}\nForm: ${form_type || 'newsletter'}\nTime: ${new Date().toISOString()}`
      });
    } catch (emailErr) {
      console.error('Subscriber notification failed:', emailErr.message);
    }

    // Send confirmation to subscriber
    try {
      await sendEmail({
        to: email,
        from: RESEND_FROM_EMAIL,
        replyTo: RESEND_TO_EMAIL,
        subject: 'Welcome to The One Group newsletter!',
        text: `Thanks for subscribing!\n\nYou'll receive weekly AI insights, automation tips, and tools for SMBs.\n\nIf you have any questions, just reply to this email.\n\n— Alec Kennedy\nThe One Group`
      });
    } catch (confirmErr) {
      console.error('Confirmation email failed:', confirmErr.message);
    }

    return json(200, { success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    return json(500, { success: false, message: 'Server error. Please try again.' });
  }
};
