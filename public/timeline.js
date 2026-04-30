import { openChatTab } from './app.js';

const TIMELINE_PHASES = [
  {
    id: 1,
    icon: "📢",
    title: "Election Announcement",
    status: "completed",
    dateRange: "January 2024",
    short: "ECI announces election schedule. MCC begins.",
    detail: "The Election Commission of India officially announces the election schedule. The Model Code of Conduct (MCC) comes into effect immediately, restricting ruling parties from making policy announcements that could influence voters."
  },
  {
    id: 2,
    icon: "📋",
    title: "Electoral Roll Revision",
    status: "completed",
    dateRange: "Jan - Feb 2024",
    short: "Voter list updated. New voters can register.",
    detail: "The electoral roll is updated. Citizens can apply to be added using Form 6 on voters.eci.gov.in. Booth Level Officers (BLOs) verify addresses. Last date to register is typically 30 days before polling."
  },
  {
    id: 3,
    icon: "🏃",
    title: "Nomination Filing",
    status: "completed",
    dateRange: "March 2024",
    short: "Candidates file nominations with Returning Officer.",
    detail: "Candidates submit nomination papers to the Returning Officer along with a security deposit of ₹25,000 (₹12,500 for SC/ST candidates) and a signed affidavit (Form 26) declaring assets, liabilities, and any criminal cases."
  },
  {
    id: 4,
    icon: "✅",
    title: "Nomination Scrutiny",
    status: "completed",
    dateRange: "April 2024",
    short: "Returning Officer verifies all nominations.",
    detail: "The Returning Officer scrutinizes all nominations for validity. Invalid nominations are rejected. Candidates can withdraw their candidacy within 2 days after scrutiny is completed."
  },
  {
    id: 5,
    icon: "📣",
    title: "Election Campaign",
    status: "completed",
    dateRange: "April - May 2024",
    short: "Parties and candidates campaign across constituencies.",
    detail: "Candidates and parties campaign to win voter support. Rules prohibit appeals based on caste or religion. Candidates have a spending limit of ₹95 lakh for Lok Sabha seats. ECI monitors compliance strictly."
  },
  {
    id: 6,
    icon: "🚫",
    title: "Campaign Silence Period",
    status: "completed",
    dateRange: "48 hours before each polling date",
    short: "All campaigning stops 48 hours before voting.",
    detail: "48 hours before polling begins, all public campaigning must stop. No rallies, public meetings, or political advertisements are allowed — including on social media. This is enforced strictly by the ECI."
  },
  {
    id: 7,
    icon: "🗳️",
    title: "Polling Day",
    status: "current",
    dateRange: "April 19 - June 1, 2024 (7 phases)",
    short: "Voters cast their votes at assigned booths.",
    detail: "Voters visit their assigned polling booth with a valid ID (Voter ID, Aadhaar, Passport, PAN, Driving License, etc.). They vote on an EVM and verify via VVPAT slip shown for 7 seconds. Indelible ink is applied to the left index finger. Polling hours: 7 AM to 6 PM."
  },
  {
    id: 8,
    icon: "🔢",
    title: "Vote Counting",
    status: "upcoming",
    dateRange: "June 4, 2024",
    short: "EVMs are unsealed and votes counted round by round.",
    detail: "On counting day, EVMs are transported under heavy security and unsealed. Votes are counted round by round for each constituency. Each round result is announced. Candidates and their agents are present throughout."
  },
  {
    id: 9,
    icon: "📊",
    title: "Results Declaration",
    status: "upcoming",
    dateRange: "June 4, 2024",
    short: "Winning candidates receive election certificates.",
    detail: "The Returning Officer declares the winning candidate and issues a Certificate of Election. ECI publishes final results on results.eci.gov.in. The President invites the leader of the majority party or alliance to form the government."
  },
  {
    id: 10,
    icon: "🤝",
    title: "Oath Taking & New Government",
    status: "upcoming",
    dateRange: "June 2024",
    short: "New PM and Cabinet take oath and form government.",
    detail: "The President administers the oath of office to the new Prime Minister and Council of Ministers. The new government presents its agenda, typically announcing key priorities within the first 100 days."
  }
];

export function renderTimeline() {
    const container = document.getElementById('timeline-container');
    const progressBar = document.getElementById('timeline-progress-bar');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    let completedCount = 0;
    
    TIMELINE_PHASES.forEach(phase => {
        if (phase.status === 'completed') completedCount++;
        
        const phaseEl = document.createElement('div');
        phaseEl.className = `timeline-item ${phase.status}`;
        if (phase.status === 'current') phaseEl.style.borderLeft = '4px solid var(--secondary)';
        if (phase.status === 'completed') phaseEl.style.opacity = '0.8';

        const statusBadge = {
            'completed': '<span class="badge" style="background: var(--secondary);">completed ✅</span>',
            'current': '<span class="badge" style="background: var(--primary);">current 🔄</span>',
            'upcoming': '<span class="badge" style="background: var(--gray);">upcoming 🔜</span>'
        }[phase.status];

        phaseEl.innerHTML = `
            <div class="timeline-marker">
                <div class="timeline-dot" style="background: ${phase.status === 'completed' ? 'var(--secondary)' : (phase.status === 'current' ? 'var(--primary)' : 'var(--border)')}; border-color: ${phase.status === 'completed' ? 'var(--secondary)' : (phase.status === 'current' ? 'var(--primary-light)' : 'var(--border)')}"></div>
                <div class="timeline-line"></div>
            </div>
            <div class="timeline-content" style="cursor: pointer; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">${phase.icon} ${phase.title}</h3>
                        <small style="color: var(--gray); font-weight: 500;">${phase.dateRange}</small>
                    </div>
                    ${statusBadge}
                </div>
                <p class="phase-short" style="margin-bottom: 0;">${phase.short}</p>
                <div class="phase-detail hidden" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <p style="font-size: 0.95rem; color: var(--dark-lighter);">${phase.detail}</p>
                    <button class="btn btn-outline ask-ai-btn" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.5rem 1rem;">
                        Ask AI about this →
                    </button>
                </div>
            </div>
        `;

        const content = phaseEl.querySelector('.timeline-content');
        const detail = phaseEl.querySelector('.phase-detail');
        const askBtn = phaseEl.querySelector('.ask-ai-btn');

        content.addEventListener('click', (e) => {
            if (e.target === askBtn) return;
            detail.classList.toggle('hidden');
        });

        askBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openChatTab(`Tell me more about the "${phase.title}" phase of the Indian election process.`);
        });

        container.appendChild(phaseEl);
    });
    
    if (progressBar) {
        progressBar.style.width = `${(completedCount / TIMELINE_PHASES.length) * 100}%`;
    }
}
