// Athlete Origins - Main Application

let allProfiles = [];
let currentFilter = 'all';

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error('Failed to fetch');
        allProfiles = await response.json();
        document.getElementById('totalProfiles').textContent = allProfiles.length;
        
        // Debug: log number of profiles loaded
        console.log(`Loaded ${allProfiles.length} profiles`);
        console.log('First few profiles:', allProfiles.slice(0, 3).map(p => p.name));
        
        renderProfiles();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('profilesGrid').innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-600 mb-4">Error loading profiles</p>
                <p class="text-sm text-gray-500">${error.message}</p>
                <button onclick="loadData()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">Retry</button>
            </div>
        `;
    }
}

// Render profiles
function renderProfiles() {
    const grid = document.getElementById('profilesGrid');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = allProfiles;
    
    // Filter by search
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.high_school.toLowerCase().includes(searchTerm) ||
            p.hometown.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by sport
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => 
            p.sports.includes(currentFilter)
        );
    }
    
    grid.innerHTML = filtered.map(profile => createProfileCard(profile)).join('');
}

// Create profile card HTML
function createProfileCard(profile) {
    const sportIcons = {
        'football': '🏈',
        'basketball': '🏀',
        'baseball': '⚾',
        'track': '🏃',
        'soccer': '⚽',
        'wrestling': '🤼',
        'tennis': '🎾',
        'swimming': '🏊',
        'gymnastics': '🤸',
        'dance': '💃',
        'boxing': '🥊',
        'lacrosse': '🥍',
        'rugby': '🏉',
        'golf': '⛳',
        'hockey': '🏒',
        'mma': '🥋',
        'judo': '🥋',
        'muay_thai': '🥋',
        'martial_arts': '🥋',
        'karate': '🥋',
        'taekwondo': '🥋'
    };
    
    // Data quality badge
    const qualityColors = {
        'high': 'bg-green-100 text-green-700',
        'medium': 'bg-yellow-100 text-yellow-700',
        'low': 'bg-orange-100 text-orange-700',
        'scraped': 'bg-gray-100 text-gray-600'
    };
    const qualityBadge = profile.data_quality ? 
        `<span class="absolute top-3 right-3 px-2 py-1 text-xs rounded-full font-medium ${qualityColors[profile.data_quality] || 'bg-gray-100 text-gray-600'}">${profile.data_quality}</span>` : '';
    
    const sportsDisplay = profile.sports.map(s => 
        `<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">${sportIcons[s] || '🏆'} ${s}</span>`
    ).join('');
    
    // Format stats for display
    let statsDisplay = '';
    const importantStats = Object.entries(profile.stats || {})
        .filter(([key]) => key.includes('ppg') || key.includes('yards') || key.includes('touchdowns') || key.includes('draft'))
        .slice(0, 3);
    
    if (importantStats.length > 0) {
        statsDisplay = `
            <div class="flex gap-3 mt-3">
                ${importantStats.map(([key, value]) => `
                    <div class="bg-blue-50 px-2 py-1 rounded">
                        <div class="text-lg font-bold text-blue-600">${value}</div>
                        <div class="text-xs text-blue-500 capitalize">${key.replace(/_/g, ' ')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Stats available indicator
    const hasStatsIndicator = Object.keys(profile.stats || {}).length > 0 ? 
        `<span class="text-xs text-blue-500 flex items-center gap-1 mt-2">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Stats available
        </span>` : '';
    
    return `
        <article class="card-hover bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer relative" onclick="window.location.href='profile.html?name=${profile.slug}'">
            ${qualityBadge}
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors">${profile.name}</h3>
                        <p class="text-sm text-gray-500 mt-1">${profile.famous_for}</p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        ${profile.name.charAt(0)}
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span class="text-gray-600">${profile.high_school || 'HS Unknown'}</span>
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        <span class="text-gray-600">${profile.hometown || 'Hometown unknown'}</span>
                    </div>
                    
                    ${profile.position ? `
                        <div class="flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span class="text-gray-600">${profile.position}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${statsDisplay}
                ${hasStatsIndicator}
                
                <div class="flex flex-wrap gap-2 mt-4">
                    ${sportsDisplay}
                </div>
                
                ${profile.what_if_analysis ? `
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <p class="text-sm text-purple-600 font-medium">What If? →</p>
                        <p class="text-sm text-gray-600 mt-1 line-clamp-2">${profile.what_if_analysis}</p>
                    </div>
                ` : ''}
            </div>
        </article>
    `;
}

// Filter buttons
function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => {
                b.classList.remove('bg-purple-600', 'text-white');
                b.classList.add('bg-white', 'text-gray-600');
            });
            btn.classList.remove('bg-white', 'text-gray-600');
            btn.classList.add('bg-purple-600', 'text-white');
            
            // Update filter
            currentFilter = btn.dataset.sport;
            renderProfiles();
        });
    });
}

// Search input
document.getElementById('searchInput')?.addEventListener('input', () => {
    renderProfiles();
});

// Initialize
loadData();
setupFilters();
