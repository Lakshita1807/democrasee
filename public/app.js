/**
 * Main application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Ticker Optimization: Clone content for infinite loop
    const tickerMove = document.querySelector('.ticker-move');
    if (tickerMove) {
        const clone = tickerMove.innerHTML;
        tickerMove.innerHTML += clone;
    }

    // SSE Live Updates
    initLiveUpdates();

    // Lazy Loading Observer
    initLazyLoading();

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
    const themeCheckbox = document.getElementById('theme-checkbox');
    
    /**
     * Applies theme to the document
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const headerThemeCheckbox = document.getElementById('theme-checkbox-header');
        if (themeCheckbox) themeCheckbox.checked = theme === 'dark';
        if (headerThemeCheckbox) headerThemeCheckbox.checked = theme === 'dark';
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeCheckbox?.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
    });

    const headerThemeCheckbox = document.getElementById('theme-checkbox-header');
    headerThemeCheckbox?.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
    });

    // Navigation & Tab Management
    const navItemsAlt = document.querySelectorAll('.nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function switchTab(tabId) {
        // Deactivate all
        navItemsAlt.forEach(nav => nav.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        // Activate target
        const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        const targetPanel = document.getElementById(`tab-${tabId}`);

        if (targetNav) targetNav.classList.add('active');
        if (targetPanel) {
            targetPanel.classList.add('active');
            initTab(tabId);
        }

        // Close sidebar on mobile
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    navItemsAlt.forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = item.getAttribute('data-tab');
            if (tab) {
                e.preventDefault();
                switchTab(tab);
            }
        });
    });

    // Accessibility Toggle
    const accBtns = [document.getElementById('acc-toggle'), document.getElementById('acc-toggle-header')];
    
    function applyAccessibility(isEnabled) {
        if (isEnabled) {
            document.documentElement.setAttribute('data-accessibility', 'enabled');
        } else {
            document.documentElement.removeAttribute('data-accessibility');
        }
        localStorage.setItem('democrasee_acc_v3', isEnabled);
        
        accBtns.forEach(btn => {
            if (btn) {
                if (isEnabled) {
                    btn.classList.add('active');
                    btn.style.background = '#ffff00';
                    btn.style.color = '#000';
                } else {
                    btn.classList.remove('active');
                    btn.style.background = '';
                    btn.style.color = '';
                }
            }
        });
        console.log('Accessibility Mode Set To:', isEnabled);
    }

    // Initial load - defaults to false unless explicitly true
    const savedAcc = localStorage.getItem('democrasee_acc_v3');
    const initialAcc = savedAcc === 'true';
    applyAccessibility(initialAcc);

    accBtns.forEach(btn => {
        btn?.addEventListener('click', (e) => {
            e.preventDefault();
            const isNowEnabled = document.documentElement.getAttribute('data-accessibility') !== 'enabled';
            applyAccessibility(isNowEnabled);
        });
    });

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

    // Initial Dashboard Update & Progress Sync
    loadUserProgress().then(progress => {
        if (progress) {
            if (progress.userRegion) localStorage.setItem('userRegion', progress.userRegion);
            if (progress.userRole) localStorage.setItem('userRole', progress.userRole);
            if (progress.quizBestScore) localStorage.setItem('quizBestScore', progress.quizBestScore);
            if (progress.masteredFlashcards) localStorage.setItem('masteredFlashcards', JSON.stringify(progress.masteredFlashcards));
            
            if (progress.userRegion && progress.userRole) {
                showApp(progress.userRegion, progress.userRole);
            }
        }
        updateDashboard(false); // Don't sync back immediately on load
    });

    // Pause/stop the ticker animation off-screen
    const ticker = document.querySelector('.ticker-move');
    if (ticker) {
        document.addEventListener('visibilitychange', () => {
            ticker.style.animationPlayState = document.hidden ? 'paused' : 'running';
        });
    }
});

/**
 * Global Caching Utility with TTL
 * @param {string} key 
 * @param {Function} fetchFn 
 * @param {number} ttlMs 
 * @returns {Promise<any>}
 */
export function getCached(key, fetchFn, ttlMs = 86400000) {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.ts < ttlMs) return Promise.resolve(cached.data);
    return fetchFn().then(data => {
        localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
        return data;
    });
}
window.getCached = getCached;

/**
 * All localStorage keys owned by the DemocraSee app.
 * Used by resetProgress() and testable in isolation.
 */
export const APP_STORAGE_KEYS = [
    'userRegion',
    'userRole',
    'language',
    'theme',
    'democrasee_acc_v3',
    'quizBestScore',
    'masteredFlashcards',
    'stats_questions',
];

/**
 * Saves current progress snapshot to storage.
 * @param {{ userRegion?: string, userRole?: string, quizBestScore?: number|string,
 *           masteredFlashcards?: string[] }} data
 * @param {Storage} [storage=localStorage]
 */
