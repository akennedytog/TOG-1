// TikTok Browser Automation Script
// Uses browser-use CLI to auto-post videos

const { execSync } = require('child_process');
const path = require('path');

const VIDEOS = [
  {
    file: '/Users/aleckennedy/.openclaw/media/tool-video-generation/openclaw-setup-service-promo---0ec26ae1-1c93-4cce-b25f-b4b4d5825a96.mp4',
    caption: `I built an 8-agent AI system that runs my entire business 24/7

And I'll set it up for YOUR business for $500 + $297/month

Stop losing calls to voicemail ❌
Stop doing follow-up manually ❌
Stop creating content daily ❌

Your competitors are already using AI. You're just making it easier for them.

Link in bio for free 30-min call 📞

#smallbusiness #ai #automation #entrepreneur #openclaw #aitools #sidehustle #businessowner`,
    scheduleTime: '2026-04-07T09:00:00' // Tomorrow 9am
  },
  {
    file: '/Users/aleckennedy/.openclaw/media/tool-video-generation/ai-automation-benefits-explainer---2d8699b2-3548-4983-a117-ec003b8d7dfc.mp4',
    caption: `Real talk: You're losing $5k-$15k/month to missed calls

I audited 90+ South Florida businesses last week. The #1 problem? 

📞 15-20 calls/week going to voicemail
💸 $300-800 average customer value
🗑️ That's $4,500-16,000 lost EVERY MONTH

Not a marketing problem. A systems problem.

Fix the leaks. Then scale.

Comment "LEAKS" and I'll DM you the exact audit checklist I use 👇

#businessautomation #ai #smallbusiness #hvac #lawyer #dentist #realestate #missedcalls #revenue`,
    scheduleTime: '2026-04-07T14:00:00' // Tomorrow 2pm
  }
];

async function postToTikTok(video) {
  console.log(`Posting: ${path.basename(video.file)}`);
  
  // Commands to execute
  const commands = [
    // Open TikTok
    `browser-use --profile "AKennedy" --headed open https://www.tiktok.com/upload`,
    `sleep 5`,
    
    // Upload video
    `browser-use upload 0 "${video.file}"`,
    `sleep 3`,
    
    // Add caption
    `browser-use type "${video.caption}"`,
    `sleep 2`,
    
    // Click post
    `browser-use click "Post"`
  ];
  
  console.log('Commands prepared. Ready to execute.');
  return commands;
}

console.log('TikTok Automation Ready');
console.log(`Videos to post: ${VIDEOS.length}`);
VIDEOS.forEach((v, i) => {
  console.log(`${i+1}. ${path.basename(v.file)}`);
});

module.exports = { VIDEOS, postToTikTok };