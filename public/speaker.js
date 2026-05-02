/**
 * Screen Reader / Text-to-Speech Module
 */

let isSpeaking = false;
let currentUtterance = null;

/**
 * Initializes speaker module
 */
export function initSpeaker() {
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

/**
 * Starts text-to-speech for the active panel
 */
export function startSpeaking() {
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

/**
 * Stops any ongoing speech
 */
export function stopSpeaking() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    currentUtterance = null;
    updateSpeakerUI(false);
}

/**
 * Extracts clean readable text from a DOM element
 * @param {HTMLElement} panel 
 * @returns {string}
 */
export function extractTextFromPanel(panel) {
    const clone = panel.cloneNode(true);
    
    const selectorsToRemove = [
        'button', 'script', 'style', '.chart-tabs', '.suggestion-chips', 
        '.chat-input-area', '.card-controls', '.progress-bar-bg', 
        '.step-badge', '.pulse-dot', '.founding-year', '[aria-hidden="true"]'
    ];
    selectorsToRemove.forEach(s => {
        clone.querySelectorAll(s).forEach(el => el.remove());
    });

    let text = clone.innerText || clone.textContent;
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Updates speaker button UI
 * @param {boolean} active 
 */
export function updateSpeakerUI(active) {
    const speakerBtn = document.getElementById('speaker-toggle');
    if (!speakerBtn) return;

    if (active) {
        speakerBtn.innerHTML = '<i data-lucide="square"></i>';
        speakerBtn.classList.add('speaking-active');
        speakerBtn.title = 'Stop Reading';
    } else {
        speakerBtn.innerHTML = '<i data-lucide="volume-2"></i>';
        speakerBtn.classList.remove('speaking-active');
        speakerBtn.title = 'Read Aloud Content';
    }
    if (window.lucide) lucide.createIcons();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSpeaker, 1000);
});