export function saveProgress(data, storage = localStorage) {
    if (data.userRegion)        storage.setItem('userRegion', data.userRegion);
    if (data.userRole)          storage.setItem('userRole', data.userRole);
    if (data.quizBestScore !== undefined)
                                storage.setItem('quizBestScore', String(data.quizBestScore));
    if (data.masteredFlashcards)
                                storage.setItem('masteredFlashcards', JSON.stringify(data.masteredFlashcards));
}

/**
 * Loads progress snapshot from storage.
 * @param {Storage} [storage=localStorage]
 * @returns {{ userRegion: string|null, userRole: string|null,
 *             quizBestScore: string|null, masteredFlashcards: string[] }}
 */
export function loadProgress(storage = localStorage) {
    return {
        userRegion:         storage.getItem('userRegion'),
        userRole:           storage.getItem('userRole'),
        quizBestScore:      storage.getItem('quizBestScore'),
        masteredFlashcards: JSON.parse(storage.getItem('masteredFlashcards') || '[]'),
    };
}

/**
 * Clears all app-owned localStorage keys ("Reset Data").
 * @param {Storage} [storage=localStorage]
 */
export function resetProgress(storage = localStorage) {
    APP_STORAGE_KEYS.forEach(key => storage.removeItem(key));
}
window.resetProgress = resetProgress;



/**
 * Initializes SSE for live election updates
 */
function initLiveUpdates() {
    const liveIndicator = document.getElementById('live-indicator');
    if (!liveIndicator) return;

    const es = new EventSource('/api/live-updates');
    
    es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'TURNOUT_UPDATE') {
            const ticker = document.querySelector('.ticker-move');
            if (ticker) {
                // Update turnout info dynamically if possible, or just log
                console.log("Live Turnout Update:", data.value);
            }
        }
    };

    es.onerror = () => {
        console.warn("SSE connection lost. Reconnecting...");
        es.close();
    };
}

/**
 * Initializes Lazy Loading for major sections
 */
function initLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const tab = entry.target.id.replace('tab-', '');
                initTab(tab);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tab-panel').forEach(section => observer.observe(section));
}

/**
 * Updates the user dashboard stats
 * @param {boolean} syncToCloud - Whether to save to Firestore
 */
function updateDashboard(syncToCloud = true) {
    const flashcards = JSON.parse(localStorage.getItem('masteredFlashcards') || '[]');
    const quizScore = localStorage.getItem('quizBestScore') || '0';
    const questions = localStorage.getItem('stats_questions') || '0';
    const region = localStorage.getItem('userRegion');
    const role = localStorage.getItem('userRole');
    
    const statFlash = document.getElementById('stat-flashcards');
    const statQuiz = document.getElementById('stat-quiz');
    const statQues = document.getElementById('stat-questions');

    if (statFlash) statFlash.textContent = `${flashcards.length}/25`;
    if (statQuiz) statQuiz.textContent = `${quizScore}/10`;
    if (statQues) statQues.textContent = questions;

    if (syncToCloud && window.saveUserProgress) {
        window.saveUserProgress({
            masteredFlashcards: flashcards,
            quizBestScore: quizScore,
            stats_questions: questions,
            userRegion: region,
            userRole: role
        });
    }
}
window.updateDashboard = updateDashboard;

/**
 * Transition from onboarding to main app
 * @param {string} region 
 * @param {string} role 
 */
function showApp(region, role) {
    const modal = document.getElementById('onboarding-modal');
    const main = document.getElementById('main-app');
    
    if (modal) modal.classList.add('hidden');
    if (main) main.classList.remove('hidden');
    
    // GA4 Tracking
    if (window.gtag) {
        gtag('event', 'select_content', {
            'content_type': 'state_selection',
            'item_id': region
        });
        gtag('event', 'user_role_assignment', {
            'role': role
        });
    }

    updateBadges(region, role);
    initTab('assistant');
}

/**
 * Updates sidebar badges with user info
 * @param {string} region 
 * @param {string} role 
 */
function updateBadges(region, role) {
    const regionBadge = document.getElementById('region-badge');
    const roleBadge = document.getElementById('role-badge');
    
    if (regionBadge) regionBadge.innerHTML = `<i data-lucide="map-pin"></i> ${region}`;
    if (roleBadge) roleBadge.innerHTML = `<i data-lucide="user"></i> ${role}`;
    
    if (window.lucide) lucide.createIcons();
}

/**
 * Lazy loads and initializes a tab panel
 * @param {string} tab 
 */
function initTab(tab) {
    const container = document.getElementById(`tab-${tab}`);
    if (container && container.getAttribute('data-loaded') === 'true') return;

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
        
        if (container) container.setAttribute('data-loaded', 'true');
        if (window.lucide) lucide.createIcons();
        
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
