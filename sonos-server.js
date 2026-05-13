#!/usr/bin/env node
/**
 * Simple Sonos HTTP API
 * Controls speakers via local network
 */

const http = require('http');
const { exec } = require('child_process');

// Sonos speaker IPs
const SPEAKERS = {
  'Living Room': '192.168.4.206',
  'Kitchen': '192.168.4.28',
  'TV Room': '192.168.4.27'
};

// UPnP/SOAP commands for Sonos
function sonosCommand(ip, command, value) {
  return new Promise((resolve, reject) => {
    // Use curl for UPnP SOAP requests
    const soapBody = createSoapBody(command, value);
    const curlCmd = `curl -X POST -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"urn:schemas-upnp-org:service:AVTransport:1#${command}\"" -d '${soapBody}' http://${ip}:1400/MediaRenderer/AVTransport/Control`;
    
    exec(curlCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, response: stdout });
      }
    });
  });
}

function createSoapBody(command, value) {
  const templates = {
    'Play': `<?xml version="1.0" encoding="utf-8"?>
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <s:Body>
          <u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
            <InstanceID>0</InstanceID>
            <Speed>1</Speed>
          </u:Play>
        </s:Body>
      </s:Envelope>`,
    'Pause': `<?xml version="1.0" encoding="utf-8"?>
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <s:Body>
          <u:Pause xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
            <InstanceID>0</InstanceID>
          </u:Pause>
        </s:Body>
      </s:Envelope>`,
    'Next': `<?xml version="1.0" encoding="utf-8"?>
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <s:Body>
          <u:Next xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
            <InstanceID>0</InstanceID>
          </u:Next>
        </s:Body>
      </s:Envelope>`,
    'Previous': `<?xml version="1.0" encoding="utf-8"?>
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <s:Body>
          <u:Previous xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
            <InstanceID>0</InstanceID>
          </u:Previous>
        </s:Body>
      </s:Envelope>`,
    'SetVolume': `<?xml version="1.0" encoding="utf-8"?>
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <s:Body>
          <u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
            <InstanceID>0</InstanceID>
            <Channel>Master</Channel>
            <DesiredVolume>${value}</DesiredVolume>
          </u:SetVolume>
        </s:Body>
      </s:Envelope>`
  };
  return templates[command] || '';
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Parse URL: /living room/play, /kitchen/pause, etc.
  const url = decodeURIComponent(req.url);
  const parts = url.split('/').filter(p => p);
  
  if (parts.length < 2) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Usage: /speaker/command [value]' }));
    return;
  }
  
  const speakerName = parts[0];
  const command = parts[1];
  const value = parts[2];
  
  const ip = SPEAKERS[speakerName];
  if (!ip) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Speaker not found', available: Object.keys(SPEAKERS) }));
    return;
  }
  
  console.log(`[${new Date().toISOString()}] ${speakerName}: ${command} ${value || ''}`);
  
  try {
    const result = await sonosCommand(ip, command, value);
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, speaker: speakerName, command, result }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

const PORT = 5005;
server.listen(PORT, () => {
  console.log('🔊 Sonos HTTP API Server running');
  console.log(`🌐 http://localhost:${PORT}`);
  console.log('\nAvailable speakers:');
  Object.entries(SPEAKERS).forEach(([name, ip]) => {
    console.log(`  • ${name}: ${ip}`);
  });
  console.log('\nEndpoints:');
  console.log('  GET /Living Room/play');
  console.log('  GET /Living Room/pause');
  console.log('  GET /Living Room/next');
  console.log('  GET /Living Room/previous');
  console.log('  GET /Living Room/SetVolume/50');
});