// Firebase configuration placeholders
// REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyBZmvfC3JUSvIqtEH6k5_ixI--lblQWu4A",
  authDomain: "prompt2-494814.firebaseapp.com",
  projectId: "prompt2-494814",
  storageBucket: "prompt2-494814.appspot.com",
  messagingSenderId: "142760811225",
  appId: "1:142760811225:web:democrasee",
  measurementId: "G-DEMOCRASEE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Anonymous Authentication to maintain a stable UID
auth.signInAnonymously().catch((error) => {
  console.error("Firebase Auth Error:", error.code, error.message);
});

async function saveUserProgress(data) {
  const user = auth.currentUser;
  if (user) {
    try {
      await db.collection('users').doc(user.uid).set(data, { merge: true });
      console.log("Progress saved to Firestore");
      
      // GA4 Tracking
      if (window.gtag) {
        gtag('event', 'save_progress', {
          'uid': user.uid,
          'quiz_score': data.quizBestScore || 0,
          'mastered_cards': data.masteredFlashcards?.length || 0
        });
      }
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  }
}

async function loadUserProgress() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
          resolve(doc.data());
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

window.saveUserProgress = saveUserProgress;
window.loadUserProgress = loadUserProgress;
window.db = db;
window.auth = auth;
