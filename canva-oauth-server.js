import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.CANVA_REDIRECT_URI;

app.get("/oauth/canva/start", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = `https://www.canva.com/api/oauth/authorize?${new URLSearchParams({
    client_id: CANVA_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "profile:read design:meta:read",
    state
  })}`;
  res.redirect(authUrl);
});

app.get("/oauth/canva/callback", express.urlencoded({ extended: true }), async (req, res) => {
  const code = req.query.code;
  const basic = Buffer.from(`${CANVA_CLIENT_ID}:${CANVA_CLIENT_SECRET}`).toString("base64");
  try {
    const response = await fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    const data = await response.json();
    // TODO: save data.access_token + data.refresh_token to your database
    console.log("Canva tokens:", data);
    res.send("Canva connected successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error exchanging code for token");
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
