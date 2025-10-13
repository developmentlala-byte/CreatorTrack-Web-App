// Auth utilities: login, register, logout, route protection, and navbar rendering.
// Firebase v9 modular SDK imported from CDN inside this module.

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { showToast } from './utils.js';

// Ensure persistence is set (also done in firebase-config but exposed here too)
export function initAuthPersistence() {
  setPersistence(auth, browserLocalPersistence);
}

// Register new user and create Firestore profile doc
export async function registerWithEmailPassword({ email, password, displayName, role, specialization }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const userDoc = {
    uid,
    email,
    displayName,
    role: role === 'admin' ? 'admin' : 'user',
    specialization: specialization || '',
    createdAt: Date.now()
  };
  await setDoc(doc(db, 'users', uid), userDoc);
  return userDoc;
}

// Login and return profile with role, creating a default profile if missing
export async function loginWithEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    // Create a minimal profile with default role=user
    const userDoc = { uid, email: cred.user.email, displayName: '', role: 'user', createdAt: Date.now(), specialization: '' };
    await setDoc(userRef, userDoc);
    return userDoc;
  }
  return snap.data();
}

// Logout
export async function logout() {
  await signOut(auth);
  window.location.href = 'index.html';
}

// Protect page: ensure authenticated; optionally ensure admin
export async function protectPage(requiredRole) {
  // Wait for auth state
  const user = await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
  if (!user) {
    window.location.href = 'index.html';
    throw new Error('Not authenticated');
  }
  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const userDoc = userSnap.data();
  if (requiredRole === 'admin' && userDoc.role !== 'admin') {
    showToast('Admin access required', 'warning');
    window.location.href = 'dashboard-user.html';
    throw new Error('Admin required');
  }
  return { user, userDoc };
}

// Render navbar with role-based links and dark mode toggle
export function renderNavbar(userDoc) {
  const root = document.getElementById('navbar-root');
  if (!root) return;
  const isAdmin = userDoc.role === 'admin';
  root.innerHTML = `
    <nav class="navbar navbar-dark navbar-expand-lg">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">CreatorTrack</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample" aria-controls="navbarsExample" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarsExample">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${isAdmin ? `<li class="nav-item"><a class="nav-link" href="dashboard-admin.html">Dashboard</a></li>` : `<li class="nav-item"><a class="nav-link" href="dashboard-user.html">Dashboard</a></li>`}
            <li class="nav-item"><a class="nav-link" href="tasks.html">Tasks</a></li>
            ${isAdmin ? `<li class="nav-item"><a class="nav-link" href="users.html">Users</a></li>` : ''}
          </ul>
          <div class="d-flex align-items-center gap-2">
            <div class="dropdown">
              <button class="btn btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">${userDoc.displayName || userDoc.email}</button>
              <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                <li><button class="dropdown-item" id="logoutBtn">Logout</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;
  // Bind logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  // Force dark theme
  localStorage.setItem('theme', 'dark');
  document.body.classList.add('dark-theme');

  // Ensure global footer exists
  if (!document.querySelector('.app-footer')) {
    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.innerHTML = '&copy; LangitLangit.id';
    document.body.appendChild(footer);
  }
}