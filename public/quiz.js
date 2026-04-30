const QUIZ_QUESTIONS = [
  {
    question: "What does ECI stand for?",
    options: [
      "Electoral Council of India",
      "Election Commission of India",
      "Electoral Committee of India",
      "Election Council of India"
    ],
    correct: 1,
    explanation: "ECI is a constitutional body established under Article 324 to conduct free and fair elections in India."
  },
  {
    question: "What is the minimum age to vote in India?",
    options: ["16 years", "21 years", "18 years", "25 years"],
    correct: 2,
    explanation: "The voting age was lowered from 21 to 18 years by the 61st Constitutional Amendment Act in 1988."
  },
  {
    question: "What does NOTA stand for?",
    options: [
      "No Other Than Abstain",
      "Not One Total Answer",
      "None Of The Above",
      "No Other Trusted Alternative"
    ],
    correct: 2,
    explanation: "NOTA was introduced by the Supreme Court in 2013 to allow voters to reject all candidates."
  },
  {
    question: "Which Article of the Constitution establishes the Election Commission?",
    options: ["Article 280", "Article 315", "Article 324", "Article 356"],
    correct: 2,
    explanation: "Article 324 gives the Election Commission superintendence, direction and control of elections."
  },
  {
    question: "What does VVPAT stand for?",
    options: [
      "Voter Verified Paper Audit Trail",
      "Verified Voter Paper and Tally",
      "Vote Verification Printing Audit Tool",
      "Verified Voting Paper Audit Technology"
    ],
    correct: 0,
    explanation: "VVPAT was introduced to add transparency — it shows a paper slip of your vote for 7 seconds after you press the EVM button."
  },
  {
    question: "How many seats are needed for a majority in Lok Sabha?",
    options: ["243", "252", "261", "272"],
    correct: 3,
    explanation: "A simple majority requires 272 seats — more than half of the 543 elected Lok Sabha seats."
  },
  {
    question: "How many Lok Sabha constituencies are there in India?",
    options: ["428", "543", "552", "600"],
    correct: 1,
    explanation: "There are 543 elected Lok Sabha constituencies across all states and union territories."
  },
  {
    question: "When does the Model Code of Conduct come into effect?",
    options: [
      "30 days before polling",
      "When nominations open",
      "When ECI announces the election schedule",
      "On polling day"
    ],
    correct: 2,
    explanation: "The MCC kicks in immediately when the Election Commission announces the election schedule."
  },
  {
    question: "What is the security deposit for a general Lok Sabha candidate?",
    options: ["₹10,000", "₹25,000", "₹50,000", "₹1,00,000"],
    correct: 1,
    explanation: "The deposit is ₹25,000 for general candidates and ₹12,500 for SC/ST candidates. It is forfeited if they get less than 1/6th of total votes."
  },
  {
    question: "Where is India's indelible election ink manufactured?",
    options: [
      "Bengaluru Chemicals Ltd",
      "Government Mysore Paints & Varnish Ltd",
      "Mumbai Ink Corporation",
      "Delhi State Industries"
    ],
    correct: 1,
    explanation: "The indelible ink used in Indian elections is exclusively manufactured at Government Mysore Paints & Varnish Ltd in Karnataka."
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeRemaining = 30;

export function initQuiz() {
    const quizBtn = document.querySelector('.master-quiz-btn');
    const closeBtn = document.getElementById('close-quiz');
    
    if (quizBtn) {
        quizBtn.addEventListener('click', showStartScreen);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            document.getElementById('quiz-overlay').classList.add('hidden');
        });
    }
}

