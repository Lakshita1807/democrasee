import { openChatTab } from './app.js';

const timelineData = [
    { title: "Election Announcement", icon: "fa-bullhorn", dateRange: "T-minus 60 Days", description: "The Election Commission announces the dates, triggering the Model Code of Conduct." },
    { title: "Voter Registration Deadline", icon: "fa-address-card", dateRange: "T-minus 45 Days", description: "Last day for citizens to enroll or update their details on the electoral roll." },
    { title: "Nomination Filing", icon: "fa-file-signature", dateRange: "T-minus 30 Days", description: "Candidates file their nomination papers and affidavits to the Returning Officer." },
    { title: "Nomination Scrutiny", icon: "fa-magnifying-glass", dateRange: "T-minus 28 Days", description: "The ECI scrutinizes nominations and candidates can withdraw if they choose." },
    { title: "Campaign Period", icon: "fa-users", dateRange: "T-minus 25 Days", description: "Candidates hold rallies, distribute manifestos, and reach out to voters." },
    { title: "Campaign Silence", icon: "fa-volume-xmark", dateRange: "48 Hours Before", description: "All public campaigning must stop to give voters a peaceful time to reflect." },
    { title: "Voting Day", icon: "fa-check-to-slot", dateRange: "Election Day", description: "Voters go to their designated polling booths to cast their votes securely." },
    { title: "Vote Counting", icon: "fa-calculator", dateRange: "T-plus 3 Days", description: "EVMs are opened and votes are counted under strict supervision." },
    { title: "Results Declaration", icon: "fa-trophy", dateRange: "T-plus 3 Days", description: "The final results are declared and the winning candidates receive certificates." },
    { title: "Oath Taking / New Government", icon: "fa-handshake", dateRange: "T-plus 15 Days", description: "The newly elected members take their oaths and form the new government." }
];

// Mocking current phase as index 6 (Voting Day) for UI demonstration
const CURRENT_PHASE_INDEX = 6;

export function renderTimeline() {
    const container = document.getElementById('timeline-container');
    const progressBar = document.getElementById('timeline-progress-bar');
    
    if(!container) return;
    
    container.innerHTML = '';
    
    // Update progress bar
    const progressPercent = ((CURRENT_PHASE_INDEX + 1) / timelineData.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    timelineData.forEach((item, index) => {
        const isCurrent = index === CURRENT_PHASE_INDEX;
        const isPast = index < CURRENT_PHASE_INDEX;
        
        const dotColor = isCurrent ? 'var(--secondary)' : (isPast ? 'var(--primary)' : 'var(--gray)');
        const glow = isCurrent ? 'box-shadow: 0 0 15px var(--secondary); border-color: #fff;' : '';
        
        const html = `
            <div class="timeline-item" style="opacity: ${isPast || isCurrent ? '1' : '0.6'};">
                <div class="timeline-marker">
                    <div class="timeline-dot" style="background: ${dotColor}; ${glow} display: flex; align-items:center; justify-content:center; color:white; font-size:0.7rem;">
                        ${isPast ? '<i class="fa-solid fa-check"></i>' : (isCurrent ? '<i class="fa-solid fa-spinner fa-spin"></i>' : '')}
                    </div>
                    <div class="timeline-line"></div>
                </div>
                <div class="timeline-content" ${isCurrent ? 'style="border-color: var(--secondary); border-width: 2px;"' : ''}>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h3><i class="fa-solid ${item.icon}" style="color: ${dotColor}; margin-right: 0.5rem;"></i> ${item.title}</h3>
                        <span class="badge" style="background: ${isCurrent ? 'var(--secondary)' : 'var(--gray)'}; margin-top:0;">${item.dateRange}</span>
                    </div>
                    <p style="margin-top: 0.5rem; color: var(--gray);">${item.description}</p>
                    
                    <button class="btn btn-outline ask-ai-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.85rem;" data-topic="${item.title}">
                        Ask AI about this <i class="fa-solid fa-robot"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
    });
    
    // Attach Event Listeners to AI Buttons
    document.querySelectorAll('.ask-ai-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const topic = e.currentTarget.dataset.topic;
            const prompt = `Can you explain more about the "${topic}" phase in the Indian election process?`;
            openChatTab(prompt);
        });
    });
}
