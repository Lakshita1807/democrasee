function initVoterID() {
    renderAadhaarStep();
}

function renderAadhaarStep() {
    const container = document.getElementById('voter-id-flow');
    container.innerHTML = `
        <div class="voter-card animated-card">
            <div class="step-badge">Step 1 of 3</div>
            <div class="voter-icon">🆔</div>
            <h3>Verify Your Identity</h3>
            <p>Enter your 12-digit Aadhaar number to pre-fill your Voter ID application.</p>
            
            <div class="aadhaar-input-wrapper">
                <input type="text" id="aadhaar-input" maxlength="12" placeholder="0000 0000 0000" oninput="formatAadhaar(this)">
                <div id="aadhaar-error" class="error-text hidden">Please enter a valid 12-digit number</div>
            </div>

            <button class="btn-primary" onclick="verifyAadhaar()">Verify & Continue →</button>
            <p class="privacy-note">🔒 Your data is processed securely and not stored.</p>
        </div>
    `;
}

function formatAadhaar(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value;
}

function verifyAadhaar() {
    const input = document.getElementById('aadhaar-input');
    const error = document.getElementById('aadhaar-error');
    
    if (input.value.length !== 12) {
        error.classList.remove('hidden');
        return;
    }
    error.classList.add('hidden');

    const container = document.getElementById('voter-id-flow');
    container.innerHTML = `
        <div class="voter-card">
            <div class="verification-loader">
                <div class="scan-line"></div>
                <div class="biometric-icon">👤</div>
            </div>
            <h3>Verifying Aadhaar...</h3>
            <p>Connecting to secure identity servers</p>
            <div class="progress-bar-bg small">
                <div id="verify-progress" class="progress-bar-fill" style="width: 0%"></div>
            </div>
        </div>
    `;

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('verify-progress').style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(renderPreFilledForm, 500);
        }
    }, 200);
}

function renderPreFilledForm() {
    const container = document.getElementById('voter-id-flow');
    const userRegion = localStorage.getItem('userRegion') || 'Delhi';
    
    container.innerHTML = `
        <div class="voter-card form-card">
            <div class="step-badge">Step 2 of 3</div>
            <div class="success-check">✅ Aadhaar Verified</div>
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
                <button type="submit" class="btn-accent">Submit Application</button>
            </form>
        </div>
    `;
}

function submitVoterForm(e) {
    e.preventDefault();
    const container = document.getElementById('voter-id-flow');
    const refId = 'REF' + Math.floor(Math.random() * 1000000000);

    container.innerHTML = `
        <div class="voter-card success-card">
            <div class="confetti">🎉</div>
            <div class="result-icon">📄</div>
            <h3>Application Submitted!</h3>
            <p>Your Voter ID registration has been initiated successfully.</p>
            
            <div class="ref-box">
                <span>Reference Number:</span>
                <strong id="ref-id">${refId}</strong>
                <button class="btn-text" onclick="copyRef()">Copy</button>
            </div>

            <div class="next-steps">
                <h4>What's next?</h4>
                <ul>
                    <li>Field Verification by BLO</li>
                    <li>Approval by ERO</li>
                    <li>EPIC Generation & Delivery</li>
                </ul>
            </div>

            <button class="btn-primary" onclick="renderAadhaarStep()">New Application 🔄</button>
        </div>
    `;
}

function copyRef() {
    const ref = document.getElementById('ref-id').innerText;
    navigator.clipboard.writeText(ref);
    alert('Reference ID copied to clipboard!');
}
