import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
const CREDENTIALS_PATH = path.resolve(process.cwd(), "credentials.json");
const TOKEN_PATH = path.resolve(process.cwd(), "token.json");

async function authorize() {
  // Reuse saved token if present
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    const auth = new google.auth.OAuth2();
    auth.setCredentials(token);
    return auth;
  }

  // This starts a temporary localhost server and opens the browser.
  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  // Persist token for next runs
  const creds = client.credentials;
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(creds, null, 2), "utf8");
  console.log(`Saved token to ${TOKEN_PATH}`);
  return client;
}

async function listNextEvents(auth) {
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = res.data.items ?? [];
  console.log("\nUpcoming events:");
  if (!events.length) return console.log("(none)");

  for (const e of events) {
    const start = e.start?.dateTime || e.start?.date || "unknown";
    console.log(`- ${start} — ${e.summary || "(no title)"}`);
  }
}

(async () => {
  try {
    const auth = await authorize();
    await listNextEvents(auth);
  } catch (err) {
    console.error("Auth/script failed:", err?.message || err);
    process.exit(1);
  }
})();
