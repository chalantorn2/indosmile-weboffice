// =====================
// User Management
// =====================
let users = [];

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users.php`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            users = data.data || [];
            displayUsers(users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTable').innerHTML = '<p class="loading">Error loading users</p>';
    }
}

function displayUsers(usersList) {
    const container = document.getElementById('usersTable');

    if (!usersList || usersList.length === 0) {
        container.innerHTML = '<p class="loading">No users found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${usersList.map(user => `
                    <tr>
                        <td>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div class="user-avatar">${getUserInitials(user.full_name || user.username)}</div>
                                <span>${escapeHtml(user.full_name || '-')}</span>
                            </div>
                        </td>
                        <td><code style="background:#f0f0f5;padding:2px 8px;border-radius:4px;font-size:13px;">${escapeHtml(user.username)}</code></td>
                        <td>${escapeHtml(user.email)}</td>
                        <td><span class="badge badge-role-${user.role}">${user.role}</span></td>
                        <td><span class="badge badge-${user.status === 'active' ? 'confirmed' : 'cancelled'}">${user.status}</span></td>
                        <td>${user.last_login ? formatDate(user.last_login) : '<span style="color:#999">Never</span>'}</td>
                        <td>
                            <div class="actions-cell">
                                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                                ${user.id != currentUser.admin_id ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}, '${escapeHtml(user.username)}')">Delete</button>` : `<span class="badge badge-info" style="font-size:11px;">You</span>`}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getUserInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function openUserModal(user = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    form.reset();
    document.getElementById('userId').value = '';

    if (user) {
        // Edit mode
        document.getElementById('userModalTitle').textContent = 'Edit User';
        document.getElementById('userModalSubtitle').textContent = 'Update user account details';
        document.getElementById('userId').value = user.id;
        document.getElementById('userFullName').value = user.full_name || '';
        document.getElementById('userUsername').value = user.username || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userRole').value = user.role || 'editor';
        document.getElementById('userStatus').value = user.status || 'active';
        document.getElementById('userPassword').value = '';
        document.getElementById('userPasswordRequired').style.display = 'none';
        document.getElementById('userPasswordHint').style.display = '';
        document.getElementById('userPassword').removeAttribute('required');
    } else {
        // Create mode
        document.getElementById('userModalTitle').textContent = 'Add New User';
        document.getElementById('userModalSubtitle').textContent = 'Create a new admin account';
        document.getElementById('userPasswordRequired').style.display = '';
        document.getElementById('userPasswordHint').style.display = 'none';
        document.getElementById('userPassword').setAttribute('required', 'required');
    }

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE}/users.php/${id}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            openUserModal(data.data);
        } else {
            showToast('Failed to load user', 'error');
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showToast('Error loading user', 'error');
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;

    const payload = {
        username: document.getElementById('userUsername').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        full_name: document.getElementById('userFullName').value.trim(),
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };

    const password = document.getElementById('userPassword').value;
    if (password) {
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'warning');
            return;
        }
        payload.password = password;
    } else if (!isEdit) {
        showToast('Password is required for new users', 'warning');
        return;
    }

    // Validate required fields
    if (!payload.username || !payload.email || !payload.full_name) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const url = isEdit ? `${API_BASE}/users.php/${userId}` : `${API_BASE}/users.php`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message || (isEdit ? 'User updated' : 'User created'), 'success');
            closeModal('userModal');
            loadUsers();
        } else {
            showToast(data.message || 'Failed to save user', 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('Error saving user. Please try again.', 'error');
    }
}

async function deleteUser(id, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users.php/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'User deleted', 'success');
            loadUsers();
        } else {
            showToast(data.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user', 'error');
    }
}
