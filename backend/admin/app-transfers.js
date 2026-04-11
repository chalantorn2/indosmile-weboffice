// =====================
// Transfers
// =====================
let transfers = [];

async function loadTransfers() {
    try {
        const response = await fetch(`${API_BASE}/transfers.php`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            transfers = data.data?.data || [];
            displayTransfers(transfers);
        }
    } catch (error) {
        console.error('Error loading transfers:', error);
    }
}

function displayTransfers(transfers) {
    const container = document.getElementById('transfersTable');

    if (!transfers || transfers.length === 0) {
        container.innerHTML = '<p>No transfers found. Click "+ Add New Transfer" to create one.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Passengers</th>
                    <th>Luggage</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${transfers.map(transfer => `
                    <tr>
                        <td>
                            <strong>${transfer.origin}</strong>
                            <br><span style="color:#888;font-size:12px;">to ${transfer.destination}</span>
                        </td>
                        <td>${transfer.vehicle_name}</td>
                        <td>Up to ${transfer.max_passengers}</td>
                        <td>${transfer.max_luggage || 0}</td>
                        <td>${formatCurrency(transfer.price)}</td>
                        <td>
                            ${transfer.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editTransfer(${transfer.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTransfer(${transfer.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openTransferModal(transferId = null) {
    const modal = document.getElementById('transferModal');
    const form = document.getElementById('transferForm');
    const title = document.getElementById('transferModalTitle');

    form.reset();
    document.getElementById('transferId').value = '';
    document.getElementById('transferActive').checked = true;

    if (transferId) {
        title.textContent = 'Edit Transfer';
        const transfer = transfers.find(t => t.id == transferId);
        if (transfer) {
            document.getElementById('transferId').value = transfer.id;
            document.getElementById('transferOrigin').value = transfer.origin || '';
            document.getElementById('transferDestination').value = transfer.destination || '';
            document.getElementById('transferVehicle').value = transfer.vehicle_name || '';
            document.getElementById('transferMaxPassengers').value = transfer.max_passengers || 1;
            document.getElementById('transferMaxLuggage').value = transfer.max_luggage || 2;
            document.getElementById('transferPrice').value = transfer.price || '';
            document.getElementById('transferImage').value = transfer.image_url || '';
            document.getElementById('transferDescription').value = transfer.description || '';
            document.getElementById('transferActive').checked = transfer.is_active == 1;
        }
    } else {
        title.textContent = 'Add New Transfer';
    }

    modal.classList.add('show');
}

function editTransfer(id) {
    openTransferModal(id);
}

async function deleteTransfer(id) {
    if (!confirm('Are you sure you want to delete this transfer route?')) return;

    try {
        const response = await fetch(`${API_BASE}/transfers.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showToast('Transfer deleted successfully', 'success');
            loadTransfers();
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to delete transfer', 'error');
        }
    } catch (error) {
        console.error('Error deleting transfer:', error);
        showToast('Network error occurred', 'error');
    }
}

// Form submit
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transferForm');
    if (form) {
        form.addEventListener('submit', handleTransferSubmit);
    }

    const addBtn = document.getElementById('addTransferBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openTransferModal());
    }

    const closeBtns = document.querySelectorAll('.transfer-modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('transferModal').classList.remove('show');
        });
    });
});

