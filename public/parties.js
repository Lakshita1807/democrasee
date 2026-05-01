const PARTIES = [
    {
        name: "Bharatiya Janata Party (BJP)",
        symbol: "🪷",
        symbolName: "Lotus",
        ideology: "Right-wing, Hindutva, Integral Humanism, Social Conservatism",
        focus: "Nationalism, Digital India, Infrastructure, Economic Reform",
        color: "#FF9933",
        founded: "1980"
    },
    {
        name: "Indian National Congress (INC)",
        symbol: "✋",
        symbolName: "Hand",
        ideology: "Big tent, Secularism, Social Democracy, Progressivism",
        focus: "Social Welfare, Rural Development, Healthcare, Inclusion",
        color: "#19AAED",
        founded: "1885"
    },
    {
        name: "Aam Aadmi Party (AAP)",
        symbol: "🧹",
        symbolName: "Broom",
        ideology: "Populism, Anti-corruption, Welfarism, Civic Nationalism",
        focus: "Education, Free Electricity/Water, Mohalla Clinics, Transparency",
        color: "#0072B0",
        founded: "2012"
    },
    {
        name: "Communist Party of India (Marxist)",
        symbol: "☭",
        symbolName: "Hammer and Sickle",
        ideology: "Left-wing, Marxism-Leninism, Socialism, Anti-imperialism",
        focus: "Workers' Rights, Land Reforms, Public Sector, Social Equality",
        color: "#DE0000",
        founded: "1964"
    },
    {
        name: "Bahujan Samaj Party (BSP)",
        symbol: "🐘",
        symbolName: "Elephant",
        ideology: "Ambedkarism, Social Equality, Bahujan Rights, Secularism",
        focus: "Dalit Empowerment, Social Justice, Reservation, Rule of Law",
        color: "#0000FF",
        founded: "1984"
    },
    {
        name: "All India Trinamool Congress (AITC)",
        symbol: "🌱",
        symbolName: "Flowers & Grass",
        ideology: "Regionalism, Populism, Secularism, Progressivism",
        focus: "State Autonomy, Maa Mati Manush, Women Empowerment",
        color: "#20C646",
        founded: "1998"
    }
];

function initParties() {
    const container = document.getElementById('parties-container');
    if (!container) return;

    container.innerHTML = PARTIES.map(p => `
        <div class="party-card" style="--party-color: ${p.color}">
            <div class="party-symbol-container">
                <span class="party-symbol">${p.symbol}</span>
                <span class="symbol-name">${p.symbolName}</span>
            </div>
            <div class="party-info">
                <div class="party-header">
                    <h3>${p.name}</h3>
                    <span class="founding-year">Est. ${p.founded}</span>
                </div>
                <div class="ideology-section">
                    <label>IDEOLOGY</label>
                    <p>${p.ideology}</p>
                </div>
                <div class="focus-section">
                    <label>KEY FOCUS</label>
                    <p>${p.focus}</p>
                </div>
                <div class="party-footer">
                    <button class="btn-text" onclick="showAIPartyInsight('${p.name}')">Ask AI about this party 🤖</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showAIPartyInsight(partyName) {
    // Switch to assistant tab and ask a question
    const navItem = document.querySelector('[data-tab="assistant"]');
    if (navItem) {
        navItem.click();
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = `Tell me more about the ideology and current stance of ${partyName}.`;
            document.getElementById('send-btn').click();
        }
    }
}
