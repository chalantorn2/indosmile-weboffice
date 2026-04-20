// =============================================
// Messages Management (Admin Panel)
// =============================================

let messagesCurrentPage = 1;
const messagesPerPage = 20;

/**
 * Load messages list
 */
async function loadMessages() {
  const container = document.getElementById('messagesTable');
  container.innerHTML = '<p class="loading">Loading messages...</p>';

  const statusFilter = document.getElementById('messageStatusFilter')?.value || '';
  const search = document.getElementById('searchMessages')?.value || '';

  let url = `${API_BASE}/contact.php?page=${messagesCurrentPage}&limit=${messagesPerPage}`;
  if (statusFilter) url += `&status=${statusFilter}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const response = await fetch(url, { credentials: 'include' });
    const result = await response.json();

    if (!result.success) throw new Error(result.message);

    const messages = result.data.items || [];
    const pagination = result.data.pagination || {};

    if (messages.length === 0) {
      container.innerHTML = '<p class="empty-state">No messages found.</p>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th style="width:36px"></th>
            <th>From</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Status</th>
            <th style="width:120px">Actions</th>
          </tr>
        </thead>
        <tbody>`;

    messages.forEach(msg => {
      const isUnread = msg.status === 'unread';
      const date = new Date(msg.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const time = new Date(msg.created_at).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit'
      });
      const statusBadge = getMessageStatusBadge(msg.status);
      const rowClass = isUnread ? 'font-semibold bg-navy/[0.02]' : '';
      const truncatedMsg = msg.message.length > 60 ? msg.message.substring(0, 60) + '...' : msg.message;

      html += `
        <tr class="${rowClass}" style="cursor:pointer" onclick="viewMessage(${msg.id})">
          <td style="text-align:center">
            ${isUnread ? '<span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>' : ''}
          </td>
          <td>
            <div style="line-height:1.3">
              <div class="${isUnread ? 'text-navy' : 'text-gray-700'}">${escapeHtml(msg.name)}</div>
              <div class="text-xs text-gray-400">${escapeHtml(msg.email)}</div>
            </div>
          </td>
          <td>
            <div style="line-height:1.3">
              <div class="${isUnread ? 'text-navy' : 'text-gray-700'}">${escapeHtml(msg.subject)}</div>
              <div class="text-xs text-gray-400">${escapeHtml(truncatedMsg)}</div>
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-600">${date}</div>
            <div class="text-xs text-gray-400">${time}</div>
          </td>
          <td>${statusBadge}</td>
          <td onclick="event.stopPropagation()">
            <div class="flex items-center gap-1">
              <button onclick="viewMessage(${msg.id})" class="btn-icon" title="View">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              ${msg.status !== 'archived' ?
                `<button onclick="updateMessageStatus(${msg.id}, 'archived')" class="btn-icon" title="Archive">
                  <i data-lucide="archive" class="w-4 h-4"></i>
                </button>` : ''}
              <button onclick="deleteMessage(${msg.id})" class="btn-icon btn-danger" title="Delete">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>`;
    });

    html += '</tbody></table>';

    // Pagination
    if (pagination.total_pages > 1) {
      html += `<div class="pagination">
        <button onclick="messagesGoToPage(${pagination.current_page - 1})" ${!pagination.has_prev ? 'disabled' : ''}>← Prev</button>
        <span>Page ${pagination.current_page} of ${pagination.total_pages} (${pagination.total_items} messages)</span>
        <button onclick="messagesGoToPage(${pagination.current_page + 1})" ${!pagination.has_next ? 'disabled' : ''}>Next →</button>
      </div>`;
    }

    container.innerHTML = html;

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (error) {
    container.innerHTML = `<p class="error-state">Error loading messages: ${error.message}</p>`;
  }

  // Also load unread count for badge
  loadUnreadCount();
}

/**
 * Load unread message count for sidebar badge
 */
async function loadUnreadCount() {
  try {
    const response = await fetch(`${API_BASE}/contact.php?stats=1`, { credentials: 'include' });
    const result = await response.json();
    if (result.success && result.data) {
      const badge = document.getElementById('messagesUnreadBadge');
      const count = parseInt(result.data.unread_count) || 0;
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    }
  } catch (e) {
    // Silently fail
  }
}

