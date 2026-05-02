/**
 * Election Helpline Module
 */

let HELPLINES = [];

/**
 * Initializes helpline module
 */
export async function initHelpline() {
    const container = document.getElementById('helpline-container');
    if (!container) return;
    
    // Load Data
    const data = await window.getCached('helplines_data', () => 
        fetch('data/helplines.json').then(r => r.json())
    );
    HELPLINES = data;

    container.innerHTML = HELPLINES.map(h => `
        <div class="helpline-card animated-card">
            <div class="helpline-icon" aria-hidden="true"><i data-lucide="${h.icon}"></i></div>
            <div class="helpline-info">
                <span class="news-category">${h.category}</span>
                <h3>${h.title}</h3>
                <p>${h.description}</p>
                <a href="tel:${h.number.replace(/-/g, '')}" class="btn-primary helpline-call">
                    <i data-lucide="phone"></i> <span>Call ${h.number}</span>
                </a>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// Global exposure
window.initHelpline = initHelpline;
