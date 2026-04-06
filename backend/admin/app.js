// API Configuration
const API_BASE = '/backend/api';

// State Management
let currentUser = null;
let tours = [];
let bookings = [];
let galleryUrls = []; // Uploaded gallery image URLs

// Hotel state
let hotels = [];
let hotelGalleryImages = []; // {image_url, category, caption, sort_order}

// Autocomplete state
let cachedDestinations = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    updateCurrentDate();
    setupAutocomplete('tourDestination');
    setupAutocomplete('hotelDestination');
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Tour Actions
    document.getElementById('addTourBtn').addEventListener('click', () => openTourModal());
    document.getElementById('tourForm').addEventListener('submit', handleTourSubmit);

    // Modal Close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('tourModal'));
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', loadBookings);
    document.getElementById('searchBookings').addEventListener('input', debounce(loadBookings, 500));

    // Hotel Actions
    document.getElementById('addHotelBtn').addEventListener('click', () => openHotelModal());
    document.getElementById('hotelForm').addEventListener('submit', handleHotelSubmit);
    document.getElementById('addRoomTypeBtn').addEventListener('click', () => addRoomType());

    // Hotel modal close
    document.querySelectorAll('.hotel-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('hotelModal'));
    });

    // Hotel tab switching
    document.querySelectorAll('#hotelModalTabBar .hotel-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchHotelTab(btn.dataset.tab));
    });

    // Hotel image category - show/hide custom input
    document.getElementById('hotelImageCategory').addEventListener('change', function() {
        document.getElementById('hotelCustomCategoryWrapper').style.display =
            this.value === '__custom__' ? '' : 'none';
    });

    // Hotel image uploads
    setupDropzone('hotelMainImageDropzone', 'hotelMainImageFile', handleHotelMainImageUpload);
    setupDropzone('hotelGalleryDropzone', 'hotelGalleryFiles', handleHotelGalleryUpload);

    // User Actions
    document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);

    // User modal close
    document.querySelectorAll('.user-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('userModal'));
    });

    // Itinerary builder
    document.getElementById('addItineraryDay').addEventListener('click', addItineraryDay);

    // Image uploads
    setupDropzone('mainImageDropzone', 'mainImageFile', handleMainImageUpload);
    setupDropzone('galleryDropzone', 'galleryFiles', handleGalleryUpload);

    // Tab switching
    document.querySelectorAll('#modalTabBar .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // One Day Trip tab toggle (show when duration_days == 1)
    document.getElementById('tourDurationDays').addEventListener('input', toggleDayTripTab);
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

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload.php`, {
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

// Main Image Upload
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

// Gallery Upload
async function handleGalleryUpload(files) {
    if (galleryUrls.length + files.length > 10) {
        showToast('Maximum 10 gallery images allowed.', 'warning');
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
        <div class="img-preview-item gallery-item">
            <img src="${url}" alt="Gallery ${index + 1}">
            <button type="button" class="img-remove-btn" onclick="removeGalleryImage(event, ${index})">&times;</button>
            <span class="img-index">${index + 1}</span>
        </div>
    `).join('');

    // Update hidden input
    document.getElementById('tourGalleryImages').value = JSON.stringify(galleryUrls);
    updateGalleryPlaceholder();
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
    if (countEl) countEl.textContent = galleryUrls.length + ' / 10 images';
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

// =====================
// UI Functions
// =====================
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';

    document.getElementById('adminName').textContent = currentUser.full_name || currentUser.username;
    document.getElementById('adminRole').textContent = currentUser.role === 'admin' ? 'Admin' : 'Staff';

    // Show/hide Users nav based on role
    const usersNav = document.querySelector('.nav-item[data-page="users"]');
    if (usersNav) {
        usersNav.style.display = currentUser.role === 'admin' ? '' : 'none';
    }

    loadTours();
}

