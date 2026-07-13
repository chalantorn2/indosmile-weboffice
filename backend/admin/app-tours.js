// =====================
// Tours (Island Tours only — Shows & Adventures live in app-shows.js)
// =====================
let tours = [];
let cachedDestinations = null;

async function loadTours() {
    try {
        const response = await fetch(`${API_BASE}/tours.php?type=inbound&active=`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            tours = data.data.items || [];
            displayTours(tours);
        }
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

function displayTours(tours) {
    const container = document.getElementById('toursTable');

    if (!tours || tours.length === 0) {
        container.innerHTML = `<p>No island tours found. Click "+ Add New Island Tour" to create one.</p>`;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Destination</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tours.map(tour => `
                    <tr>
                        <td>
                            ${tour.main_image
                                ? `<img src="${tour.main_image}" alt="${tour.name}" class="tour-thumb" onerror="this.style.display='none'">`
                                : '<span class="no-image">No img</span>'}
                        </td>
                        <td><strong>${tour.name}</strong></td>
                        <td>${tour.destination}</td>
                        <td>${tour.duration_days == 1 ? '<span class="badge badge-info">Day Trip</span>' : tour.duration_days + 'D/' + tour.duration_nights + 'N'}</td>
                        <td>${formatCurrency(tour.adult_price)}</td>
                        <td>
                            ${tour.is_featured == 1 ? '<span class="badge badge-confirmed">Featured</span> ' : ''}
                            ${tour.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editTour(${tour.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTour(${tour.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openTourModal(tourId = null) {
    const modal = document.getElementById('tourModal');
    const form = document.getElementById('tourForm');
    const title = document.getElementById('modalTitle');

    form.reset();
    clearItineraryBuilder();
    galleryUrls = [];

    // Reset to first tab
    switchTab('basic');

    // Reset image areas
    setMainImagePreview('');
    renderGalleryPreview();

    const subtitle = document.getElementById('modalSubtitle');

    if (tourId) {
        const tour = tours.find(t => t.id == tourId);
        title.textContent = 'Edit Island Tour';
        if (subtitle) subtitle.textContent = 'Update the island tour details';
        if (tour) {
            document.getElementById('tourId').value = tour.id;
            document.getElementById('tourType').value = tour.type || 'inbound';
            document.getElementById('tourName').value = tour.name || '';
            document.getElementById('tourDestination').value = tour.destination || '';
            document.getElementById('tourAdultPrice').value = tour.adult_price || '';
            document.getElementById('tourChildPrice').value = tour.child_price || '';
            document.getElementById('tourParkFeeIncluded').checked = Number(tour.park_fee_included) === 1;
            document.getElementById('tourParkFeeAdult').value = tour.park_fee_adult || '';
            document.getElementById('tourParkFeeChild').value = tour.park_fee_child || '';
            document.getElementById('tourDurationDays').value = tour.duration_days || '';
            document.getElementById('tourDurationNights').value = tour.duration_nights || '';
            document.getElementById('tourDescription').value = tour.description || '';
            document.getElementById('tourShortDescription').value = tour.short_description || '';

            // Images
            setMainImagePreview(tour.main_image || '');
            setGalleryFromUrls(tour.gallery_images);

            // Text arrays
            document.getElementById('tourHighlights').value =
                Array.isArray(tour.highlights) ? tour.highlights.join('\n') : '';
            document.getElementById('tourIncluded').value =
                Array.isArray(tour.included) ? tour.included.join('\n') : '';
            document.getElementById('tourNotIncluded').value =
                Array.isArray(tour.not_included) ? tour.not_included.join('\n') : '';

            // Itinerary
            if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
                tour.itinerary.forEach(day => {
                    addItineraryDay(null, day);
                });
            }

            // Additional fields
            document.getElementById('tourMaxParticipants').value = tour.max_participants || '';
            document.getElementById('tourMinParticipants').value = tour.min_participants || 1;
            document.getElementById('tourDifficulty').value = tour.difficulty_level || 'easy';
            document.getElementById('tourRating').value = tour.rating || 0;
            document.getElementById('tourTerms').value = tour.terms_conditions || '';
            document.getElementById('tourCancellation').value = tour.cancellation_policy || '';

            document.getElementById('tourFeatured').checked = tour.is_featured == 1;
            document.getElementById('tourActive').checked = tour.is_active == 1;

            // One Day Trip fields
            document.getElementById('tourPickupTime').value = tour.pickup_time || '';
            document.getElementById('tourPickupLocation').value = tour.pickup_location || '';
            document.getElementById('tourDropoffTime').value = tour.dropoff_time || '';
            document.getElementById('tourDropoffLocation').value = tour.dropoff_location || '';
            document.getElementById('tourDepartureTimes').value =
                Array.isArray(tour.departure_times) ? tour.departure_times.join(', ') : (tour.departure_times || '');
            document.getElementById('tourMealInfo').value = tour.meal_info || '';
            document.getElementById('tourTransferInfo').value = tour.transfer_info || '';
            document.getElementById('tourWhatToBring').value =
                Array.isArray(tour.what_to_bring) ? tour.what_to_bring.join('\n') : (tour.what_to_bring || '');
            document.getElementById('tourImportantNotes').value = tour.important_notes || '';
        }
    } else {
        title.textContent = 'Add New Island Tour';
        if (subtitle) subtitle.textContent = 'Fill in the details to create an island tour';
        document.getElementById('tourId').value = '';
        document.getElementById('tourType').value = 'inbound';
        document.getElementById('tourActive').checked = true;
    }

    updateTabDots();
    modal.classList.add('active');
    toggleDayTripTab(); // Show/hide One Day Trip tab based on duration
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function handleTourSubmit(e) {
    e.preventDefault();

    // Validate required fields and switch to their tab if invalid
    const requiredFields = [
        { id: 'tourName', tab: 'basic', label: 'Tour Name' },
        { id: 'tourDestination', tab: 'basic', label: 'Destination' },
        { id: 'tourDurationDays', tab: 'basic', label: 'Days' },
        { id: 'tourDurationNights', tab: 'basic', label: 'Nights' },
        { id: 'tourAdultPrice', tab: 'basic', label: 'Adult Price' },
        { id: 'tourDescription', tab: 'basic', label: 'Full Description' },
    ];

    for (const field of requiredFields) {
        const el = document.getElementById(field.id);
        if (!el.value || el.value.trim() === '') {
            switchTab(field.tab);
            el.focus();
            showToast(`Please fill in "${field.label}"`, 'warning');
            return;
        }
    }

    const tourId = document.getElementById('tourId').value;
    const durationDays = parseInt(document.getElementById('tourDurationDays').value);
    const durationNights = parseInt(document.getElementById('tourDurationNights').value);
    const adultPrice = parseFloat(document.getElementById('tourAdultPrice').value);
    const childPrice = parseFloat(document.getElementById('tourChildPrice').value) || null;

    const tourData = {
        name: document.getElementById('tourName').value,
        destination: document.getElementById('tourDestination').value,
        type: document.getElementById('tourType').value || 'inbound',
        adult_price: adultPrice,
        child_price: childPrice,
        park_fee_included: document.getElementById('tourParkFeeIncluded').checked ? 1 : 0,
        park_fee_adult: parseFloat(document.getElementById('tourParkFeeAdult').value) || null,
        park_fee_child: parseFloat(document.getElementById('tourParkFeeChild').value) || null,
        duration_days: durationDays,
        duration_nights: durationDays === 1 ? 0 : durationNights,
        duration_label: durationDays === 1 ? 'One Day Trip' : `${durationDays} Days / ${durationNights} Nights`,
        currency: 'THB',
        description: document.getElementById('tourDescription').value,
        short_description: document.getElementById('tourShortDescription').value,
        main_image: document.getElementById('tourMainImage').value,
        gallery_images: galleryUrls,
        highlights: document.getElementById('tourHighlights').value
            .split('\n').map(h => h.trim()).filter(h => h),
        included: document.getElementById('tourIncluded').value
            .split('\n').map(i => i.trim()).filter(i => i),
        not_included: document.getElementById('tourNotIncluded').value
            .split('\n').map(n => n.trim()).filter(n => n),
        itinerary: getItineraryData(),
        max_participants: parseInt(document.getElementById('tourMaxParticipants').value) || null,
        min_participants: parseInt(document.getElementById('tourMinParticipants').value) || 1,
        difficulty_level: document.getElementById('tourDifficulty').value,
        rating: parseFloat(document.getElementById('tourRating').value) || 0,
        review_count: 0,
        terms_conditions: document.getElementById('tourTerms').value,
        cancellation_policy: document.getElementById('tourCancellation').value,
        is_featured: document.getElementById('tourFeatured').checked ? 1 : 0,
        is_active: document.getElementById('tourActive').checked ? 1 : 0,
        // One Day Trip fields
        pickup_time: document.getElementById('tourPickupTime').value || null,
        pickup_location: document.getElementById('tourPickupLocation').value || null,
        dropoff_time: document.getElementById('tourDropoffTime').value || null,
        dropoff_location: document.getElementById('tourDropoffLocation').value || null,
        departure_times: document.getElementById('tourDepartureTimes').value
            ? document.getElementById('tourDepartureTimes').value.split(',').map(t => t.trim()).filter(t => t)
            : null,
        meal_info: document.getElementById('tourMealInfo').value || null,
        transfer_info: document.getElementById('tourTransferInfo').value || null,
        what_to_bring: document.getElementById('tourWhatToBring').value
            ? document.getElementById('tourWhatToBring').value.split('\n').map(i => i.trim()).filter(i => i)
            : null,
        important_notes: document.getElementById('tourImportantNotes').value || null,
        // Set only when this tour came in via the Contract Rate importer
        source_tour_id: parseInt(document.getElementById('tourSourceId').value) || null,
        source_supplier_name: document.getElementById('tourSourceSupplier').value || null
    };

    try {
        const url = tourId ? `${API_BASE}/tours.php?id=${tourId}` : `${API_BASE}/tours.php`;
        const method = tourId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(tourData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal('tourModal');
            loadTours();
            invalidateDestinationCache();
            showToast(tourId ? 'Tour updated successfully!' : 'Tour created successfully!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error saving tour:', error);
        showToast('Error saving tour. Please try again.', 'error');
    }
}

async function editTour(id) {
    openTourModal(id);
}

async function deleteTour(id) {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
        const response = await fetch(`${API_BASE}/tours.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            loadTours();
            showToast('Tour deleted successfully!', 'success');
        } else {
            showToast('Error deleting tour: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting tour:', error);
        showToast('Error deleting tour', 'error');
    }
}

// =====================
// Tour Main Image Upload
// =====================
async function handleMainImageUpload(files) {
    const file = files[0];
    const preview = document.getElementById('mainImagePreview');
    const placeholder = document.getElementById('mainImagePlaceholder');

    // Show loading
    placeholder.style.display = 'none';
    preview.innerHTML = '<div class="upload-loading"><div class="spinner"></div><span>Uploading...</span></div>';

    try {
        const data = await uploadFile(file);

        if (data.success) {
            const url = data.data.url;
            document.getElementById('tourMainImage').value = url;
            preview.innerHTML = `
                <div class="img-preview-item main-preview">
                    <img src="${url}" alt="Main image">
                    <button type="button" class="img-remove-btn" onclick="removeMainImage(event)">&times;</button>
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

function removeMainImage(e) {
    e.stopPropagation();
    document.getElementById('tourMainImage').value = '';
    document.getElementById('mainImagePreview').innerHTML = '';
    document.getElementById('mainImagePlaceholder').style.display = '';
}

// =====================
// Tour Gallery Upload
// =====================
let galleryUrls = [];

// Roomy enough to hold a full Contract Rate import (see app-import.js)
const GALLERY_MAX = 30;

async function handleGalleryUpload(files) {
    if (galleryUrls.length + files.length > GALLERY_MAX) {
        showToast(`Maximum ${GALLERY_MAX} gallery images allowed.`, 'warning');
        return;
    }

    const placeholder = document.getElementById('galleryPlaceholder');
    placeholder.style.display = 'none';

    // Show loading for each file
    const galleryPreview = document.getElementById('galleryPreview');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'upload-loading';
    loadingDiv.innerHTML = '<div class="spinner"></div><span>Uploading ' + files.length + ' image(s)...</span>';
    galleryPreview.appendChild(loadingDiv);

    try {
        const data = await uploadFiles(files);

        loadingDiv.remove();

        if (data.success && data.data.urls) {
            data.data.urls.forEach(url => {
                galleryUrls.push(url);
            });
            renderGalleryPreview();
        }

        if (data.data.errors && data.data.errors.length > 0) {
            showToast('Some uploads failed: ' + data.data.errors.join(', '), 'warning');
        }
    } catch (error) {
        console.error('Gallery upload error:', error);
        loadingDiv.remove();
        showToast('Upload error. Please try again.', 'error');
    }

    updateGalleryPlaceholder();
}

function renderGalleryPreview() {
    const container = document.getElementById('galleryPreview');
    container.innerHTML = galleryUrls.map((url, index) => `
        <div class="img-preview-item gallery-item" draggable="true" 
             ondragstart="handleGalleryDragStart(event, ${index})" 
             ondragover="handleGalleryDragOver(event)" 
             ondragenter="handleGalleryDragEnter(event)"
             ondragleave="handleGalleryDragLeave(event)"
             ondrop="handleGalleryDrop(event, ${index})" 
             ondragend="handleGalleryDragEnd(event)"
             style="cursor: grab; transition: transform 0.2s, box-shadow 0.2s;">
            <img src="${url}" alt="Gallery ${index + 1}" style="pointer-events: none;">
            <button type="button" class="img-remove-btn" onclick="removeGalleryImage(event, ${index})">&times;</button>
            <span class="img-index">${index + 1}</span>
        </div>
    `).join('');

    // Update hidden input
    document.getElementById('tourGalleryImages').value = JSON.stringify(galleryUrls);
    updateGalleryPlaceholder();
}

let draggedGalleryIndex = null;

function handleGalleryDragStart(e, index) {
    draggedGalleryIndex = index;
    e.target.style.opacity = '0.4';
    e.target.style.transform = 'scale(0.95)';
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox to allow drag
    e.dataTransfer.setData('text/plain', index);
}

function handleGalleryDragEnter(e) {
    e.preventDefault();
    if (e.target.classList && e.target.classList.contains('gallery-item')) {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = '0 0 0 2px #0056b3';
    }
}

function handleGalleryDragLeave(e) {
    if (e.target.classList && e.target.classList.contains('gallery-item')) {
        e.target.style.transform = '';
        e.target.style.boxShadow = '';
    }
}

function handleGalleryDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleGalleryDrop(e, targetIndex) {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.classList && e.target.classList.contains('gallery-item')) {
        e.target.style.transform = '';
        e.target.style.boxShadow = '';
    }

    if (draggedGalleryIndex !== null && draggedGalleryIndex !== targetIndex) {
        const item = galleryUrls.splice(draggedGalleryIndex, 1)[0];
        galleryUrls.splice(targetIndex, 0, item);
        renderGalleryPreview();
    }
    return false;
}

function handleGalleryDragEnd(e) {
    e.target.style.opacity = '1';
    e.target.style.transform = '';
    draggedGalleryIndex = null;
    document.querySelectorAll('.gallery-item').forEach(el => {
        el.style.transform = '';
        el.style.boxShadow = '';
    });
}

function removeGalleryImage(e, index) {
    e.stopPropagation();
    galleryUrls.splice(index, 1);
    renderGalleryPreview();
}

function updateGalleryPlaceholder() {
    const placeholder = document.getElementById('galleryPlaceholder');
    placeholder.style.display = galleryUrls.length === 0 ? '' : 'none';
    const countEl = document.getElementById('galleryCount');
    if (countEl) countEl.textContent = galleryUrls.length + ' / ' + GALLERY_MAX + ' images';
    updateTabDots();
}

// Set gallery from existing URLs (for edit mode)
function setGalleryFromUrls(urls) {
    galleryUrls = Array.isArray(urls) ? [...urls] : [];
    renderGalleryPreview();
}

// Set main image preview from existing URL (for edit mode)
function setMainImagePreview(url) {
    const preview = document.getElementById('mainImagePreview');
    const placeholder = document.getElementById('mainImagePlaceholder');

    if (url) {
        document.getElementById('tourMainImage').value = url;
        preview.innerHTML = `
            <div class="img-preview-item main-preview">
                <img src="${url}" alt="Main image">
                <button type="button" class="img-remove-btn" onclick="removeMainImage(event)">&times;</button>
            </div>`;
        placeholder.style.display = 'none';
    } else {
        document.getElementById('tourMainImage').value = '';
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

// =====================
// Tab Switching (Tour Modal)
// =====================
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('#modalTabBar .tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.className = 'tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy';
        } else {
            btn.className = 'tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600';
        }
    });

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.dataset.tab === tabName) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

// =====================
// Tab Completion Dots
// =====================
function updateTabDots() {
    // Basic: check required fields
    const basicFilled = document.getElementById('tourName').value &&
                        document.getElementById('tourDestination').value &&
                        document.getElementById('tourDescription').value;
    toggleDot('basic', basicFilled);

    // Media: check main image
    const mediaFilled = document.getElementById('tourMainImage').value || galleryUrls.length > 0;
    toggleDot('media', mediaFilled);

    // Details: check highlights or itinerary
    const detailsFilled = document.getElementById('tourHighlights').value.trim() ||
                          document.getElementById('itineraryBuilder').children.length > 0;
    toggleDot('details', detailsFilled);

    // Settings: always considered done (has defaults)
    toggleDot('settings', true);
}

function toggleDot(tabName, filled) {
    const dot = document.querySelector(`[data-tab-dot="${tabName}"]`);
    if (dot) {
        dot.classList.toggle('filled', !!filled);
        dot.classList.toggle('hidden', !filled);
    }
}

// =====================
// One Day Trip Tab Toggle
// =====================
function toggleDayTripTab() {
    const daysVal = parseInt(document.getElementById('tourDurationDays').value) || 0;
    const daytripTab = document.getElementById('daytripTabBtn');
    const nightsField = document.getElementById('tourDurationNights');
    const nightsWrapper = document.getElementById('nightsFieldWrapper');

    if (daytripTab) {
        daytripTab.style.display = daysVal === 1 ? '' : 'none';
    }

    // Auto-fill nights = 0 and hide the nights field when days = 1
    if (daysVal === 1) {
        nightsField.value = 0;
        if (nightsWrapper) nightsWrapper.style.display = 'none';
    } else {
        if (nightsWrapper) nightsWrapper.style.display = '';
    }

    // If switching away from 1-day and daytrip tab is active, switch to basic
    if (daysVal !== 1) {
        const activeDaytripPanel = document.querySelector('.tab-panel[data-tab="daytrip"]:not(.hidden)');
        if (activeDaytripPanel) {
            switchTab('basic');
        }
    }
}

// =====================
// Itinerary Builder V2
// =====================
function addItineraryDay(e, existingData = null) {
    const builder = document.getElementById('itineraryBuilder');
    const dayCount = builder.querySelectorAll('.itinerary-day-v2').length + 1;
    const title = existingData ? (existingData.title || '') : '';
    const time = existingData ? (existingData.time || '') : '';
    const description = existingData ? (existingData.description || '') : '';
    const activities = existingData && Array.isArray(existingData.activities) ? existingData.activities.join(', ') : '';

    const dayDiv = document.createElement('div');
    dayDiv.className = 'itinerary-day-v2';
    dayDiv.innerHTML = `
        <div class="itinerary-day-bar" onclick="toggleItineraryDay(this)">
            <span class="itinerary-day-badge">${dayCount}</span>
            <span class="itinerary-day-bar-title">
                <span class="day-title-text">${title || 'Day ' + dayCount}</span>
                <span class="day-subtitle">${time}</span>
            </span>
            <button type="button" class="itinerary-collapse-btn" title="Toggle"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
            <button type="button" class="itinerary-remove-btn" onclick="event.stopPropagation(); removeItineraryDay(this)" title="Remove day"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
        <div class="itinerary-day-content">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="field-label">Title</label>
                    <input type="text" class="itinerary-title field-input" value="${title}" placeholder="e.g. Arrival & City Tour" oninput="updateItineraryBarTitle(this)">
                </div>
                <div>
                    <label class="field-label">Time</label>
                    <input type="text" class="itinerary-time field-input" value="${time}" placeholder="e.g. 08:00 - 17:00" oninput="updateItineraryBarTitle(this)">
                </div>
            </div>
            <div class="mb-3">
                <label class="field-label">Description</label>
                <textarea class="itinerary-description field-input resize-y" rows="2" placeholder="Describe the day's activities...">${description}</textarea>
            </div>
            <div>
                <label class="field-label">Activities <span class="text-gray-300 font-normal text-xs">(comma-separated)</span></label>
                <input type="text" class="itinerary-activities field-input" value="${activities}" placeholder="Temple visit, Lunch at local restaurant, Beach">
            </div>
        </div>
    `;

    builder.appendChild(dayDiv);
    updateItineraryCount();
    updateTabDots();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleItineraryDay(bar) {
    const content = bar.nextElementSibling;
    const collapseBtn = bar.querySelector('.itinerary-collapse-btn');
    content.classList.toggle('collapsed');
    const isCollapsed = content.classList.contains('collapsed');
    collapseBtn.innerHTML = `<i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="w-3.5 h-3.5"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateItineraryBarTitle(input) {
    const dayV2 = input.closest('.itinerary-day-v2');
    const titleInput = dayV2.querySelector('.itinerary-title');
    const timeInput = dayV2.querySelector('.itinerary-time');
    const barTitle = dayV2.querySelector('.day-title-text');
    const barSubtitle = dayV2.querySelector('.day-subtitle');
    const dayNum = dayV2.querySelector('.itinerary-day-badge').textContent;

    barTitle.textContent = titleInput.value || ('Day ' + dayNum);
    barSubtitle.textContent = timeInput.value || '';
}

function removeItineraryDay(btn) {
    btn.closest('.itinerary-day-v2').remove();
    renumberItineraryDays();
    updateItineraryCount();
    updateTabDots();
}

function renumberItineraryDays() {
    document.querySelectorAll('.itinerary-day-v2').forEach((day, index) => {
        const badge = day.querySelector('.itinerary-day-badge');
        badge.textContent = index + 1;
        const titleInput = day.querySelector('.itinerary-title');
        const barTitle = day.querySelector('.day-title-text');
        if (!titleInput.value) {
            barTitle.textContent = 'Day ' + (index + 1);
        }
    });
}

function updateItineraryCount() {
    const count = document.querySelectorAll('.itinerary-day-v2').length;
    const el = document.getElementById('itineraryDayCount');
    if (el) el.textContent = count + (count === 1 ? ' day' : ' days');
}

function clearItineraryBuilder() {
    document.getElementById('itineraryBuilder').innerHTML = '';
    updateItineraryCount();
}

function getItineraryData() {
    const days = document.querySelectorAll('.itinerary-day-v2');
    const itinerary = [];

    days.forEach((day, index) => {
        const title = day.querySelector('.itinerary-title').value.trim();
        const time = day.querySelector('.itinerary-time').value.trim();
        const description = day.querySelector('.itinerary-description').value.trim();
        const activitiesStr = day.querySelector('.itinerary-activities').value.trim();
        const activities = activitiesStr ? activitiesStr.split(',').map(a => a.trim()).filter(a => a) : [];

        itinerary.push({
            day: index + 1,
            title: title || `Day ${index + 1}`,
            time: time,
            description: description,
            activities: activities
        });
    });

    return itinerary;
}

// =====================
// Autocomplete Destination
// =====================
async function fetchDestinations() {
    if (cachedDestinations) return cachedDestinations;
    try {
        const response = await fetch(`${API_BASE}/destinations.php`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            cachedDestinations = data.data || [];
            return cachedDestinations;
        }
    } catch (e) {
        console.warn('Failed to fetch destinations:', e);
    }
    return [];
}

// Invalidate cache when tours/hotels are saved
function invalidateDestinationCache() {
    cachedDestinations = null;
}

function setupAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Wrap in relative container
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    wrapper.appendChild(dropdown);

    let activeIndex = -1;

    input.addEventListener('focus', async () => {
        const destinations = await fetchDestinations();
        showSuggestions(input, dropdown, destinations, activeIndex);
    });

    input.addEventListener('input', async () => {
        activeIndex = -1;
        const destinations = await fetchDestinations();
        showSuggestions(input, dropdown, destinations, activeIndex);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (!items.length || dropdown.style.display === 'none') return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            highlightItem(items, activeIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            highlightItem(items, activeIndex);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            input.value = items[activeIndex].textContent;
            dropdown.style.display = 'none';
            activeIndex = -1;
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
            activeIndex = -1;
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
            activeIndex = -1;
        }
    });
}

function showSuggestions(input, dropdown, destinations, activeIndex) {
    const query = input.value.toLowerCase().trim();
    const filtered = destinations.filter(d =>
        d.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = filtered.map((dest, i) => {
        // Highlight matching part
        const idx = dest.toLowerCase().indexOf(query);
        let html = dest;
        if (query && idx >= 0) {
            html = dest.substring(0, idx)
                + '<strong>' + dest.substring(idx, idx + query.length) + '</strong>'
                + dest.substring(idx + query.length);
        }
        return `<div class="autocomplete-item${i === activeIndex ? ' active' : ''}" data-index="${i}">${html}</div>`;
    }).join('');

    dropdown.style.display = 'block';

    // Click handler for items
    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            input.value = destinations.find(d =>
                d.toLowerCase() === item.textContent.toLowerCase()
            ) || item.textContent;
            dropdown.style.display = 'none';
        });
    });
}

function highlightItem(items, index) {
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
    }
}
