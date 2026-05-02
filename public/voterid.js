/**
 * Voter ID Registration Module (Mock Flow)
 */

/**
 * Initializes Voter ID module
 */
export function initVoterID() {
    renderAadhaarStep();
}

/**
 * Renders the first step (Aadhaar input)
 */
export function renderAadhaarStep() {
    const container = document.getElementById('voter-id-flow');
    if (!container) return;
    
    container.innerHTML = `
        <div class="voter-card animated-card">
            <div class="step-badge">Step 1 of 3</div>
            <div class="voter-icon" aria-hidden="true"><i data-lucide="fingerprint" style="width:48px;height:48px"></i></div>
            <h3>Verify Your Identity</h3>
            <p>Enter your 12-digit Aadhaar number to pre-fill your Voter ID application.</p>
            
            <div class="aadhaar-input-wrapper">
                <input type="text" id="aadhaar-input" maxlength="12" placeholder="0000 0000 0000" oninput="formatAadhaar(this)">
                <div id="aadhaar-error" class="error-text hidden">Please enter a valid 12-digit number</div>
            </div>

            <button class="btn-primary" onclick="verifyAadhaar()">Verify & Continue <i data-lucide="arrow-right"></i></button>
            <p class="privacy-note"><i data-lucide="lock"></i> Your data is processed securely and not stored.</p>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

/**
 * Formats Aadhaar input to allow only numbers
 * @param {HTMLInputElement} input 
 */
export function formatAadhaar(input) {
    input.value = input.value.replace(/\D/g, '');
}

/**
 * Simulates Aadhaar verification process
 */
export function verifyAadhaar() {
    const input = document.getElementById('aadhaar-input');
    const error = document.getElementById('aadhaar-error');
    
    if (!input || input.value.length !== 12) {
        if (error) error.classList.remove('hidden');
        return;
    }
    if (error) error.classList.add('hidden');

    const container = document.getElementById('voter-id-flow');
    container.innerHTML = `
        <div class="voter-card" aria-live="polite">
            <div class="verification-loader">
                <div class="scan-line"></div>
                <div class="biometric-icon" aria-hidden="true"><i data-lucide="user-check" style="width:48px;height:48px"></i></div>
            </div>
            <h3>Verifying Aadhaar...</h3>
            <p>Connecting to secure identity servers</p>
            <div class="progress-bar-bg small">
                <div id="verify-progress" class="progress-bar-fill" style="width: 0%"></div>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        const bar = document.getElementById('verify-progress');
        if (bar) bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(renderPreFilledForm, 500);
        }
    }, 200);
}

/**
 * Renders step 2: Pre-filled registration form
 */
export function renderPreFilledForm() {
    const container = document.getElementById('voter-id-flow');
    const userRegion = localStorage.getItem('userRegion') || 'Delhi';
    
    if (!container) return;
    container.innerHTML = `
        <div class="voter-card form-card">
            <div class="step-badge">Step 2 of 3</div>
            <div class="success-check"><i data-lucide="check"></i> Aadhaar Verified</div>
            <h3>Voter Registration (Form 6)</h3>
            <p>We've pre-filled this form using your Aadhaar details.</p>

            <form id="voter-reg-form" class="voter-form" onsubmit="submitVoterForm(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" value="Rajesh Kumar" readonly>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="text" value="15/08/1995" readonly>
                    </div>
                    <div class="form-group">
                        <label>Gender</label>
                        <input type="text" value="Male" readonly>
                    </div>
                    <div class="form-group">
                        <label>State/UT</label>
                        <input type="text" value="${userRegion}" readonly>
                    </div>
                    <div class="form-group full-width">
                        <label>Current Address</label>
                        <textarea readonly>Flat 402, Sunshine Apartments, Sector 12, ${userRegion}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Mobile Number</label>
                        <input type="tel" placeholder="Enter mobile number" required>
                    </div>
                    <div class="form-group">
                        <label>Email ID (Optional)</label>
                        <input type="email" placeholder="Enter email">
                    </div>
                </div>
                <button type="submit" class="btn-accent">Submit Application <i data-lucide="send"></i></button>
            </form>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

/**
 * Handles form submission and shows success message
 * @param {Event} e 
 */
export function submitVoterForm(e) {
    e.preventDefault();
    const container = document.getElementById('voter-id-flow');
    const refId = 'REF' + Math.floor(Math.random() * 1000000000);

    if (!container) return;
    container.innerHTML = `
        <div class="voter-card success-card" aria-live="assertive">
            <div class="confetti" aria-hidden="true"><i data-lucide="party-popper" style="width:48px;height:48px;color:#F59E0B"></i></div>
            <div class="result-icon" aria-hidden="true"><i data-lucide="file-check" style="width:48px;height:48px;color:#22C55E"></i></div>
            <h3>Application Submitted!</h3>
            <p>Your Voter ID registration has been initiated successfully.</p>
            
            <div class="ref-box">
                <span>Reference Number:</span>
                <strong id="ref-id">${refId}</strong>
                <button class="btn-text" onclick="copyRef()">Copy <i data-lucide="copy"></i></button>
            </div>

            <div class="next-steps">
                <h4>What's next?</h4>
                <ul>
                    <li>Field Verification by BLO</li>
                    <li>Approval by ERO</li>
                    <li>EPIC Generation & Delivery</li>
                </ul>
            </div>

            <button class="btn-primary" onclick="renderAadhaarStep()">New Application <i data-lucide="refresh-cw"></i></button>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

/**
 * Copies reference ID to clipboard
 */
export function copyRef() {
    const el = document.getElementById('ref-id');
    const ref = el ? el.innerText : '';
    navigator.clipboard.writeText(ref);
    alert('Reference ID copied to clipboard!');
}

// Global exposure
window.initVoterID = initVoterID;
window.renderAadhaarStep = renderAadhaarStep;
window.formatAadhaar = formatAadhaar;
window.verifyAadhaar = verifyAadhaar;
window.renderPreFilledForm = renderPreFilledForm;
window.submitVoterForm = submitVoterForm;
window.copyRef = copyRef;
