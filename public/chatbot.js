/**
 * AI Chatbot Module for DemocraSee
 * Handles Gemini API integration and chat UI
 */

let lastRequestTime = 0;
const REQUEST_COOLDOWN = 2000; // 2 seconds

/**
 * Sanitizes user input
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeInput(text) {
    if (!text) return '';
    // Limit to 500 characters
    const truncated = text.substring(0, 500);
    const div = document.createElement('div');
    div.textContent = truncated;
    return div.innerHTML.trim();
}

/**
 * Toggles global loader
 * @param {boolean} show 
 */
export function showGlobalLoader(show) {
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

/**
 * Toggles speech recognition
 */
export function toggleListening() {
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

/**
 * Starts speech recognition
 */
export function startListening() {
    const btn = document.getElementById('mic-btn');
    if (btn) {
        btn.classList.add('mic-active');
        btn.title = "Listening...";
    }
    recognition.start();
}

/**
 * Stops speech recognition
 */
export function stopListening() {
    const btn = document.getElementById('mic-btn');
    if (btn) {
        btn.classList.remove('mic-active');
        btn.title = "Voice Input";
    }
    recognition.stop();
}

/**
 * Exports chat history to a text file
 */
export function exportChat() {
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

/**
 * Calls the backend API for Gemini response
 * @param {string} userMessage 
 * @returns {Promise<string>}
 */
async function callGemini(userMessage) {
  // Check Cache first (TTL 1 hour)
  const cacheKey = `gemini_cache_${userMessage.toLowerCase().trim()}`;
  const cachedResponse = await window.getCached(cacheKey, async () => {
      // Rate Limiting Check
      const now = Date.now();
      if (now - lastRequestTime < REQUEST_COOLDOWN) {
        throw new Error("WAIT_COOLDOWN");
      }
      lastRequestTime = now;

      const region = localStorage.getItem('userRegion') || 'India';
      const role = localStorage.getItem('userRole') || 'Voter';

      const prompt = `You are ElectionGuide, a friendly civic education assistant for Indian elections.
User region: ${region}. User role: ${role}.
Rules:
- Never favor any party. Use simple language.
- Use numbered steps. End with one follow-up question.
- CRITICAL: DO NOT use markdown bolding (no ** symbols).
- CRITICAL: Keep response under 500 words.

User question: ${userMessage}`;

      const response = await fetch('/chat-endpoint', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Gemini error:", data);
        throw new Error("API_ERROR");
      }

      return data.candidates[0].content.parts[0].text;
  }, 3600000);

  return cachedResponse;
}

/**
 * Appends a message to the chat container
 * @param {string} role - 'user' or 'ai'
 * @param {string} text 
 */
export function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerHTML = text; 
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

/**
 * Sends a user message and handles AI response
 * @param {string} text 
 */
export async function sendMessage(text) {
    const cleanText = sanitizeInput(text);
    if (!cleanText) return;
    
    appendMessage('user', cleanText);
    const input = document.getElementById('chat-input');
    if (input) input.value = '';
    
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.classList.remove('hidden');
    
    try {
        const aiResponse = await callGemini(cleanText);
        if (indicator) indicator.classList.add('hidden');
        appendMessage('ai', aiResponse);
        generateChips(aiResponse);
        
        // Update Stats
        const count = parseInt(localStorage.getItem('stats_questions') || '0');
        localStorage.setItem('stats_questions', count + 1);
        if (window.updateDashboard) window.updateDashboard();
    } catch (error) {
        if (indicator) indicator.classList.add('hidden');
        if (error.message === 'WAIT_COOLDOWN') {
            appendMessage('ai', "Please wait a moment before asking another question... <i data-lucide='clock'></i>");
        } else {
            appendMessage('ai', "Sorry, I couldn't connect. Please try again! <i data-lucide='refresh-cw'></i>");
        }
        if (window.lucide) lucide.createIcons();
    }
}

/**
 * Generates suggestion chips based on AI response
 * @param {string} responseText 
 */
export function generateChips(responseText) {
    const container = document.getElementById('suggestion-chips');
    if (!container) return;
    container.innerHTML = '';
    
    let topics = ["How to Vote", "Registration", "Key Dates"];
    
    const text = responseText.toLowerCase();
    if (text.includes('vote') || text.includes('booth') || text.includes('poll')) {
        topics = ["Documents needed?", "Deadline?", "Find my booth?"];
    } else if (text.includes('regist') || text.includes('form') || text.includes('voter id')) {
        topics = ["Form 6 guide", "Check status", "Last date?"];
    } else if (text.includes('timeline') || text.includes('date') || text.includes('phase')) {
        topics = ["Polling day details", "Campaign rules", "Counting process"];
    }
    
    topics.forEach(topic => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.innerHTML = `<span>${topic}</span> <i data-lucide="chevron-right"></i>`;
        chip.onclick = () => sendMessage(topic);
        container.appendChild(chip);
    });
    if (window.lucide) lucide.createIcons();
}

/**
 * Initializes chat module
 */
export function initChat() {
    const container = document.getElementById('chat-messages');
    if (!container || container.children.length > 0) return;
    const welcome = `Namaste! <i data-lucide="hand"></i> I'm your ElectionGuide. How can I help you today?`;
    appendMessage('ai', welcome);
    generateChips(welcome);
    if (window.lucide) lucide.createIcons();
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
window.sendMessage = sendMessage;
window.sanitizeInput = sanitizeInput;
window.showGlobalLoader = showGlobalLoader;
window.toggleListening = toggleListening;
window.startListening = startListening;
window.stopListening = stopListening;
window.exportChat = exportChat;
window.generateChips = generateChips;
window.appendMessage = appendMessage;
