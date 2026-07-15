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
    console.log('[DEBUG] setupEventListeners START');
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

    // Shows & Adventures Actions
    document.getElementById('addShowBtn').addEventListener('click', () => openShowModal());
    document.getElementById('showForm').addEventListener('submit', handleShowSubmit);
    setupAutocomplete('shDestination');

    // Import from Contract Rate
    document.getElementById('importTourBtn').addEventListener('click', () => openImportModal('tour'));
    document.getElementById('importShowBtn').addEventListener('click', () => openImportModal('show'));
    document.getElementById('importSearchInput').addEventListener('input', debounce(searchContractRate, 400));
    document.getElementById('importSearchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchContractRate();
        }
    });
    document.getElementById('importBackBtn').addEventListener('click', () => showImportStep('search'));
    document.getElementById('importContinueBtn').addEventListener('click', confirmImport);
    document.querySelectorAll('.import-target-btn').forEach(btn => {
        btn.addEventListener('click', () => setImportTarget(btn.dataset.importTarget));
    });
    document.querySelectorAll('.import-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('importModal'));
    });

    // Tours/Shows section sub-tabs
    const sectionTabs = document.querySelectorAll('.tour-section-tab');
    console.log('[DEBUG] tour-section-tab buttons found:', sectionTabs.length);
    sectionTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('[DEBUG] section tab clicked:', btn.dataset.tourSectionTab);
            switchTourSectionTab(btn.dataset.tourSectionTab);
        });
    });

    // Tour modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('tourModal'));
    });

    // Show modal close
    document.querySelectorAll('.show-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('showModal'));
    });

    // Show modal tab switching
    document.querySelectorAll('#showModalTabBar .sh-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchShowTab(btn.dataset.tab));
    });

    // Show modal dropzones
    setupDropzone('shMainImageDropzone', 'shMainImageFile', handleShowMainImageUpload);
    setupDropzone('shGalleryDropzone', 'shGalleryFiles', handleShowGalleryUpload);

    // Show times & seat zones builders
    document.getElementById('addShowTimeBtn').addEventListener('click', () => addShowTime());
    document.getElementById('addSeatZoneBtn').addEventListener('click', () => addSeatZone());

    // Filters
    document.getElementById('statusFilter').addEventListener('change', reloadBookingsFromFirstPage);
    document.getElementById('paymentFilter').addEventListener('change', reloadBookingsFromFirstPage);
    document.getElementById('searchBookings').addEventListener('input', debounce(reloadBookingsFromFirstPage, 500));

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

    // Agent Actions
    document.getElementById('addAgentBtn').addEventListener('click', () => openAgentModal());
    document.getElementById('agentForm').addEventListener('submit', handleAgentSubmit);
    document.getElementById('agentPasswordCopyBtn').addEventListener('click', copyAgentPassword);
    document.getElementById('agentPasswordEmailBtn').addEventListener('click', emailAgentCredentials);
    document.getElementById('agentCodeSuggestBtn').addEventListener('click', suggestAgentCode);

    // Agent modal close
    document.querySelectorAll('.agent-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('agentModal'));
    });
    document.querySelectorAll('.agent-detail-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('agentDetailModal'));
    });
    document.querySelectorAll('.agent-password-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('agentPasswordModal'));
    });

    // Agent contract rates
    document.getElementById('agentRatesApplyBtn').addEventListener('click', applyAgentRates);
    document.getElementById('agentRatesRemoveBtn').addEventListener('click', removeAgentRates);
    document.getElementById('agentRatesSearch').addEventListener('input', debounce(renderAgentRates, 250));
    document.querySelectorAll('.agent-rates-filter').forEach(btn => {
        btn.addEventListener('click', () => setAgentRatesFilter(btn.dataset.filter));
    });
    document.querySelectorAll('.agent-rates-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('agentRatesModal'));
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
    console.log('[DEBUG] setupEventListeners END (all listeners bound)');
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

    // Show/hide admin-only navs based on role
    ['users', 'agents'].forEach(page => {
        const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (nav) {
            nav.style.display = currentUser.role === 'admin' ? '' : 'none';
        }
    });

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
        'agents': 'Agent Management',
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
    if (page === 'agents') loadAgents();
    if (page === 'users') loadUsers();
    if (page === 'settings' && typeof loadSettings === 'function') loadSettings();
}

// =====================
// Tours / Shows section sub-tab switcher
// =====================
function switchTourSectionTab(section) {
    document.querySelectorAll('.tour-section-tab').forEach(btn => {
        const isActive = btn.dataset.tourSectionTab === section;
        btn.classList.toggle('border-navy', isActive);
        btn.classList.toggle('text-navy', isActive);
        btn.classList.toggle('border-transparent', !isActive);
        btn.classList.toggle('text-gray-500', !isActive);
    });

    const toursSection = document.getElementById('toursSection');
    const showsSection = document.getElementById('showsSection');

    if (section === 'shows') {
        toursSection.style.display = 'none';
        showsSection.style.display = '';
        loadShows();
    } else {
        toursSection.style.display = '';
        showsSection.style.display = 'none';
        loadTours();
    }
}

// Make functions globally accessible (for onclick handlers in HTML)
window.editTour = editTour;
window.deleteTour = deleteTour;
window.editShow = editShow;
window.deleteShow = deleteShow;
window.removeShowMainImage = removeShowMainImage;
window.removeShowGalleryImage = removeShowGalleryImage;
window.removeShowTime = removeShowTime;
window.removeSeatZone = removeSeatZone;
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
window.viewAgent = viewAgent;
window.editAgent = editAgent;
window.deleteAgent = deleteAgent;
window.generateAgentPassword = generateAgentPassword;
window.openAgentRates = openAgentRates;
window.toggleAgentRateRow = toggleAgentRateRow;
window.toggleAgentRatesAll = toggleAgentRatesAll;
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
