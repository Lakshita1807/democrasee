/**
 * Political Parties Module
 */

let PARTIES = [];

/**
 * Initializes political parties module
 */
export async function initParties() {
    const container = document.getElementById('parties-container');
    if (!container) return;
    
    // Load Data
    const data = await window.getCached('parties_data', () => 
        fetch('data/parties.json').then(r => r.json())
    );
    PARTIES = data;

    container.innerHTML = '';
    PARTIES.forEach(party => {
        const card = document.createElement('div');
        card.className = 'party-card animated-card';
        card.style.setProperty('--party-color', party.color);
        
        card.innerHTML = `
            <div class="party-symbol-container">
                <div class="party-symbol" style="background: ${party.color}22; color: ${party.color}">
                    <i data-lucide="${party.symbol}"></i>
                </div>
                <span class="symbol-name">${party.symbolName}</span>
            </div>
            <div class="party-info">
                <div class="party-header">
                    <h3>${party.name}</h3>
                    <span class="founding-year">Est. ${party.founded}</span>
                </div>
                <div class="ideology-section">
                    <label>IDEOLOGY</label>
                    <p>${party.ideology}</p>
                </div>
                <div class="focus-section">
                    <label>KEY FOCUS</label>
                    <p>${party.focus}</p>
                </div>
                <div class="party-footer">
                    <button class="btn-text" onclick="showAIPartyInsight('${party.name}')">
                        Ask AI about this party <i data-lucide="bot"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

/**
 * Sends a query about a specific party to the AI
 * @param {string} partyName 
 */
export function showAIPartyInsight(partyName) {
    const navAssistant = document.querySelector('[data-tab="assistant"]');
    if (navAssistant) navAssistant.click();
    
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = `Tell me more about the ideology and current stance of ${partyName}.`;
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) sendBtn.click();
    }
}

// Global exposure
window.initParties = initParties;
window.showAIPartyInsight = showAIPartyInsight;
