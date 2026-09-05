// Twilio Voice handler for The One Group (754) 799-8676
// Netlify Function: /api/twilio-voice
// Handles: business-hours forwarding, after-hours auto-responder,
//          voicemail with transcription, call recording, missed-call logging.
// Business hours: Mon-Fri 9:00-18:00 America/New_York
const BUSINESS_HOURS = { start: 9, end: 18 }; // 9am-6pm
const FORWARD_TO = '+15024037201'; // Alec's cell
const BRAND = 'The One Group';
const BUSINESS_NAME = 'The One Group';
const CALLER_ID = '+17547998676';

function isBusinessHours(now) {
  const et = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const weekday = et.find((p) => p.type === 'weekday')?.value;
  const hour = parseInt(et.find((p) => p.type === 'hour')?.value, 10);
  const isWeekday = !['Sat', 'Sun'].includes(weekday);
  return isWeekday && hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end;
}

export async function handler(event) {
  const params = new URLSearchParams(event.body || '');
  const now = new Date();
  const inHours = isBusinessHours(now);

  // Build TwiML response
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

  if (inHours) {
    // Business hours: forward to Alec, record the call, voicemail on no-answer
    twiml += `  <Dial callerId="${CALLER_ID}" timeout="25" record="record-from-answer" recordingStatusCallback="https://theonegroup.info/api/twilio-callback" recordingStatusCallbackEvent="completed" recordingStatusCallbackMethod="POST">\n`;
    twiml += `    <Number>${FORWARD_TO}</Number>\n`;
    twiml += `  </Dial>\n`;
    // If Dial fails or times out, play voicemail prompt and record
    twiml += `  <Say voice="alice" language="en-US">You've reached ${BRAND}. We're unable to answer right now. Please leave a message after the tone and we'll get back to you shortly.</Say>\n`;
    twiml += `  <Record transcribe="true" transcribeCallback="https://theonegroup.info/api/twilio-transcription" maxLength="120" playBeep="true" />\n`;
    twiml += `  <Say voice="alice" language="en-US">Thank you for calling. Goodbye.</Say>\n`;
  } else {
    // After hours: auto-responder, offer to text, then voicemail
    twiml += `  <Say voice="alice" language="en-US">Thank you for calling ${BRAND}. Our office is currently closed. Please text us at ${CALLER_ID} and we'll get back to you within 24 hours. Or leave a message after the tone.</Say>\n`;
    twiml += `  <Record transcribe="true" transcribeCallback="https://theonegroup.info/api/twilio-transcription" maxLength="120" playBeep="true" />\n`;
    twiml += `  <Say voice="alice" language="en-US">Thank you. We'll get back to you soon. Goodbye.</Say>\n`;
  }

  twiml += '</Response>';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: twiml,
  };
}
