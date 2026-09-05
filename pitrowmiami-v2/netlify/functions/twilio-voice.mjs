// Twilio Voice handler for Pit Row Miami (954) 800-2162
// Netlify Function: /api/twilio-voice
// Handles: business-hours forwarding, after-hours auto-responder,
//          voicemail with transcription, call recording, missed-call logging.
const BUSINESS_HOURS = { start: 9, end: 18 }; // 9am-6pm
const FORWARD_TO = '+15024037201'; // Alec's cell
const BRAND = 'Pit Row Miami';
const CALLER_ID = '+19548002162';

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

  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

  if (inHours) {
    twiml += `  <Dial callerId="${CALLER_ID}" timeout="25" record="record-from-answer" recordingStatusCallback="https://pitrowmiami.com/api/twilio-callback" recordingStatusCallbackEvent="completed" recordingStatusCallbackMethod="POST">\n`;
    twiml += `    <Number>${FORWARD_TO}</Number>\n`;
    twiml += `  </Dial>\n`;
    twiml += `  <Say voice="alice" language="en-US">You've reached ${BRAND}. We're unable to answer right now. Please leave a message after the tone and we'll get back to you shortly.</Say>\n`;
    twiml += `  <Record transcribe="true" transcribeCallback="https://pitrowmiami.com/api/twilio-callback" maxLength="120" playBeep="true" />\n`;
    twiml += `  <Say voice="alice" language="en-US">Thank you for calling. Goodbye.</Say>\n`;
  } else {
    twiml += `  <Say voice="alice" language="en-US">Thank you for calling ${BRAND}. We're currently closed. Please text us at ${CALLER_ID} to book a racing simulator experience, or leave a message after the tone.</Say>\n`;
    twiml += `  <Record transcribe="true" transcribeCallback="https://pitrowmiami.com/api/twilio-callback" maxLength="120" playBeep="true" />\n`;
    twiml += `  <Say voice="alice" language="en-US">Thank you. We'll get back to you soon. Goodbye.</Say>\n`;
  }

  twiml += '</Response>';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: twiml,
  };
}
