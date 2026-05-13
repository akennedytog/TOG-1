const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ConvertKit V3 API configuration
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const CONVERTKIT_BASE_URL = 'https://api.convertkit.com/v3';
const NEWSLETTER_TAG_ID = process.env.NEWSLETTER_TAG_ID;
const BETA_TAG_ID = process.env.BETA_TAG_ID;

// Validate environment variables
if (!CONVERTKIT_API_KEY) {
  console.error('ERROR: CONVERTKIT_API_KEY is required');
  process.exit(1);
}

// Helper function to make ConvertKit V3 API requests
async function convertKitRequest(endpoint, options = {}) {
  // V3 API uses api_key as query param
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${CONVERTKIT_BASE_URL}${endpoint}${separator}api_key=${CONVERTKIT_API_KEY}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Subscribe endpoint - handles both newsletter and beta signups
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, first_name, tag_id, form_type, ...customFields } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!form_type || !['newsletter', 'beta'].includes(form_type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid form_type (newsletter or beta) is required'
      });
    }

    // Determine which tag to use
    let targetTagId = tag_id;
    if (!targetTagId) {
      if (form_type === 'newsletter') {
        targetTagId = NEWSLETTER_TAG_ID;
      } else if (form_type === 'beta') {
        targetTagId = BETA_TAG_ID;
      }
    }

    // V3 API payload
    const subscriberPayload = {
      email: email,
      first_name: first_name || customFields.name || ''
    };

    // Add any custom fields for beta signups
    if (form_type === 'beta' && Object.keys(customFields).length > 0) {
      if (customFields.business) subscriberPayload.business_name = customFields.business;
      if (customFields.team_size) subscriberPayload.team_size = customFields.team_size;
      if (customFields.pain_point) subscriberPayload.pain_point = customFields.pain_point;
    }

    console.log(`Creating ${form_type} subscriber:`, email);

    let subscriberResult;

    // V3 API: If we have a tag, use the tag subscription endpoint
    // Otherwise use the general subscriber endpoint
    if (targetTagId) {
      console.log(`Subscribing to tag ${targetTagId}`);
      subscriberResult = await convertKitRequest(`/tags/${targetTagId}/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscriberPayload)
      });
    } else {
      // Subscribe without a specific tag
      subscriberResult = await convertKitRequest(`/forms`, {
        method: 'GET'  // First get forms, then subscribe to first one
      });
      console.log('No tag configured, available forms:', subscriberResult);
    }

    // Return success response
    res.json({
      success: true,
      message: form_type === 'newsletter' 
        ? 'Successfully subscribed to the newsletter!'
        : 'Beta application submitted successfully! We\'ll be in touch within 48 hours.',
      subscriber: subscriberResult
    });

  } catch (error) {
    console.error('Subscription error:', error.message);
    
    // Check for specific ConvertKit errors
    if (error.message.includes('already subscribed')) {
      return res.status(409).json({
        success: false,
        message: 'You\'re already subscribed!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    convertkit_configured: !!CONVERTKIT_API_KEY
  });
});

// Get tags endpoint (for debugging/configuration)
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await convertKitRequest('/tags');
    res.json(tags);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message
    });
  }
});

// Create tags endpoint (for initial setup)
app.post('/api/tags', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tag name is required' });
    }
    
    const result = await convertKitRequest('/tags', {
      method: 'POST',
      body: JSON.stringify({ tag: { name } })
    });
    
    res.json({ success: true, tag: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 ConvertKit API: ${CONVERTKIT_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`🏷️  Newsletter Tag: ${NEWSLETTER_TAG_ID || 'Not set'}`);
  console.log(`🏷️  Beta Tag: ${BETA_TAG_ID || 'Not set'}`);
});

module.exports = app;
