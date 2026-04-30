function initEligibility() {
    // UI is pre-rendered in HTML, step logic is handled here
}

function updateAge(val) {
    document.getElementById('age-val').textContent = val;
}

function eligNext(step) {
    document.querySelectorAll('.elig-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(`elig-step-${step}`).classList.remove('hidden');
}

function checkAge() {
    const age = parseInt(document.getElementById('age-slider').value);
    if (age >= 18) {
        eligNext(3);
    } else {
        eligResult('underage');
    }
}

function eligResult(type) {
    document.querySelectorAll('.elig-card').forEach(c => c.classList.add('hidden'));
    const result = document.getElementById('elig-result');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');
    const docs = document.getElementById('result-docs');
    
    result.classList.remove('hidden');
    docs.classList.remove('hidden');

    if (type === 'eligible-reg') {
        icon.textContent = '✅';
        title.textContent = 'You are Ready to Vote!';
        desc.textContent = 'You are a citizen, 18+ and already registered. Just find your polling booth on election day!';
    } else if (type === 'eligible-not-reg') {
        icon.textContent = '📝';
        title.textContent = 'You are Eligible, but need to Register!';
        desc.textContent = 'You meet the age and citizenship criteria. Please register now using Form 6 at voters.eci.gov.in.';
    } else if (type === 'unsure') {
        icon.textContent = '🔍';
        title.textContent = 'Check your Status';
        desc.textContent = 'You might be eligible. Check your name in the electoral roll at electoralsearch.eci.gov.in.';
    } else if (type === 'underage') {
        icon.textContent = '⏳';
        title.textContent = 'Not Eligible Yet';
        desc.textContent = 'You must be at least 18 years old to vote in India. You can pre-register if you are 17+!';
        docs.classList.add('hidden');
    } else if (type === 'not-citizen') {
        icon.textContent = '❌';
        title.textContent = 'Not Eligible';
        desc.textContent = 'Only citizens of India are eligible to vote in Indian elections.';
        docs.classList.add('hidden');
    }
}

function resetElig() {
    document.querySelectorAll('.elig-card').forEach(c => c.classList.add('hidden'));
    document.getElementById('elig-step-1').classList.remove('hidden');
    document.getElementById('age-slider').value = 18;
    document.getElementById('age-val').textContent = 18;
}
