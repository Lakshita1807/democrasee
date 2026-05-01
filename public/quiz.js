const QUESTIONS = [
  { q:"What does ECI stand for?",
    opts:["Electoral Council of India","Election Commission of India","Electoral Committee of India","Election Council of India"],
    ans:1, exp:"ECI is established under Article 324 of the Constitution to conduct free and fair elections." },
  { q:"Minimum age to vote in India?",
    opts:["16 years","21 years","18 years","25 years"],
    ans:2, exp:"Lowered from 21 to 18 by the 61st Constitutional Amendment Act, 1988." },
  { q:"What does NOTA stand for?",
    opts:["No Other Than Abstain","Not One Total Answer","None Of The Above","No Other Trusted Alternative"],
    ans:2, exp:"NOTA introduced by Supreme Court order in 2013 to allow voters to reject all candidates." },
  { q:"Which Article establishes the Election Commission?",
    opts:["Article 280","Article 315","Article 324","Article 356"],
    ans:2, exp:"Article 324 gives ECI superintendence over all elections to Parliament and State Legislatures." },
  { q:"What does VVPAT stand for?",
    opts:["Voter Verified Paper Audit Trail","Verified Voter Paper and Tally","Vote Verification Printing Audit Tool","Verified Voting Paper Audit Technology"],
    ans:0, exp:"VVPAT shows a paper slip of your vote for 7 seconds to verify your EVM choice." },
  { q:"Seats needed for Lok Sabha majority?",
    opts:["243","252","261","272"],
    ans:3, exp:"Simple majority = 272 seats (more than half of 543 elected seats)." },
  { q:"How many Lok Sabha constituencies in India?",
    opts:["428","543","552","600"],
    ans:1, exp:"There are 543 elected Lok Sabha constituencies across all states and UTs." },
  { q:"When does Model Code of Conduct begin?",
    opts:["30 days before polling","When nominations open","When ECI announces schedule","On polling day"],
    ans:2, exp:"MCC kicks in immediately when ECI announces the election schedule." },
  { q:"Security deposit for general Lok Sabha candidate?",
    opts:["₹10,000","₹25,000","₹50,000","₹1,00,000"],
    ans:1, exp:"₹25,000 for general, ₹12,500 for SC/ST. Forfeited if votes below 1/6th of total." },
  { q:"Where is India's indelible election ink made?",
    opts:["Bengaluru Chemicals Ltd","Government Mysore Paints & Varnish Ltd","Mumbai Ink Corporation","Delhi State Industries"],
    ans:1, exp:"Exclusively manufactured at Government Mysore Paints & Varnish Ltd in Karnataka." }
];

let qIndex = 0, score = 0, timer, timeLeft = 30;

function initQuiz() {
  showQuizStart();
}

function showQuizStart() {
  document.getElementById('tab-quiz').innerHTML = `
    <div class="quiz-start">
      <div class="quiz-icon">🎓</div>
      <h2>Master Election Quiz</h2>
      <p>Test your knowledge of Indian elections</p>
      <div class="quiz-meta">
        <span>📝 10 Questions</span>
        <span>⏱️ 30 sec each</span>
        <span>🏆 Win badges</span>
      </div>
      <button class="btn-primary" onclick="startQuiz()">Start Quiz →</button>
    </div>`;
}

function startQuiz() {
  qIndex = 0; score = 0;
  showQuestion();
}

function showQuestion() {
  if (qIndex >= QUESTIONS.length) { showResults(); return; }
  const q = QUESTIONS[qIndex];
  timeLeft = 30;
  document.getElementById('tab-quiz').innerHTML = `
    <div class="quiz-question">
      <div class="quiz-progress">Question ${qIndex+1} of ${QUESTIONS.length}</div>
      <div class="quiz-timer-bar"><div id="timer-fill" style="width:100%"></div></div>
      <div id="timer-text">⏱️ ${timeLeft}s</div>
      <h3>${q.q}</h3>
      <div class="quiz-options">
        ${q.opts.map((o,i) => 
          `<button class="quiz-opt" onclick="selectAnswer(${i})">${o}</button>`
        ).join('')}
      </div>
    </div>`;
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    const fill = document.getElementById('timer-fill');
    const text = document.getElementById('timer-text');
    if (fill) fill.style.width = (timeLeft/30*100) + '%';
    if (fill && timeLeft <= 10) fill.style.background = '#EF4444';
    if (text) text.textContent = '⏱️ ' + timeLeft + 's';
    if (timeLeft <= 0) { clearInterval(timer); selectAnswer(-1); }
  }, 1000);
}

function selectAnswer(chosen) {
  clearInterval(timer);
  const q = QUESTIONS[qIndex];
  const correct = chosen === q.ans;
  if (correct) score++;
  
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) btn.style.background = '#22C55E';
    else if (i === chosen) btn.style.background = '#EF4444';
  });
  
  const exp = document.createElement('div');
  exp.className = 'quiz-explanation';
  exp.innerHTML = `<strong>${correct ? '✅ Correct!' : '❌ Wrong!'}</strong><br>${q.exp}`;
  document.querySelector('.quiz-options').after(exp);
  
  const next = document.createElement('button');
  next.className = 'btn-primary';
  next.style.marginTop = '20px';
  next.textContent = qIndex < 9 ? 'Next Question →' : 'See Results 🏆';
  next.onclick = () => { qIndex++; showQuestion(); };
  exp.after(next);
}

function showResults() {
  const badge = score >= 9 ? '🥇 Election Expert!' :
                score >= 6 ? '🥈 Civic Scholar!' : '🥉 Keep Learning!';
  
  // Save Best Score
  const best = parseInt(localStorage.getItem('quizBestScore') || '0');
  if (score > best) {
    localStorage.setItem('quizBestScore', score);
    if (window.updateDashboard) window.updateDashboard();
  }

  document.getElementById('tab-quiz').innerHTML = `
    <div class="quiz-results">
      <div class="quiz-icon">🏆</div>
      <div class="result-badge" style="font-weight:700; color:var(--primary); margin-bottom:10px;">${badge}</div>
      <h2>You scored ${score}/10</h2>
      <p style="margin: 10px 0 24px;">${score >= 9 ? 'Outstanding! You know Indian elections inside out!' :
          score >= 6 ? 'Great job! You have solid election knowledge!' :
          'Good effort! Keep exploring DemocraSee to learn more!'}</p>
      <div class="result-actions" style="display:flex; gap:12px; justify-content:center;">
        <button class="btn-primary" onclick="startQuiz()">Retry Quiz 🔄</button>
        <button class="btn-secondary" onclick="shareScore(${score})">Share Score 📤</button>
      </div>
    </div>`;
}

function shareScore(s) {
  const text = `I scored ${s}/10 on the DemocraSee Election Quiz! 🗳️ Test your knowledge here!`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Score copied to clipboard! Share it anywhere 🎉');
  });
}
