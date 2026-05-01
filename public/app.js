document.addEventListener('DOMContentLoaded', () => {
    // Check if onboarding is needed
    const savedRegion = localStorage.getItem('userRegion');
    const savedRole = localStorage.getItem('userRole');
    const savedLang = localStorage.getItem('language');

    if (savedLang) setLanguage(savedLang);

    if (savedRegion && savedRole) {
        showApp(savedRegion, savedRole);
    } else {
        document.getElementById('onboarding-modal').classList.remove('hidden');
    }

    // Onboarding Button
    document.getElementById('get-started-btn').addEventListener('click', () => {
        const region = document.getElementById('state-select').value;
        const role = document.getElementById('role-select').value;
        
        localStorage.setItem('userRegion', region);
        localStorage.setItem('userRole', role);
        
        showApp(region, role);
    });

    // Tab Switching
    const navItems = document.querySelectorAll('[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            
            // UI Updates
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            // Mobile Sidebar Close
            document.getElementById('sidebar').classList.remove('open');
            
            initTab(tab);
        });
    });

    // Mobile Hamburger
    const hamburger = document.getElementById('hamburger');
    hamburger.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !hamburger.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const themeCheckbox = document.getElementById('theme-checkbox');
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const headerThemeCheckbox = document.getElementById('theme-checkbox-header');
        if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        if (themeCheckbox) themeCheckbox.checked = theme === 'dark';
        if (headerThemeCheckbox) headerThemeCheckbox.checked = theme === 'dark';
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeBtn?.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    themeCheckbox?.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
    });

    const headerThemeCheckbox = document.getElementById('theme-checkbox-header');
    headerThemeCheckbox?.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
    });

    // Accessibility Toggle
    const accBtn = document.getElementById('acc-toggle');
    const headerAccBtn = document.getElementById('acc-toggle-header');
    
    function toggleAccessibility() {
        const active = document.body.classList.toggle('accessibility-mode');
        localStorage.setItem('accessibilityMode', active);
    }

    if (localStorage.getItem('accessibilityMode') === 'true') {
        document.body.classList.add('accessibility-mode');
    }

    accBtn?.addEventListener('click', toggleAccessibility);
    headerAccBtn?.addEventListener('click', toggleAccessibility);

    // Share Button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = "Learn about Indian elections with DemocraSee! https://democrasee-142760811225.us-central1.run.app #BuildwithAI #PromptWarsVirtual";
            navigator.clipboard.writeText(text).then(() => {
                shareBtn.classList.add('copied');
                setTimeout(() => shareBtn.classList.remove('copied'), 2000);
            });
        });
    }

    // Initial Dashboard Update
    updateDashboard();
});

function updateDashboard() {
    const flashcards = JSON.parse(localStorage.getItem('masteredFlashcards') || '[]');
    const quizScore = localStorage.getItem('quizBestScore') || '0';
    const questions = localStorage.getItem('stats_questions') || '0';
    
    // Calculate Days Active
    const firstVisit = localStorage.getItem('firstVisitDate') || new Date().toISOString();
    if (!localStorage.getItem('firstVisitDate')) localStorage.setItem('firstVisitDate', firstVisit);
    const diff = Math.floor((new Date() - new Date(firstVisit)) / (1000 * 60 * 60 * 24)) + 1;

    document.getElementById('stat-flashcards').textContent = `${flashcards.length}/25`;
    document.getElementById('stat-quiz').textContent = `${quizScore}/10`;
    document.getElementById('stat-questions').textContent = questions;
}
window.updateDashboard = updateDashboard;

function showApp(region, role) {
    document.getElementById('onboarding-modal').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    updateBadges(region, role);
    initTab('assistant');
}

function updateBadges(region, role) {
    document.getElementById('region-badge').textContent = `📍 ${region}`;
    document.getElementById('role-badge').textContent = `👤 ${role}`;
}

function initTab(tab) {
    const container = document.getElementById(`tab-${tab}`);
    try {
        if (tab === 'assistant') initChat();
        if (tab === 'timeline') renderTimeline();
        if (tab === 'news') initNews();
        if (tab === 'flashcards') initFlashcards();
        if (tab === 'charts') initCharts();
        if (tab === 'eligibility') initEligibility();
        if (tab === 'quiz') initQuiz();
        if (tab === 'multilingual') initMultilingual();
        if (tab === 'helpline') initHelpline();
        if (tab === 'voter-id') initVoterID();
        if (tab === 'parties') initParties();
    } catch (error) {
        console.error(`Error loading tab ${tab}:`, error);
        if (container) {
            container.innerHTML = `
                <div class="error-boundary">
                    <h3>Oops! Something went wrong</h3>
                    <p>We couldn't load this section. Please try refreshing the page.</p>
                    <button class="btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            `;
        }
    }
}
