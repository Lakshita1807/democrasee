const HELPLINES = [
    {
        title: "National Voter Helpline",
        number: "1950",
        description: "For any queries related to voter registration, EPIC, etc.",
        category: "National",
        icon: "📞"
    },
    {
        title: "ECI Control Room",
        number: "011-23052220",
        description: "Election Commission of India - Main Control Room",
        category: "National",
        icon: "🏢"
    },
    {
        title: "State Election Office",
        number: "1800-111-400",
        description: "General state-level assistance for election process",
        category: "State",
        icon: "🏛️"
    },
    {
        title: "Complaint Registration",
        number: "1912",
        description: "Lodge complaints regarding election misconduct or issues",
        category: "Urgent",
        icon: "⚠️"
    }
];

function initHelpline() {
    const container = document.getElementById('helpline-container');
    if (!container) return;

    container.innerHTML = HELPLINES.map(h => `
        <div class="helpline-card">
            <div class="helpline-icon">${h.icon}</div>
            <div class="helpline-info">
                <span class="news-category">${h.category}</span>
                <h3>${h.title}</h3>
                <p>${h.description}</p>
                <a href="tel:${h.number.replace(/-/g, '')}" class="btn-primary helpline-call">
                    <span>Call ${h.number}</span>
                </a>
            </div>
        </div>
    `).join('');
}
