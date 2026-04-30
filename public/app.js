import { setLanguage, updateUIText, currentLanguage } from './i18n.js';
import { initChat } from './gemini.js';
import { renderTimeline } from './timeline.js';
import { initFlashcards } from './flashcards.js';
import { initCharts } from './charts.js';
import { initQuiz } from './quiz.js';
import { initEligibility } from './eligibility.js';

// Central State Management
export const state = {
    region: '',
    role: '',
    language: currentLanguage
};

// Application Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    // 1. Check LocalStorage for saved user data
    const savedRegion = localStorage.getItem('userRegion');
    const savedRole = localStorage.getItem('userRole');
    
    // Set language from start
    setLanguage(state.language);
    
    // Setup Language Switcher
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            state.language = e.target.value;
            setLanguage(e.target.value);
        });
    }

    const overlay = document.getElementById('onboarding-overlay');
    const appContainer = document.getElementById('app-container');

    if (savedRegion && savedRole) {
        state.region = savedRegion;
        state.role = savedRole;
        
        updateSidebarDisplay();
        
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }

    // 2. Setup Onboarding Form Submission
    const onboardingForm = document.getElementById('onboarding-form');
    if (onboardingForm) {
        onboardingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const regionInput = document.getElementById('state-select').value;
            const roleInput = document.getElementById('goal-select').value;

            if (!regionInput || !roleInput) {
                alert('Please select both Region and Role.');
                return;
            }

            state.region = regionInput;
            state.role = roleInput;

            // Save state
            localStorage.setItem('userRegion', state.region);
            localStorage.setItem('userRole', state.role);

            updateSidebarDisplay();

            // Transition UI
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            appContainer.classList.remove('hidden');
            
            // Initialize all modules safely
            console.log("Onboarding complete. Initializing modules...");
            const initModules = [
                { name: 'Chat', fn: initChat },
                { name: 'Timeline', fn: renderTimeline },
                { name: 'Flashcards', fn: initFlashcards },
                { name: 'Charts', fn: initCharts },
                { name: 'Quiz', fn: initQuiz },
                { name: 'Eligibility', fn: initEligibility }
            ];

            initModules.forEach(module => {
                try {
                    module.fn();
                    console.log(`${module.name} initialized.`);
                } catch (err) {
                    console.error(`Failed to initialize ${module.name}:`, err);
                }
            });
        });
    }
    
    // Check if already logged in from previous session
    if (savedRegion && savedRole) {
        console.log("Restoring session...");
        const initModules = [
            { name: 'Chat', fn: initChat },
            { name: 'Timeline', fn: renderTimeline },
            { name: 'Flashcards', fn: initFlashcards },
            { name: 'Charts', fn: initCharts },
            { name: 'Quiz', fn: initQuiz },
            { name: 'Eligibility', fn: initEligibility }
        ];

        initModules.forEach(module => {
            try {
                module.fn();
            } catch (err) {
                console.error(`Failed to initialize ${module.name}:`, err);
            }
        });
    }
    
    // 3. Setup Edit Buttons in Sidebar
    const regionBadge = document.getElementById('region-badge');
    const roleBadge = document.getElementById('role-badge');
    if (regionBadge) regionBadge.addEventListener('click', openOnboarding);
    if (roleBadge) roleBadge.addEventListener('click', openOnboarding);

    // 4. Setup Tab Navigation
    setupNavigation();
    
    // 5. Setup Mobile Menu
    setupMobileMenu();
}

export function openOnboarding() {
    // Populate form with current state
    if(state.region) document.getElementById('state-select').value = state.region;
    if(state.role) document.getElementById('goal-select').value = state.role;
    
    document.getElementById('onboarding-overlay').classList.add('active');
    document.getElementById('onboarding-overlay').classList.remove('hidden');
}

export function updateSidebarDisplay() {
    const regionBadge = document.getElementById('region-badge');
    const roleBadge = document.getElementById('role-badge');
    
    const region = state.region || localStorage.getItem('userRegion') || 'India';
    const role = state.role || localStorage.getItem('userRole') || 'Voter';
    
    if (regionBadge) regionBadge.innerHTML = `Region: ${region} <i class="fa-solid fa-pencil" style="font-size:0.6rem;"></i>`;
    if (roleBadge) roleBadge.innerHTML = `Role: ${role} <i class="fa-solid fa-pencil" style="font-size:0.6rem;"></i>`;
}

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetView = document.getElementById(targetId);

            // Remove active from all
            navBtns.forEach(b => b.classList.remove('active'));
            views.forEach(v => {
                if (v.id !== targetId) {
                    v.classList.remove('active');
                    v.classList.add('hidden');
                }
            });

            // Add active to clicked
            btn.classList.add('active');
            
            targetView.classList.remove('hidden');
            // Force reflow
            void targetView.offsetWidth;
            targetView.classList.add('active');
            
            // Close mobile menu if open
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if(sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    });
}

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// Utility Function: Open Chat Tab Programmatically (Used by Timeline)
export function openChatTab(prefilledPrompt = '') {
    const chatBtn = document.querySelector('button[data-target="chat-view"]');
    if (chatBtn) {
        chatBtn.click();
    }
    
    if (prefilledPrompt) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = prefilledPrompt;
            input.focus();
        }
    }
}
