/**
 * Election News Module
 */

/**
 * Mock fetch function for news data
 * @returns {Promise<Array>}
 */
export async function fetchNews() {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
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
                }
            ]);
        }, 800);
    });
}

/**
 * Initializes news module
 */
export async function initNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    // Use getCached for efficiency
    try {
        const newsData = await window.getCached('democrasee_news', async () => {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loader-inline"></div>
                    <p>Loading latest news...</p>
                </div>
            `;
            return await fetchNews();
        }, 3600000); // 1 hour TTL
        
        renderNews(newsData);
    } catch (error) {
        console.error("Error loading news:", error);
        container.innerHTML = `<p>Failed to load news. Please try again later.</p>`;
    }
}

/**
 * Renders news items to DOM
 * @param {Array} news 
 */
function renderNews(news) {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    container.innerHTML = news.map(item => `
        <div class="news-card animated-card">
            <div class="news-header">
                <span class="news-category">${item.category}</span>
                <span class="news-date"><i data-lucide="calendar"></i> ${item.date}</span>
            </div>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-summary">${item.summary}</p>
            <a href="${item.link}" target="_blank" class="news-link">
                Read Full Story <i data-lucide="external-link"></i>
            </a>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// Global exposure
window.initNews = initNews;
window.fetchNews = fetchNews;
