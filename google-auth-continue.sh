#!/bin/bash
# Google OAuth Authentication Script
# Run this to authenticate gog with Google Drive/Sheets

echo "🔐 Google OAuth Setup"
echo "====================="
echo ""
echo "This will authenticate gog to access your Google Drive and Sheets."
echo "You'll need to visit a URL in your browser and authorize."
echo ""

# Check if credentials exist
if [ ! -f "$HOME/.openclaw/workspace/google-credentials.json" ]; then
    echo "❌ Error: google-credentials.json not found"
    exit 1
fi

# Set up credentials
echo "✓ Credentials file found"
gog auth credentials "$HOME/.openclaw/workspace/google-credentials.json"

# Add account with Drive and Sheets access
echo ""
echo "➕ Adding Google account..."
echo "When prompted, visit the URL in your browser and authorize."
echo "Then paste the code back here."
echo ""

# Get email from user
echo -n "Enter your Google email (e.g., akennedy@gmail.com): "
read EMAIL

gog auth add "$EMAIL" --services drive,sheets

echo ""
echo "✅ Authentication complete!"
echo "You can now create Google Forms and Sheets using gog."
echo ""