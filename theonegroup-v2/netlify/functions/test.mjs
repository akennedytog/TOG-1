export async function handler(event) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hubspot: !!process.env.HUBSPOT_ACCESS_TOKEN,
      resend: !!process.env.RESEND_API_KEY,
      node: process.version,
      env_keys: Object.keys(process.env).filter(k => k.includes('HUBSPOT') || k.includes('RESEND') || k.includes('NODE'))
    })
  };
}
