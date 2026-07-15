<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Dashboard - Indo Smile South Services</title>
    <link rel="stylesheet" href="/backend/admin/style.css" />
    <link rel="icon" type="image/x-icon" href="/icon.png" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <!-- Quill Core and Tools -->
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
    <script>
      tailwind.config = {
        corePlugins: {
          preflight: false,
        },
        theme: {
          extend: {
            colors: {
              navy: '#010048',
              gold: '#ffd447',
            }
          }
        }
      }
    </script>
  </head>
  <body>
    <!-- Login Screen -->
    <div id="loginScreen" class="login-container">
      <div class="login-box">
        <img src="/Final Logo.png" alt="Logo" class="login-logo" />
        <h1>Admin Login</h1>
        <form id="loginForm">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div id="loginError" class="error-message"></div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="dashboard" style="display: none">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <img src="/Final Logo.png" alt="Logo" />
          <h2>Admin Panel</h2>
        </div>
        <nav class="nav-menu">
          <a href="#" class="nav-item" data-page="overview">
            <span class="icon"><i data-lucide="layout-dashboard" class="w-5 h-5"></i></span>
            Overview
          </a>
          <a href="#" class="nav-item" data-page="bookings">
            <span class="icon"><i data-lucide="calendar-check" class="w-5 h-5"></i></span>
            Bookings
          </a>
          <a href="#" class="nav-item active" data-page="tours">
            <span class="icon"><i data-lucide="map" class="w-5 h-5"></i></span>
            Tours
          </a>
          <a href="#" class="nav-item" data-page="hotels">
            <span class="icon"><i data-lucide="building-2" class="w-5 h-5"></i></span>
            Hotels
          </a>
          <a href="#" class="nav-item" data-page="blog">
            <span class="icon"><i data-lucide="file-text" class="w-5 h-5"></i></span>
            Blog
          </a>
          <a href="#" class="nav-item" data-page="transfers">
            <span class="icon"><i data-lucide="car" class="w-5 h-5"></i></span>
            Transfers
          </a>
          <a href="#" class="nav-item" data-page="agents">
            <span class="icon"><i data-lucide="handshake" class="w-5 h-5"></i></span>
            Agents
          </a>
          <a href="#" class="nav-item" data-page="users">
            <span class="icon"><i data-lucide="users" class="w-5 h-5"></i></span>
            Users
          </a>
          <a href="#" class="nav-item" data-page="settings">
            <span class="icon"><i data-lucide="settings" class="w-5 h-5"></i></span>
            Settings
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="admin-info">
            <div class="admin-name" id="adminName">Admin User</div>
            <div class="admin-role" id="adminRole">Administrator</div>
          </div>
          <button id="logoutBtn" class="btn btn-secondary">Logout</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="header">
          <h1 id="pageTitle">Tour Management</h1>
          <div class="header-actions">
            <span class="date" id="currentDate"></span>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content">
          <!-- Overview Page -->
          <div id="overviewPage" class="page">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-info">
                  <h3 id="totalBookings">0</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-info">
                  <h3 id="pendingBookings">0</h3>
                  <p>Pending Bookings</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                  <h3 id="confirmedBookings">0</h3>
                  <p>Confirmed Bookings</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <h3 id="totalRevenue">0 THB</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>

            <div class="recent-section">
              <h2>Recent Bookings</h2>
              <div id="recentBookings" class="table-container">
                <p class="loading">Loading...</p>
              </div>
            </div>
          </div>

          <!-- Tours Page -->
          <div id="toursPage" class="page active">
            <!-- Sub-tabs -->
            <div class="flex gap-2 mb-5 border-b border-gray-200">
              <button type="button" data-tour-section-tab="tours" class="tour-section-tab px-5 py-2.5 text-sm font-semibold border-b-2 border-navy text-navy">Island Tours</button>
              <button type="button" data-tour-section-tab="shows" class="tour-section-tab px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-navy">Shows & Adventures</button>
            </div>

            <!-- Island Tours section -->
            <div id="toursSection" class="tour-section-panel">
              <div class="page-header" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
                <button id="addTourBtn" class="btn btn-primary">
                  + Add New Island Tour
                </button>
                <button id="importTourBtn" class="btn btn-secondary">
                  <i data-lucide="download-cloud" class="w-4 h-4 inline mr-1"></i>
                  Import from Contract Rate
                </button>
              </div>
              <div id="toursTable" class="table-container">
                <p class="loading">Loading...</p>
              </div>
            </div>

            <!-- Shows & Adventures section -->
            <div id="showsSection" class="tour-section-panel" style="display:none">
              <div class="page-header" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
                <button id="addShowBtn" class="btn btn-primary">
                  + Add New Show & Adventure
                </button>
                <button id="importShowBtn" class="btn btn-secondary">
                  <i data-lucide="download-cloud" class="w-4 h-4 inline mr-1"></i>
                  Import from Contract Rate
                </button>
              </div>
              <div id="showsTable" class="table-container">
                <p class="loading">Loading...</p>
              </div>
            </div>
          </div>

          <!-- Hotels Page -->
          <div id="hotelsPage" class="page">
            <div class="page-header">
              <button id="addHotelBtn" class="btn btn-primary">
                + Add New Hotel
              </button>
            </div>
            <div id="hotelsTable" class="table-container">
              <p class="loading">Loading...</p>
            </div>
          </div>

          <!-- Blog Page -->
          <div id="blogPage" class="page">
            <div class="page-header" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
              <button id="addBlogPostBtn" class="btn btn-primary">+ Add New Post</button>
              <button id="manageCategoriesBtn" class="btn btn-secondary" style="background:#f3f4f6;color:#010048;border:1px solid #e5e7eb">Manage Categories</button>
              <div style="margin-left:auto;display:flex;gap:8px">
                <select id="blogCategoryFilter" class="field-input" style="width:180px;padding:8px 12px;font-size:13px">
                  <option value="">All Categories</option>
                </select>
                <select id="blogStatusFilter" class="field-input" style="width:140px;padding:8px 12px;font-size:13px">
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div id="blogPostsTable" class="table-container">
              <p class="loading">Loading...</p>
            </div>
          </div>

          <!-- Transfers Page -->
          <div id="transfersPage" class="page">
            <!-- Sub-tabs -->
            <div class="flex gap-2 mb-5 border-b border-gray-200">
              <button type="button" data-transfer-tab="routes" class="transfer-tab px-5 py-2.5 text-sm font-semibold border-b-2 border-navy text-navy">Routes</button>
              <button type="button" data-transfer-tab="locations" class="transfer-tab px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-navy">Locations</button>
              <button type="button" data-transfer-tab="vehicles" class="transfer-tab px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-navy">Vehicles</button>
            </div>

            <!-- Routes tab -->
            <div id="transferTabRoutes" class="transfer-tab-panel">
              <div class="page-header">
                <button id="addRouteBtn" class="btn btn-primary">+ Add New Route</button>
              </div>
              <div id="routesTable" class="table-container">
                <p class="loading">Loading...</p>
              </div>
            </div>

            <!-- Locations tab -->
            <div id="transferTabLocations" class="transfer-tab-panel" style="display:none">
              <div class="page-header">
                <button id="addLocationBtn" class="btn btn-primary">+ Add New Location</button>
              </div>
              <div id="locationsTable" class="table-container">
                <p class="loading">Loading...</p>
              </div>
            </div>

            <!-- Vehicles tab -->
            <div id="transferTabVehicles" class="transfer-tab-panel" style="display:none">
              <div class="page-header">
                <button id="addVehicleBtn" class="btn btn-primary">+ Add New Vehicle</button>
              </div>
              <div id="vehiclesTable" class="table-container">
                <p class="loading">Loading...</p>
              </div>
            </div>

            <!-- Transfer Gallery Section -->
            <div class="section-card settings-section-card" style="margin-top: 32px;">
              <div class="section-header" style="cursor:pointer" id="transferGalleryToggle">
                <span class="section-icon"><i data-lucide="images" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Page Gallery — "Our Services in Action"</h3>
                <span class="ml-auto text-xs text-gray-400" id="transferGalleryCount">0 images</span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 ml-2 transition-transform" id="transferGalleryChevron"></i>
              </div>
              <div class="section-body" id="transferGalleryBody" style="display:none">
                <p class="text-xs text-gray-400 mb-4">These images appear in the "Our Services in Action" gallery section on the Transfer page. Drag & drop to reorder. Recommended: 6 images.</p>
                <div id="transferGalleryDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[120px] flex flex-col items-center justify-center relative">
                  <div id="transferGalleryPreview" class="dropzone-gallery flex flex-wrap gap-2.5 w-full"></div>
                  <div id="transferGalleryPlaceholder" class="dropzone-placeholder pointer-events-none">
                    <div class="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="plus" class="w-5 h-5 text-gray-300"></i></div>
                    <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload gallery images</p>
                    <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB each) • Max 12 images</small>
                  </div>
                  <input type="file" id="transferGalleryFiles" accept="image/jpeg,image/png,image/webp" multiple class="dropzone-input hidden" />
                </div>
                <div class="flex justify-end mt-4 gap-3">
                  <button type="button" id="transferGallerySaveBtn" class="px-5 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm">
                    <i data-lucide="save" class="w-4 h-4"></i> Save Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bookings Page -->
          <div id="bookingsPage" class="page">
            <div class="page-header">
              <div class="filter-group">
                <select id="statusFilter">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <select id="paymentFilter">
                  <option value="">All Payments</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
                <input
                  type="text"
                  id="searchBookings"
                  placeholder="Search bookings..."
                />
              </div>
            </div>
            <div id="bookingsTable" class="table-container">
              <p class="loading">Loading...</p>
            </div>
            <div id="bookingsPagination" class="pagination"></div>
          </div>

          <!-- Agents Page -->
          <div id="agentsPage" class="page">
            <div class="page-header" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
              <button id="addAgentBtn" class="btn btn-primary">
                + Add New Agent
              </button>
              <span class="text-xs text-gray-400">Set your own agent code, or leave it blank to use the company initials. The login password is always generated.</span>
            </div>
            <div id="agentsTable" class="table-container">
              <p class="loading">Loading...</p>
            </div>
          </div>

          <!-- Users Page -->
          <div id="usersPage" class="page">
            <div class="page-header">
              <button id="addUserBtn" class="btn btn-primary">
                + Add New User
              </button>
            </div>
            <div id="usersTable" class="table-container">
              <p class="loading">Loading...</p>
            </div>
          </div>

          <!-- Settings Page -->
          <div id="settingsPage" class="page">
            <!-- Sticky Save Bar -->
            <div id="settingsSaveBar" class="settings-save-bar hidden">
              <div class="flex items-center gap-3">
                <span class="settings-save-dot"></span>
                <span class="text-sm font-medium text-gray-600">You have unsaved changes</span>
              </div>
              <div class="flex items-center gap-3">
                <button type="button" id="settingsDiscardBtn" class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Discard</button>
                <button type="button" id="settingsSaveBtn" class="px-5 py-2 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm">
                  <i data-lucide="save" class="w-4 h-4"></i> Save Changes
                </button>
              </div>
            </div>

            <div id="settingsLoader" class="settings-page-loader hidden">
              <div class="spinner" style="width:28px;height:28px;border-width:3px"></div>
              <span class="text-sm font-medium text-gray-500">Loading settings...</span>
            </div>

            <form id="settingsForm" class="settings-layout">

              <!-- ============================== -->
              <!-- SECTION: Company Information   -->
              <!-- ============================== -->
              <div class="section-card settings-section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="building" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Company Information</h3>
                  <span class="ml-auto text-xs text-gray-400">Displayed on website header, footer & contact page</span>
                </div>
                <div class="section-body">
                  <div class="mb-5">
                    <label for="setting_site_name" class="field-label">Company / Site Name</label>
                    <input type="text" id="setting_site_name" class="field-input" placeholder="Indo Smile South Services" />
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label for="setting_site_email" class="field-label">Contact Email</label>
                      <div class="field-input-group">
                        <span class="field-addon"><i data-lucide="mail" class="w-4 h-4"></i></span>
                        <input type="email" id="setting_site_email" class="field-input-grouped" placeholder="info@indosmilesouthservices.com" />
                      </div>
                    </div>
                    <div>
                      <label for="setting_site_phone" class="field-label">Primary Phone <span class="text-gray-300 font-normal text-xs">(comma-separated)</span></label>
                      <div class="field-input-group">
                        <span class="field-addon"><i data-lucide="phone" class="w-4 h-4"></i></span>
                        <input type="text" id="setting_site_phone" class="field-input-grouped" placeholder="+66 XX XXX XXXX" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label for="setting_site_address" class="field-label">Office Address</label>
                    <div class="field-input-group">
                      <span class="field-addon"><i data-lucide="map-pin" class="w-4 h-4"></i></span>
                      <input type="text" id="setting_site_address" class="field-input-grouped" placeholder="199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- ============================== -->
              <!-- SECTION: Social Media Links    -->
              <!-- ============================== -->
              <div class="section-card settings-section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="share-2" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Social Media Links</h3>
                  <span class="ml-auto text-xs text-gray-400">Shown in website footer</span>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label for="setting_social_facebook" class="field-label flex items-center gap-2">
                        <span class="settings-social-icon" style="background:#1877f2"><svg class="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span>
                        Facebook
                      </label>
                      <input type="url" id="setting_social_facebook" class="field-input" placeholder="https://facebook.com/yourpage" />
                    </div>
                    <div>
                      <label for="setting_social_instagram" class="field-label flex items-center gap-2">
                        <span class="settings-social-icon" style="background:linear-gradient(135deg,#f58529,#dd2a7b,#8134af)"><svg class="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></span>
                        Instagram
                      </label>
                      <input type="url" id="setting_social_instagram" class="field-input" placeholder="https://instagram.com/yourpage" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label for="setting_social_line" class="field-label flex items-center gap-2">
                        <span class="settings-social-icon" style="background:#06c755"><svg class="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.634.634 0 01-.199.031c-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595a.64.64 0 01.194-.033c.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.086l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg></span>
                        LINE Official
                      </label>
                      <input type="url" id="setting_social_line" class="field-input" placeholder="https://line.me/ti/p/@yourline" />
                    </div>
                    <div>
                      <label for="setting_social_whatsapp" class="field-label flex items-center gap-2">
                        <span class="settings-social-icon" style="background:#25d366"><svg class="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>
                        WhatsApp
                      </label>
                      <input type="url" id="setting_social_whatsapp" class="field-input" placeholder="https://wa.me/66XXXXXXXXX" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- ============================== -->
              <!-- SECTION: Booking & Currency    -->
              <!-- ============================== -->
              <div class="section-card settings-section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="wallet" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Booking & Currency</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label for="setting_currency_default" class="field-label">Default Currency</label>
                      <select id="setting_currency_default" class="field-input">
                        <option value="THB">🇹🇭 Thai Baht (THB)</option>
                        <option value="USD">🇺🇸 US Dollar (USD)</option>
                        <option value="EUR">🇪🇺 Euro (EUR)</option>
                        <option value="GBP">🇬🇧 British Pound (GBP)</option>
                        <option value="AUD">🇦🇺 Australian Dollar (AUD)</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3">
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="setting_booking_confirmation_auto" class="toggle-checkbox" />
                        <span class="toggle-switch toggle-green"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Auto-Confirm Bookings</span>
                          <p class="text-xs text-gray-400 mt-0.5">New bookings will be automatically confirmed without manual review</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- ============================== -->
              <!-- SECTION: Notifications         -->
              <!-- ============================== -->
              <div class="section-card settings-section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="bell-ring" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Notifications</h3>
                </div>
                <div class="section-body">
                  <div class="flex flex-col gap-3">
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="setting_email_notifications_enabled" class="toggle-checkbox" />
                        <span class="toggle-switch toggle-navy"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Email Notifications</span>
                          <p class="text-xs text-gray-400 mt-0.5">Receive an email alert when a new booking is submitted</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Floating Save Button (always visible) -->
              <div class="settings-footer-actions">
                <button type="submit" class="settings-save-main-btn">
                  <i data-lucide="save" class="w-4 h-4"></i> Save All Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>

