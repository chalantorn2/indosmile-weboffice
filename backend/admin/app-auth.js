// =====================
// Authentication
// =====================
async function checkSession() {
    try {
        const response = await fetch(`${API_BASE}/auth.php/check`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.data && data.data.authenticated) {
            currentUser = data.data;
            showDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Session check error:', error);
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth.php/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.data.user;
            showDashboard();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.classList.add('active');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.add('active');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/auth.php/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        currentUser = null;
        showLogin();
    } catch (error) {
        console.error('Logout error:', error);
    }
}
