// =====================
// Shows & Adventures
// =====================
let shows = [];
let showsGalleryUrls = [];

async function loadShows() {
    try {
        const response = await fetch(`${API_BASE}/shows.php?active=`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            shows = data.data.items || [];
            displayShows(shows);
        }
    } catch (error) {
        console.error('Error loading shows:', error);
    }
}

function displayShows(items) {
    const container = document.getElementById('showsTable');

    if (!items || items.length === 0) {
        container.innerHTML = `<p>No shows & adventures found. Click "+ Add New Show" to create one.</p>`;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Destination</th>
                    <th>Venue</th>
                    <th>Showtimes</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(show => `
                    <tr>
                        <td>
                            ${show.main_image
                                ? `<img src="${show.main_image}" alt="${escapeHtml(show.name)}" class="tour-thumb" onerror="this.style.display='none'">`
                                : '<span class="no-image">No img</span>'}
                        </td>
                        <td><strong>${escapeHtml(show.name)}</strong></td>
                        <td>${escapeHtml(show.destination)}</td>
                        <td>${escapeHtml(show.venue || '-')}</td>
                        <td>${Array.isArray(show.show_times) && show.show_times.length > 0
                            ? show.show_times.slice(0, 3).map(t => `<span class="badge badge-info">${escapeHtml(t)}</span>`).join(' ')
                            : '<span class="text-gray-400">—</span>'}</td>
                        <td>
                            ${show.is_featured == 1 ? '<span class="badge badge-confirmed">Featured</span> ' : ''}
                            ${show.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editShow(${show.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteShow(${show.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openShowModal(showId = null) {
    const modal = document.getElementById('showModal');
    const form = document.getElementById('showForm');
    const title = document.getElementById('showModalTitle');
    const subtitle = document.getElementById('showModalSubtitle');

    form.reset();
    showsGalleryUrls = [];
    clearShowTimes();
    clearSeatZones();
    setOperationalDays([]);

    switchShowTab('sh-basic');
    setShowMainImagePreview('');
    renderShowGalleryPreview();

    if (showId) {
        const show = shows.find(s => s.id == showId);
        title.textContent = 'Edit Show & Adventure';
        if (subtitle) subtitle.textContent = 'Update the show details';
        if (show) {
            document.getElementById('shId').value = show.id;
            document.getElementById('shName').value = show.name || '';
            document.getElementById('shDestination').value = show.destination || '';
            document.getElementById('shVenue').value = show.venue || '';
            document.getElementById('shAdultPrice').value = show.adult_price || '';
            document.getElementById('shChildPrice').value = show.child_price || '';
            document.getElementById('shParkFeeIncluded').checked = Number(show.park_fee_included) === 1;
            document.getElementById('shParkFeeAdult').value = show.park_fee_adult || '';
            document.getElementById('shParkFeeChild').value = show.park_fee_child || '';
            document.getElementById('shDurationDays').value = show.duration_days || 1;
            document.getElementById('shDurationNights').value = show.duration_nights || 0;
            document.getElementById('shDescription').value = show.description || '';
            document.getElementById('shShortDescription').value = show.short_description || '';

            setShowMainImagePreview(show.main_image || '');
            setShowGalleryFromUrls(show.gallery_images);

            document.getElementById('shHighlights').value =
                Array.isArray(show.highlights) ? show.highlights.join('\n') : '';
            document.getElementById('shIncluded').value =
                Array.isArray(show.included) ? show.included.join('\n') : '';
            document.getElementById('shNotIncluded').value =
                Array.isArray(show.not_included) ? show.not_included.join('\n') : '';

            // Show times
            if (Array.isArray(show.show_times)) {
                show.show_times.forEach(time => addShowTime(null, time));
            }

            // Seat zones
            if (Array.isArray(show.seat_zones)) {
                show.seat_zones.forEach(zone => addSeatZone(null, zone));
            }

            // Operational days
            setOperationalDays(Array.isArray(show.operational_days) ? show.operational_days : []);

            document.getElementById('shMaxParticipants').value = show.max_participants || '';
            document.getElementById('shMinParticipants').value = show.min_participants || 1;
            document.getElementById('shRating').value = show.rating || 0;
            document.getElementById('shTerms').value = show.terms_conditions || '';
            document.getElementById('shCancellation').value = show.cancellation_policy || '';

            document.getElementById('shFeatured').checked = show.is_featured == 1;
            document.getElementById('shActive').checked = show.is_active == 1;

            document.getElementById('shPickupTime').value = show.pickup_time || '';
            document.getElementById('shPickupLocation').value = show.pickup_location || '';
            document.getElementById('shDropoffTime').value = show.dropoff_time || '';
            document.getElementById('shDropoffLocation').value = show.dropoff_location || '';
            document.getElementById('shMealInfo').value = show.meal_info || '';
            document.getElementById('shTransferInfo').value = show.transfer_info || '';
            document.getElementById('shWhatToBring').value =
                Array.isArray(show.what_to_bring) ? show.what_to_bring.join('\n') : (show.what_to_bring || '');
            document.getElementById('shImportantNotes').value = show.important_notes || '';
        }
    } else {
        title.textContent = 'Add New Show & Adventure';
        if (subtitle) subtitle.textContent = 'Fill in the details to create a show';
        document.getElementById('shId').value = '';
        document.getElementById('shActive').checked = true;
        document.getElementById('shDurationDays').value = 1;
        document.getElementById('shDurationNights').value = 0;
    }

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function handleShowSubmit(e) {
    e.preventDefault();

    const requiredFields = [
        { id: 'shName', tab: 'sh-basic', label: 'Show Name' },
        { id: 'shDestination', tab: 'sh-basic', label: 'Destination' },
        { id: 'shAdultPrice', tab: 'sh-basic', label: 'Adult Price' },
        { id: 'shDescription', tab: 'sh-basic', label: 'Full Description' },
    ];

    for (const field of requiredFields) {
        const el = document.getElementById(field.id);
        if (!el.value || el.value.trim() === '') {
            switchShowTab(field.tab);
            el.focus();
            showToast(`Please fill in "${field.label}"`, 'warning');
            return;
        }
    }

    const showId = document.getElementById('shId').value;
    const durationDays = parseInt(document.getElementById('shDurationDays').value) || 1;
    const durationNights = parseInt(document.getElementById('shDurationNights').value) || 0;
    const adultPrice = parseFloat(document.getElementById('shAdultPrice').value);
    const childPrice = parseFloat(document.getElementById('shChildPrice').value) || null;

    const showData = {
        name: document.getElementById('shName').value,
        destination: document.getElementById('shDestination').value,
        venue: document.getElementById('shVenue').value || null,
        adult_price: adultPrice,
        child_price: childPrice,
        park_fee_included: document.getElementById('shParkFeeIncluded').checked ? 1 : 0,
        park_fee_adult: parseFloat(document.getElementById('shParkFeeAdult').value) || null,
        park_fee_child: parseFloat(document.getElementById('shParkFeeChild').value) || null,
        duration_days: durationDays,
        duration_nights: durationDays === 1 ? 0 : durationNights,
        duration_label: durationDays === 1 ? 'One Day Experience' : `${durationDays} Days / ${durationNights} Nights`,
        currency: 'THB',
        description: document.getElementById('shDescription').value,
        short_description: document.getElementById('shShortDescription').value,
        main_image: document.getElementById('shMainImage').value,
        gallery_images: showsGalleryUrls,
        highlights: document.getElementById('shHighlights').value
            .split('\n').map(h => h.trim()).filter(h => h),
        included: document.getElementById('shIncluded').value
            .split('\n').map(i => i.trim()).filter(i => i),
        not_included: document.getElementById('shNotIncluded').value
            .split('\n').map(n => n.trim()).filter(n => n),
        show_times: getShowTimes(),
        seat_zones: getSeatZones(),
        operational_days: getOperationalDays(),
        max_participants: parseInt(document.getElementById('shMaxParticipants').value) || null,
        min_participants: parseInt(document.getElementById('shMinParticipants').value) || 1,
        rating: parseFloat(document.getElementById('shRating').value) || 0,
        review_count: 0,
        terms_conditions: document.getElementById('shTerms').value,
        cancellation_policy: document.getElementById('shCancellation').value,
        is_featured: document.getElementById('shFeatured').checked ? 1 : 0,
        is_active: document.getElementById('shActive').checked ? 1 : 0,
        pickup_time: document.getElementById('shPickupTime').value || null,
        pickup_location: document.getElementById('shPickupLocation').value || null,
        dropoff_time: document.getElementById('shDropoffTime').value || null,
        dropoff_location: document.getElementById('shDropoffLocation').value || null,
        meal_info: document.getElementById('shMealInfo').value || null,
        transfer_info: document.getElementById('shTransferInfo').value || null,
        what_to_bring: document.getElementById('shWhatToBring').value
            ? document.getElementById('shWhatToBring').value.split('\n').map(i => i.trim()).filter(i => i)
            : null,
        important_notes: document.getElementById('shImportantNotes').value || null,
        // Set only when this show came in via the Contract Rate importer
        source_tour_id: parseInt(document.getElementById('shSourceId').value) || null,
        source_supplier_name: document.getElementById('shSourceSupplier').value || null
    };

    try {
        const url = showId ? `${API_BASE}/shows.php?id=${showId}` : `${API_BASE}/shows.php`;
        const method = showId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(showData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal('showModal');
            loadShows();
            if (typeof invalidateDestinationCache === 'function') invalidateDestinationCache();
            showToast(showId ? 'Show updated successfully!' : 'Show created successfully!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error saving show:', error);
        showToast('Error saving show. Please try again.', 'error');
    }
}

async function editShow(id) {
    openShowModal(id);
}

async function deleteShow(id) {
    if (!confirm('Are you sure you want to delete this show?')) return;

    try {
        const response = await fetch(`${API_BASE}/shows.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            loadShows();
            showToast('Show deleted successfully!', 'success');
        } else {
            showToast('Error deleting show: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting show:', error);
        showToast('Error deleting show', 'error');
    }
}

// =====================
// Show Main Image
// =====================
async function handleShowMainImageUpload(files) {
    const file = files[0];
    const preview = document.getElementById('shMainImagePreview');
    const placeholder = document.getElementById('shMainImagePlaceholder');

    placeholder.style.display = 'none';
    preview.innerHTML = '<div class="upload-loading"><div class="spinner"></div><span>Uploading...</span></div>';

    try {
        const data = await uploadFile(file, 'shows');

        if (data.success) {
            const url = data.data.url;
            document.getElementById('shMainImage').value = url;
            preview.innerHTML = `
                <div class="img-preview-item main-preview">
                    <img src="${url}" alt="Main image">
                    <button type="button" class="img-remove-btn" onclick="removeShowMainImage(event)">&times;</button>
                </div>`;
        } else {
            showToast('Upload failed: ' + data.message, 'error');
            preview.innerHTML = '';
            placeholder.style.display = '';
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload error. Please try again.', 'error');
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

function removeShowMainImage(e) {
    e.stopPropagation();
    document.getElementById('shMainImage').value = '';
    document.getElementById('shMainImagePreview').innerHTML = '';
    document.getElementById('shMainImagePlaceholder').style.display = '';
}

function setShowMainImagePreview(url) {
    const preview = document.getElementById('shMainImagePreview');
    const placeholder = document.getElementById('shMainImagePlaceholder');

    if (url) {
        document.getElementById('shMainImage').value = url;
        preview.innerHTML = `
            <div class="img-preview-item main-preview">
                <img src="${url}" alt="Main image">
                <button type="button" class="img-remove-btn" onclick="removeShowMainImage(event)">&times;</button>
            </div>`;
        placeholder.style.display = 'none';
    } else {
        document.getElementById('shMainImage').value = '';
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

// =====================
// Show Gallery
// =====================
async function handleShowGalleryUpload(files) {
    if (showsGalleryUrls.length + files.length > GALLERY_MAX) {
        showToast(`Maximum ${GALLERY_MAX} gallery images allowed.`, 'warning');
        return;
    }

    const placeholder = document.getElementById('shGalleryPlaceholder');
    placeholder.style.display = 'none';

    const galleryPreview = document.getElementById('shGalleryPreview');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'upload-loading';
    loadingDiv.innerHTML = '<div class="spinner"></div><span>Uploading ' + files.length + ' image(s)...</span>';
    galleryPreview.appendChild(loadingDiv);

    try {
        const data = await uploadFiles(files);
        loadingDiv.remove();

        if (data.success && data.data.urls) {
            data.data.urls.forEach(url => showsGalleryUrls.push(url));
            renderShowGalleryPreview();
        }

        if (data.data.errors && data.data.errors.length > 0) {
            showToast('Some uploads failed: ' + data.data.errors.join(', '), 'warning');
        }
    } catch (error) {
        console.error('Gallery upload error:', error);
        loadingDiv.remove();
        showToast('Upload error. Please try again.', 'error');
    }

    updateShowGalleryPlaceholder();
}

function renderShowGalleryPreview() {
    const container = document.getElementById('shGalleryPreview');
    container.innerHTML = showsGalleryUrls.map((url, index) => `
        <div class="img-preview-item gallery-item">
            <img src="${url}" alt="Gallery ${index + 1}">
            <button type="button" class="img-remove-btn" onclick="removeShowGalleryImage(event, ${index})">&times;</button>
            <span class="img-index">${index + 1}</span>
        </div>
    `).join('');

    document.getElementById('shGalleryImages').value = JSON.stringify(showsGalleryUrls);
    updateShowGalleryPlaceholder();
}

function removeShowGalleryImage(e, index) {
    e.stopPropagation();
    showsGalleryUrls.splice(index, 1);
    renderShowGalleryPreview();
}

function updateShowGalleryPlaceholder() {
    const placeholder = document.getElementById('shGalleryPlaceholder');
    placeholder.style.display = showsGalleryUrls.length === 0 ? '' : 'none';
    const countEl = document.getElementById('shGalleryCount');
    if (countEl) countEl.textContent = showsGalleryUrls.length + ' / ' + GALLERY_MAX + ' images';
}

function setShowGalleryFromUrls(urls) {
    showsGalleryUrls = Array.isArray(urls) ? [...urls] : [];
    renderShowGalleryPreview();
}

// =====================
// Show Tabs
// =====================
function switchShowTab(tabName) {
    document.querySelectorAll('#showModalTabBar .sh-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.className = 'sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy flex items-center gap-2';
        } else {
            btn.className = 'sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600 flex items-center gap-2';
        }
    });

    document.querySelectorAll('#showModal .sh-tab-panel').forEach(panel => {
        if (panel.dataset.tab === tabName) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

// =====================
// Show Times Builder
// =====================
function addShowTime(e, existing = '') {
    const builder = document.getElementById('shTimesBuilder');
    const row = document.createElement('div');
    row.className = 'show-time-row flex items-center gap-2 mb-2';
    row.innerHTML = `
        <input type="text" class="sh-time-input field-input flex-1" placeholder="e.g. 18:00" value="${escapeHtml(existing)}" />
        <button type="button" class="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all" onclick="removeShowTime(this)">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    builder.appendChild(row);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeShowTime(btn) {
    btn.closest('.show-time-row').remove();
}

function clearShowTimes() {
    const builder = document.getElementById('shTimesBuilder');
    if (builder) builder.innerHTML = '';
}

function getShowTimes() {
    const inputs = document.querySelectorAll('#shTimesBuilder .sh-time-input');
    const times = [];
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) times.push(val);
    });
    return times;
}

// =====================
// Seat Zones Builder
// =====================
function addSeatZone(e, existing = null) {
    const builder = document.getElementById('shSeatZonesBuilder');
    const name = existing ? (existing.name || '') : '';
    const price = existing ? (existing.price || '') : '';
    const capacity = existing ? (existing.capacity || '') : '';

    const row = document.createElement('div');
    row.className = 'seat-zone-row grid grid-cols-12 gap-2 mb-2 items-center';
    row.innerHTML = `
        <input type="text" class="sz-name field-input col-span-5" placeholder="Zone name (e.g. VIP, Standard)" value="${escapeHtml(name)}" />
        <input type="number" step="0.01" class="sz-price field-input col-span-3" placeholder="Price (THB)" value="${escapeHtml(String(price))}" />
        <input type="number" class="sz-capacity field-input col-span-3" placeholder="Capacity" value="${escapeHtml(String(capacity))}" />
        <button type="button" class="col-span-1 px-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all" onclick="removeSeatZone(this)">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    builder.appendChild(row);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeSeatZone(btn) {
    btn.closest('.seat-zone-row').remove();
}

function clearSeatZones() {
    const builder = document.getElementById('shSeatZonesBuilder');
    if (builder) builder.innerHTML = '';
}

function getSeatZones() {
    const rows = document.querySelectorAll('#shSeatZonesBuilder .seat-zone-row');
    const zones = [];
    rows.forEach(row => {
        const name = row.querySelector('.sz-name').value.trim();
        const price = parseFloat(row.querySelector('.sz-price').value) || 0;
        const capacity = parseInt(row.querySelector('.sz-capacity').value) || 0;
        if (name) {
            zones.push({ name, price, capacity });
        }
    });
    return zones;
}

// =====================
// Operational Days
// =====================
function getOperationalDays() {
    const checkboxes = document.querySelectorAll('#shOperationalDays .op-day-checkbox');
    const days = [];
    checkboxes.forEach(cb => {
        if (cb.checked) days.push(cb.dataset.day);
    });
    return days;
}

function setOperationalDays(days) {
    const set = new Set(Array.isArray(days) ? days : []);
    document.querySelectorAll('#shOperationalDays .op-day-checkbox').forEach(cb => {
        cb.checked = set.has(cb.dataset.day);
    });
}
