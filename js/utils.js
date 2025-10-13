// Utility helpers: toasts, spinners, formatting, tags, classes, search/filtering

// Show a Bootstrap toast message
export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center';
  toastEl.role = 'alert';
  toastEl.ariaLive = 'assertive';
  toastEl.ariaAtomic = 'true';
  toastEl.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${type.toUpperCase()}</strong>
      <small>now</small>
      <button type="button" class="btn-close btn-close-white ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toastContainer';
  div.className = 'toast-container position-fixed top-0 end-0 p-3';
  document.body.appendChild(div);
  return div;
}

// Theme toggle setup for standalone button (index/register pages)
export function setupThemeToggle(btn) {
  applyStoredTheme();
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = localStorage.getItem('theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.body.classList.toggle('dark-theme', next === 'dark');
  });
}

export function applyStoredTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('dark-theme', theme === 'dark');
}

// Date formatter
export function formatDate(ts) {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString();
}

// Parse comma-separated tags
export function parseTags(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Badge classes
export function statusBadgeClass(s) {
  switch (s) {
    case 'todo': return 'bg-secondary';
    case 'in-progress': return 'bg-info';
    case 'review': return 'bg-warning';
    case 'completed': return 'bg-success';
    case 'cancelled': return 'bg-danger';
    default: return 'bg-light text-dark';
  }
}
export function priorityBadgeClass(p) {
  switch (p) {
    case 'low': return 'bg-secondary';
    case 'medium': return 'bg-info';
    case 'high': return 'bg-warning';
    case 'urgent': return 'bg-danger';
    default: return 'bg-light text-dark';
  }
}

// Permission helpers
export function isAdmin(userDoc) { return userDoc?.role === 'admin'; }
export function canEditTask(task, userDoc, user) {
  return isAdmin(userDoc) || task.createdBy === user.uid;
}