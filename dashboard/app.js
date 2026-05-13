// Lead Management Dashboard - Updated with Email Campaign Tracking
(function() {
  'use strict';

  // State
  let leads = [];
  let sortField = 'score';
  let sortDirection = 'desc';
  let searchQuery = '';

  // Status options
  const STATUS_OPTIONS = ['New', 'Contacted', 'Responded', 'Qualified', 'Not Interested'];

  // Email sequence status
  const EMAIL_TOUCHES = ['Touch 1', 'Touch 2', 'Touch 3', 'Touch 4'];

  // Campaign info
  const CAMPAIGN_INFO = {
    sender: 'Alec Kennedy',
    senderEmail: 'alec@theonegroup.io',
    senderPhone: '(305) 555-0142',
    lastUpdated: '2026-03-23'
  };

  // DOM Elements
  const tableBody = document.getElementById('leadsTableBody');
  const mobileCards = document.getElementById('mobileCards');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const exportBtn = document.getElementById('exportBtn');
  const totalLeadsEl = document.getElementById('totalLeads');
  const avgScoreEl = document.getElementById('avgScore');
  const highPriorityEl = document.getElementById('highPriority');
  const industryStatsEl = document.getElementById('industryStats');

  // Load leads from localStorage or use defaults
  function loadLeads() {
    const stored = localStorage.getItem('arloLeads');
    if (stored) {
      leads = JSON.parse(stored);
      // Check if we need to update with email campaign data
      updateWithEmailData();
    } else {
      // Initial data from current campaign (8 leads with sequences)
      leads = [
        {"name":"RCI Air Conditioning Company","industry":"HVAC","city":"Miami","website":"https://rci-air.com","phone":"(305) 396-3728","address":"Pinecrest, Coral Gables, Palmetto Bay, Cutler Bay, FL","score":9,"notes":"Trane Comfort Specialist dealer. Commercial and residential HVAC services. Family business founded 2010, expanded commercial in 2014.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Trinity Air Conditioning Company","industry":"HVAC","city":"Miami","website":"https://trinityac.com","phone":"(305) 224-6935","address":"13601 SW 143rd Ct #104, Miami, FL 33186","score":9,"notes":"Established 1986, serving South Florida for over 40 years. Full-service mechanical contractor, union company. 24/7 service available.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Panther AC & Electric","industry":"HVAC","city":"Miami","website":"https://www.panthermiami.com","phone":"(786) 228-8777","address":"8901 SW 129th St, Miami, FL 33176","score":8,"notes":"Woman-owned and operated. 30+ years experience. Offers HVAC and electrical services. Financing available.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Greenberg Traurig, LLP","industry":"Law Firm","city":"Miami","website":"https://www.gtlaw.com","phone":"(305) 579-0500","address":"333 SE 2nd Avenue, Suite 4400, Miami, FL 33131","score":10,"notes":"One of the largest law offices in Miami with 200+ attorneys. Global reach with Miami roots. Founded nearly 60 years ago.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Akerman LLP","industry":"Law Firm","city":"Miami","website":"https://www.akerman.com","phone":"(305) 374-5600","address":"98 SE 7th St, Suite 1100, Miami, FL 33131","score":10,"notes":"Am Law 100 firm. 300+ lawyers practicing in 30+ practice areas. Ranked among most active law firms for PE deals.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Gonzalez Law Offices, P.A.","industry":"Law Firm","city":"Miami","website":"https://aglawoffices.com","phone":"(305) 676-6677","address":"7765 SW 87th Avenue, Suite 100, Miami, FL 33173","score":8,"notes":"Civil litigation firm. Nominated for Best Law Firm by Miami Herald 2023-2025. Civil and business litigation.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Kaufman Rossin","industry":"Accounting Firm","city":"Miami","website":"https://kaufmanrossin.com","phone":"(305) 858-5600","address":"3310 Mary Street, Suite 501, Miami, FL 33133","score":9,"notes":"One of Florida's largest accounting firms. Full-service CPA and advisory. Multiple locations in FL, NY, and internationally.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}},
        {"name":"Martinez-Marquez, CPA, P.A.","industry":"Accounting Firm","city":"Miami","website":"https://www.mgccpa.net","phone":"(305) 274-2626","address":"6303 Blue Lagoon Dr., Suite 200, Miami, FL 33126","score":8,"notes":"Full-service CPA firm licensed in FL. Over 15 years experience. Tax, bookkeeping, business services. Free consultations offered.","status":"New","emailSequence":{"currentTouch":0,"totalTouches":4,"lastSent":null,"nextSend":"2026-03-23"}}
      ];
      saveLeads();
    }
  }

  // Update existing leads with email campaign data
  function updateWithEmailData() {
    leads.forEach(lead => {
      if (!lead.emailSequence) {
        lead.emailSequence = {
          currentTouch: 0,
          totalTouches: 4,
          lastSent: null,
          nextSend: '2026-03-23'
        };
      }
    });
    saveLeads();
  }

  // Save to localStorage
  function saveLeads() {
    localStorage.setItem('arloLeads', JSON.stringify(leads));
  }

  // Get score class
  function getScoreClass(score) {
    if (score >= 9) return 'score-high';
    if (score >= 7) return 'score-medium';
    return 'score-low';
  }

  // Get status class
  function getStatusClass(status) {
    const map = {
      'New': 'status-new',
      'Contacted': 'status-contacted',
      'Responded': 'status-responded',
      'Qualified': 'status-qualified',
      'Not Interested': 'status-not-interested'
    };
    return map[status] || 'status-new';
  }

  // Get email progress
  function getEmailProgress(lead) {
    const seq = lead.emailSequence || { currentTouch: 0, totalTouches: 4 };
    const percent = (seq.currentTouch / seq.totalTouches) * 100;
    return {
      percent: percent,
      text: `${seq.currentTouch}/${seq.totalTouches}`,
      nextTouch: seq.currentTouch < seq.totalTouches ? EMAIL_TOUCHES[seq.currentTouch] : 'Complete'
    };
  }

  // Update stats
  function updateStats() {
    const total = leads.length;
    const avg = total > 0 ? (leads.reduce((a, b) => a + b.score, 0) / total).toFixed(1) : 0;
    const high = leads.filter(l => l.score >= 9).length;
    const contacted = leads.filter(l => l.status !== 'New').length;

    totalLeadsEl.textContent = total;
    avgScoreEl.textContent = avg;
    highPriorityEl.textContent = high;

    // Industry breakdown
    const industries = leads.reduce((acc, lead) => {
      acc[lead.industry] = (acc[lead.industry] || 0) + 1;
      return acc;
    }, {});

    industryStatsEl.innerHTML = Object.entries(industries)
      .sort((a, b) => b[1] - a[1])
      .map(([industry, count]) => `
        <span class="industry-tag">
          ${industry}
          <span class="count">${count}</span>
        </span>
      `).join('');

    // Add sender info
    const header = document.querySelector('header .container');
    if (header && !document.getElementById('senderInfo')) {
      const senderDiv = document.createElement('div');
      senderDiv.id = 'senderInfo';
      senderDiv.style.cssText = 'margin-top: 10px; font-size: 14px; color: #666;';
      senderDiv.innerHTML = `
        👤 <strong>${CAMPAIGN_INFO.sender}</strong> | 
        📧 ${CAMPAIGN_INFO.senderEmail} | 
        📞 ${CAMPAIGN_INFO.senderPhone} |
        📅 Updated: ${CAMPAIGN_INFO.lastUpdated}
      `;
      header.appendChild(senderDiv);
    }
  }

  // Filter and sort leads
  function getFilteredLeads() {
    let filtered = leads.filter(lead => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return lead.name.toLowerCase().includes(q) ||
             lead.industry.toLowerCase().includes(q) ||
             lead.city.toLowerCase().includes(q) ||
             (lead.phone && lead.phone.toLowerCase().includes(q));
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }

  // Render table
  function renderTable() {
    const filtered = getFilteredLeads();
    
    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="7" class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <p>No leads found matching your search.</p>
        </td></tr>
      `;
      mobileCards.innerHTML = '';
      return;
    }

    // Desktop table
    tableBody.innerHTML = filtered.map(lead => {
      const emailProgress = getEmailProgress(lead);
      return `
      <tr data-id="${lead.name}">
        <td>
          <span class="score-badge ${getScoreClass(lead.score)}">${lead.score}</span>
        </td>
        <td>
          <div class="company-name">${escapeHtml(lead.name)}</div>
          <span class="industry-badge">${escapeHtml(lead.industry)}</span>
        </td>
        <td>
          <div class="contact-info">
            <div>📍 ${escapeHtml(lead.city || 'N/A')}</div>
            <div>📞 ${escapeHtml(lead.phone || 'N/A')}</div>
            ${lead.website ? `<div>🔗 <a href="${escapeHtml(lead.website)}" target="_blank">Website</a></div>` : ''}
          </div>
        </td>
        <td>
          <select class="status-select ${getStatusClass(lead.status)}" onchange="window.updateLeadStatus('${escapeHtml(lead.name)}', this.value)">
            ${STATUS_OPTIONS.map(s => `<option value="${s}" ${s === lead.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <div class="email-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${emailProgress.percent}%"></div>
            </div>
            <span class="progress-text">${emailProgress.text}</span>
            <span class="next-touch">${emailProgress.nextTouch}</span>
          </div>
        </td>
        <td class="notes-cell">
          <textarea class="notes-input" onblur="window.updateLeadNotes('${escapeHtml(lead.name)}', this.value)" placeholder="Add notes...">${escapeHtml(lead.notes || '')}</textarea>
        </td>
        <td>
          <button class="btn btn-small" onclick="window.copyEmailTemplate('${escapeHtml(lead.name)}')">📧 Copy Email</button>
        </td>
      </tr>
    `}).join('');

    // Mobile cards
    mobileCards.innerHTML = filtered.map(lead => {
      const emailProgress = getEmailProgress(lead);
      return `
      <div class="card" data-id="${escapeHtml(lead.name)}">
        <div class="card-header">
          <div>
            <div class="card-title">${escapeHtml(lead.name)}</div>
            <span class="industry-badge">${escapeHtml(lead.industry)}</span>
          </div>
          <span class="score-badge ${getScoreClass(lead.score)}">${lead.score}</span>
        </div>
        <div class="card-body">
          <div class="card-row">
            <span class="card-label">City</span>
            <span>${escapeHtml(lead.city || 'N/A')}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Phone</span>
            <span>${escapeHtml(lead.phone || 'N/A')}</span>
          </div>
          ${lead.website ? `
          <div class="card-row">
            <span class="card-label">Website</span>
            <a href="${escapeHtml(lead.website)}" target="_blank">Visit ↗</a>
          </div>
          ` : ''}
          <div class="card-row">
            <span class="card-label">Status</span>
            <select class="status-select ${getStatusClass(lead.status)}" onchange="window.updateLeadStatus('${escapeHtml(lead.name)}', this.value)">
              ${STATUS_OPTIONS.map(s => `<option value="${s}" ${s === lead.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="card-row">
            <span class="card-label">Email Progress</span>
            <span>${emailProgress.text} - ${emailProgress.nextTouch}</span>
          </div>
          <div>
            <span class="card-label">Notes</span>
            <textarea class="notes-input" onblur="window.updateLeadNotes('${escapeHtml(lead.name)}', this.value)" placeholder="Add notes...">${escapeHtml(lead.notes || '')}</textarea>
          </div>
          <button class="btn btn-small btn-full" onclick="window.copyEmailTemplate('${escapeHtml(lead.name)}')">📧 Copy Email Template</button>
        </div>
      </div>
    `}).join('');
  }

  // Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Update status
  window.updateLeadStatus = function(name, status) {
    const lead = leads.find(l => l.name === name);
    if (lead) {
      lead.status = status;
      saveLeads();
      renderTable();
    }
  };

  // Update notes
  window.updateLeadNotes = function(name, notes) {
    const lead = leads.find(l => l.name === name);
    if (lead) {
      lead.notes = notes;
      saveLeads();
    }
  };

  // Copy email template (opens email tracker JSON)
  window.copyEmailTemplate = function(leadName) {
    const lead = leads.find(l => l.name === leadName);
    if (lead) {
      const emailBody = generateEmailTemplate(lead);
      navigator.clipboard.writeText(emailBody).then(() => {
        alert(`✅ Email template copied for ${leadName}!\n\nOpen Gmail and paste to send.`);
      });
    }
  };

  // Generate email template based on industry
  function generateEmailTemplate(lead) {
    const templates = {
      'HVAC': `Subject: ${lead.name} — ready for the busy season rush?

Hi there,

I was looking at ${lead.name}'s reviews and noticed you're doing solid work in Miami.

Quick question: when the AC units start failing this summer and your phones start ringing non-stop, who's catching the calls when your techs are elbow-deep in a compressor?

We've helped similar HVAC companies handle their overflow during last year's heat wave — they captured emergency calls they'd have otherwise missed.

Worth a 10-minute conversation?

Alec Kennedy
The One Group
(305) 555-0142 | alec@theonegroup.io`,

      'Law Firm': `Subject: Following up with every ${lead.name} lead?

Hi there,

Saw ${lead.name} recently expanded — congrats.

Quick thought: with growth comes more leads... but also more complexity in making sure every potential client gets the right response.

Most firms I talk to in Miami tell me they're losing 15-20% of intake calls to voicemail or slow follow-up. For a firm your size, that's potentially six figures in annual revenue.

We built a system that routes calls, qualifies leads in real-time, and ensures 24/7 coverage. Worth 15 minutes to see if it makes sense for ${lead.name}?

Alec Kennedy
The One Group
(305) 555-0142 | alec@theonegroup.io`,

      'Accounting Firm': `Subject: Tax season automation for ${lead.name}?

Hi there,

Tax season's winding down — hope you survived Miami's filing frenzy.

How many calls went to voicemail in March? How many clients couldn't reach you during crunch time?

We work with accounting firms to handle the overflow during peak season. Their team focused on returns while we handled the phones, appointment scheduling, and urgent client questions.

Next year doesn't have to mean 70-hour weeks and missed family dinners.

Want to see how it works?

Alec Kennedy
The One Group
(305) 555-0142 | alec@theonegroup.io`
    };

    return templates[lead.industry] || templates['HVAC'];
  }

  // Export to CSV
  function exportToCSV() {
    const headers = ['Name', 'Industry', 'City', 'Phone', 'Website', 'Score', 'Status', 'Address', 'Notes', 'Email Touch', 'Next Send'];
    const rows = leads.map(lead => {
      const seq = lead.emailSequence || { currentTouch: 0, nextSend: '' };
      return [
        lead.name,
        lead.industry,
        lead.city || '',
        lead.phone || '',
        lead.website || '',
        lead.score,
        lead.status || 'New',
        (lead.address || '').replace(/"/g, '""'),
        (lead.notes || '').replace(/"/g, '""'),
        seq.currentTouch,
        seq.nextSend || ''
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  // Event listeners
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  sortSelect.addEventListener('change', (e) => {
    const [field, dir] = e.target.value.split(':');
    sortField = field;
    sortDirection = dir;
    renderTable();
  });

  exportBtn.addEventListener('click', exportToCSV);

  // Initialize
  loadLeads();
  updateStats();
  renderTable();
})();