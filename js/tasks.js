// Tasks page logic: list with filters/search, table/card view; shared helpers for task mutations

import { db } from './firebase-config.js';
import { showToast } from './utils.js';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

export function initTasksPage(userDoc) {
  const tbody = document.querySelector('#tasksTable tbody');
  const cardsView = document.getElementById('cardsView');
  const tableView = document.getElementById('tableView');

  // View toggle
  document.getElementById('toggleTable').addEventListener('click', () => {
    tableView.classList.remove('d-none');
    cardsView.classList.add('d-none');
  });
  document.getElementById('toggleCards').addEventListener('click', () => {
    tableView.classList.add('d-none');
    cardsView.classList.remove('d-none');
  });

  // Read filters from query for convenience
  const url = new URL(window.location.href);
  const assignedQuery = url.searchParams.get('assigned') || '';
  if (assignedQuery) document.getElementById('filterAssigned').value = assignedQuery;

  const tasksCol = collection(db, 'tasks');
  // Real-time snapshot of tasks
  onSnapshot(query(tasksCol, orderBy('updatedAt', 'desc')), (qs) => {
    const rows = [];
    qs.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    applyFiltersAndRender(rows);
  });

  // Bind filters
  ['filterStatus','filterPriority','filterPlatform','filterAssigned','filterFrom','filterTo','search','sortBy']
    .forEach(id => document.getElementById(id).addEventListener('input', () => applyFiltersAndRender(lastRows)));

  // Keep last rows for filtering
  let lastRows = [];
  function applyFiltersAndRender(rows) {
    lastRows = rows;
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const platform = document.getElementById('filterPlatform').value;
    const assigned = document.getElementById('filterAssigned').value.trim().toLowerCase();
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const search = document.getElementById('search').value.trim().toLowerCase();
    const sortBy = document.getElementById('sortBy').value;

    let filtered = rows.filter((t) => {
      if (status && t.status !== status) return false;
      if (priority && t.priority !== priority) return false;
      if (platform && t.platform !== platform) return false;
      if (assigned && (t.assignedToName || '').toLowerCase().indexOf(assigned) === -1) return false;
      if (from && (!t.deadline || new Date(t.deadline) < new Date(from))) return false;
      if (to && (!t.deadline || new Date(t.deadline) > new Date(to))) return false;
      if (search && !(`${t.title} ${t.description}`.toLowerCase().includes(search))) return false;
      return true;
    });

    // Sorting
    filtered.sort((a,b) => {
      switch (sortBy) {
        case 'createdAt_desc': return (b.createdAt||0) - (a.createdAt||0);
        case 'deadline_asc': return (a.deadline||0) - (b.deadline||0);
        case 'deadline_desc': return (b.deadline||0) - (a.deadline||0);
        case 'priority_desc': return priorityRank(b.priority) - priorityRank(a.priority);
        default: return 0;
      }
    });

    // Render table
    tbody.innerHTML = '';
    filtered.forEach(t => tbody.appendChild(renderTaskRow(t, userDoc)));
    // Render cards
    cardsView.innerHTML = '';
    filtered.forEach(t => cardsView.appendChild(renderTaskCard(t, userDoc)));
  }
}

function priorityRank(p) {
  return { low: 1, medium: 2, high: 3, urgent: 4 }[p] || 0;
}

function renderTaskRow(t, userDoc) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><a class="link-light" href="task-detail.html?id=${t.id}">${t.title}</a></td>
    <td>${t.platform}</td>
    <td>${t.contentType}</td>
    <td><span class="badge bg-info">${t.status}</span></td>
    <td><span class="badge bg-warning">${t.priority}</span></td>
    <td>${t.assignedToName || '-'}</td>
    <td>${t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
    <td>
      <div class="btn-group btn-group-sm">
        <a class="btn btn-outline-light" href="task-detail.html?id=${t.id}">Open</a>
        ${userDoc.role === 'admin' ? `<button class="btn btn-outline-danger delBtn" data-id="${t.id}"><i class="bi bi-trash"></i></button>` : ''}
      </div>
    </td>
  `;
  if (userDoc.role === 'admin') {
    tr.querySelector('.delBtn').addEventListener('click', async () => {
      if (!confirm('Delete this task?')) return;
      await deleteDoc(doc(db, 'tasks', t.id));
      showToast('Task deleted', 'success');
    });
  }
  return tr;
}

function renderTaskCard(t, userDoc) {
  const col = document.createElement('div');
  col.className = 'col-md-4';
  col.innerHTML = `
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title">${t.title}</h5>
          <span class="badge bg-warning">${t.priority}</span>
        </div>
        <div class="small text-muted mb-2">${t.platform} • ${t.contentType}</div>
        <p>${t.description || ''}</p>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <span class="badge bg-info">${t.status}</span>
        <a class="btn btn-sm btn-outline-light" href="task-detail.html?id=${t.id}">Open</a>
      </div>
    </div>
  `;
  return col;
}