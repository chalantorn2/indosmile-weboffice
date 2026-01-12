// API Configuration
const API_BASE = 'https://indosmilesouthservices.com/backend/api/v1';

// State Management
let currentUser = null;
let tours = [];
let bookings = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    updateCurrentDate();
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
}

// Authentication Functions
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

// UI Functions
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';

    // Update admin info
    document.getElementById('adminName').textContent = currentUser.full_name || currentUser.username;
    document.getElementById('adminRole').textContent = currentUser.role || 'Admin';

    // Load initial data
    loadOverview();
}

function handleNavigation(e) {
    e.preventDefault();

    const page = e.currentTarget.dataset.page;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // Show page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}Page`).classList.add('active');

    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'tours': 'Tour Management',
        'bookings': 'Booking Management',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    // Load page data
    if (page === 'overview') loadOverview();
    if (page === 'tours') loadTours();
    if (page === 'bookings') loadBookings();
}

// Overview Functions
async function loadOverview() {
    try {
        // Load stats
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

        // Load recent bookings
        const bookingsResponse = await fetch(`${API_BASE}/bookings.php?limit=5`, {
            credentials: 'include'
        });
        const bookingsData = await bookingsResponse.json();

        if (bookingsData.success) {
            displayRecentBookings(bookingsData.data.items);
        }
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

function displayRecentBookings(bookings) {
    const container = document.getElementById('recentBookings');

    if (bookings.length === 0) {
        container.innerHTML = '<p>No recent bookings</p>';
        return;
    }

    const html = `
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

    container.innerHTML = html;
}

// Tours Functions
async function loadTours() {
    try {
        const response = await fetch(`${API_BASE}/tours.php?active=`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            tours = data.data.items;
            displayTours(tours);
        }
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

function displayTours(tours) {
    const container = document.getElementById('toursTable');

    if (tours.length === 0) {
        container.innerHTML = '<p>No tours found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Destination</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tours.map(tour => `
                    <tr>
                        <td>${tour.name}</td>
                        <td>${tour.destination}</td>
                        <td>${tour.type}</td>
                        <td>${tour.duration_days}D/${tour.duration_nights}N</td>
                        <td>${formatCurrency(tour.price)}</td>
                        <td>
                            ${tour.is_featured ? '<span class="badge badge-confirmed">Featured</span>' : ''}
                            ${tour.is_active ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editTour(${tour.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTour(${tour.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function openTourModal(tourId = null) {
    const modal = document.getElementById('tourModal');
    const form = document.getElementById('tourForm');
    const title = document.getElementById('modalTitle');

    form.reset();

    if (tourId) {
        title.textContent = 'Edit Tour';
        const tour = tours.find(t => t.id === tourId);
        if (tour) {
            document.getElementById('tourId').value = tour.id;
            document.getElementById('tourName').value = tour.name;
            document.getElementById('tourDestination').value = tour.destination;
            document.getElementById('tourType').value = tour.type;
            document.getElementById('tourPrice').value = tour.price;
            document.getElementById('tourDurationDays').value = tour.duration_days;
            document.getElementById('tourDurationNights').value = tour.duration_nights;
            document.getElementById('tourDescription').value = tour.description;
            document.getElementById('tourShortDescription').value = tour.short_description || '';
            document.getElementById('tourMainImage').value = tour.main_image || '';
            document.getElementById('tourHighlights').value = tour.highlights ? tour.highlights.join('\n') : '';
            document.getElementById('tourIncluded').value = tour.included ? tour.included.join('\n') : '';
            document.getElementById('tourNotIncluded').value = tour.not_included ? tour.not_included.join('\n') : '';
            document.getElementById('tourFeatured').checked = tour.is_featured == 1;
            document.getElementById('tourActive').checked = tour.is_active == 1;
        }
    } else {
        title.textContent = 'Add New Tour';
        document.getElementById('tourId').value = '';
    }

    modal.classList.add('active');
}

async function handleTourSubmit(e) {
    e.preventDefault();

    const tourId = document.getElementById('tourId').value;
    const formData = {
        name: document.getElementById('tourName').value,
        destination: document.getElementById('tourDestination').value,
        type: document.getElementById('tourType').value,
        price: parseFloat(document.getElementById('tourPrice').value),
        duration_days: parseInt(document.getElementById('tourDurationDays').value),
        duration_nights: parseInt(document.getElementById('tourDurationNights').value),
        description: document.getElementById('tourDescription').value,
        short_description: document.getElementById('tourShortDescription').value,
        main_image: document.getElementById('tourMainImage').value,
        highlights: document.getElementById('tourHighlights').value.split('\n').filter(h => h.trim()),
        included: document.getElementById('tourIncluded').value.split('\n').filter(i => i.trim()),
        not_included: document.getElementById('tourNotIncluded').value.split('\n').filter(n => n.trim()),
        is_featured: document.getElementById('tourFeatured').checked ? 1 : 0,
        is_active: document.getElementById('tourActive').checked ? 1 : 0,
        duration_label: `${formData.duration_days} Days / ${formData.duration_nights} Nights`,
        price_label: `${formatCurrency(formData.price)}`,
        currency: 'THB',
        rating: 0,
        review_count: 0
    };

    try {
        const url = tourId ? `${API_BASE}/tours.php?id=${tourId}` : `${API_BASE}/tours.php`;
        const method = tourId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal('tourModal');
            loadTours();
            alert(tourId ? 'Tour updated successfully!' : 'Tour created successfully!');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving tour:', error);
        alert('Error saving tour');
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
            alert('Tour deleted successfully!');
        } else {
            alert('Error deleting tour: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting tour:', error);
        alert('Error deleting tour');
    }
}

// Bookings Functions
async function loadBookings() {
    try {
        const status = document.getElementById('statusFilter').value;
        const search = document.getElementById('searchBookings').value;

        let url = `${API_BASE}/bookings.php?`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${search}&`;

        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            bookings = data.data.items;
            displayBookings(bookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsTable');

    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }

    const html = `
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
                        <td>
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

    container.innerHTML = html;
}

async function confirmBooking(id) {
    if (!confirm('Confirm this booking?')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings.php?id=${id}&action=confirm`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (data.success) {
            loadBookings();
            loadOverview();
            alert('Booking confirmed!');
        } else {
            alert('Error: ' + data.message);
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (data.success) {
            loadBookings();
            loadOverview();
            alert('Booking cancelled!');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
    }
}

// Utility Functions
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

// Make functions globally accessible
window.editTour = editTour;
window.deleteTour = deleteTour;
window.confirmBooking = confirmBooking;
window.cancelBooking = cancelBooking;
