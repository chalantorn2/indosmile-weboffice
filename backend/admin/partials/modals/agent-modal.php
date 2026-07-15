    <!-- Agent Modal (create / edit) -->
    <div id="agentModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="handshake" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="agentModalTitle" class="text-lg font-bold text-navy">Add New Agent</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="agentModalSubtitle">A login password is generated automatically on save</p>
            </div>
          </div>
          <button class="agent-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-7">
          <form id="agentForm" novalidate>
            <input type="hidden" id="agentId" />

            <!-- Section: Company -->
            <div class="section-card mb-5">
              <div class="section-header">
                <span class="section-icon"><i data-lucide="building-2" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Company</h3>
              </div>
              <div class="section-body">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="agentCompanyName" class="field-label">Company Name <span class="text-red-400">*</span></label>
                    <input type="text" id="agentCompanyName" required placeholder="e.g. Sunrise Travel Co., Ltd." class="field-input" />
                  </div>
                  <div>
                    <label for="agentContactName" class="field-label">Contact Person</label>
                    <input type="text" id="agentContactName" placeholder="e.g. John Doe" class="field-input" />
                  </div>
                </div>
                <div class="mb-4">
                  <label for="agentCode" class="field-label">Agent Code</label>
                  <div class="flex gap-2">
                    <input type="text" id="agentCode" placeholder="Leave blank to use the company initials" class="field-input" style="text-transform:uppercase" />
                    <button type="button" id="agentCodeSuggestBtn" class="px-4 py-2 shrink-0 text-sm font-medium text-navy bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2">
                      <i data-lucide="wand-2" class="w-4 h-4"></i> Suggest
                    </button>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Letters, numbers and dashes only. Must be unique — e.g. <code>STV</code>, <code>SUNRISE-01</code>.</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="agentCountry" class="field-label">Country</label>
                    <input type="text" id="agentCountry" placeholder="e.g. Thailand" class="field-input" />
                  </div>
                  <div>
                    <label for="agentLicenseNo" class="field-label">Travel Licence No.</label>
                    <input type="text" id="agentLicenseNo" placeholder="e.g. 31/00123" class="field-input" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Contact Channels -->
            <div class="section-card mb-5">
              <div class="section-header">
                <span class="section-icon"><i data-lucide="contact" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Contact Channels</h3>
              </div>
              <div class="section-body">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="agentEmail" class="field-label">Email (login) <span class="text-red-400">*</span></label>
                    <input type="email" id="agentEmail" required placeholder="e.g. booking@agency.com" class="field-input" />
                  </div>
                  <div>
                    <label for="agentPhone" class="field-label">Phone</label>
                    <input type="text" id="agentPhone" placeholder="e.g. +66 81 234 5678" class="field-input" />
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label for="agentWhatsapp" class="field-label">WhatsApp</label>
                    <input type="text" id="agentWhatsapp" placeholder="+66..." class="field-input" />
                  </div>
                  <div>
                    <label for="agentLineId" class="field-label">LINE ID</label>
                    <input type="text" id="agentLineId" placeholder="@agency" class="field-input" />
                  </div>
                  <div>
                    <label for="agentWechatId" class="field-label">WeChat ID</label>
                    <input type="text" id="agentWechatId" placeholder="wechat_id" class="field-input" />
                  </div>
                </div>
                <div>
                  <label for="agentAddress" class="field-label">Address</label>
                  <textarea id="agentAddress" rows="2" placeholder="Office address" class="field-input"></textarea>
                </div>
              </div>
            </div>

            <!-- Section: Account -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-icon"><i data-lucide="shield" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Account</h3>
              </div>
              <div class="section-body">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="agentStatus" class="field-label">Status</label>
                    <select id="agentStatus" class="field-input">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label for="agentTaxId" class="field-label">Tax ID</label>
                    <input type="text" id="agentTaxId" placeholder="e.g. 0105561000000" class="field-input" />
                  </div>
                </div>
                <div>
                  <label for="agentNotes" class="field-label">Internal Notes</label>
                  <textarea id="agentNotes" rows="2" placeholder="Only visible to admins" class="field-input"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <p class="text-xs text-gray-400" id="agentModalFooterHint">Agent code and password are generated automatically</p>
          <div class="flex gap-3">
            <button type="button" class="agent-modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" form="agentForm" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
              <i data-lucide="save" class="w-4 h-4"></i> Save Agent
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Agent Detail Modal -->
    <div id="agentDetailModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="id-card" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="agentDetailTitle" class="text-lg font-bold text-navy">Agent Details</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="agentDetailSubtitle">Contact channels and login history</p>
            </div>
          </div>
          <button class="agent-detail-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-7" id="agentDetailBody">
          <p class="loading">Loading...</p>
        </div>

        <div class="flex items-center justify-end px-7 py-4 border-t border-gray-100 bg-gray-50/80 gap-3">
          <button type="button" class="agent-detail-modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
          <button type="button" id="agentDetailRatesBtn" class="px-5 py-2.5 text-sm font-medium text-navy bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2">
            <i data-lucide="tag" class="w-4 h-4"></i> Contract Rates
          </button>
          <button type="button" id="agentDetailEditBtn" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
            <i data-lucide="pencil" class="w-4 h-4"></i> Edit Agent
          </button>
        </div>

      </div>
    </div>

    <!-- Generated Password Modal -->
    <div id="agentPasswordModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="key-round" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 class="text-lg font-bold text-navy">Agent Password</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="agentPasswordSubtitle">Shown once — copy it now</p>
            </div>
          </div>
          <button class="agent-password-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <div class="p-7">
          <div class="mb-4">
            <label class="field-label">Login Email</label>
            <div class="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-navy font-medium" id="agentPasswordEmail">—</div>
          </div>
          <div class="mb-4">
            <label class="field-label">Password</label>
            <div class="flex gap-2">
              <div class="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-base tracking-wide text-navy" id="agentPasswordValue">—</div>
              <button type="button" id="agentPasswordCopyBtn" class="px-4 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-all flex items-center gap-2">
                <i data-lucide="copy" class="w-4 h-4"></i> Copy
              </button>
            </div>
          </div>
          <p class="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            This password is not stored in plain text. Once you close this dialog it cannot be shown again — you would have to generate a new one.
          </p>

          <button type="button" id="agentPasswordEmailBtn"
                  class="w-full mt-4 px-4 py-3 rounded-xl bg-yellow text-navy text-sm font-bold hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <i data-lucide="mail" class="w-4 h-4"></i> <span id="agentPasswordEmailBtnLabel">Email these details to the agent</span>
          </button>
          <p class="text-xs text-gray-400 text-center mt-2" id="agentPasswordEmailHint">
            Sends the agent code, login email and this password. Nothing goes out until you press it.
          </p>
        </div>

        <div class="flex items-center justify-end px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <button type="button" class="agent-password-modal-close px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all">Done</button>
        </div>

      </div>
    </div>
