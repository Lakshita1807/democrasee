export function initEligibility() {
    const btns = document.querySelectorAll('.elig-btn');
    const ageNextBtn = document.getElementById('elig-age-next');
    
    // Step 1: Citizenship
    document.querySelector('#eligibility-step-1').addEventListener('click', (e) => {
        if(e.target.classList.contains('elig-btn')) {
            const isCitizen = e.target.dataset.val === 'yes';
            if(!isCitizen) {
                showResult(false, "You must be an Indian citizen to vote in Indian elections.", false);
            } else {
                nextStep(1);
            }
        }
    });

    // Step 2: Age
    ageNextBtn.addEventListener('click', () => {
        const age = parseInt(document.getElementById('elig-age-input').value);
        if(!age || isNaN(age)) {
            alert("Please enter a valid age.");
            return;
        }
        
        if(age < 18) {
            showResult(false, `You must be at least 18 years old to vote. You have ${18 - age} more years to go!`, false);
        } else {
            nextStep(2);
        }
    });

    // Step 3: Registration
    document.querySelector('#eligibility-step-3').addEventListener('click', (e) => {
        if(e.target.classList.contains('elig-btn')) {
            const status = e.target.dataset.val;
            
            if(status === 'yes') {
                showResult(true, "You are eligible to vote! Keep your Voter ID (EPIC) ready.", false);
            } else if(status === 'no') {
                showResult(false, "You meet the age and citizenship criteria, but you MUST register on the Electoral Roll to vote.", true);
            } else {
                showResult(false, "You need to verify if your name is on the Electoral Roll.", true);
            }
        }
    });
}

function nextStep(currentStep) {
    document.getElementById(`eligibility-step-${currentStep}`).classList.add('hidden');
    document.getElementById(`eligibility-step-${currentStep + 1}`).classList.remove('hidden');
    
    // Update progress
    const indicators = document.querySelectorAll('#eligibility-progress .step-indicator');
    indicators[currentStep].classList.add('active');
    indicators[currentStep].style.background = 'var(--primary)';
    indicators[currentStep].style.color = 'var(--white)';
    indicators[currentStep].style.borderColor = 'var(--primary)';
}

function showResult(isEligible, message, needsRegistration) {
    // Hide all steps
    [1, 2, 3].forEach(i => document.getElementById(`eligibility-step-${i}`).classList.add('hidden'));
    document.getElementById('eligibility-progress').classList.add('hidden');
    
    const resultDiv = document.getElementById('eligibility-result');
    resultDiv.classList.remove('hidden');
    
    let html = '';
    
    if(isEligible) {
        html = `
            <div style="font-size: 4rem; color: var(--secondary); margin-bottom: 1rem;"><i class="fa-solid fa-circle-check"></i></div>
            <h3 style="font-size: 1.5rem; color: var(--dark); margin-bottom: 1rem;">You are eligible to vote!</h3>
            <p style="color: var(--gray); margin-bottom: 2rem;">${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Check Again</button>
        `;
    } else if(needsRegistration) {
        html = `
            <div style="font-size: 4rem; color: #F59E0B; margin-bottom: 1rem;"><i class="fa-solid fa-circle-exclamation"></i></div>
            <h3 style="font-size: 1.5rem; color: var(--dark); margin-bottom: 1rem;">Action Required</h3>
            <p style="color: var(--gray); margin-bottom: 2rem;">${message}</p>
            <a href="https://voters.eci.gov.in/" target="_blank" class="btn btn-primary" style="margin-right:0.5rem; text-decoration:none;"><i class="fa-solid fa-up-right-from-square"></i> Go to NVSP Portal</a>
            <button class="btn btn-outline" onclick="location.reload()">Check Again</button>
        `;
    } else {
        html = `
            <div style="font-size: 4rem; color: #EF4444; margin-bottom: 1rem;"><i class="fa-solid fa-circle-xmark"></i></div>
            <h3 style="font-size: 1.5rem; color: var(--dark); margin-bottom: 1rem;">Not Yet Eligible</h3>
            <p style="color: var(--gray); margin-bottom: 2rem;">${message}</p>
            <button class="btn btn-outline" onclick="location.reload()">Check Again</button>
        `;
    }
    
    resultDiv.innerHTML = html;
}