<?php
$modalsDir = __DIR__ . '/partials/modals';
$modals = [
    'tour-modal.php',
    'show-modal.php',
    'import-modal.php',
    'hotel-modal.php',
    'user-modal.php',
    'booking-modal.php',
    'agent-modal.php',
    'agent-rates-modal.php',
    'blog-post-modal.php',
    'blog-categories-modal.php',
    'location-modal.php',
    'vehicle-modal.php',
    'route-modal.php',
];
foreach ($modals as $modal) {
    include $modalsDir . '/' . $modal;
}
?>

    <script src="/backend/admin/app-utils.js"></script>
    <script src="/backend/admin/app-auth.js"></script>
    <script src="/backend/admin/app-tours.js"></script>
    <script src="/backend/admin/app-shows.js"></script>
    <script src="/backend/admin/app-import.js"></script>
    <script src="/backend/admin/app-hotels.js"></script>
    <script src="/backend/admin/app-bookings.js"></script>
    <script src="/backend/admin/app-users.js"></script>
    <script src="/backend/admin/app-agents.js"></script>
    <script src="/backend/admin/app-blog.js"></script>
    <script src="/backend/admin/app-transfers.js"></script>
    <script src="/backend/admin/app-settings.js"></script>
    <script src="/backend/admin/app.js"></script>
  </body>
</html>
