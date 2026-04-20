// =====================
// Transfers — Locations / Vehicles / Routes
// =====================

let transferLocations = [];
let transferVehicles = [];
let transferRoutes = [];

// ─── Tab switching ────────────────────────────────────────────────
function switchTransferTab(tab) {
    document.querySelectorAll('.transfer-tab').forEach(btn => {
        const isActive = btn.dataset.transferTab === tab;
        btn.classList.toggle('border-navy', isActive);
        btn.classList.toggle('text-navy', isActive);
        btn.classList.toggle('border-transparent', !isActive);
        btn.classList.toggle('text-gray-500', !isActive);
    });
    document.querySelectorAll('.transfer-tab-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    const panel = document.getElementById('transferTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (panel) panel.style.display = '';

    if (tab === 'routes') loadTransferRoutes();
    if (tab === 'locations') loadTransferLocations();
    if (tab === 'vehicles') loadTransferVehicles();
}

// Entry point called by app.js when navigating to transfers page
function loadTransfers() {
    switchTransferTab('routes');
}

// ─── Locations ────────────────────────────────────────────────────
async function loadTransferLocations() {
    try {
        const res = await fetch(`${API_BASE}/transfers.php?resource=locations`, { credentials: 'include' });
        const data = await res.json();
        transferLocations = data.success ? (data.data?.data || []) : [];
        displayTransferLocations();
    } catch (e) {
        console.error('Error loading locations:', e);
    }
}

function displayTransferLocations() {
    const container = document.getElementById('locationsTable');
    if (!transferLocations.length) {
        container.innerHTML = '<p>No locations yet. Click "+ Add New Location" to create one.</p>';
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${transferLocations.map(loc => `
                    <tr>
                        <td><strong>${escapeHtml(loc.name)}</strong></td>
                        <td>${loc.sort_order ?? 0}</td>
                        <td>${loc.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}</td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editTransferLocation(${loc.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTransferLocation(${loc.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openLocationModal(id = null) {
    const modal = document.getElementById('locationModal');
    const form = document.getElementById('locationForm');
    form.reset();
    document.getElementById('locationId').value = '';
    document.getElementById('locationActive').checked = true;
    document.getElementById('locationSortOrder').value = 0;

    if (id) {
        const loc = transferLocations.find(l => l.id == id);
        if (loc) {
            document.getElementById('locationModalTitle').textContent = 'Edit Location';
            document.getElementById('locationId').value = loc.id;
            document.getElementById('locationName').value = loc.name || '';
            document.getElementById('locationSortOrder').value = loc.sort_order ?? 0;
            document.getElementById('locationActive').checked = loc.is_active == 1;
        }
    } else {
        document.getElementById('locationModalTitle').textContent = 'Add New Location';
    }
    modal.classList.add('active');
}

function editTransferLocation(id) { openLocationModal(id); }

async function deleteTransferLocation(id) {
    if (!confirm('Delete this location? Routes that use it will also be removed.')) return;
    try {
        const res = await fetch(`${API_BASE}/transfers.php?resource=locations&id=${id}`, {
            method: 'DELETE', credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Location deleted', 'success');
            loadTransferLocations();
        } else {
            showToast(data.message || 'Failed to delete', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
}

async function handleLocationSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('locationSaveBtn');
    const orig = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const id = document.getElementById('locationId').value;
    const payload = {
        name: document.getElementById('locationName').value.trim(),
        sort_order: parseInt(document.getElementById('locationSortOrder').value) || 0,
        is_active: document.getElementById('locationActive').checked ? 1 : 0,
    };

    try {
        const url = id
            ? `${API_BASE}/transfers.php?resource=locations&id=${id}`
            : `${API_BASE}/transfers.php?resource=locations`;
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
            showToast(id ? 'Location updated' : 'Location created', 'success');
            document.getElementById('locationModal').classList.remove('active');
            loadTransferLocations();
        } else {
            showToast(data.message || 'Failed to save', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    } finally {
        btn.textContent = orig;
        btn.disabled = false;
    }
}

// ─── Vehicles ─────────────────────────────────────────────────────
async function loadTransferVehicles() {
    try {
        const res = await fetch(`${API_BASE}/transfers.php?resource=vehicles`, { credentials: 'include' });
        const data = await res.json();
        transferVehicles = data.success ? (data.data?.data || []) : [];
        displayTransferVehicles();
    } catch (e) {
        console.error('Error loading vehicles:', e);
    }
}

function displayTransferVehicles() {
    const container = document.getElementById('vehiclesTable');
    if (!transferVehicles.length) {
        container.innerHTML = '<p>No vehicles yet. Click "+ Add New Vehicle" to create one.</p>';
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Passengers</th>
                    <th>Luggage</th>
                    <th>Sort</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${transferVehicles.map(v => `
                    <tr>
                        <td>${v.image_url
                            ? `<img src="${v.image_url}" class="tour-thumb" alt="${escapeHtml(v.name)}">`
                            : '<span class="no-image">No image</span>'}</td>
                        <td><strong>${escapeHtml(v.name)}</strong>${v.description ? `<br><span style="color:#888;font-size:12px;">${escapeHtml(v.description)}</span>` : ''}</td>
                        <td>Up to ${v.max_passengers}</td>
                        <td>${v.max_luggage ?? 0}</td>
                        <td>${v.sort_order ?? 0}</td>
                        <td>${v.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}</td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editTransferVehicle(${v.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTransferVehicle(${v.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openVehicleModal(id = null) {
    const modal = document.getElementById('vehicleModal');
    const form = document.getElementById('vehicleForm');
    form.reset();
    document.getElementById('vehicleId').value = '';
    document.getElementById('vehicleActive').checked = true;
    document.getElementById('vehicleSortOrder').value = 0;
    document.getElementById('vehicleImageUrl').value = '';
    renderVehicleImagePreview('');

    if (id) {
        const v = transferVehicles.find(x => x.id == id);
        if (v) {
            document.getElementById('vehicleModalTitle').textContent = 'Edit Vehicle';
            document.getElementById('vehicleId').value = v.id;
            document.getElementById('vehicleName').value = v.name || '';
            document.getElementById('vehicleMaxPassengers').value = v.max_passengers || 1;
            document.getElementById('vehicleMaxLuggage').value = v.max_luggage ?? 2;
            document.getElementById('vehicleSortOrder').value = v.sort_order ?? 0;
            document.getElementById('vehicleDescription').value = v.description || '';
            document.getElementById('vehicleImageUrl').value = v.image_url || '';
            document.getElementById('vehicleActive').checked = v.is_active == 1;
            renderVehicleImagePreview(v.image_url || '');
        }
    } else {
        document.getElementById('vehicleModalTitle').textContent = 'Add New Vehicle';
    }
    modal.classList.add('active');
}

function renderVehicleImagePreview(url) {
    const preview = document.getElementById('vehicleImagePreview');
    const placeholder = document.getElementById('vehicleImagePlaceholder');
    if (url) {
        placeholder.style.display = 'none';
        preview.innerHTML = `
            <div style="position:relative;display:inline-block;">
                <img src="${url}" style="max-width:200px;max-height:120px;border-radius:8px;object-fit:cover;" alt="Vehicle">
                <button type="button" class="img-remove-btn" onclick="removeVehicleImage(event)" title="Remove"
                    style="position:absolute;top:4px;right:4px;background:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.2);font-size:14px;color:#ef4444;">×</button>
            </div>
        `;
    } else {
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

function removeVehicleImage(e) {
    e.stopPropagation();
    document.getElementById('vehicleImageUrl').value = '';
    renderVehicleImagePreview('');
}

async function handleVehicleImageUpload(files) {
    if (!files || !files.length) return;
    const file = files[0];
    try {
        const result = await uploadFile(file, 'transfers');
        const url = result.url || (result.data && result.data.url);
        if (result.success && url) {
            document.getElementById('vehicleImageUrl').value = url;
            renderVehicleImagePreview(url);
        } else {
            showToast(result.message || 'Upload failed', 'error');
        }
    } catch (e) {
        showToast('Upload failed', 'error');
    }
}

function editTransferVehicle(id) { openVehicleModal(id); }

async function deleteTransferVehicle(id) {
    if (!confirm('Delete this vehicle? Prices set on routes will also be removed.')) return;
    try {
        const res = await fetch(`${API_BASE}/transfers.php?resource=vehicles&id=${id}`, {
            method: 'DELETE', credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Vehicle deleted', 'success');
            loadTransferVehicles();
        } else {
            showToast(data.message || 'Failed to delete', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
}

async function handleVehicleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('vehicleSaveBtn');
    const orig = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const id = document.getElementById('vehicleId').value;
    const payload = {
        name: document.getElementById('vehicleName').value.trim(),
        max_passengers: parseInt(document.getElementById('vehicleMaxPassengers').value) || 1,
        max_luggage: parseInt(document.getElementById('vehicleMaxLuggage').value) || 0,
        sort_order: parseInt(document.getElementById('vehicleSortOrder').value) || 0,
        description: document.getElementById('vehicleDescription').value.trim(),
        image_url: document.getElementById('vehicleImageUrl').value || null,
        is_active: document.getElementById('vehicleActive').checked ? 1 : 0,
    };

    try {
        const url = id
            ? `${API_BASE}/transfers.php?resource=vehicles&id=${id}`
            : `${API_BASE}/transfers.php?resource=vehicles`;
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
            showToast(id ? 'Vehicle updated' : 'Vehicle created', 'success');
            document.getElementById('vehicleModal').classList.remove('active');
            loadTransferVehicles();
        } else {
            showToast(data.message || 'Failed to save', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    } finally {
        btn.textContent = orig;
        btn.disabled = false;
    }
}

// ─── Routes ───────────────────────────────────────────────────────
async function loadTransferRoutes() {
    try {
        const res = await fetch(`${API_BASE}/transfers.php?resource=routes`, { credentials: 'include' });
        const data = await res.json();
        transferRoutes = data.success ? (data.data?.data || []) : [];
        displayTransferRoutes();
    } catch (e) {
        console.error('Error loading routes:', e);
    }
}

function displayTransferRoutes() {
    const container = document.getElementById('routesTable');
    if (!transferRoutes.length) {
        container.innerHTML = '<p>No routes yet. Click "+ Add New Route" to create one. (Make sure to add Locations and Vehicles first.)</p>';
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Route</th>
                    <th>Vehicles & Prices</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${transferRoutes.map(r => {
                    const prices = (r.prices || []).map(p =>
                        `<div style="font-size:12px;"><strong>${escapeHtml(p.vehicle_name)}</strong> — ${formatCurrency(p.price)}</div>`
                    ).join('') || '<span style="color:#999;font-size:12px;">No prices set</span>';
                    return `
                        <tr>
                            <td>
                                <strong>${escapeHtml(r.origin_name)}</strong>
                                <br><span style="color:#888;font-size:12px;">↔ ${escapeHtml(r.destination_name)}</span>
                            </td>
                            <td>${prices}</td>
                            <td>${r.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}</td>
                            <td class="actions-cell">
                                <button class="btn btn-sm btn-primary" onclick="editTransferRoute(${r.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteTransferRoute(${r.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

async function openRouteModal(id = null) {
    const modal = document.getElementById('routeModal');
    const form = document.getElementById('routeForm');
    form.reset();
    document.getElementById('routeId').value = '';
    document.getElementById('routeActive').checked = true;

    // Make sure we have fresh locations + vehicles to populate the form
    if (!transferLocations.length) await loadTransferLocations();
    if (!transferVehicles.length) await loadTransferVehicles();

    populateRouteLocationSelects();
    populateRoutePricesGrid();

    if (id) {
        const route = transferRoutes.find(r => r.id == id);
        if (route) {
            document.getElementById('routeModalTitle').textContent = 'Edit Route';
            document.getElementById('routeId').value = route.id;
            document.getElementById('routeOriginId').value = route.origin_id;
            document.getElementById('routeDestinationId').value = route.destination_id;
            document.getElementById('routeActive').checked = route.is_active == 1;

            // Hydrate prices
            (route.prices || []).forEach(p => {
                const input = document.querySelector(`#routePricesGrid input[data-vehicle-id="${p.vehicle_id}"]`);
                if (input) input.value = p.price;
            });
        }
    } else {
        document.getElementById('routeModalTitle').textContent = 'Add New Route';
    }
    modal.classList.add('active');
}

function populateRouteLocationSelects() {
    const originSel = document.getElementById('routeOriginId');
    const destSel = document.getElementById('routeDestinationId');
    const opts = ['<option value="">Select location...</option>']
        .concat(transferLocations
            .filter(l => l.is_active == 1)
            .map(l => `<option value="${l.id}">${escapeHtml(l.name)}</option>`));
    originSel.innerHTML = opts.join('');
    destSel.innerHTML = opts.join('');
}

function populateRoutePricesGrid() {
    const grid = document.getElementById('routePricesGrid');
    const activeVehicles = transferVehicles.filter(v => v.is_active == 1);
    if (!activeVehicles.length) {
        grid.innerHTML = '<p class="p-4 text-center text-sm text-gray-400">No active vehicles. Add vehicles first in the Vehicles tab.</p>';
        return;
    }
    grid.innerHTML = activeVehicles.map(v => `
        <div class="flex items-center gap-4 px-4 py-3">
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm text-navy">${escapeHtml(v.name)}</div>
                <div class="text-xs text-gray-400">Up to ${v.max_passengers} pax · ${v.max_luggage ?? 0} bags</div>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" min="0" step="0.01" placeholder="0.00" data-vehicle-id="${v.id}"
                    class="field-input route-price-input" style="width:140px;text-align:right;">
                <span class="text-xs text-gray-400">THB</span>
            </div>
        </div>
    `).join('');
}

function editTransferRoute(id) { openRouteModal(id); }

async function deleteTransferRoute(id) {
    if (!confirm('Delete this route? All prices for this route will be removed.')) return;
    try {
        const res = await fetch(`${API_BASE}/transfers.php?resource=routes&id=${id}`, {
            method: 'DELETE', credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Route deleted', 'success');
            loadTransferRoutes();
        } else {
            showToast(data.message || 'Failed to delete', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
}

async function handleRouteSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('routeSaveBtn');
    const orig = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const originId = parseInt(document.getElementById('routeOriginId').value);
    const destId = parseInt(document.getElementById('routeDestinationId').value);

    if (!originId || !destId) {
        showToast('Select both origin and destination', 'error');
        btn.textContent = orig; btn.disabled = false;
        return;
    }
    if (originId === destId) {
        showToast('Origin and destination must be different', 'error');
        btn.textContent = orig; btn.disabled = false;
        return;
    }

    const prices = [];
    document.querySelectorAll('#routePricesGrid .route-price-input').forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) {
            prices.push({
                vehicle_id: parseInt(input.dataset.vehicleId),
                price: val,
            });
        }
    });

    if (!prices.length) {
        showToast('Set a price for at least one vehicle', 'error');
        btn.textContent = orig; btn.disabled = false;
        return;
    }

    const id = document.getElementById('routeId').value;
    const payload = {
        origin_id: originId,
        destination_id: destId,
        is_active: document.getElementById('routeActive').checked ? 1 : 0,
        prices,
    };

    try {
        const url = id
            ? `${API_BASE}/transfers.php?resource=routes&id=${id}`
            : `${API_BASE}/transfers.php?resource=routes`;
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
            showToast(id ? 'Route updated' : 'Route created', 'success');
            document.getElementById('routeModal').classList.remove('active');
            loadTransferRoutes();
        } else {
            showToast(data.message || 'Failed to save route', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    } finally {
        btn.textContent = orig;
        btn.disabled = false;
    }
}

// ─── Wire up buttons + modal close handlers ───────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Tab buttons
    document.querySelectorAll('.transfer-tab').forEach(btn => {
        btn.addEventListener('click', () => switchTransferTab(btn.dataset.transferTab));
    });

    // Add buttons
    document.getElementById('addLocationBtn')?.addEventListener('click', () => openLocationModal());
    document.getElementById('addVehicleBtn')?.addEventListener('click', () => openVehicleModal());
    document.getElementById('addRouteBtn')?.addEventListener('click', () => openRouteModal());

    // Form submits
    document.getElementById('locationForm')?.addEventListener('submit', handleLocationSubmit);
    document.getElementById('vehicleForm')?.addEventListener('submit', handleVehicleSubmit);
    document.getElementById('routeForm')?.addEventListener('submit', handleRouteSubmit);

    // Modal close buttons
    document.querySelectorAll('.location-modal-close').forEach(b =>
        b.addEventListener('click', () => document.getElementById('locationModal').classList.remove('active'))
    );
    document.querySelectorAll('.vehicle-modal-close').forEach(b =>
        b.addEventListener('click', () => document.getElementById('vehicleModal').classList.remove('active'))
    );
    document.querySelectorAll('.route-modal-close').forEach(b =>
        b.addEventListener('click', () => document.getElementById('routeModal').classList.remove('active'))
    );

    // Vehicle image dropzone
    if (document.getElementById('vehicleImageDropzone')) {
        setupDropzone('vehicleImageDropzone', 'vehicleImageFile', handleVehicleImageUpload);
    }
});

// Expose for inline onclick handlers
window.editTransferLocation = editTransferLocation;
window.deleteTransferLocation = deleteTransferLocation;
window.editTransferVehicle = editTransferVehicle;
window.deleteTransferVehicle = deleteTransferVehicle;
window.editTransferRoute = editTransferRoute;
window.deleteTransferRoute = deleteTransferRoute;
window.removeVehicleImage = removeVehicleImage;

// =====================
// Transfer Page Gallery (unchanged from previous version)
// =====================
let transferGalleryImages = [];

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
        if (typeof lucide !== 'undefined') lucide.createIcons({ nameAttr: 'data-lucide', node: btn });
    }
}

document.addEventListener('DOMContentLoaded', () => {
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

    if (document.getElementById('transferGalleryDropzone')) {
        setupDropzone('transferGalleryDropzone', 'transferGalleryFiles', handleTransferGalleryUpload);
    }

    const saveBtn = document.getElementById('transferGallerySaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveTransferGallery);
    }
});
