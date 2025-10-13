// Firebase initialization using v9 modular SDK imported from CDN
// This file centralizes Firebase imports and exports app, auth, and db for reuse.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Use EXACT config provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyA3OpHq7ykHEnoUth1Pho9fSPf2rHobjKg",
  authDomain: "creatortrack-f9dc4.firebaseapp.com",
  projectId: "creatortrack-f9dc4",
  storageBucket: "creatortrack-f9dc4.firebasestorage.app",
  messagingSenderId: "77152132821",
  appId: "1:77152132821:web:ed48c96f660bf5e41889b4",
  measurementId: "G-7MP0PLTD29"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);
// Initialize Auth with local persistence (keeps user logged in)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
// Initialize Firestore
export const db = getFirestore(app);