// API configurations are now handled by the backend for security

let lastRequestTime = 0;
const REQUEST_COOLDOWN = 2000; // 2 seconds

function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.trim();
}

function showGlobalLoader(show) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        if (show) loader.classList.remove('hidden');
        else loader.classList.add('hidden');
    }
}

let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    
    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const input = document.getElementById('chat-input');
        if (input) input.value = transcript;
        stopListening();
    };
    
    recognition.onend = () => stopListening();
}

function toggleListening() {
    const btn = document.getElementById('mic-btn');
    if (!recognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    
    if (btn.classList.contains('mic-active')) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    const btn = document.getElementById('mic-btn');
    btn.classList.add('mic-active');
    btn.title = "Listening...";
    recognition.start();
}

function stopListening() {
    const btn = document.getElementById('mic-btn');
    btn.classList.remove('mic-active');
    btn.title = "Voice Input";
    recognition.stop();
}

function exportChat() {
    const messages = Array.from(document.querySelectorAll('.message'))
        .map(m => {
            const role = m.classList.contains('user') ? 'USER' : 'AI';
            return `${role}: ${m.textContent}`;
        })
        .join('\n\n');
    
    if (!messages) return alert("No chat history to save!");
    
    const blob = new Blob([messages], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `democrasee-chat-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function callGemini(userMessage) {
  // Check Cache first
  const cacheKey = `gemini_cache_${userMessage.toLowerCase().trim()}`;
  const cachedResponse = sessionStorage.getItem(cacheKey);
  if (cachedResponse) {
    console.log("Serving from cache...");
    return cachedResponse;
  }

  // Rate Limiting
  const now = Date.now();
  if (now - lastRequestTime < REQUEST_COOLDOWN) {
    return "Please wait a moment before asking another question... ⏳";
  }
  lastRequestTime = now;

  try {
    const region = localStorage.getItem('userRegion') || 'India';
    const role = localStorage.getItem('userRole') || 'Voter';

    const prompt = `You are ElectionGuide, a friendly civic 
education assistant for Indian elections.
User region: ${region}. User role: ${role}.
Rules:
- Never favor any party. Use simple language.
- Use numbered steps. End with one follow-up question.
- CRITICAL: DO NOT use markdown bolding (no ** symbols).
- CRITICAL: Keep response under 500 words.

User question: ${userMessage}`;

    const customKey = localStorage.getItem('democrasee_key');

    const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          apiKey: customKey
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini error:", data);
      throw new Error("API error: " + response.status);
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    // Save to Cache
    sessionStorage.setItem(cacheKey, aiText);
    
    return aiText;

  } catch (error) {
    console.error("Gemini call failed:", error);
    return "Sorry, I couldn't connect. Please try again! 🔄";
  }
}

// UI Glue Logic
function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage(text) {
    const cleanText = sanitizeInput(text);
    if (!cleanText) return;
    
    appendMessage('user', cleanText);
    const input = document.getElementById('chat-input');
    if (input) input.value = '';
    
    const indicator = document.getElementById('typing-indicator');
    indicator?.classList.remove('hidden');
    
    const aiResponse = await callGemini(cleanText);
    indicator?.classList.add('hidden');
    appendMessage('ai', aiResponse);
    generateChips(aiResponse);
    
    // Update Stats
    const count = parseInt(localStorage.getItem('stats_questions') || '0');
    localStorage.setItem('stats_questions', count + 1);
    if (window.updateDashboard) window.updateDashboard();
}

function generateChips(responseText) {
    const container = document.getElementById('suggestion-chips');
    if (!container) return;
    container.innerHTML = '';
    
    let topics = ["🗳️ How to Vote", "📝 Registration", "📅 Key Dates"];
    
    const text = responseText.toLowerCase();
    if (text.includes('vote') || text.includes('booth') || text.includes('poll')) {
        topics = ["📄 Documents needed?", "📅 Deadline?", "🗺️ Find my booth?"];
    } else if (text.includes('regist') || text.includes('form') || text.includes('voter id')) {
        topics = ["📝 Form 6 guide", "✅ Check status", "📅 Last date?"];
    } else if (text.includes('timeline') || text.includes('date') || text.includes('phase')) {
        topics = ["🗳️ Polling day details", "📣 Campaign rules", "🔢 Counting process"];
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
    if (!container || container.children.length > 0) return;
    const welcome = `Namaste! 🙏 I'm your ElectionGuide. How can I help you today?`;
    appendMessage('ai', welcome);
    generateChips(welcome);
}

// Event Listeners
document.getElementById('mic-btn')?.addEventListener('click', toggleListening);
document.getElementById('save-chat')?.addEventListener('click', exportChat);

document.getElementById('send-btn')?.addEventListener('click', () => {
    sendMessage(document.getElementById('chat-input').value);
});

document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(e.target.value);
});

document.getElementById('clear-chat')?.addEventListener('click', () => {
    if (confirm('Clear conversation?')) {
        const container = document.getElementById('chat-messages');
        if (container) container.innerHTML = '';
        initChat();
    }
});

// Global exposure
window.initChat = initChat;
window.callGemini = callGemini;
window.sendMessage = sendMessage;
window.sanitizeInput = sanitizeInput;
window.showGlobalLoader = showGlobalLoader;
window.toggleListening = toggleListening;
window.startListening = startListening;
window.stopListening = stopListening;
window.exportChat = exportChat;
window.generateChips = generateChips;
window.appendMessage = appendMessage;
