const ELECTION_NEWS = [
    {
        id: 1,
        category: "National",
        title: "ECI Announces Final Voter Turnout for Phase 7",
        summary: "The Election Commission of India has released official figures for the final phase, showing a steady participation across 8 states and UTs.",
        date: "May 1, 2024",
        link: "https://eci.gov.in"
    },
    {
        id: 2,
        category: "Process",
        title: "New Guidelines for Counting Day Procedures",
        summary: "To ensure transparency, ECI has updated the guidelines for polling agents and counting supervisors for the upcoming results day.",
        date: "April 30, 2024",
        link: "https://eci.gov.in"
    },
    {
        id: 3,
        category: "Technology",
        title: "Record Number of VVPAT Verifications Planned",
        summary: "The Supreme Court has directed the ECI to maintain strict protocols for VVPAT matching across multiple polling stations.",
        date: "April 29, 2024",
        link: "https://eci.gov.in"
    },
    {
        id: 4,
        category: "State",
        title: "Special Arrangements for Senior Citizens in UP",
        summary: "Uttar Pradesh sees a surge in home-voting registrations for citizens aged 85 and above for the next assembly by-polls.",
        date: "April 28, 2024",
        link: "https://eci.gov.in"
    }
];

function initNews() {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    container.innerHTML = ELECTION_NEWS.map(item => `
        <div class="news-card">
            <div class="news-header">
                <span class="news-category">${item.category}</span>
                <span class="news-date">${item.date}</span>
            </div>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-summary">${item.summary}</p>
            <a href="${item.link}" target="_blank" class="news-link">Read Full Story →</a>
        </div>
    `).join('');
}