function showStartScreen() {
    const overlay = document.getElementById('quiz-overlay');
    const content = document.getElementById('quiz-content');
    const title = document.getElementById('quiz-topic-title');
    
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    title.innerText = "Topic: Master Election Quiz";
    
    content.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 4rem; margin-bottom: 1.5rem;">🏆</div>
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Ready to test your knowledge?</h3>
            <p style="color: var(--gray); margin-bottom: 2rem;">10 Questions • 30 sec each • No retries</p>
            <button id="start-quiz-now" class="btn btn-primary btn-block">Start Quiz <i class="fa-solid fa-play"></i></button>
        </div>
    `;
    
    document.getElementById('start-quiz-now').addEventListener('click', startQuiz);
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
}

function renderQuestion() {
    if (currentQuestionIndex >= QUIZ_QUESTIONS.length) {
        showResults();
        return;
    }
    
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    const content = document.getElementById('quiz-content');
    
    content.innerHTML = `
        <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span class="badge" style="background: var(--primary);">Question ${currentQuestionIndex + 1} of 10</span>
            <span id="quiz-timer" style="font-weight: bold; color: var(--primary-dark);"><i class="fa-regular fa-clock"></i> 30s</span>
        </div>
        <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px; margin-bottom: 1.5rem; overflow: hidden;">
            <div id="quiz-timer-bar" style="width: 100%; height: 100%; background: var(--secondary); transition: width 1s linear;"></div>
        </div>
        <h3 style="font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--dark);">${question.question}</h3>
        <div class="quiz-options-container">
            ${question.options.map((opt, i) => `
                <button class="quiz-option" data-index="${i}">${opt}</button>
            `).join('')}
        </div>
        <div id="quiz-feedback" class="quiz-feedback" style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius-md); display: none;"></div>
        <button id="next-question-btn" class="btn btn-primary btn-block" style="margin-top: 1.5rem; display: none;">Next Question <i class="fa-solid fa-arrow-right"></i></button>
    `;
    
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', handleAnswer);
    });
    
    document.getElementById('next-question-btn').addEventListener('click', () => {
        currentQuestionIndex++;
        renderQuestion();
    });
    
    startTimeLimit();
}

function startTimeLimit() {
    timeRemaining = 30;
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('quiz-timer');
    const timerBar = document.getElementById('quiz-timer-bar');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerDisplay) timerDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeRemaining}s`;
        if (timerBar) {
            timerBar.style.width = `${(timeRemaining / 30) * 100}%`;
            if (timeRemaining < 10) {
                timerBar.style.backgroundColor = '#EF4444';
                timerDisplay.style.color = '#EF4444';
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            revealAnswer(-1); // -1 means timeout
        }
    }, 1000);
}

function handleAnswer(e) {
    clearInterval(timerInterval);
    const selectedIndex = parseInt(e.target.dataset.index);
    revealAnswer(selectedIndex);
}

function revealAnswer(selectedIndex) {
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-question-btn');
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach((btn, i) => {
        btn.disabled = true;
        if (i === question.correct) {
            btn.classList.add('correct');
        } else if (i === selectedIndex) {
            btn.classList.add('incorrect');
        }
    });
    
    feedback.style.display = 'block';
    if (selectedIndex === question.correct) {
        score++;
        feedback.style.background = 'rgba(34, 197, 94, 0.1)';
        feedback.style.color = 'var(--secondary)';
        feedback.innerHTML = `<strong>Correct! ✅</strong><br><small>${question.explanation}</small>`;
    } else {
        feedback.style.background = 'rgba(239, 68, 68, 0.1)';
        feedback.style.color = '#EF4444';
        feedback.innerHTML = `<strong>${selectedIndex === -1 ? "Time's Up! ⏰" : "Incorrect ❌"}</strong><br><small>${question.explanation}</small>`;
    }
    
    nextBtn.style.display = 'block';
}

function showResults() {
    const content = document.getElementById('quiz-content');
    let badge = '';
    let emoji = '';
    
    if (score >= 9) {
        badge = "🥇 Election Expert";
        emoji = "🥇";
    } else if (score >= 6) {
        badge = "🥈 Civic Scholar";
        emoji = "🥈";
    } else {
        badge = "🥉 Keep Learning";
        emoji = "🥉";
    }
    
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
            <h3 style="font-size: 1.5rem; color: var(--primary-dark); margin-bottom: 0.5rem;">${badge}</h3>
            <div style="font-size: 3rem; font-weight: bold; color: var(--secondary); margin-bottom: 1rem;">${score} / 10</div>
            <p style="color: var(--gray); margin-bottom: 2rem;">You've completed the Master Election Quiz!</p>
            <button id="retry-quiz-btn" class="btn btn-outline btn-block"><i class="fa-solid fa-rotate-right"></i> Retry Quiz</button>
        </div>
    `;
    
    document.getElementById('retry-quiz-btn').addEventListener('click', startQuiz);
}
