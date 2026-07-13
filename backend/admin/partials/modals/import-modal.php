    <!-- Import from Contract Rate Modal -->
    <div id="importModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="download-cloud" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 class="text-lg font-bold text-navy">Import from Contract Rate</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="importModalSubtitle">Search a tour on the Contract Rate site and pull it in</p>
            </div>
          </div>
          <button class="import-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Step 1: search + pick a source tour -->
        <div id="importStepSearch" class="flex-1 overflow-y-auto px-7 py-5">
          <div class="relative mb-4">
            <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="importSearchInput" class="field-input pl-9" placeholder="Search tour name or supplier — e.g. phi phi, tiger park">
          </div>
          <div id="importSearchResults">
            <p class="text-sm text-gray-400 text-center py-10">Type to search, or leave empty and press Enter to list everything.</p>
          </div>
        </div>

        <!-- Step 2: pick images + target, then continue to the full form -->
        <div id="importStepDetail" class="flex-1 overflow-y-auto px-7 py-5 hidden">
          <button type="button" id="importBackBtn" class="text-sm text-gray-500 hover:text-navy flex items-center gap-1 mb-4">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to search
          </button>

          <div id="importDetailSummary" class="mb-5"></div>

          <div class="mb-5">
            <label class="field-label">Import as</label>
            <div class="flex gap-2 mt-1">
              <button type="button" data-import-target="tour" class="import-target-btn flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all">
                <i data-lucide="palmtree" class="w-4 h-4 inline mr-1"></i> Island Tour
              </button>
              <button type="button" data-import-target="show" class="import-target-btn flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all">
                <i data-lucide="ticket" class="w-4 h-4 inline mr-1"></i> Show &amp; Adventure
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1.5" id="importTargetHint"></p>
          </div>

          <div class="mb-2">
            <label class="field-label">Images <span class="text-gray-300 font-normal text-xs">(all images are copied over &mdash; click one to make it the cover)</span></label>
          </div>
          <div id="importImageGrid" class="grid grid-cols-4 gap-3"></div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <span class="text-xs text-gray-400" id="importFooterNote"></span>
          <div class="flex gap-2">
            <button type="button" class="import-modal-close btn btn-secondary">Cancel</button>
            <button type="button" id="importContinueBtn" class="btn btn-primary hidden">Import &amp; Continue</button>
          </div>
        </div>

      </div>
    </div>
