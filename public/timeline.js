/**
 * Election Timeline Module
 */

let PHASES = [];

/**
 * Initializes timeline module
 */
export async function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  if (container.children.length > 0) return;
  
  // Load Data
  const data = await window.getCached('timeline_data', () => 
    fetch('data/timeline.json').then(r => r.json())
  );
  PHASES = data;

  const completed = PHASES.filter(p => p.status === 'completed').length;
  
  // Progress bar
  const progFill = document.getElementById('timeline-progress');
  const progText = document.getElementById('timeline-progress-text');
  if (progFill) progFill.style.width = (completed / PHASES.length * 100) + '%';
  if (progText) progText.textContent = `${completed} of ${PHASES.length} phases complete`;

  container.innerHTML = '';
  PHASES.forEach(phase => {
    const card = document.createElement('div');
    card.className = 'phase-card ' + phase.status;
    card.innerHTML = `
      <div class="phase-icon" aria-hidden="true"><i data-lucide="${phase.icon}"></i></div>
      <div class="phase-content">
        <button class="phase-header-btn" onclick="togglePhase(${phase.id})" aria-expanded="false" aria-controls="detail-${phase.id}">
          <div class="phase-header-text">
            <h3>${phase.title}</h3>
            <span class="phase-date"><i data-lucide="calendar"></i> ${phase.date}</span>
          </div>
          <span class="phase-status ${phase.status}">
            ${phase.status === 'completed' ? '<i data-lucide="check-circle"></i>' : 
              phase.status === 'current' ? '<i data-lucide="refresh-cw"></i> Current' : '<i data-lucide="clock"></i>'}
          </span>
        </button>
        <p class="phase-short">${phase.short}</p>
        <div class="phase-detail" id="detail-${phase.id}" style="display:none">
          <p>${phase.detail}</p>
          <button class="ask-ai-btn" onclick="askAIAboutPhase('${phase.title}')">
            Ask AI about this <i data-lucide="bot"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  if (window.lucide) lucide.createIcons();
}

/**
 * Toggles visibility of phase details
 * @param {number} id - Phase ID
 */
export function togglePhase(id) {
  const detail = document.getElementById('detail-' + id);
  const btn = document.querySelector(`button[aria-controls="detail-${id}"]`);
  
  if (detail) {
    const isHidden = detail.style.display === 'none';
    detail.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.setAttribute('aria-expanded', isHidden);
  }
}

/**
 * Sends a pre-filled question to the AI assistant
 * @param {string} phaseTitle 
 */
export function askAIAboutPhase(phaseTitle) {
    const navAssistant = document.querySelector('[data-tab="assistant"]');
    if (navAssistant) navAssistant.click();
    
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = `Tell me more about ${phaseTitle} of the Indian elections.`;
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) sendBtn.click();
    }
}

// Global exposure
window.renderTimeline = renderTimeline;
window.togglePhase = togglePhase;
window.askAIAboutPhase = askAIAboutPhase;
