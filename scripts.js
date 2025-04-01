// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_WEB_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:YOUR_SENDER_ID:web:YOUR_APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebase UI config
const uiConfig = {
  signInSuccessUrl: '/dashboard.html',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy'
};

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Auth Functions
async function handleLogin() {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(
      emailInput.value,
      passwordInput.value
    );
    console.log('User logged in:', userCredential.user);
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message);
  }
}

// Event Listeners
loginBtn.addEventListener('click', handleLogin);

// Initialize Firebase UI
const ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);

// API Interaction Functions
async function analyzeAnswer(question, answer) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await firebase.auth().currentUser.getIdToken()}`
    },
    body: JSON.stringify({ question, answer })
  });
  return await response.json();
}

async function getStudyPlan() {
  const response = await fetch('/api/study-plan', {
    headers: {
      'Authorization': `Bearer ${await firebase.auth().currentUser.getIdToken()}`
    }
  });
  return await response.json();
}