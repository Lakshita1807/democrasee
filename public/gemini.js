const GEMINI_API_KEY = "PASTE_YOUR_KEY_HERE";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let chatHistory = [];

async function callGemini(messages) {
    const cacheKey = messages[messages.length - 1].content;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: messages.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.content }]
            })),
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("Gemini API Error:", error);
        return "I'm having trouble connecting to my brain right now. Please check the API key in public/gemini.js!";
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    sessionStorage.setItem(cacheKey, text);
    return text;
}

function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    
    chatHistory.push({ role, content: text });
}

async function sendMessage(text) {
    if (!text) return;
    
    appendMessage('user', text);
    document.getElementById('chat-input').value = '';
    
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.remove('hidden');
    
    const region = localStorage.getItem('userRegion') || 'India';
    const role = localStorage.getItem('userRole') || 'Citizen';
    
    const systemPrompt = `You are ElectionGuide, a friendly civic education assistant for Indian elections. Rules:
1. NEVER favor any political party or candidate. Stay strictly neutral.
2. Use simple, easy language suitable for a ${role}.
3. Break answers into numbered steps or bullet points.
4. Use emojis: 📅 dates, ✅ completed, 🔜 upcoming, 🗳️ voting.
5. Keep responses under 200 words unless more detail is requested.
6. Always end with one follow-up question.
7. User region: ${region}, User role: ${role}.
8. Current context: We are in the 2024 election cycle.`;

    const messages = [
        { role: 'user', content: systemPrompt },
        ...chatHistory.slice(-5) // Keep last 5 messages for context
    ];

    const aiResponse = await callGemini(messages);
    indicator.classList.add('hidden');
    appendMessage('ai', aiResponse);
    
    generateChips(aiResponse);
}

function generateChips(responseText) {
    const container = document.getElementById('suggestion-chips');
    container.innerHTML = '';
    
    // Simple logic to generate relevant follow-ups
    let topics = ["🗳️ How to Vote", "📝 Registration", "📅 Key Dates"];
    if (responseText.toLowerCase().includes('id') || responseText.toLowerCase().includes('document')) {
        topics = ["🪪 Required IDs", "📍 Find Booth", "🔍 Check Name"];
    } else if (responseText.toLowerCase().includes('evm') || responseText.toLowerCase().includes('vvpat')) {
        topics = ["🤖 How EVM works", "🔒 Security", "📊 Counting"];
    }
    
    topics.forEach(topic => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = topic;
        chip.onclick = () => sendMessage(topic);
        container.appendChild(chip);
    });
}

function initChat() {
    const container = document.getElementById('chat-messages');
    if (container.children.length > 0) return;
    
    const welcome = `Namaste! 🙏 I'm your ElectionGuide. How can I help you participate in Indian democracy today? You can ask me about registration, voting process, or election dates in ${localStorage.getItem('userRegion') || 'India'}.`;
    appendMessage('ai', welcome);
    
    const quickTopics = ["🗳️ How to Vote", "📝 How to Register", "📅 Election Timeline", "⚖️ Voter Rights", "🏛️ How Parliament Works", "📊 How Votes are Counted"];
    generateChips(welcome);
    
    // Override chips for welcome
    const chipsContainer = document.getElementById('suggestion-chips');
    chipsContainer.innerHTML = '';
    quickTopics.forEach(topic => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = topic;
        chip.onclick = () => sendMessage(topic);
        chipsContainer.appendChild(chip);
    });
}

// Event Listeners
document.getElementById('send-btn').addEventListener('click', () => {
    sendMessage(document.getElementById('chat-input').value);
});

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(e.target.value);
});

document.getElementById('clear-chat').addEventListener('click', () => {
    if (confirm('Clear entire conversation?')) {
        document.getElementById('chat-messages').innerHTML = '';
        chatHistory = [];
        initChat();
    }
});

// Voice Input
const micBtn = document.getElementById('mic-btn');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    micBtn.onclick = () => {
        recognition.start();
        micBtn.textContent = '🛑';
    };
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById('chat-input').value = text;
        micBtn.textContent = '🎤';
        sendMessage(text);
    };
    
    recognition.onerror = () => {
        micBtn.textContent = '🎤';
    };
} else {
    micBtn.style.display = 'none';
}
