#!/usr/bin/env node
/**
 * Ring API Integration
 * Controls Ring cameras and doorbells
 */

const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Load credentials from secure config
let RING_EMAIL, RING_PASSWORD;
try {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.openclaw', '.ring-config.json'), 'utf-8'));
  RING_EMAIL = config.email;
  RING_PASSWORD = config.password;
} catch {
  // Fallback to env vars
  RING_EMAIL = process.env.RING_EMAIL;
  RING_PASSWORD = process.env.RING_PASSWORD;
}

// Ring API endpoints
const RING_API_BASE = 'api.ring.com';
const RING_DEVICES_ENDPOINT = '/clients_api/ring_devices';

class RingAPI {
  constructor() {
    this.authToken = null;
    this.refreshToken = null;
  }

  async authenticate() {
    if (!RING_EMAIL || !RING_PASSWORD) {
      throw new Error('RING_EMAIL and RING_PASSWORD environment variables required');
    }

    console.log('🔐 Authenticating with Ring...');
    
    // Ring uses a complex OAuth flow - simplified version here
    // In production, use ring-client-api npm package
    
    const postData = querystring.stringify({
      username: RING_EMAIL,
      password: RING_PASSWORD,
      grant_type: 'password',
      client_id: 'ring_official_android'
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'oauth.ring.com',
        port: 443,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Ring/4.0.0 (Android)'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.access_token) {
              this.authToken = response.access_token;
              this.refreshToken = response.refresh_token;
              console.log('✅ Ring authentication successful');
              resolve(response);
            } else {
              reject(new Error('Authentication failed: ' + JSON.stringify(response)));
            }
          } catch (err) {
            reject(new Error('Parse error: ' + err.message));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async getDevices() {
    if (!this.authToken) await this.authenticate();

    console.log('📹 Fetching Ring devices...');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: RING_API_BASE,
        port: 443,
        path: RING_DEVICES_ENDPOINT + '?auth_token=' + this.authToken,
        method: 'GET',
        headers: {
          'User-Agent': 'Ring/4.0.0 (Android)',
          'Authorization': 'Bearer ' + this.authToken
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const devices = JSON.parse(data);
            resolve(devices);
          } catch (err) {
            reject(new Error('Failed to parse devices: ' + err.message));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }
}

// Run if called directly
if (require.main === module) {
  const ring = new RingAPI();
  
  ring.getDevices()
    .then(devices => {
      console.log('\n📹 Ring Devices Found:');
      console.log(JSON.stringify(devices, null, 2));
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      console.log('\nNote: Ring API requires 2FA. Check your phone for verification code.');
    });
}

module.exports = RingAPI;