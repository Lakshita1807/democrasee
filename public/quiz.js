/**
 * Quiz Module for DemocraSee
 */

/**
 * Calculates the quiz score
 * @param {Array<number>} userAnswers 
 * @param {Array<number>} correctAnswers 
 * @returns {number}
 */
export function scoreQuiz(userAnswers, correctAnswers) {
  if (!userAnswers || !correctAnswers) return 0;
  let score = 0;
  const len = Math.min(userAnswers.length, correctAnswers.length);
  for (let i = 0; i < len; i++) {
    if (userAnswers[i] === correctAnswers[i]) {
      score++;
    }
  }
  return score;
}

let QUESTIONS = [];
let qIndex = 0, score = 0, timer, timeLeft = 30;

/**
 * Initializes quiz module
 */
export async function initQuiz() {
  const data = await window.getCached('quiz_data', () => 
    fetch('data/quiz.json').then(r => r.json())
  );
  QUESTIONS = data;
  showQuizStart();
}

/**
 * Shows the quiz starting screen
 */
function showQuizStart() {
  const container = document.getElementById('tab-quiz');
  if (!container) return;
  container.innerHTML = `
    <div class="quiz-start">
      <div class="quiz-icon" aria-hidden="true"><i data-lucide="graduation-cap" style="width: 48px; height: 48px;"></i></div>
      <h2>Master Election Quiz</h2>
      <p>Test your knowledge of Indian elections</p>
      <div class="quiz-meta">
        <span><i data-lucide="file-text"></i> ${QUESTIONS.length} Questions</span>
        <span><i data-lucide="clock"></i> 30 sec each</span>
        <span><i data-lucide="award"></i> Win badges</span>
      </div>
      <button class="btn-primary" onclick="startQuiz()">Start Quiz <i data-lucide="arrow-right"></i></button>
    </div>`;
  if (window.lucide) lucide.createIcons();
}

/**
 * Starts the quiz
 */
function startQuiz() {
  qIndex = 0; score = 0;
  showQuestion();
}

/**
 * Displays current question
 */
function showQuestion() {
  const container = document.getElementById('tab-quiz');
  if (!container) return;
  if (qIndex >= QUESTIONS.length) { showResults(); return; }
  const q = QUESTIONS[qIndex];
  timeLeft = 30;
  container.innerHTML = `
    <div class="quiz-question" aria-live="polite">
      <div class="quiz-progress">Question ${qIndex+1} of ${QUESTIONS.length}</div>
      <div class="quiz-timer-bar"><div id="timer-fill" style="width:100%"></div></div>
      <div id="timer-text"><i data-lucide="clock"></i> ${timeLeft}s</div>
      <h3>${q.question}</h3>
      <div class="quiz-options">
        ${q.options.map((o,i) => 
          `<button class="quiz-opt" onclick="selectAnswer(${i})">${o}</button>`
        ).join('')}
      </div>
    </div>`;
  if (window.lucide) lucide.createIcons();
  startTimer();
}

/**
 * Starts question timer
 */
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    const fill = document.getElementById('timer-fill');
    const text = document.getElementById('timer-text');
    if (fill) fill.style.width = (timeLeft/30*100) + '%';
    if (fill && timeLeft <= 10) fill.style.background = '#EF4444';
    if (text) text.innerHTML = `<i data-lucide="clock"></i> ${timeLeft}s`;
    if (timeLeft <= 0) { clearInterval(timer); selectAnswer(-1); }
  }, 1000);
}

/**
 * Handles answer selection
 * @param {number} chosen - Index of chosen option
 */
function selectAnswer(chosen) {
  clearInterval(timer);
  const q = QUESTIONS[qIndex];
  const correct = chosen === q.correctIndex;
  if (correct) score++;
  else {
    if (window.gtag) {
        gtag('event', 'quiz_miss_question', {
            'question': q.question,
            'selected_index': chosen,
            'correct_index': q.correctIndex
        });
    }
  }
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.style.background = '#22C55E';
    else if (i === chosen) btn.style.background = '#EF4444';
  });
  
  const exp = document.createElement('div');
  exp.className = 'quiz-explanation';
  exp.innerHTML = `<strong>${correct ? '<i data-lucide="check-circle" style="color:#22C55E"></i> Correct!' : '<i data-lucide="x-circle" style="color:#EF4444"></i> Wrong!'}</strong><br>${q.explanation}`;
  document.querySelector('.quiz-options').after(exp);
  
  const next = document.createElement('button');
  next.className = 'btn-primary';
  next.style.marginTop = '20px';
  next.innerHTML = qIndex < QUESTIONS.length - 1 ? 'Next Question <i data-lucide="arrow-right"></i>' : 'See Results <i data-lucide="award"></i>';
  next.onclick = () => { qIndex++; showQuestion(); };
  exp.after(next);
  if (window.lucide) lucide.createIcons();
}

/**
 * Displays final results
 */
function showResults() {
  const container = document.getElementById('tab-quiz');
  if (!container) return;
  const badge = score >= 9 ? '🥇 Election Expert!' :
                score >= 6 ? '🥈 Civic Scholar!' : '🥉 Keep Learning!';
  
  const best = parseInt(localStorage.getItem('quizBestScore') || '0');
  if (score > best) {
    localStorage.setItem('quizBestScore', score);
    if (window.updateDashboard) window.updateDashboard();
  }

  container.innerHTML = `
    <div class="quiz-results" aria-live="assertive">
      <div class="quiz-icon" aria-hidden="true"><i data-lucide="award" style="width: 48px; height: 48px;"></i></div>
      <div class="result-badge" style="font-weight:700; color:var(--primary); margin-bottom:10px;">${badge}</div>
      <h2>You scored ${score}/${QUESTIONS.length}</h2>
      <p style="margin: 10px 0 24px;">${score >= 9 ? 'Outstanding! You know Indian elections inside out!' :
          score >= 6 ? 'Great job! You have solid election knowledge!' :
          'Good effort! Keep exploring DemocraSee to learn more!'}</p>
      <div class="result-actions" style="display:flex; gap:12px; justify-content:center;">
        <button class="btn-primary" onclick="startQuiz()">Retry Quiz <i data-lucide="refresh-cw"></i></button>
        <button class="btn-secondary" onclick="shareScore(${score})">Share Score <i data-lucide="share-2"></i></button>
      </div>
    </div>`;
  if (window.lucide) lucide.createIcons();
}

/**
 * Copies score to clipboard
 * @param {number} s - Score
 */
function shareScore(s) {
  const text = `I scored ${s}/${QUESTIONS.length} on the DemocraSee Election Quiz! 🗳️ Test your knowledge here!`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Score copied to clipboard! Share it anywhere 🎉');
  });
}

// Global exposure
window.scoreQuiz = scoreQuiz;
window.initQuiz = initQuiz;
window.startQuiz = startQuiz;
window.showQuestion = showQuestion;
window.selectAnswer = selectAnswer;
window.showResults = showResults;
window.shareScore = shareScore;
