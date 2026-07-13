    <!-- Vehicle Modal -->
    <div id="vehicleModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="car" class="w-5 h-5 text-navy"></i></div>
            <h2 id="vehicleModalTitle" class="text-lg font-bold text-navy">Add New Vehicle</h2>
          </div>
          <button type="button" class="vehicle-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-7">
          <form id="vehicleForm">
            <input type="hidden" id="vehicleId" />
            <div class="mb-4">
              <label for="vehicleName" class="field-label">Vehicle Name <span class="text-red-400">*</span></label>
              <input type="text" id="vehicleName" required placeholder="e.g. Standard Car (Toyota Camry)" class="field-input" />
            </div>
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label for="vehicleMaxPassengers" class="field-label">Max Passengers</label>
                <input type="number" id="vehicleMaxPassengers" min="1" value="1" class="field-input" />
              </div>
              <div>
                <label for="vehicleMaxLuggage" class="field-label">Max Luggage</label>
                <input type="number" id="vehicleMaxLuggage" min="0" value="2" class="field-input" />
              </div>
              <div>
                <label for="vehicleSortOrder" class="field-label">Sort Order</label>
                <input type="number" id="vehicleSortOrder" value="0" class="field-input" />
              </div>
            </div>
            <div class="mb-4">
              <label class="field-label">Vehicle Image</label>
              <div id="vehicleImageDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[120px] flex flex-col items-center justify-center relative">
                <div id="vehicleImagePreview" class="w-full"></div>
                <div id="vehicleImagePlaceholder" class="dropzone-placeholder pointer-events-none">
                  <div class="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="image" class="w-5 h-5 text-gray-300"></i></div>
                  <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload image</p>
                  <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB)</small>
                </div>
                <input type="file" id="vehicleImageFile" accept="image/jpeg,image/png,image/webp" class="dropzone-input hidden" />
              </div>
              <input type="hidden" id="vehicleImageUrl" />
            </div>
            <div class="mb-4">
              <label for="vehicleDescription" class="field-label">Description</label>
              <textarea id="vehicleDescription" rows="3" placeholder="e.g. Comfortable sedan for up to 3 passengers" class="field-input resize-y"></textarea>
            </div>
            <div class="mb-6">
              <label class="toggle-row">
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="vehicleActive" checked class="toggle-checkbox" />
                  <span class="toggle-switch toggle-green"></span>
                  <span class="text-sm font-medium text-gray-700">Active</span>
                </div>
              </label>
            </div>
            <div class="flex justify-end border-t border-gray-100 pt-5 gap-3">
              <button type="button" class="vehicle-modal-close btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" id="vehicleSaveBtn">Save Vehicle</button>
            </div>
          </form>
        </div>
      </div>
    </div>
