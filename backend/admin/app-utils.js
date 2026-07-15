// =====================
// Utility Functions
// =====================
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('th-TH');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =====================
// Toast Notifications
// =====================
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i data-lucide="${icons[type] || icons.info}" class="w-5 h-5"></i></span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons({ nameAttr: 'data-lucide', node: toast });

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// =====================
// Dropzone & Upload
// =====================
function setupDropzone(dropzoneId, inputId, onFilesSelected) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);

    // Click to open file picker
    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('.img-remove-btn')) return; // Don't open picker when removing
        input.click();
    });

    // File selected via picker
    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            onFilesSelected(input.files);
            input.value = ''; // Reset so same file can be re-selected
        }
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    });
}

async function uploadFile(file, folder = 'tours') {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload.php?folder=${folder}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    return await response.json();
}

async function uploadFiles(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images[]', files[i]);
    }

    const response = await fetch(`${API_BASE}/upload.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    return await response.json();
}
