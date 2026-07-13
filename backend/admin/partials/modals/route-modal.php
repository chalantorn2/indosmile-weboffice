    <!-- Route Modal -->
    <div id="routeModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="route" class="w-5 h-5 text-navy"></i></div>
            <h2 id="routeModalTitle" class="text-lg font-bold text-navy">Add New Route</h2>
          </div>
          <button type="button" class="route-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-7">
          <form id="routeForm">
            <input type="hidden" id="routeId" />
            <div class="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label for="routeOriginId" class="field-label">Origin <span class="text-red-400">*</span></label>
                <select id="routeOriginId" required class="field-input">
                  <option value="">Select location...</option>
                </select>
              </div>
              <div>
                <label for="routeDestinationId" class="field-label">Destination <span class="text-red-400">*</span></label>
                <select id="routeDestinationId" required class="field-input">
                  <option value="">Select location...</option>
                </select>
              </div>
            </div>
            <p class="text-xs text-gray-400 mb-5">Routes are bidirectional — pricing applies in both directions.</p>

            <div class="mb-5">
              <label class="field-label flex items-center justify-between">
                <span>Vehicle Prices (THB)</span>
                <span class="text-xs font-normal text-gray-400">Leave blank if vehicle does not run this route</span>
              </label>
              <div id="routePricesGrid" class="border border-gray-200 rounded-xl divide-y divide-gray-100">
                <p class="loading p-4 text-center text-gray-400 text-sm">Loading vehicles...</p>
              </div>
            </div>

            <div class="mb-6">
              <label class="toggle-row">
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="routeActive" checked class="toggle-checkbox" />
                  <span class="toggle-switch toggle-green"></span>
                  <span class="text-sm font-medium text-gray-700">Active</span>
                </div>
              </label>
            </div>
            <div class="flex justify-end border-t border-gray-100 pt-5 gap-3">
              <button type="button" class="route-modal-close btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" id="routeSaveBtn">Save Route</button>
            </div>
          </form>
        </div>
      </div>
    </div>
