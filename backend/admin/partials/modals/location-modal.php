    <!-- Location Modal -->
    <div id="locationModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-md max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="map-pin" class="w-5 h-5 text-navy"></i></div>
            <h2 id="locationModalTitle" class="text-lg font-bold text-navy">Add New Location</h2>
          </div>
          <button type="button" class="location-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <form id="locationForm">
            <input type="hidden" id="locationId" />
            <div class="mb-4">
              <label for="locationName" class="field-label">Name <span class="text-red-400">*</span></label>
              <input type="text" id="locationName" required placeholder="e.g. Phuket Airport (HKT)" class="field-input" />
            </div>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label for="locationSortOrder" class="field-label">Sort Order</label>
                <input type="number" id="locationSortOrder" value="0" class="field-input" />
              </div>
              <div class="flex items-end">
                <label class="toggle-row">
                  <div class="flex items-center gap-3">
                    <input type="checkbox" id="locationActive" checked class="toggle-checkbox" />
                    <span class="toggle-switch toggle-green"></span>
                    <span class="text-sm font-medium text-gray-700">Active</span>
                  </div>
                </label>
              </div>
            </div>
            <div class="flex justify-end border-t border-gray-100 pt-4 gap-3">
              <button type="button" class="location-modal-close btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" id="locationSaveBtn">Save Location</button>
            </div>
          </form>
        </div>
      </div>
    </div>
