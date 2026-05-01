let isSpeaking = false;
let currentUtterance = null;

function initSpeaker() {
    const speakerBtn = document.getElementById('speaker-toggle');
    if (!speakerBtn) return;

    speakerBtn.addEventListener('click', () => {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            startSpeaking();
        }
    });

    // Stop speaking when switching tabs
    const navItems = document.querySelectorAll('[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isSpeaking) stopSpeaking();
        });
    });
}

function startSpeaking() {
    const activePanel = document.querySelector('.tab-panel.active');
    if (!activePanel) return;

    const textToRead = extractTextFromPanel(activePanel);
    if (!textToRead) return;

    isSpeaking = true;
    updateSpeakerUI(true);

    currentUtterance = new SpeechSynthesisUtterance(textToRead);
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;
    
    currentUtterance.onend = () => {
        stopSpeaking();
    };

    currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        stopSpeaking();
    };

    window.speechSynthesis.speak(currentUtterance);
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    currentUtterance = null;
    updateSpeakerUI(false);
}

function extractTextFromPanel(panel) {
    // Clone panel to manipulate without affecting UI
    const clone = panel.cloneNode(true);
    
    // Remove non-essential elements from clone
    const selectorsToRemove = [
        'button', 'script', 'style', '.chart-tabs', '.suggestion-chips', 
        '.chat-input-area', '.card-controls', '.progress-bar-bg', 
        '.step-badge', '.pulse-dot', '.founding-year'
    ];
    selectorsToRemove.forEach(s => {
        clone.querySelectorAll(s).forEach(el => el.remove());
    });

    // Get text content and clean it up
    let text = clone.innerText || clone.textContent;
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

function updateSpeakerUI(active) {
    const speakerBtn = document.getElementById('speaker-toggle');
    if (!speakerBtn) return;

    if (active) {
        speakerBtn.innerHTML = '🛑';
        speakerBtn.classList.add('speaking-active');
        speakerBtn.title = 'Stop Reading';
    } else {
        speakerBtn.innerHTML = '🔊';
        speakerBtn.classList.remove('speaking-active');
        speakerBtn.title = 'Read Aloud Content';
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to ensure all tabs are ready
    setTimeout(initSpeaker, 1000);
});
