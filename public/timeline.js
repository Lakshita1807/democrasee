const PHASES = [
  { id:1, icon:"📢", title:"Election Announcement",
    status:"completed", date:"January 2024",
    short:"ECI announces schedule. MCC begins immediately.",
    detail:"The Election Commission of India officially announces the complete election schedule including polling dates for all phases. The Model Code of Conduct comes into force immediately, restricting the ruling government from making new policy announcements that could influence voters." },

  { id:2, icon:"📋", title:"Electoral Roll Revision",
    status:"completed", date:"Jan–Feb 2024",
    short:"Voter list updated. New voters can register via Form 6.",
    detail:"The electoral roll is revised and updated. Citizens can apply for new voter registration using Form 6 on voters.eci.gov.in. Booth Level Officers visit homes to verify addresses. The last date to register is typically 30 days before polling day." },

  { id:3, icon:"🏃", title:"Nomination Filing",
    status:"completed", date:"March 2024",
    short:"Candidates file nominations with security deposit.",
    detail:"Candidates submit nomination papers to the Returning Officer of their constituency. They must pay a security deposit of ₹25,000 (₹12,500 for SC/ST candidates) and submit Form 26 — a sworn affidavit declaring all assets, liabilities, and criminal cases if any." },

  { id:4, icon:"🔍", title:"Nomination Scrutiny",
    status:"completed", date:"March 2024",
    short:"Returning Officer verifies all nominations filed.",
    detail:"The Returning Officer scrutinizes all nominations for legal validity. Nominations that do not meet requirements are rejected. After scrutiny, candidates have a 2-day window to withdraw their candidacy if they choose to do so." },

  { id:5, icon:"📣", title:"Election Campaign",
    status:"completed", date:"March–May 2024",
    short:"Parties campaign across constituencies within rules.",
    detail:"Political parties and candidates conduct public rallies, door-to-door campaigns, and media advertising. Strict rules apply — no appeals based on caste or religion, spending limit of ₹95 lakh per Lok Sabha candidate, and ECI monitors all activities." },

  { id:6, icon:"🚫", title:"Campaign Silence Period",
    status:"completed", date:"48 hrs before each polling date",
    short:"All campaigning stops 48 hours before voting.",
    detail:"A mandatory silence period of 48 hours begins before each polling phase. All public meetings, rallies, advertisements, and social media campaigning must stop completely. This gives voters time to make decisions free from campaign pressure." },

  { id:7, icon:"🗳️", title:"Polling Day",
    status:"current", date:"April 19 – June 1, 2024",
    short:"Voters cast votes at booths using EVMs.",
    detail:"Voters visit their assigned polling booth with valid ID (Voter ID, Aadhaar, Passport, PAN Card, Driving License, etc.). They press their candidate's button on the EVM and verify via VVPAT slip shown for 7 seconds. Indelible ink is applied to the left index finger. Polling hours: 7 AM to 6 PM." },

  { id:8, icon:"🔢", title:"Vote Counting",
    status:"upcoming", date:"June 4, 2024",
    short:"EVMs unsealed and counted round by round.",
    detail:"On counting day, EVMs are brought from secure storage under heavy security. Seals are broken in the presence of candidates and their agents. Votes are counted round by round for each constituency and results announced progressively." },

  { id:9, icon:"📊", title:"Results Declaration",
    status:"upcoming", date:"June 4, 2024",
    short:"Winners receive certificates. Government formation begins.",
    detail:"The Returning Officer declares the winning candidate and issues a Certificate of Election. The Election Commission publishes all results on results.eci.gov.in. The President of India invites the leader of the majority party or alliance to form the government." },

  { id:10, icon:"🤝", title:"Oath & New Government",
    status:"upcoming", date:"June 2024",
    short:"New PM and Cabinet sworn in by the President.",
    detail:"The President of India administers the oath of office to the new Prime Minister followed by Cabinet Ministers. The new government is officially formed and begins its 5-year term, typically announcing key priorities and a 100-day agenda." }
];

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container || container.children.length > 0) return;
  
  const completed = PHASES.filter(p => p.status === 'completed').length;
  
  // Progress bar
  document.getElementById('timeline-progress').style.width = 
    (completed / PHASES.length * 100) + '%';
  document.getElementById('timeline-progress-text').textContent = 
    completed + ' of ' + PHASES.length + ' phases complete';
  
  PHASES.forEach(phase => {
    const card = document.createElement('div');
    card.className = 'phase-card ' + phase.status;
    card.innerHTML = `
      <div class="phase-icon">${phase.icon}</div>
      <div class="phase-content">
        <div class="phase-header" onclick="togglePhase(${phase.id})">
          <div>
            <h3>${phase.title}</h3>
            <span class="phase-date">📅 ${phase.date}</span>
          </div>
          <span class="phase-status ${phase.status}">
            ${phase.status === 'completed' ? '✅' : 
              phase.status === 'current' ? '🔄 Current' : '🔜'}
          </span>
        </div>
        <p class="phase-short">${phase.short}</p>
        <div class="phase-detail" id="detail-${phase.id}" style="display:none">
          <p>${phase.detail}</p>
          <button class="ask-ai-btn" onclick="askAIAboutPhase('${phase.title}')">
            Ask AI about this 🤖
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function togglePhase(id) {
  const detail = document.getElementById('detail-' + id);
  detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
}

function askAIAboutPhase(title) {
  document.querySelector('[data-tab="assistant"]').click();
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    input.value = 'Explain the "' + title + '" phase of Indian elections in detail';
    document.getElementById('send-btn').click();
  }, 300);
}
