require('dotenv').config();
const fs = require('fs');
const { TwitterApi } = require('twitter-api-v2');

(async () => {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    }).readWrite;

    // Read the avatar SVG and convert to base64-encoded PNG using sharp
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync('avatar.svg');
    const pngBuffer = await sharp(svgBuffer)
      .resize(400, 400)
      .png()
      .toBuffer();

    // Upload media
    const mediaId = await client.v1.uploadMedia(pngBuffer, { mimeType: 'image/png' });

    // Update profile image
    await client.v1.updateAccountProfileImage(pngBuffer);

    console.log('Profile picture updated successfully');
  } catch (err) {
    console.error('Error updating profile picture:', err);
    process.exit(1);
  }
})();