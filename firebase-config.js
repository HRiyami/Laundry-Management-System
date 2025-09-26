// firebase-config.js
// This file initializes Firebase and exports the Firestore and Functions instances.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js';

// TODO: Replace the following configuration with your Firebase project's details.
// You can find these settings in your Firebase console > Project settings > General.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Optionally set region for functions if different from default
// import { connectFunctionsEmulator } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js';
// connectFunctionsEmulator(functions, 'localhost', 5001);