/**
 * View a single message in a modal
 */
async function viewMessage(id) {
  try {
    const response = await fetch(`${API_BASE}/contact.php?id=${id}`, { credentials: 'include' });
    const result = await response.json();

    if (!result.success) throw new Error(result.message);

    const msg = result.data;
    const date = new Date(msg.created_at).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const modal = document.getElementById('messageViewModal');
    document.getElementById('msgViewName').textContent = msg.name;
    document.getElementById('msgViewEmail').textContent = msg.email;
    document.getElementById('msgViewEmail').href = `mailto:${msg.email}`;
    document.getElementById('msgViewSubject').textContent = msg.subject;
    document.getElementById('msgViewDate').textContent = date;
    document.getElementById('msgViewStatus').innerHTML = getMessageStatusBadge(msg.status);
    document.getElementById('msgViewBody').textContent = msg.message;
    document.getElementById('msgViewNotes').value = msg.admin_notes || '';

    // Store current message ID
    modal.dataset.messageId = id;

    // Show status action buttons
    const actionsContainer = document.getElementById('msgViewActions');
    let actionsHtml = '';
    if (msg.status !== 'replied') {
      actionsHtml += `<button onclick="updateMessageStatus(${id}, 'replied')" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
        <i data-lucide="check-circle" class="w-4 h-4"></i> Mark as Replied
      </button>`;
    }
    if (msg.status !== 'archived') {
      actionsHtml += `<button onclick="updateMessageStatus(${id}, 'archived')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
        <i data-lucide="archive" class="w-4 h-4"></i> Archive
      </button>`;
    }
    actionsHtml += `<a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}" class="px-4 py-2 text-sm font-medium text-navy bg-gold/20 rounded-lg hover:bg-gold/40 transition-all flex items-center gap-2">
      <i data-lucide="reply" class="w-4 h-4"></i> Reply via Email
    </a>`;
    actionsContainer.innerHTML = actionsHtml;

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Refresh list to update read status
    loadMessages();

  } catch (error) {
    showToast('Error loading message: ' + error.message, 'error');
  }
}

/**
 * Save admin notes for message
 */
async function saveMessageNotes() {
  const modal = document.getElementById('messageViewModal');
  const id = modal.dataset.messageId;
  const notes = document.getElementById('msgViewNotes').value;

  try {
    const response = await fetch(`${API_BASE}/contact.php?id=${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes })
    });
    const result = await response.json();

    if (result.success) {
      showToast('Notes saved', 'success');
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    showToast('Error saving notes: ' + error.message, 'error');
  }
}

/**
 * Update message status
 */
async function updateMessageStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE}/contact.php?id=${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const result = await response.json();

    if (result.success) {
      showToast(`Message marked as ${status}`, 'success');
      closeModal('messageViewModal');
      loadMessages();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    showToast('Error updating status: ' + error.message, 'error');
  }
}

/**
 * Delete a message
 */
async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) return;

  try {
    const response = await fetch(`${API_BASE}/contact.php?id=${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const result = await response.json();

    if (result.success) {
      showToast('Message deleted', 'success');
      closeModal('messageViewModal');
      loadMessages();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    showToast('Error deleting message: ' + error.message, 'error');
  }
}

/**
 * Get status badge HTML
 */
function getMessageStatusBadge(status) {
  const badges = {
    unread: '<span class="status-badge status-pending" style="background:#dbeafe;color:#1d4ed8">● Unread</span>',
    read: '<span class="status-badge" style="background:#f3f4f6;color:#6b7280">Read</span>',
    replied: '<span class="status-badge status-success" style="background:#dcfce7;color:#16a34a">✓ Replied</span>',
    archived: '<span class="status-badge" style="background:#f5f5f4;color:#a8a29e">Archived</span>'
  };
  return badges[status] || status;
}

/**
 * Pagination helper
 */
function messagesGoToPage(page) {
  if (page < 1) return;
  messagesCurrentPage = page;
  loadMessages();
}

// Make functions globally accessible
window.viewMessage = viewMessage;
window.deleteMessage = deleteMessage;
window.updateMessageStatus = updateMessageStatus;
window.saveMessageNotes = saveMessageNotes;
window.messagesGoToPage = messagesGoToPage;
