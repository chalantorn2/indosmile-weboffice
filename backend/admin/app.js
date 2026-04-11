// API Configuration
const API_BASE = '/backend/api';

// State Management
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    updateCurrentDate();
    setupAutocomplete('tourDestination');
    setupAutocomplete('hotelDestination');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Initialize Quill Rich Text Editor
    if (document.getElementById('blogQuillEditor')) {
        blogQuillEditor = new Quill('#blogQuillEditor', {
            theme: 'snow',
            placeholder: 'Write your article content here...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }
        });

        blogQuillEditor.on('text-change', function() {
            const html = blogQuillEditor.root.innerHTML;
            document.getElementById('blogContent').value = html === '<p><br></p>' ? '' : html;
        });
    }
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

    // Blog Actions
    document.getElementById('addBlogPostBtn').addEventListener('click', () => openBlogPostModal());
    document.getElementById('blogPostForm').addEventListener('submit', handleBlogPostSubmit);
    document.getElementById('manageCategoriesBtn').addEventListener('click', openCategoriesModal);
    document.getElementById('addCategoryBtn').addEventListener('click', handleAddCategory);

    // Blog modal close
    document.querySelectorAll('.blog-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('blogPostModal'));
    });
    document.querySelectorAll('.blog-cat-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('blogCategoriesModal'));
    });

    // Blog tab switching
    document.querySelectorAll('#blogModalTabBar .blog-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchBlogTab(btn.dataset.tab));
    });

    // Blog cover image upload
    setupDropzone('blogCoverDropzone', 'blogCoverFile', handleBlogCoverUpload);

    // Blog filters
    document.getElementById('blogCategoryFilter').addEventListener('change', loadBlogPosts);
    document.getElementById('blogStatusFilter').addEventListener('change', loadBlogPosts);

    // Settings
    if (typeof setupSettingsUI === 'function') {
        setupSettingsUI();
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
        'blog': 'Blog Management',
        'transfers': 'Transfer Management',
        'bookings': 'Booking Management',
        'users': 'User Management',
        'settings': 'Platform Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    if (page === 'overview') loadOverview();
    if (page === 'tours') loadTours();
    if (page === 'hotels') loadHotels();
    if (page === 'blog') loadBlogPosts();
    if (page === 'transfers' && typeof loadTransfers === 'function') { loadTransfers(); if (typeof loadTransferGallery === 'function') loadTransferGallery(); }
    if (page === 'bookings') loadBookings();
    if (page === 'users') loadUsers();
    if (page === 'settings' && typeof loadSettings === 'function') loadSettings();
}

// Make functions globally accessible (for onclick handlers in HTML)
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
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editBlogPost = editBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.removeBlogCover = removeBlogCover;
window.deleteBlogCategory = deleteBlogCategory;
// Transfers
window.editTransfer = typeof editTransfer !== 'undefined' ? editTransfer : window.editTransfer;
window.deleteTransfer = typeof deleteTransfer !== 'undefined' ? deleteTransfer : window.deleteTransfer;
// Transfer gallery
window.removeTGImage = typeof removeTGImage !== 'undefined' ? removeTGImage : window.removeTGImage;
window.updateTGCaption = typeof updateTGCaption !== 'undefined' ? updateTGCaption : window.updateTGCaption;
window.handleTGDragStart = typeof handleTGDragStart !== 'undefined' ? handleTGDragStart : window.handleTGDragStart;
window.handleTGDragOver = typeof handleTGDragOver !== 'undefined' ? handleTGDragOver : window.handleTGDragOver;
window.handleTGDragEnter = typeof handleTGDragEnter !== 'undefined' ? handleTGDragEnter : window.handleTGDragEnter;
window.handleTGDragLeave = typeof handleTGDragLeave !== 'undefined' ? handleTGDragLeave : window.handleTGDragLeave;
window.handleTGDrop = typeof handleTGDrop !== 'undefined' ? handleTGDrop : window.handleTGDrop;
window.handleTGDragEnd = typeof handleTGDragEnd !== 'undefined' ? handleTGDragEnd : window.handleTGDragEnd;
