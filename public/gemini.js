import { state } from './app.js';

let chatHistory = [];
// Use sessionStorage to cache responses and avoid duplicate API calls
const responseCache = JSON.parse(sessionStorage.getItem('democrasee_cache')) || {};

export async function initChat() {
    const chatForm = document.getElementById('chat-form');
    const clearBtn = document.getElementById('clear-chat');
    const micBtn = document.getElementById('mic-btn');
    
    // Add event listeners
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearChat);
    }
    
    if (micBtn) {
        setupVoiceInput(micBtn);
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const submitBtn = document.querySelector('#chat-form button[type="submit"]');
    const prompt = input.value.trim();
    
    if (!prompt) return;

    // UI Updates: Disable input, clear text, show user message
    input.value = '';
    input.disabled = true;
    submitBtn.disabled = true;
    
    appendMessage('user', prompt);
    const typingIndicatorId = showTypingIndicator();

    try {
        const responseText = await fetchGeminiResponse(prompt);
        removeTypingIndicator(typingIndicatorId);
        
        if (responseText) {
            appendMessage('system', formatMarkdown(responseText));
            chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
            chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
            
            // Add Smart Suggestion Chips
            generateSuggestionChips(responseText);
        } else {
            appendMessage('system', '<p class="error">Sorry, I encountered an error connecting to the AI. Please check your API key or try again later.</p>');
        }
    } catch (error) {
        removeTypingIndicator(typingIndicatorId);
        appendMessage('system', '<p class="error">An unexpected error occurred.</p>');
        console.error(error);
    } finally {
        input.disabled = false;
        submitBtn.disabled = false;
        input.focus();
    }
}

async function fetchGeminiResponse(prompt, forceJson = false) {
    // Check Cache First
    const cacheKey = `${state.language}_${state.role}_${state.region}_${prompt}_${forceJson}`;
    if (responseCache[cacheKey]) {
        return responseCache[cacheKey];
    }
    
    if (state.apiKey === 'demo') {
        await new Promise(r => setTimeout(r, 1000));
        return `This is a mock response because you are using the 'demo' key. To see real AI answers, please enter a valid Google Gemini API Key. \n\nI see you are a **${state.role}** from **${state.region}**!`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;
        
        const systemInstruction = `You are ElectionGuide, a friendly civic education assistant for Indian elections. 
        Always respond in simple language. Never favor any political party or candidate. 
        Break answers into numbered steps. Use emojis for dates (📅), steps (✅), and upcoming items (🔜). 
        Keep responses under 200 words unless asked for more. 
        Always end with a follow-up question. The user's region is ${state.region} and role is ${state.role}. 
        Tailor your answer accordingly. Respond in this language code: ${state.language}`;

        let contents = [];
        if (chatHistory.length > 0) {
            contents = [...chatHistory, { role: 'user', parts: [{ text: prompt }] }];
        } else {
            contents = [{ role: 'user', parts: [{ text: prompt }] }];
        }

        const requestBody = {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: contents,
            generationConfig: {
                temperature: 0.7
            }
        };

        if (forceJson) {
            requestBody.generationConfig.responseMimeType = "application/json";
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 429) {
                 return "Rate limit exceeded. Please wait a few seconds and try again. ⏳";
            }
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Save to cache
        responseCache[cacheKey] = responseText;
        sessionStorage.setItem('democrasee_cache', JSON.stringify(responseCache));
        
        return responseText;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
    }
}

// Reusable function for other modules (Timeline, Quizzes) to call Gemini directly
export async function callGeminiDirectly(prompt, forceJson = false) {
    return await fetchGeminiResponse(prompt, forceJson);
}

function appendMessage(sender, htmlContent) {
    const history = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = htmlContent;
    
    msgDiv.appendChild(contentDiv);
    history.appendChild(msgDiv);
    
    // Smooth scroll to bottom
    history.scrollTop = history.scrollHeight;
}

function showTypingIndicator() {
    const history = document.getElementById('chat-history');
    const id = 'typing-' + Date.now();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message system`;
    msgDiv.id = id;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content typing-indicator';
    contentDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    msgDiv.appendChild(contentDiv);
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
    
    return id;
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

function clearChat() {
    const history = document.getElementById('chat-history');
    history.innerHTML = `
        <div class="message system">
            <div class="message-content">
                Chat cleared. How else can I help you understand the election process?
            </div>
        </div>
    `;
    chatHistory = [];
    document.getElementById('suggestion-chips').innerHTML = '';
}

async function generateSuggestionChips(lastResponse) {
    const chipsContainer = document.getElementById('suggestion-chips');
    chipsContainer.innerHTML = ''; // Clear old chips
    
    if (state.apiKey === 'demo') {
        renderChips(["What documents do I need? 📄", "What's the deadline? 📅", "How to check status? 🔍"]);
        return;
    }
    
    const prompt = `Based on this previous answer: "${lastResponse.substring(0, 100)}...", generate exactly 3 short, relevant follow-up questions the user might ask next. 
    Make them brief (under 6 words each) and include a relevant emoji at the end of each.
    Return strictly a JSON array of 3 strings. Example: ["What documents do I need? 📄", "What's the deadline? 📅", "How to check status? 🔍"]`;
    
    try {
        let jsonStr = await fetchGeminiResponse(prompt, true);
        if (jsonStr) {
             jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
             const chipsArray = JSON.parse(jsonStr);
             if (Array.isArray(chipsArray) && chipsArray.length === 3) {
                 renderChips(chipsArray);
             }
        }
    } catch(e) {
        console.error("Failed to generate chips", e);
    }
}

function renderChips(chipsArray) {
    const chipsContainer = document.getElementById('suggestion-chips');
    chipsContainer.innerHTML = '';
    
    chipsArray.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-chip';
        btn.textContent = text;
        btn.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            input.value = text;
            document.querySelector('#chat-form button[type="submit"]').click();
            chipsContainer.innerHTML = ''; // Hide chips once clicked
        });
        chipsContainer.appendChild(btn);
    });
}

function setupVoiceInput(micBtn) {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        micBtn.style.display = 'none';
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language based on selected UI language
    const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'bn': 'bn-IN'
    };
    
    micBtn.addEventListener('click', () => {
        recognition.lang = langMap[state.language] || 'en-IN';
        
        micBtn.classList.add('btn-primary');
        micBtn.classList.remove('btn-outline');
        micBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-fade"></i>';
        
        try {
            recognition.start();
        } catch(e) {
            console.error("Speech recognition already started");
        }
    });
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('chat-input');
        input.value = transcript;
        
        // Auto submit
        setTimeout(() => {
            document.querySelector('#chat-form button[type="submit"]').click();
        }, 500);
    };
    
    recognition.onspeechend = () => {
        recognition.stop();
        resetMicBtn(micBtn);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        resetMicBtn(micBtn);
    };
}

function resetMicBtn(micBtn) {
    micBtn.classList.remove('btn-primary');
    micBtn.classList.add('btn-outline');
    micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
}

function formatMarkdown(text) {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/^\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
    html = html.replace(/<\/ul>\n<ul>/g, '\n');
    html = html.replace(/<\/ol>\n<ol>/g, '\n');
    html = html.replace(/\n/g, '<br>');
    return html;
}
