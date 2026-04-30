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
});

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
    if (tab === 'assistant') initChat();
    if (tab === 'timeline') renderTimeline();
    if (tab === 'flashcards') initFlashcards();
    if (tab === 'charts') initCharts();
    if (tab === 'eligibility') initEligibility();
    if (tab === 'quiz') initQuiz();
    if (tab === 'multilingual') initMultilingual();
}