function handleNavigation(e) {
    e.preventDefault();

    if (e.currentTarget.classList.contains('disabled')) return;

    const page = e.currentTarget.dataset.page;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}Page`).classList.add('active');

    const titles = {
        'overview': 'Dashboard Overview',
        'tours': 'Tour Management',
        'hotels': 'Hotel Management',
        'bookings': 'Booking Management',
        'users': 'User Management',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    if (page === 'overview') loadOverview();
    if (page === 'tours') loadTours();
    if (page === 'hotels') loadHotels();
    if (page === 'bookings') loadBookings();
    if (page === 'users') loadUsers();
}

// =====================
// Overview
// =====================
async function loadOverview() {
    try {
        const statsResponse = await fetch(`${API_BASE}/bookings.php?stats=1`, {
            credentials: 'include'
        });
        const statsData = await statsResponse.json();

        if (statsData.success) {
            const stats = statsData.data;
            document.getElementById('totalBookings').textContent = stats.total_bookings || 0;
            document.getElementById('pendingBookings').textContent = stats.pending_bookings || 0;
            document.getElementById('confirmedBookings').textContent = stats.confirmed_bookings || 0;
            document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenue || 0);
        }

        const bookingsResponse = await fetch(`${API_BASE}/bookings.php?limit=5`, {
            credentials: 'include'
        });
        const bookingsData = await bookingsResponse.json();

        if (bookingsData.success) {
            displayRecentBookings(bookingsData.data.items || []);
        }
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

function displayRecentBookings(bookings) {
    const container = document.getElementById('recentBookings');

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No recent bookings</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Tour</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.booking_reference}</td>
                        <td>${booking.customer_name}</td>
                        <td>${booking.tour_name}</td>
                        <td>${formatDate(booking.travel_date)}</td>
                        <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
                        <td>${formatCurrency(booking.total_price)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// =====================
// Tours
// =====================
async function loadTours() {
    try {
        const response = await fetch(`${API_BASE}/tours.php?active=`, {
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
        container.innerHTML = '<p>No tours found. Click "+ Add New Tour" to create one.</p>';
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
        title.textContent = 'Edit Tour';
        if (subtitle) subtitle.textContent = 'Update the tour package details';
        const tour = tours.find(t => t.id == tourId);
        if (tour) {
            document.getElementById('tourId').value = tour.id;
            document.getElementById('tourName').value = tour.name || '';
            document.getElementById('tourDestination').value = tour.destination || '';
            document.getElementById('tourAdultPrice').value = tour.adult_price || '';
            document.getElementById('tourChildPrice').value = tour.child_price || '';
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
        title.textContent = 'Add New Tour';
        if (subtitle) subtitle.textContent = 'Fill in the details to create a tour package';
        document.getElementById('tourId').value = '';
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
        type: 'inbound',
        adult_price: adultPrice,
        child_price: childPrice,
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
        important_notes: document.getElementById('tourImportantNotes').value || null
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
// Hotels
// =====================
async function loadHotels() {
    try {
        const response = await fetch(`${API_BASE}/hotels.php?active=`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            hotels = data.data.items || [];
            displayHotels(hotels);
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

function displayHotels(hotels) {
    const container = document.getElementById('hotelsTable');

    if (!hotels || hotels.length === 0) {
        container.innerHTML = '<p>No hotels found. Click "+ Add New Hotel" to create one.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Destination</th>
                    <th>Stars</th>
                    <th>Rooms</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${hotels.map(hotel => `
                    <tr>
                        <td>
                            ${hotel.main_image
                                ? `<img src="${hotel.main_image}" alt="${hotel.name}" class="tour-thumb" onerror="this.style.display='none'">`
                                : '<span class="no-image">No img</span>'}
                        </td>
                        <td><strong>${hotel.name}</strong></td>
                        <td>${hotel.destination}</td>
                        <td>${'★'.repeat(hotel.stars)}${'☆'.repeat(5 - hotel.stars)}</td>
                        <td>${hotel.room_types ? hotel.room_types.length : 0} types</td>
                        <td>
                            ${hotel.is_featured == 1 ? '<span class="badge badge-confirmed">Featured</span> ' : ''}
                            ${hotel.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editHotel(${hotel.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteHotel(${hotel.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openHotelModal(hotelId = null) {
    const modal = document.getElementById('hotelModal');
    const form = document.getElementById('hotelForm');

    form.reset();
    hotelGalleryImages = [];
    clearRoomTypeBuilder();

    switchHotelTab('h-basic');

    // Reset image areas
    setHotelMainImagePreview('');
    renderHotelGalleryGrouped();
    updateRoomTypeCategoryOptions();

    const title = document.getElementById('hotelModalTitle');
    const subtitle = document.getElementById('hotelModalSubtitle');

    if (hotelId) {
        title.textContent = 'Edit Hotel';
        subtitle.textContent = 'Update the hotel property details';
        const hotel = hotels.find(h => h.id == hotelId);
        if (hotel) {
            document.getElementById('hotelId').value = hotel.id;
            document.getElementById('hotelName').value = hotel.name || '';
            document.getElementById('hotelDestination').value = hotel.destination || '';
            document.getElementById('hotelStars').value = hotel.stars || 4;
            document.getElementById('hotelDescription').value = hotel.description || '';
            document.getElementById('hotelShortDescription').value = hotel.short_description || '';
            document.getElementById('hotelAddress').value = hotel.address || '';
            document.getElementById('hotelPhone').value = hotel.contact_phone || '';
            document.getElementById('hotelEmail').value = hotel.contact_email || '';
            document.getElementById('hotelWebsite').value = hotel.website || '';
            document.getElementById('hotelCheckIn').value = hotel.check_in_time || '';
            document.getElementById('hotelCheckOut').value = hotel.check_out_time || '';
            document.getElementById('hotelRating').value = hotel.rating || 0;
            document.getElementById('hotelReviewCount').value = hotel.review_count || 0;

            // Amenities
            const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
            document.getElementById('hotelAmenities').value = amenities.join('\n');

            // Visibility
            document.getElementById('hotelFeatured').checked = hotel.is_featured == 1;
            document.getElementById('hotelActive').checked = hotel.is_active == 1;

            // Main image
            setHotelMainImagePreview(hotel.main_image || '');

            // Gallery images
            if (Array.isArray(hotel.images)) {
                hotelGalleryImages = hotel.images.map(img => ({
                    image_url: img.image_url,
                    category: img.category || 'Other',
                    caption: img.caption || '',
                    sort_order: img.sort_order || 0
                }));
            }
            renderHotelGalleryGrouped();

            // Room types
            if (Array.isArray(hotel.room_types)) {
                hotel.room_types.forEach(room => addRoomType(room));
            }
            updateRoomTypeCategoryOptions();
        }
    } else {
        title.textContent = 'Add New Hotel';
        subtitle.textContent = 'Fill in the details to add a hotel property';
        document.getElementById('hotelId').value = '';
        document.getElementById('hotelActive').checked = true;
    }

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function handleHotelSubmit(e) {
    e.preventDefault();

    const requiredFields = [
        { id: 'hotelName', tab: 'h-basic', label: 'Hotel Name' },
        { id: 'hotelDestination', tab: 'h-basic', label: 'Destination' },
        { id: 'hotelDescription', tab: 'h-basic', label: 'Full Description' },
    ];

    for (const field of requiredFields) {
        const el = document.getElementById(field.id);
        if (!el.value || el.value.trim() === '') {
            switchHotelTab(field.tab);
            el.focus();
            showToast(`Please fill in "${field.label}"`, 'warning');
            return;
        }
    }

    const hotelId = document.getElementById('hotelId').value;

    const hotelData = {
        name: document.getElementById('hotelName').value,
        destination: document.getElementById('hotelDestination').value,
        stars: parseInt(document.getElementById('hotelStars').value),
        description: document.getElementById('hotelDescription').value,
        short_description: document.getElementById('hotelShortDescription').value,
        address: document.getElementById('hotelAddress').value || null,
        contact_phone: document.getElementById('hotelPhone').value || null,
        contact_email: document.getElementById('hotelEmail').value || null,
        website: document.getElementById('hotelWebsite').value || null,
        check_in_time: document.getElementById('hotelCheckIn').value || null,
        check_out_time: document.getElementById('hotelCheckOut').value || null,
        main_image: document.getElementById('hotelMainImage').value,
        rating: parseFloat(document.getElementById('hotelRating').value) || 0,
        review_count: parseInt(document.getElementById('hotelReviewCount').value) || 0,
        amenities: document.getElementById('hotelAmenities').value
            .split('\n').map(a => a.trim()).filter(a => a),
        is_featured: document.getElementById('hotelFeatured').checked ? 1 : 0,
        is_active: document.getElementById('hotelActive').checked ? 1 : 0,
        images: hotelGalleryImages,
        room_types: getRoomTypeData()
    };

    try {
        const url = hotelId ? `${API_BASE}/hotels.php?id=${hotelId}` : `${API_BASE}/hotels.php`;
        const method = hotelId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(hotelData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal('hotelModal');
            loadHotels();
            invalidateDestinationCache();
            showToast(hotelId ? 'Hotel updated successfully!' : 'Hotel created successfully!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error saving hotel:', error);
        showToast('Error saving hotel. Please try again.', 'error');
    }
}

async function editHotel(id) {
    openHotelModal(id);
}

async function deleteHotel(id) {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
        const response = await fetch(`${API_BASE}/hotels.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            loadHotels();
            showToast('Hotel deleted successfully!', 'success');
        } else {
            showToast('Error deleting hotel: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        showToast('Error deleting hotel', 'error');
    }
}

// =====================
// Hotel Tab Switching
// =====================
function switchHotelTab(tabName) {
    document.querySelectorAll('#hotelModalTabBar .hotel-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.className = 'hotel-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy';
        } else {
            btn.className = 'hotel-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600';
        }
    });

    document.querySelectorAll('.hotel-tab-panel').forEach(panel => {
        if (panel.dataset.tab === tabName) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

// =====================
// Hotel Main Image Upload
// =====================
async function handleHotelMainImageUpload(files) {
    const file = files[0];
    const preview = document.getElementById('hotelMainImagePreview');
    const placeholder = document.getElementById('hotelMainImagePlaceholder');

    placeholder.style.display = 'none';
    preview.innerHTML = '<div class="upload-loading"><div class="spinner"></div><span>Uploading...</span></div>';

    try {
        const data = await uploadFile(file);

        if (data.success) {
            const url = data.data.url;
            document.getElementById('hotelMainImage').value = url;
            preview.innerHTML = `
                <div class="img-preview-item main-preview">
                    <img src="${url}" alt="Main image">
                    <button type="button" class="img-remove-btn" onclick="removeHotelMainImage(event)">&times;</button>
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

function removeHotelMainImage(e) {
    e.stopPropagation();
    document.getElementById('hotelMainImage').value = '';
    document.getElementById('hotelMainImagePreview').innerHTML = '';
    document.getElementById('hotelMainImagePlaceholder').style.display = '';
}

function setHotelMainImagePreview(url) {
    const preview = document.getElementById('hotelMainImagePreview');
    const placeholder = document.getElementById('hotelMainImagePlaceholder');

    if (url) {
        document.getElementById('hotelMainImage').value = url;
        preview.innerHTML = `
            <div class="img-preview-item main-preview">
                <img src="${url}" alt="Main image">
                <button type="button" class="img-remove-btn" onclick="removeHotelMainImage(event)">&times;</button>
            </div>`;
        placeholder.style.display = 'none';
    } else {
        document.getElementById('hotelMainImage').value = '';
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

// =====================
// Hotel Gallery Upload (by category)
// =====================
const PRESET_CATEGORIES = ['Exterior', 'Lobby', 'Bedroom', 'Bathroom', 'Restaurant', 'Pool', 'Spa', 'Gym', 'View'];
let selectedGalleryIndexes = new Set();

function getGalleryCategoryOptions(currentValue) {
    // Build category options: presets + room types + any custom categories already used
    const roomNames = [];
    document.querySelectorAll('.room-type-item .room-name').forEach(input => {
        const name = input.value.trim();
        if (name) roomNames.push(name);
    });

    // Collect custom categories already in use
    const usedCategories = new Set(hotelGalleryImages.map(img => img.category));
    const customUsed = [...usedCategories].filter(c => c && c !== 'Uncategorized' && !PRESET_CATEGORIES.includes(c) && !roomNames.includes(c));

    let html = '<option value="Uncategorized"' + (currentValue === 'Uncategorized' ? ' selected' : '') + '>Uncategorized</option>';
    html += '<optgroup label="General">';
    PRESET_CATEGORIES.forEach(cat => {
        html += `<option value="${cat}"${currentValue === cat ? ' selected' : ''}>${cat}</option>`;
    });
    html += '</optgroup>';

    if (roomNames.length > 0) {
        html += '<optgroup label="Room Types">';
        roomNames.forEach(name => {
            html += `<option value="${name}"${currentValue === name ? ' selected' : ''}>${name}</option>`;
        });
        html += '</optgroup>';
    }

    if (customUsed.length > 0) {
        html += '<optgroup label="Custom">';
        customUsed.forEach(cat => {
            html += `<option value="${cat}"${currentValue === cat ? ' selected' : ''}>${cat}</option>`;
        });
        html += '</optgroup>';
    }

    html += '<option value="__custom__">+ New category...</option>';
    return html;
}

async function handleHotelGalleryUpload(files) {
    const categorySelect = document.getElementById('hotelImageCategory');
    let category = categorySelect.value;

    if (category === '__custom__') {
        category = document.getElementById('hotelCustomCategory').value.trim();
        if (!category) {
            category = 'Uncategorized';
        }
    }

    // Show loading in gallery area
    const container = document.getElementById('hotelGalleryGrouped');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'upload-loading';
    loadingDiv.innerHTML = `<div class="spinner"></div><span>Uploading ${files.length} image${files.length > 1 ? 's' : ''}...</span>`;
    container.prepend(loadingDiv);

    try {
        const data = await uploadFiles(files);

        loadingDiv.remove();

        if (data.success && data.data.urls) {
            data.data.urls.forEach(url => {
                hotelGalleryImages.push({
                    image_url: url,
                    category: category,
                    caption: '',
                    sort_order: hotelGalleryImages.length
                });
            });
            renderHotelGalleryGrouped();
        }

        if (data.data.errors && data.data.errors.length > 0) {
            showToast('Some uploads failed: ' + data.data.errors.join(', '), 'warning');
        }
    } catch (error) {
        loadingDiv.remove();
        console.error('Gallery upload error:', error);
        showToast('Upload error. Please try again.', 'error');
    }
}

function renderHotelGalleryGrouped() {
    const container = document.getElementById('hotelGalleryGrouped');
    selectedGalleryIndexes.clear();
    updateBulkBar();

    if (hotelGalleryImages.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 text-center py-6">No gallery images yet. Upload photos above.</p>';
    } else {
        // Group images by category
        const groups = {};
        hotelGalleryImages.forEach((img, index) => {
            const cat = img.category || 'Uncategorized';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ ...img, _index: index });
        });

        // Sort: Uncategorized first, then alphabetical
        const sortedEntries = Object.entries(groups).sort((a, b) => {
            if (a[0] === 'Uncategorized') return -1;
            if (b[0] === 'Uncategorized') return 1;
            return a[0].localeCompare(b[0]);
        });

        container.innerHTML = sortedEntries.map(([category, images]) => {
            const groupIndexes = images.map(img => img._index);
            return `
            <div class="border border-gray-100 rounded-xl overflow-hidden ${category === 'Uncategorized' ? 'border-amber-200 bg-amber-50/30' : ''}">
                <div class="bg-gray-50 px-4 py-2.5 flex items-center justify-between ${category === 'Uncategorized' ? 'bg-amber-50' : ''}">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="gallery-group-checkbox" onchange="toggleGalleryGroup(this, [${groupIndexes.join(',')}])" />
                        <span class="text-sm font-semibold ${category === 'Uncategorized' ? 'text-amber-700' : 'text-navy'}">${category === 'Uncategorized' ? 'Uncategorized' : category}</span>
                    </label>
                    <span class="text-xs text-gray-400">${images.length} photo${images.length > 1 ? 's' : ''}</span>
                </div>
                <div class="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    ${images.map(img => `
                        <div class="gallery-thumb relative group cursor-pointer rounded-lg overflow-hidden border-2 ${selectedGalleryIndexes.has(img._index) ? 'border-navy' : 'border-transparent'}" onclick="toggleGallerySelect(${img._index}, event)">
                            <img src="${img.image_url}" alt="${img.caption || category}" class="w-full h-24 object-cover">
                            <div class="absolute top-1.5 left-1.5">
                                <input type="checkbox" class="gallery-checkbox" data-index="${img._index}" ${selectedGalleryIndexes.has(img._index) ? 'checked' : ''} onclick="event.stopPropagation(); toggleGallerySelect(${img._index}, event)" />
                            </div>
                            <button type="button" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation(); removeHotelGalleryImage(event, ${img._index})">&times;</button>
                            ${img.caption ? `<div class="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5 text-white text-[10px] truncate">${img.caption}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('');
    }

    const countEl = document.getElementById('hotelGalleryCount');
    if (countEl) countEl.textContent = hotelGalleryImages.length + ' images';
}

// =====================
// Gallery Bulk Selection
// =====================
function toggleGallerySelect(index, e) {
    if (e && e.target.tagName === 'INPUT') {
        // Checkbox click — toggle based on checked state
        if (e.target.checked) {
            selectedGalleryIndexes.add(index);
        } else {
            selectedGalleryIndexes.delete(index);
        }
    } else {
        // Thumbnail click — toggle
        if (selectedGalleryIndexes.has(index)) {
            selectedGalleryIndexes.delete(index);
        } else {
            selectedGalleryIndexes.add(index);
        }
    }
    // Update visual state without full re-render
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        const cb = thumb.querySelector('.gallery-checkbox');
        if (!cb) return;
        const idx = parseInt(cb.dataset.index);
        const isSelected = selectedGalleryIndexes.has(idx);
        cb.checked = isSelected;
        thumb.classList.toggle('border-navy', isSelected);
        thumb.classList.toggle('border-transparent', !isSelected);
    });
    updateBulkBar();
}

function toggleGalleryGroup(checkbox, indexes) {
    if (checkbox.checked) {
        indexes.forEach(i => selectedGalleryIndexes.add(i));
    } else {
        indexes.forEach(i => selectedGalleryIndexes.delete(i));
    }
    // Update visual state
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        const cb = thumb.querySelector('.gallery-checkbox');
        if (!cb) return;
        const idx = parseInt(cb.dataset.index);
        const isSelected = selectedGalleryIndexes.has(idx);
        cb.checked = isSelected;
        thumb.classList.toggle('border-navy', isSelected);
        thumb.classList.toggle('border-transparent', !isSelected);
    });
    updateBulkBar();
}

function updateBulkBar() {
    let bar = document.getElementById('galleryBulkBar');
    const count = selectedGalleryIndexes.size;

    if (count === 0) {
        if (bar) bar.style.display = 'none';
        return;
    }

    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'galleryBulkBar';
        bar.className = 'gallery-bulk-bar';
        const section = document.getElementById('hotelGalleryGrouped').parentElement;
        section.insertBefore(bar, document.getElementById('hotelGalleryGrouped'));
    }

    bar.style.display = '';
    bar.innerHTML = `
        <div class="flex items-center gap-3 flex-wrap">
            <span class="text-sm font-semibold text-navy">${count} selected</span>
            <select id="bulkCategorySelect" class="field-input !py-1.5 !text-xs !w-auto">
                ${getGalleryCategoryOptions('')}
            </select>
            <button type="button" class="px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 transition-all" onclick="applyBulkCategory()">Apply Category</button>
            <button type="button" class="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-all" onclick="clearGallerySelection()">Deselect All</button>
            <button type="button" class="px-4 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-all ml-auto" onclick="bulkDeleteGalleryImages()">Delete Selected</button>
        </div>
    `;
}

function applyBulkCategory() {
    const select = document.getElementById('bulkCategorySelect');
    let category = select.value;

    if (category === '__custom__') {
        const custom = prompt('Enter new category name:');
        if (!custom || !custom.trim()) return;
        category = custom.trim();
    }

    if (!category || category === 'Uncategorized') {
        category = 'Uncategorized';
    }

    selectedGalleryIndexes.forEach(idx => {
        hotelGalleryImages[idx].category = category;
    });

    selectedGalleryIndexes.clear();
    renderHotelGalleryGrouped();
    showToast(`Category updated for ${selectedGalleryIndexes.size || 'selected'} images`, 'success');
}

function clearGallerySelection() {
    selectedGalleryIndexes.clear();
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        const cb = thumb.querySelector('.gallery-checkbox');
        if (cb) cb.checked = false;
        thumb.classList.remove('border-navy');
        thumb.classList.add('border-transparent');
    });
    document.querySelectorAll('.gallery-group-checkbox').forEach(cb => cb.checked = false);
    updateBulkBar();
}

function bulkDeleteGalleryImages() {
    const count = selectedGalleryIndexes.size;
    if (!confirm(`Delete ${count} selected image${count > 1 ? 's' : ''}?`)) return;

    // Delete from highest index first to avoid shifting
    const sorted = [...selectedGalleryIndexes].sort((a, b) => b - a);
    sorted.forEach(idx => hotelGalleryImages.splice(idx, 1));

    selectedGalleryIndexes.clear();
    renderHotelGalleryGrouped();
    showToast(`${count} image${count > 1 ? 's' : ''} deleted`, 'success');
}

function changeHotelImageCategory(index, newCategory) {
    if (newCategory === '__custom__') {
        const custom = prompt('Enter new category name:');
        if (custom && custom.trim()) {
            hotelGalleryImages[index].category = custom.trim();
        }
    } else {
        hotelGalleryImages[index].category = newCategory;
    }
    renderHotelGalleryGrouped();
}

function changeHotelImageCaption(index, caption) {
    hotelGalleryImages[index].caption = caption;
}

function removeHotelGalleryImage(e, index) {
    e.stopPropagation();
    hotelGalleryImages.splice(index, 1);
    renderHotelGalleryGrouped();
}

// =====================
// Hotel Room Types Builder
// =====================
function addRoomType(existingData = null) {
    const builder = document.getElementById('roomTypeBuilder');
    const count = builder.querySelectorAll('.room-type-item').length + 1;

    const name = existingData ? (existingData.name || '') : '';
    const description = existingData ? (existingData.description || '') : '';
    const maxGuests = existingData ? (existingData.max_guests || 2) : 2;
    const bedType = existingData ? (existingData.bed_type || '') : '';
    const roomSize = existingData ? (existingData.room_size || '') : '';
    const amenities = existingData && Array.isArray(existingData.amenities) ? existingData.amenities.join(', ') : '';

    const div = document.createElement('div');
    div.className = 'room-type-item';
    div.innerHTML = `
        <div class="itinerary-day-bar" onclick="toggleRoomType(this)">
            <span class="itinerary-day-badge">${count}</span>
            <span class="itinerary-day-bar-title">
                <span class="room-title-text">${name || 'Room Type ' + count}</span>
                <span class="day-subtitle">${bedType ? bedType + ' Bed' : ''}</span>
            </span>
            <button type="button" class="itinerary-collapse-btn" title="Toggle"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
            <button type="button" class="itinerary-remove-btn" onclick="event.stopPropagation(); removeRoomType(this)" title="Remove"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
        <div class="itinerary-day-content">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="field-label">Room Name <span class="text-red-400">*</span></label>
                    <input type="text" class="room-name field-input" value="${name}" placeholder="e.g. Deluxe Ocean View" oninput="updateRoomBarTitle(this)">
                </div>
                <div>
                    <label class="field-label">Bed Type</label>
                    <select class="room-bed-type field-input" oninput="updateRoomBarTitle(this)">
                        <option value="">Select...</option>
                        <option value="King" ${bedType === 'King' ? 'selected' : ''}>King</option>
                        <option value="Queen" ${bedType === 'Queen' ? 'selected' : ''}>Queen</option>
                        <option value="Twin" ${bedType === 'Twin' ? 'selected' : ''}>Twin</option>
                        <option value="Double" ${bedType === 'Double' ? 'selected' : ''}>Double</option>
                        <option value="Single" ${bedType === 'Single' ? 'selected' : ''}>Single</option>
                        <option value="Bunk" ${bedType === 'Bunk' ? 'selected' : ''}>Bunk</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="field-label">Max Guests</label>
                    <input type="number" class="room-max-guests field-input" min="1" value="${maxGuests}" placeholder="2">
                </div>
                <div>
                    <label class="field-label">Room Size (sqm)</label>
                    <input type="number" class="room-size field-input" min="0" step="0.1" value="${roomSize}" placeholder="32">
                </div>
            </div>
            <div class="mb-3">
                <label class="field-label">Description</label>
                <textarea class="room-description field-input resize-y" rows="2" placeholder="Describe this room type...">${description}</textarea>
            </div>
            <div>
                <label class="field-label">Amenities <span class="text-gray-300 font-normal text-xs">(comma-separated)</span></label>
                <input type="text" class="room-amenities field-input" value="${amenities}" placeholder="WiFi, TV, Minibar, Balcony, Sea View">
            </div>
        </div>
    `;

    builder.appendChild(div);
    updateRoomTypeCount();
    updateRoomTypeCategoryOptions();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleRoomType(bar) {
    const content = bar.nextElementSibling;
    const collapseBtn = bar.querySelector('.itinerary-collapse-btn');
    content.classList.toggle('collapsed');
    const isCollapsed = content.classList.contains('collapsed');
    collapseBtn.innerHTML = `<i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="w-3.5 h-3.5"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateRoomBarTitle(input) {
    const item = input.closest('.room-type-item');
    const nameInput = item.querySelector('.room-name');
    const bedTypeSelect = item.querySelector('.room-bed-type');
    const barTitle = item.querySelector('.room-title-text');
    const barSubtitle = item.querySelector('.day-subtitle');
    const num = item.querySelector('.itinerary-day-badge').textContent;

    barTitle.textContent = nameInput.value || ('Room Type ' + num);
    barSubtitle.textContent = bedTypeSelect.value ? bedTypeSelect.value + ' Bed' : '';

    updateRoomTypeCategoryOptions();
}

function removeRoomType(btn) {
    btn.closest('.room-type-item').remove();
    renumberRoomTypes();
    updateRoomTypeCount();
    updateRoomTypeCategoryOptions();
}

function renumberRoomTypes() {
    document.querySelectorAll('.room-type-item').forEach((item, index) => {
        const badge = item.querySelector('.itinerary-day-badge');
        badge.textContent = index + 1;
        const nameInput = item.querySelector('.room-name');
        const barTitle = item.querySelector('.room-title-text');
        if (!nameInput.value) {
            barTitle.textContent = 'Room Type ' + (index + 1);
        }
    });
}

function updateRoomTypeCount() {
    const count = document.querySelectorAll('.room-type-item').length;
    const el = document.getElementById('roomTypeCount');
    if (el) el.textContent = count + ' room type' + (count !== 1 ? 's' : '');
}

function clearRoomTypeBuilder() {
    document.getElementById('roomTypeBuilder').innerHTML = '';
    updateRoomTypeCount();
}

function getRoomTypeData() {
    const items = document.querySelectorAll('.room-type-item');
    const roomTypes = [];

    items.forEach((item, index) => {
        const name = item.querySelector('.room-name').value.trim();
        if (!name) return;

        const amenitiesStr = item.querySelector('.room-amenities').value.trim();
        const amenities = amenitiesStr ? amenitiesStr.split(',').map(a => a.trim()).filter(a => a) : [];

        roomTypes.push({
            name: name,
            description: item.querySelector('.room-description').value.trim() || null,
            max_guests: parseInt(item.querySelector('.room-max-guests').value) || 2,
            bed_type: item.querySelector('.room-bed-type').value || null,
            room_size: parseFloat(item.querySelector('.room-size').value) || null,
            amenities: amenities,
            sort_order: index
        });
    });

    return roomTypes;
}

// Update the category dropdown in Media tab with room type names
function updateRoomTypeCategoryOptions() {
    const optgroup = document.getElementById('hotelImageCategoryRooms');
    if (!optgroup) return;

    // Get current room type names
    const roomNames = [];
    document.querySelectorAll('.room-type-item .room-name').forEach(input => {
        const name = input.value.trim();
        if (name) roomNames.push(name);
    });

    // Update optgroup
    optgroup.innerHTML = roomNames.map(name =>
        `<option value="${name}">${name}</option>`
    ).join('');
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
// Bookings
// =====================
async function loadBookings() {
    try {
        const status = document.getElementById('statusFilter').value;
        const search = document.getElementById('searchBookings').value;

        let url = `${API_BASE}/bookings.php?`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${search}&`;

        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            bookings = data.data.items || [];
            displayBookings(bookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsTable');

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Tour</th>
                    <th>Travel Date</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.booking_reference}</td>
                        <td>
                            ${booking.customer_name}<br>
                            <small>${booking.customer_email}</small>
                        </td>
                        <td>${booking.tour_name}</td>
                        <td>${formatDate(booking.travel_date)}</td>
                        <td>${booking.number_of_guests}</td>
                        <td>${formatCurrency(booking.total_price)}</td>
                        <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
                        <td class="actions-cell">
                            ${booking.status === 'pending' ?
                                `<button class="btn btn-sm btn-success" onclick="confirmBooking(${booking.id})">Confirm</button>` :
                                ''}
                            ${booking.status !== 'cancelled' ?
                                `<button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button>` :
                                ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function confirmBooking(id) {
    if (!confirm('Confirm this booking?')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings.php?id=${id}&action=confirm`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (data.success) {
            loadBookings();
            loadOverview();
            showToast('Booking confirmed!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error confirming booking:', error);
    }
}

async function cancelBooking(id) {
    const reason = prompt('Cancellation reason:');
    if (!reason) return;

    try {
        const response = await fetch(`${API_BASE}/bookings.php?id=${id}&action=cancel`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (data.success) {
            loadBookings();
            loadOverview();
            showToast('Booking cancelled.', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
    }
}

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

// =====================
// Tab Switching
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

// Make functions globally accessible
window.editTour = editTour;
window.deleteTour = deleteTour;
window.confirmBooking = confirmBooking;
window.cancelBooking = cancelBooking;
window.removeItineraryDay = removeItineraryDay;
window.toggleItineraryDay = toggleItineraryDay;
window.updateItineraryBarTitle = updateItineraryBarTitle;
window.removeMainImage = removeMainImage;
window.removeGalleryImage = removeGalleryImage;
window.editHotel = editHotel;
window.deleteHotel = deleteHotel;
window.removeHotelMainImage = removeHotelMainImage;
window.removeHotelGalleryImage = removeHotelGalleryImage;
window.changeHotelImageCategory = changeHotelImageCategory;
window.changeHotelImageCaption = changeHotelImageCaption;
window.toggleGallerySelect = toggleGallerySelect;
window.toggleGalleryGroup = toggleGalleryGroup;
window.applyBulkCategory = applyBulkCategory;
window.clearGallerySelection = clearGallerySelection;
window.bulkDeleteGalleryImages = bulkDeleteGalleryImages;
window.toggleRoomType = toggleRoomType;
window.updateRoomBarTitle = updateRoomBarTitle;
window.removeRoomType = removeRoomType;

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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
