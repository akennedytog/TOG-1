// Profile Detail Page - with TikTok Script Generator

let currentProfile = null;

// Load profile data
async function loadProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('name') || 'lebron-james';
    
    try {
        const response = await fetch('./data.json');
        const profiles = await response.json();
        currentProfile = profiles.find(p => p.slug === slug);
        
        if (!currentProfile) {
            // Fallback to first profile
            currentProfile = profiles[0];
        }
        
        renderProfile();
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('loading').innerHTML = '<p class="text-red-600">Error loading profile</p>';
    }
}

function renderProfile() {
    const p = currentProfile;
    
    // Hide loading, show profile
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('profile').classList.remove('hidden');
    
    // Basic info
    document.getElementById('name').textContent = p.name;
    document.getElementById('famousFor').textContent = p.famous_for;
    document.getElementById('initial').textContent = p.name.charAt(0);
    document.getElementById('highSchool').textContent = p.high_school;
    document.getElementById('hometown').textContent = p.hometown;
    document.getElementById('position').textContent = p.position || 'N/A';
    
    // Sports tags
    const sportIcons = {
        'football': '🏈', 'basketball': '🏀', 'baseball': '⚾',
        'track': '🏃', 'soccer': '⚽', 'wrestling': '🤼',
        'tennis': '🎾', 'swimming': '🏊', 'gymnastics': '🤸',
        'dance': '💃'
    };
    
    document.getElementById('sports').innerHTML = p.sports.map(s => 
        `<span class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">${sportIcons[s] || '🏆'} ${s}</span>`
    ).join('');
    
    // Stats
    if (Object.keys(p.stats).length > 0) {
        document.getElementById('statsSection').classList.remove('hidden');
        document.getElementById('statsGrid').innerHTML = Object.entries(p.stats)
            .filter(([k, v]) => v && v !== '')
            .slice(0, 4)
            .map(([key, value]) => `
                <div class="stat-card rounded-xl p-4 text-white">
                    <div class="text-2xl font-black">${value}</div>
                    <div class="text-xs text-purple-100 capitalize">${key.replace(/_/g, ' ')}</div>
                </div>
            `).join('');
    }
    
    // Achievements
    document.getElementById('achievements').innerHTML = p.notable_achievements
        .map(a => `<li class="flex items-start gap-2"><span class="text-yellow-500">⭐</span><span>${a}</span></li>`)
        .join('');
    
    // What if
    document.getElementById('whatIf').textContent = p.what_if_analysis;
    
    // Viral angle
    document.getElementById('viralAngle').textContent = p.viral_angle;
    
    // Generate TikTok script
    generateTikTokScript();
    
    // Update page title
    document.title = `${p.name} — Athlete Origins`;
}

function generateTikTokScript() {
    const p = currentProfile;
    
    // Generate different script formats
    const scripts = [
        // Hook-style script
        `[HOOK]
"Before ${p.name} became ${p.famous_for.split(',')[0]}..."

[REVEAL]
"They were dominating at ${p.high_school}"

[STAT]
"${getBestStat(p)}"

[ACHIEVEMENT]
"${p.notable_achievements[0]}"

[WHAT IF]
"${p.what_if_analysis.substring(0, 100)}..."

[CTA]
"Follow for more athlete origin stories"`,
        
        // Comparison script
        `[HOOK - Text on screen]
"${p.name} in high school vs ${p.name} now"

[VOICEOVER]
"You know ${p.name} as ${p.famous_for.split(',')[0]}.

But at ${p.high_school} in ${p.hometown.split(',')[0]}...

They were ${p.sports.join(' and ')}."

[STAT FLASH]
${getBestStat(p)}

[REVEAL]
"${p.viral_angle.substring(0, 80)}..."

[END CARD]
"What other celebrities played sports?"`,
        
        // Quick fact script
        `[FAST CUTS]
Text: "Did you know?"

[0.5s later]
Text: "${p.name}"

[0.5s later]
Text: "${p.high_school}"

[1s]
Show: ${getBestStat(p)}

[VOICEOVER]
"${p.viral_angle}"

[TEXT]
"Athlete Origins - Link in bio"`,
        
        // Story format
        `[VISUAL: Yearbook photo style]
"Class of ${getGradYear(p)}"

[VOICEOVER]
"This is ${p.name} before the fame.

Before ${p.famous_for.split(',')[0]}.

This is ${p.name} averaging ${getBestStat(p)} at ${p.high_school}."

[REVEAL]
"Most people don't know that ${p.what_if_analysis.toLowerCase()}"

[END]
"What if they chose sports instead?"

[FOLLOW CTA]`
    ];
    
    // Pick a random script or use the first one
    const script = scripts[0];
    
    document.getElementById('tiktokScript').innerHTML = script
        .replace(/\n/g, '<br>')
        .replace(/\[([^\]]+)\]/g, '<span class="text-purple-400 font-bold">[$1]</span>');
}

function getBestStat(p) {
    const important = ['ppg', 'yards', 'touchdowns', 'sacks', 'draft_round'];
    for (const key of important) {
        const match = Object.entries(p.stats).find(([k, v]) => k.includes(key) && v);
        if (match) return `${match[1]} ${match[0].replace(/_/g, ' ')}`;
    }
    const first = Object.entries(p.stats).find(([k, v]) => v);
    return first ? `${first[1]} ${first[0].replace(/_/g, ' ')}` : 'Multi-sport athlete';
}

function getGradYear(p) {
    // Rough estimate based on age
    const birthYears = {
        'LeBron James': 1984, 'Tom Brady': 1977, 'Dwayne Johnson': 1972,
        'Michael Jordan': 1963, 'Patrick Mahomes': 1995, 'Kyler Murray': 1997
    };
    const year = birthYears[p.name] || 1990;
    return year + 18;
}

function copyViral() {
    navigator.clipboard.writeText(currentProfile.viral_angle)
        .then(() => alert('Viral angle copied!'))
        .catch(() => alert('Could not copy'));
}

function copyTikTok() {
    const script = document.getElementById('tiktokScript').innerText;
    navigator.clipboard.writeText(script)
        .then(() => alert('TikTok script copied!'))
        .catch(() => alert('Could not copy'));
}

// Initialize
loadProfile();
