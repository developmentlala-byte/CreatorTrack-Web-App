// Dashboard logic for admin and user pages: stats and recent lists

import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Admin dashboard: show overall stats, recent tasks, and charts
export function initAdminDashboard() {
  const tasksCol = collection(db, 'tasks');
  const usersCol = collection(db, 'users');
  let allTasks = [];

  // Stats counters
  let counts = { total: 0, pending: 0, completed: 0 };
  onSnapshot(tasksCol, (qs) => {
    counts = { total: qs.size, pending: 0, completed: 0 };
    const byStatus = {};
    const byPlatform = {};
    const byContentFor = {};
    const recent = [];
    allTasks = [];
    qs.forEach((doc) => {
      const t = doc.data();
      allTasks.push({ id: doc.id, ...t });
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPlatform[t.platform] = (byPlatform[t.platform] || 0) + 1;
      const cf = (t.contentFor || 'Unspecified');
      byContentFor[cf] = (byContentFor[cf] || 0) + 1;
      if (t.status === 'todo' || t.status === 'in-progress' || t.status === 'review') counts.pending++;
      if (t.status === 'completed') counts.completed++;
      recent.push({ id: doc.id, ...t });
    });
    // Update stat badges
    document.getElementById('statTotalTasks').textContent = counts.total;
    document.getElementById('statPending').textContent = counts.pending;
    document.getElementById('statCompleted').textContent = counts.completed;
    // Render recent table (sort by updatedAt desc)
    recent.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
    renderRecentTasks(recent.slice(0, 8));
    // Render charts
    renderCharts(byStatus, byPlatform, byContentFor);
  });

  // Users count
  onSnapshot(usersCol, (qs) => {
    document.getElementById('statUsers').textContent = qs.size;
  });

  // Bind download once; use latest allTasks snapshot when clicked
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn?.addEventListener('click', () => {
    const headers = ['Title','Content For','Platform','Status','Priority','Assigned To','Deadline'];
    const rows = allTasks.map(t => [
      sanitizeCSV(t.title),
      sanitizeCSV(t.contentFor || ''),
      sanitizeCSV(t.platform || ''),
      sanitizeCSV(t.status || ''),
      sanitizeCSV(t.priority || ''),
      sanitizeCSV(t.assignedToName || ''),
      t.deadline ? new Date(t.deadline).toLocaleDateString() : ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function renderRecentTasks(rows) {
  const tbody = document.querySelector('#recentTasksTable tbody');
  tbody.innerHTML = '';
  rows.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="task-detail.html?id=${t.id}" class="link-light">${t.title}</a></td>
      <td><span class="badge bg-secondary">${t.platform}</span></td>
      <td>${t.contentFor || '-'}</td>
      <td><span class="badge bg-info">${t.status}</span></td>
      <td><span class="badge bg-warning">${t.priority}</span></td>
      <td>${t.assignedToName || '-'}</td>
      <td>${t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

let chartStatus, chartPlatform, chartContentFor;
function renderCharts(byStatus, byPlatform, byContentFor) {
  const statusCtx = document.getElementById('chartStatus');
  const platformCtx = document.getElementById('chartPlatform');
  const contentForCtx = document.getElementById('chartContentFor');
  const statusLabels = Object.keys(byStatus);
  const statusData = Object.values(byStatus);
  const platformLabels = Object.keys(byPlatform);
  const platformData = Object.values(byPlatform);
  const contentForLabels = Object.keys(byContentFor || {});
  const contentForData = Object.values(byContentFor || {});
  if (chartStatus) chartStatus.destroy();
  if (chartPlatform) chartPlatform.destroy();
  if (chartContentFor) chartContentFor.destroy();
  chartStatus = new Chart(statusCtx, {
    type: 'doughnut',
    data: { labels: statusLabels, datasets: [{ data: statusData, backgroundColor: ['#6c757d','#0dcaf0','#ffc107','#198754','#dc3545'] }]},
    options: { plugins: { legend: { position: 'bottom' } } }
  });
  chartPlatform = new Chart(platformCtx, {
    type: 'bar',
    data: { labels: platformLabels, datasets: [{ data: platformData, backgroundColor: '#4a9eff' }]},
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
  if (contentForCtx) {
    chartContentFor = new Chart(contentForCtx, {
      type: 'bar',
      data: { labels: contentForLabels, datasets: [{ data: contentForData, backgroundColor: '#20c997' }]},
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}

function sanitizeCSV(val) {
  const s = String(val ?? '').replaceAll('"', '""');
  if (s.includes(',') || s.includes('\n')) return `"${s}"`;
  return s;
}

// User dashboard: show personal stats and lists
export function initUserDashboard(userDoc) {
  const tasksCol = collection(db, 'tasks');
  onSnapshot(tasksCol, (qs) => {
    const assigned = [];
    const created = [];
    let myTotal = 0, myPending = 0, myCompleted = 0, upcoming = 0;
    const now = Date.now();
    qs.forEach((d) => {
      const t = { id: d.id, ...d.data() };
      const isAssigned = t.assignedTo === userDoc.uid;
      const isCreated = t.createdBy === userDoc.uid;
      if (isAssigned) assigned.push(t);
      if (isCreated) created.push(t);
      if (isAssigned || isCreated) {
        myTotal++;
        if (t.status === 'completed') myCompleted++; else if (t.status !== 'cancelled') myPending++;
        if (t.deadline && t.deadline > now) upcoming++;
      }
    });
    document.getElementById('statMyTotal').textContent = myTotal;
    document.getElementById('statMyPending').textContent = myPending;
    document.getElementById('statMyCompleted').textContent = myCompleted;
    document.getElementById('statUpcoming').textContent = upcoming;
    renderTaskList('#assignedTable tbody', assigned);
    renderTaskList('#createdTable tbody', created);
  });
}

function renderTaskList(selector, rows) {
  const tbody = document.querySelector(selector);
  tbody.innerHTML = '';
  rows.sort((a,b) => (a.deadline||0) - (b.deadline||0));
  rows.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="task-detail.html?id=${t.id}" class="link-light">${t.title}</a></td>
      <td><span class="badge bg-info">${t.status}</span></td>
      <td><span class="badge bg-warning">${t.priority}</span></td>
      <td>${t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
      <td><a href="task-detail.html?id=${t.id}" class="btn btn-sm btn-outline-light">Open</a></td>
    `;
    tbody.appendChild(tr);
  });
}