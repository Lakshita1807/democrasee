/**
 * Eligibility Checker Module
 */

/**
 * Validates eligibility based on age and citizenship
 * @param {Object} data 
 * @param {number} data.age
 * @param {boolean} data.citizen
 * @param {boolean} data.registered
 * @returns {Object}
 */
export function checkEligibility({ age, citizen, registered }) {
    if (!citizen) return { eligible: false, type: 'not-citizen' };
    if (age < 18) return { eligible: false, type: 'underage' };
    if (!registered) return { eligible: true, type: 'eligible-not-reg' };
    return { eligible: true, type: 'eligible-reg' };
}

/**
 * Initializes eligibility module
 */
export function initEligibility() {
    // UI is pre-rendered in HTML, step logic is handled here
}

/**
 * Updates age display in UI
 * @param {number} val 
 */
export function updateAge(val) {
    const el = document.getElementById('age-val');
    if (el) el.textContent = val;
}

/**
 * Advances to next step in eligibility wizard
 * @param {number} step 
 */
export function eligNext(step) {
    if (window.gtag) {
        gtag('event', 'eligibility_step', { 'step': step });
    }
    document.querySelectorAll('.elig-card').forEach(c => c.classList.add('hidden'));
    const nextStep = document.getElementById(`elig-step-${step}`);
    if (nextStep) nextStep.classList.remove('hidden');
}

/**
 * Validates age and moves to next step
 */
export function checkAge() {
    const slider = document.getElementById('age-slider');
    const age = parseInt(slider ? slider.value : '0');
    if (window.gtag) {
        gtag('event', 'eligibility_age_check', { 'age': age });
    }
    if (age >= 18) {
        eligNext(3);
    } else {
        eligResult('underage');
    }
}

/**
 * Renders final eligibility result
 * @param {string} type 
 */
export function eligResult(type) {
    if (window.gtag) {
        gtag('event', 'eligibility_result', { 'result_type': type });
    }
    document.querySelectorAll('.elig-card').forEach(c => c.classList.add('hidden'));
    const result = document.getElementById('elig-result');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');
    const docs = document.getElementById('result-docs');
    
    if (!result) return;
    result.classList.remove('hidden');
    if (docs) docs.classList.remove('hidden');
    
    // Clear previous buttons
    const oldActions = result.querySelector('.elig-actions-vertical');
    if (oldActions) oldActions.remove();

    if (type === 'eligible-reg') {
        icon.innerHTML = '<i data-lucide="check-circle" style="width:48px;height:48px;color:#22C55E"></i>';
        title.textContent = 'You are Ready to Vote!';
        desc.textContent = 'You are a citizen, 18+ and already registered. Just find your polling booth on election day!';
    } else if (type === 'eligible-not-reg') {
        icon.innerHTML = '<i data-lucide="file-text" style="width:48px;height:48px;color:#3B82F6"></i>';
        title.textContent = 'You are Eligible, but need to Register!';
        desc.textContent = 'You meet the age and citizenship criteria. Please register now using Form 6 at voters.eci.gov.in.';
    } else if (type === 'unsure') {
        icon.innerHTML = '<i data-lucide="search" style="width:48px;height:48px;color:#F59E0B"></i>';
        title.textContent = 'Check your Status';
        desc.textContent = 'You might be eligible. Check your name in the electoral roll at electoralsearch.eci.gov.in.';
    } else if (type === 'underage') {
        icon.innerHTML = '<i data-lucide="clock" style="width:48px;height:48px;color:#6366F1"></i>';
        title.textContent = 'Not Eligible Yet';
        desc.textContent = 'You must be at least 18 years old to vote in India. You can pre-register if you are 17+!';
        if (docs) docs.classList.add('hidden');
    } else if (type === 'not-citizen') {
        icon.innerHTML = '<i data-lucide="x-circle" style="width:48px;height:48px;color:#EF4444"></i>';
        title.textContent = 'Not Eligible';
        desc.textContent = 'Only citizens of India are eligible to vote in Indian elections.';
        if (docs) docs.classList.add('hidden');
    }

    if (type.startsWith('eligible') || type === 'unsure') {
        const actionArea = document.createElement('div');
        actionArea.className = 'elig-actions-vertical';
        actionArea.style.display = 'flex';
        actionArea.style.flexDirection = 'column';
        actionArea.style.gap = '10px';
        actionArea.style.marginTop = '20px';
        
        actionArea.innerHTML = `
            <a href="https://electoralsearch.eci.gov.in/" target="_blank" class="btn-primary" style="text-decoration:none">
                Find My Polling Booth <i data-lucide="map"></i>
            </a>
            <a href="https://voters.eci.gov.in/" target="_blank" class="btn-accent" style="text-decoration:none">
                Download Voter ID <i data-lucide="file-text"></i>
            </a>
        `;
        result.appendChild(actionArea);
    }
    if (window.lucide) lucide.createIcons();
}

/**
 * Resets the eligibility wizard
 */
export function resetElig() {
    document.querySelectorAll('.elig-card').forEach(c => c.classList.add('hidden'));
    const step1 = document.getElementById('elig-step-1');
    if (step1) step1.classList.remove('hidden');
    const slider = document.getElementById('age-slider');
    if (slider) slider.value = 18;
    const ageVal = document.getElementById('age-val');
    if (ageVal) ageVal.textContent = 18;
}

// Global exposure
window.checkEligibility = checkEligibility;
window.initEligibility = initEligibility;
window.updateAge = updateAge;
window.eligNext = eligNext;
window.checkAge = checkAge;
window.eligResult = eligResult;
window.resetElig = resetElig;
