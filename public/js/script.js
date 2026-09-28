// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '🔔'}</span>
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toastContainer';
  div.className = 'toast-container';
  document.body.appendChild(div);
  return div;
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
let pendingDeleteId = null;

function confirmDelete(studentId, studentName) {
  pendingDeleteId = studentId;
  const nameEl = document.getElementById('deleteStudentName');
  if (nameEl) nameEl.textContent = studentName || 'this student';
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('active');
}

async function executeDelete() {
  if (!pendingDeleteId) return;

  const btn = document.getElementById('confirmDeleteBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Deleting...';
  }

  try {
    const response = await fetch(`/api/students/${pendingDeleteId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.success) {
      closeDeleteModal();
      showToast(data.message || 'Student deleted successfully', 'success');
      // Remove row from table
      const row = document.querySelector(`tr[data-student-id="${pendingDeleteId}"]`);
      if (row) {
        row.style.transition = 'opacity 0.3s ease';
        row.style.opacity = '0';
        setTimeout(() => {
          row.remove();
          checkEmptyTable();
        }, 300);
      } else {
        setTimeout(() => location.reload(), 800);
      }
    } else {
      closeDeleteModal();
      showToast(data.message || 'Failed to delete student', 'error');
    }
  } catch (error) {
    closeDeleteModal();
    showToast('Network error. Please try again.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    }
  }
}

function checkEmptyTable() {
  const tbody = document.querySelector('tbody');
  if (tbody && tbody.querySelectorAll('tr').length === 0) {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (tableWrapper) {
      tableWrapper.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <h3>No students found</h3>
          <p>No students match your search criteria.</p>
          <a href="/students" class="btn btn-primary btn-sm"><i class="fas fa-times"></i> Clear Search</a>
        </div>`;
    }
  }
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

// ─── Form Submit Loading State ────────────────────────────────────────────────
function setFormLoading(formId, loading) {
  const form = document.getElementById(formId);
  if (!form) return;
  const btn = form.querySelector('[type="submit"]');
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Saving...';
  } else {
    btn.innerHTML = btn.dataset.originalText || 'Submit';
  }
}

// ─── Search Debounce ──────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ─── Auto-dismiss alerts ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Auto-dismiss alerts after 5 seconds
  document.querySelectorAll('.alert').forEach((alert) => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // Close modal on overlay click
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }

  // Sidebar overlay click
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Search form auto-submit on course filter change
  const courseFilter = document.getElementById('courseFilter');
  if (courseFilter) {
    courseFilter.addEventListener('change', () => {
      courseFilter.closest('form').submit();
    });
  }

  // Student ID auto-uppercase
  const studentIdInput = document.getElementById('studentId');
  if (studentIdInput) {
    studentIdInput.addEventListener('input', function () {
      const pos = this.selectionStart;
      this.value = this.value.toUpperCase();
      this.setSelectionRange(pos, pos);
    });
  }
});
