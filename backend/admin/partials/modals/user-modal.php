    <!-- User Modal -->
    <div id="userModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="user-plus" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="userModalTitle" class="text-lg font-bold text-navy">Add New User</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="userModalSubtitle">Create a new admin account</p>
            </div>
          </div>
          <button class="user-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-7">
          <form id="userForm" novalidate>
            <input type="hidden" id="userId" />

            <!-- Section: Account Info -->
            <div class="section-card mb-5">
              <div class="section-header">
                <span class="section-icon"><i data-lucide="user" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Account Info</h3>
              </div>
              <div class="section-body">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="userFullName" class="field-label">Full Name <span class="text-red-400">*</span></label>
                    <input type="text" id="userFullName" name="full_name" required placeholder="e.g. John Doe" class="field-input" />
                  </div>
                  <div>
                    <label for="userUsername" class="field-label">Username <span class="text-red-400">*</span></label>
                    <input type="text" id="userUsername" name="username" required placeholder="e.g. johndoe" class="field-input" />
                  </div>
                </div>
                <div class="mb-4">
                  <label for="userEmail" class="field-label">Email <span class="text-red-400">*</span></label>
                  <input type="email" id="userEmail" name="email" required placeholder="e.g. john@example.com" class="field-input" />
                </div>
                <div id="userPasswordGroup">
                  <label for="userPassword" class="field-label">Password <span class="text-red-400" id="userPasswordRequired">*</span></label>
                  <input type="password" id="userPassword" name="password" placeholder="Min 6 characters" class="field-input" />
                  <p class="text-xs text-gray-400 mt-1" id="userPasswordHint" style="display:none;">Leave blank to keep current password</p>
                </div>
              </div>
            </div>

            <!-- Section: Role & Status -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-icon"><i data-lucide="shield" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Role & Status</h3>
              </div>
              <div class="section-body">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="userRole" class="field-label">Role <span class="text-red-400">*</span></label>
                    <select id="userRole" name="role" class="field-input">
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label for="userStatus" class="field-label">Status</label>
                    <select id="userStatus" name="status" class="field-input">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <div></div>
          <div class="flex gap-3">
            <button type="button" class="user-modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" form="userForm" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
              <i data-lucide="save" class="w-4 h-4"></i> Save User
            </button>
          </div>
        </div>

      </div>
    </div>