async function handleTransferSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('transferSaveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    const data = {
        origin: document.getElementById('transferOrigin').value,
        destination: document.getElementById('transferDestination').value,
        vehicle_name: document.getElementById('transferVehicle').value,
        max_passengers: parseInt(document.getElementById('transferMaxPassengers').value) || 1,
        max_luggage: parseInt(document.getElementById('transferMaxLuggage').value) || 2,
        price: parseFloat(document.getElementById('transferPrice').value) || 0,
        image_url: document.getElementById('transferImage').value,
        description: document.getElementById('transferDescription').value,
        is_active: document.getElementById('transferActive').checked ? 1 : 0
    };

    const id = document.getElementById('transferId').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/transfers.php?id=${id}` : `${API_BASE}/transfers.php`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showToast(id ? 'Transfer updated successfully' : 'Transfer created successfully', 'success');
            document.getElementById('transferModal').classList.remove('show');
            loadTransfers();
        } else {
            showToast(result.error || 'Failed to save transfer', 'error');
        }
    } catch (error) {
        console.error('Error saving transfer:', error);
        showToast('Network error occurred', 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// =====================
// Transfer Page Gallery
// =====================
let transferGalleryImages = []; // [{src, alt}]

async function loadTransferGallery() {
    try {
        const res = await fetch(`${API_BASE}/transfers.php?action=gallery`, { credentials: 'include' });
        const data = await res.json();
        transferGalleryImages = Array.isArray(data.data) ? data.data : [];
        renderTransferGallery();
    } catch (e) {
        console.error('Failed to load transfer gallery:', e);
    }
}

function renderTransferGallery() {
    const container = document.getElementById('transferGalleryPreview');
    const placeholder = document.getElementById('transferGalleryPlaceholder');
    const counter = document.getElementById('transferGalleryCount');

    counter.textContent = `${transferGalleryImages.length} images`;

    if (transferGalleryImages.length === 0) {
        container.innerHTML = '';
        placeholder.style.display = '';
        return;
    }
    placeholder.style.display = 'none';

    container.innerHTML = transferGalleryImages.map((img, idx) => `
        <div class="img-preview-item gallery-item" draggable="true"
             ondragstart="handleTGDragStart(event, ${idx})"
             ondragover="handleTGDragOver(event)"
             ondragenter="handleTGDragEnter(event)"
             ondragleave="handleTGDragLeave(event)"
             ondrop="handleTGDrop(event, ${idx})"
             ondragend="handleTGDragEnd(event)"
             style="position:relative;width:120px;height:90px;border-radius:10px;overflow:hidden;cursor:grab;">
            <img src="${img.src}" alt="${img.alt || ''}" style="width:100%;height:100%;object-fit:cover;pointer-events:none;">
            <button type="button" class="img-remove-btn" onclick="removeTGImage(${idx})" title="Remove"
                style="position:absolute;top:4px;right:4px;background:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.2);font-size:14px;color:#ef4444;z-index:2;">×</button>
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.5));padding:2px 6px;">
                <input type="text" value="${escapeHtml(img.alt || '')}" placeholder="Caption"
                    onchange="updateTGCaption(${idx}, this.value)"
                    onclick="event.stopPropagation()"
                    style="width:100%;background:transparent;border:none;color:#fff;font-size:10px;outline:none;padding:0;">
            </div>
        </div>
    `).join('');
}

function removeTGImage(idx) {
    transferGalleryImages.splice(idx, 1);
    renderTransferGallery();
}

function updateTGCaption(idx, caption) {
    transferGalleryImages[idx].alt = caption;
}

// Drag & drop reorder
let tgDragIndex = null;
function handleTGDragStart(e, idx) { tgDragIndex = idx; e.dataTransfer.effectAllowed = 'move'; }
function handleTGDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function handleTGDragEnter(e) { e.currentTarget.style.outline = '2px solid #010048'; }
function handleTGDragLeave(e) { e.currentTarget.style.outline = ''; }
function handleTGDragEnd(e) { e.currentTarget.style.outline = ''; }
function handleTGDrop(e, dropIdx) {
    e.preventDefault();
    e.currentTarget.style.outline = '';
    if (tgDragIndex === null || tgDragIndex === dropIdx) return;
    const [item] = transferGalleryImages.splice(tgDragIndex, 1);
    transferGalleryImages.splice(dropIdx, 0, item);
    tgDragIndex = null;
    renderTransferGallery();
}

async function handleTransferGalleryUpload(files) {
    if (transferGalleryImages.length + files.length > 12) {
        showToast('Maximum 12 gallery images allowed.', 'warning');
        return;
    }

    const placeholder = document.getElementById('transferGalleryPlaceholder');
    placeholder.style.display = 'none';

    for (const file of files) {
        try {
            const result = await uploadFile(file, 'transfers');
            const url = result.url || (result.data && result.data.url);
            if (result.success && url) {
                transferGalleryImages.push({ src: url, alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') });
            } else {
                showToast(`Upload failed: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (err) {
            console.error('Gallery upload error:', err);
            showToast('Upload failed', 'error');
        }
    }
    renderTransferGallery();
}

async function saveTransferGallery() {
    const btn = document.getElementById('transferGallerySaveBtn');
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Saving...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/transfers.php?action=gallery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ images: transferGalleryImages })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Gallery saved successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to save gallery', 'error');
        }
    } catch (err) {
        console.error('Save gallery error:', err);
        showToast('Network error', 'error');
    } finally {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        // Re-render lucide icons inside button
        if (typeof lucide !== 'undefined') lucide.createIcons({ nameAttr: 'data-lucide', node: btn });
    }
}

// Init gallery on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Toggle gallery section
    const toggle = document.getElementById('transferGalleryToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const body = document.getElementById('transferGalleryBody');
            const chevron = document.getElementById('transferGalleryChevron');
            const isOpen = body.style.display !== 'none';
            body.style.display = isOpen ? 'none' : '';
            chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        });
    }

    // Setup dropzone
    if (document.getElementById('transferGalleryDropzone')) {
        setupDropzone('transferGalleryDropzone', 'transferGalleryFiles', handleTransferGalleryUpload);
    }

    // Save button
    const saveBtn = document.getElementById('transferGallerySaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveTransferGallery);
    }
});
