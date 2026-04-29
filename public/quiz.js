let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let timeRemaining = 60;
let timerInterval;

export function initQuiz() {
    const startQuizBtn = document.querySelector('.master-quiz-btn');
    const closeBtn = document.getElementById('close-quiz');
    
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startMasterQuiz);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeQuizModal);
    }
}

async function startMasterQuiz() {
    const overlay = document.getElementById('quiz-overlay');
    const content = document.getElementById('quiz-content');
    const title = document.getElementById('quiz-topic-title');
    
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    content.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading Master Quiz...</div>';
    title.innerHTML = 'Topic: Master Election Quiz 🏆';
    
    // Load static quiz data
    try {
        const response = await fetch('./data/quiz.json');
        quizData = await response.json();
        
        if (quizData && quizData.length > 0) {
            currentQuestionIndex = 0;
            score = 0;
            renderQuestion();
        } else {
            content.innerHTML = '<p class="error">No quiz questions found.</p>';
        }
    } catch (e) {
        console.error("Failed to load quiz JSON:", e);
        content.innerHTML = '<p class="error">Error loading quiz data.</p>';
    }
}

function renderQuestion() {
    const content = document.getElementById('quiz-content');
    if (!content || quizData.length === 0) return;
    
    if (currentQuestionIndex >= quizData.length) {
        showFinalResults();
        return;
    }
    
    const qData = quizData[currentQuestionIndex];
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span class="badge" style="margin: 0; background: var(--primary);">Question ${currentQuestionIndex + 1} of ${quizData.length}</span>
            <span id="quiz-timer" style="font-weight: bold; color: var(--primary-dark);"><i class="fa-regular fa-clock"></i> 60s</span>
        </div>
        
        <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px; margin-bottom: 1.5rem; overflow: hidden;">
            <div id="quiz-timer-bar" style="width: 100%; height: 100%; background: var(--secondary); transition: width 1s linear;"></div>
        </div>

        <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; color: var(--dark);">${qData.question}</h3>
        
        <div class="quiz-options-container">
    `;
    
    qData.options.forEach((opt, index) => {
        html += `<button class="quiz-option" data-index="${index}">${opt}</button>`;
    });
    
    html += `
        </div>
        <div id="quiz-feedback" class="quiz-feedback"></div>
        <button id="next-question-btn" class="btn btn-primary btn-block" style="margin-top: 1.5rem; display: none;">Next Question <i class="fa-solid fa-arrow-right"></i></button>
    `;
    
    content.innerHTML = html;
    
    // Attach listeners
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', handleOptionSelect);
    });
    
    document.getElementById('next-question-btn').addEventListener('click', () => {
        currentQuestionIndex++;
        renderQuestion();
    });
    
    startTimer();
}

function startTimer() {
    timeRemaining = 60;
    clearInterval(timerInterval);
    
    const timerDisplay = document.getElementById('quiz-timer');
    const timerBar = document.getElementById('quiz-timer-bar');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        if(timerDisplay) timerDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeRemaining}s`;
        
        if (timerBar) {
            timerBar.style.width = `${(timeRemaining / 60) * 100}%`;
            if (timeRemaining < 15) {
                timerBar.style.background = '#EF4444'; // red when low
                timerDisplay.style.color = '#EF4444';
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleOptionSelect(e) {
    clearInterval(timerInterval); // Stop timer
    
    const selectedBtn = e.currentTarget;
    const selectedIndex = parseInt(selectedBtn.dataset.index);
    const qData = quizData[currentQuestionIndex];
    const isCorrect = selectedIndex === qData.correctIndex;
    
    // Disable all options
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });
    
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-question-btn');
    
    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Correct!</strong><br><small style="display:block; margin-top:0.5rem;">${qData.explanation}</small>`;
    } else {
        selectedBtn.classList.add('incorrect');
        // highlight correct one
        document.querySelector(`.quiz-option[data-index="${qData.correctIndex}"]`).classList.add('correct');
        
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <strong>Incorrect.</strong><br><small style="display:block; margin-top:0.5rem; color:var(--dark);">${qData.explanation}</small>`;
    }
    
    nextBtn.style.display = 'block';
}

function handleTimeUp() {
    // Disable all options
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });
    
    const qData = quizData[currentQuestionIndex];
    document.querySelector(`.quiz-option[data-index="${qData.correctIndex}"]`).classList.add('correct');
    
    const feedback = document.getElementById('quiz-feedback');
    feedback.className = 'quiz-feedback error';
    feedback.innerHTML = `<i class="fa-solid fa-clock"></i> <strong>Time's Up!</strong><br><small style="display:block; margin-top:0.5rem; color:var(--dark);">${qData.explanation}</small>`;
    
    document.getElementById('next-question-btn').style.display = 'block';
}

function showFinalResults() {
    clearInterval(timerInterval);
    const content = document.getElementById('quiz-content');
    
    let badge = '';
    let message = '';
    if (score >= 9) {
        badge = '🥇 Election Expert';
        message = 'Outstanding! You have a fantastic grasp of the Indian election process.';
    } else if (score >= 6) {
        badge = '🥈 Civic Scholar';
        message = 'Great job! You know the basics well, but there is still some room to learn.';
    } else {
        badge = '🥉 Keep Learning';
        message = 'Good effort! Review the flashcards and timeline to boost your knowledge.';
    }
    
    const timeTaken = (quizData.length * 60) - (score * 0) ; // Simplified time tracking logic for demo
    
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${badge.split(' ')[0]}</div>
            <h3 style="font-size: 1.5rem; color: var(--primary-dark); margin-bottom: 0.5rem;">${badge.substring(2)}</h3>
            <div style="font-size: 3rem; font-weight: bold; color: var(--secondary); margin-bottom: 1rem;">${score} / ${quizData.length}</div>
            <p style="color: var(--gray); margin-bottom: 2rem;">${message}</p>
            
            <button id="share-score-btn" class="btn btn-primary btn-block" style="margin-bottom: 1rem;">
                <i class="fa-solid fa-share-nodes"></i> Share Score
            </button>
            <button id="retry-quiz-btn" class="btn btn-outline btn-block">
                <i class="fa-solid fa-rotate-right"></i> Retry Quiz
            </button>
        </div>
    `;
    
    document.getElementById('retry-quiz-btn').addEventListener('click', startMasterQuiz);
    
    document.getElementById('share-score-btn').addEventListener('click', (e) => {
        const text = `I just scored ${score}/${quizData.length} on the DemocraSee Master Election Quiz! I earned the ${badge} badge. Can you beat my score? 🇮🇳🗳️`;
        navigator.clipboard.writeText(text).then(() => {
            e.currentTarget.innerHTML = `<i class="fa-solid fa-check"></i> Copied to Clipboard!`;
            setTimeout(() => {
                 e.currentTarget.innerHTML = `<i class="fa-solid fa-share-nodes"></i> Share Score`;
            }, 2000);
        });
    });
}

function closeQuizModal() {
    clearInterval(timerInterval);
    const overlay = document.getElementById('quiz-overlay');
    overlay.classList.remove('active');
    setTimeout(() => overlay.classList.add('hidden'), 300); // wait for fade out
}
