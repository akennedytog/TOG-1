// Twilio callbacks for Pit Row Miami (954) 800-2162
// Netlify Function: /api/twilio-callback
// Handles: voicemail transcription, call recording, missed-call alerts.
// Emails Alec via Resend so every call is visible.
const BRAND = 'Pit Row Miami';
const TO_EMAIL = 'akennedy@theonegroup.info';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Pit Row Miami calls <hello@pitrowmiami.com>';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

async function sendEmail({ subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'RESEND_API_KEY not configured' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject, text }),
  });
  const body = await response.json().catch(() => ({}));
  return { sent: response.ok, reason: response.ok ? undefined : body.message };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { success: false, message: 'Method not allowed' });
  const params = new URLSearchParams(event.body || '');
  const eventType = params.get('EventType') || params.get('TranscriptionStatus') || 'unknown';
  const from = params.get('From') || 'unknown';
  const to = params.get('To') || BRAND;
  const callSid = params.get('CallSid') || 'unknown';
  const now = new Date().toISOString();

  if (params.get('TranscriptionStatus') === 'completed') {
    const transcript = params.get('TranscriptionText') || '(empty)';
    const subject = `📞 Voicemail from ${from} — ${BRAND}`;
    const text = [
      `New voicemail transcription:`,
      ``,
      `From: ${from}`,
      `To: ${to}`,
      `Time: ${now}`,
      `Call SID: ${callSid}`,
      ``,
      `TRANSCRIPT:`,
      transcript,
      ``,
      `— ${BRAND} call system`,
    ].join('\n');
    const result = await sendEmail({ subject, text });
    return json(200, { success: true, type: 'transcription', email: result });
  }

  if (params.get('RecordingStatus') === 'completed') {
    const recordingUrl = params.get('RecordingUrl') || '';
    const duration = params.get('RecordingDuration') || '?';
    const subject = `🎙️ Call recording (${duration}s) from ${from} — ${BRAND}`;
    const text = [
      `Call recording available:`,
      ``,
      `From: ${from}`,
      `To: ${to}`,
      `Time: ${now}`,
      `Duration: ${duration}s`,
      `Call SID: ${callSid}`,
      ``,
      `Listen: ${recordingUrl}`,
      ``,
      `— ${BRAND} call system`,
    ].join('\n');
    const result = await sendEmail({ subject, text });
    return json(200, { success: true, type: 'recording', email: result });
  }

  if (eventType === 'no-answer' || eventType === 'failed' || eventType === 'busy') {
    const subject = `📵 Missed call from ${from} — ${BRAND}`;
    const text = [
      `Missed call alert:`,
      ``,
      `From: ${from}`,
      `To: ${to}`,
      `Time: ${now}`,
      `Status: ${eventType}`,
      `Call SID: ${callSid}`,
      ``,
      `— ${BRAND} call system`,
    ].join('\n');
    const result = await sendEmail({ subject, text });
    return json(200, { success: true, type: 'missed-call', email: result });
  }

  return json(200, { success: true, type: eventType, handled: false });
}
