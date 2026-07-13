    <!-- Show & Adventure Modal -->
    <div id="showModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="ticket" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="showModalTitle" class="text-lg font-bold text-navy">Add New Show & Adventure</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="showModalSubtitle">Fill in the details to create a show</p>
            </div>
          </div>
          <button class="show-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Tabs -->
        <div class="flex px-7 bg-gray-50/80 border-b border-gray-100 gap-1" id="showModalTabBar">
          <button type="button" class="sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy flex items-center gap-2" data-tab="sh-basic">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Basic Info</span>
          </button>
          <button type="button" class="sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600 flex items-center gap-2" data-tab="sh-media">
            <i data-lucide="image" class="w-4 h-4"></i>
            <span>Media</span>
          </button>
          <button type="button" class="sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600 flex items-center gap-2" data-tab="sh-showinfo">
            <i data-lucide="ticket" class="w-4 h-4"></i>
            <span>Show Info</span>
          </button>
          <button type="button" class="sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600 flex items-center gap-2" data-tab="sh-details">
            <i data-lucide="list-checks" class="w-4 h-4"></i>
            <span>Details</span>
          </button>
          <button type="button" class="sh-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600 flex items-center gap-2" data-tab="sh-settings">
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>Settings</span>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-7">
          <form id="showForm" novalidate>
            <input type="hidden" id="shId" />
            <input type="hidden" id="shSourceId" value="" />
            <input type="hidden" id="shSourceSupplier" value="" />

            <!-- Tab: Basic Info -->
            <div class="sh-tab-panel" data-tab="sh-basic">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="tag" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Show Identity</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="shName" class="field-label">Show Name <span class="text-red-400">*</span></label>
                      <input type="text" id="shName" required placeholder="e.g. Phuket FantaSea" class="field-input" />
                    </div>
                    <div>
                      <label for="shDestination" class="field-label">Destination <span class="text-red-400">*</span></label>
                      <input type="text" id="shDestination" required placeholder="e.g. Phuket, Thailand" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="shVenue" class="field-label">Venue / Stage Location</label>
                      <input type="text" id="shVenue" placeholder="e.g. FantaSea Theatre, Kamala" class="field-input" />
                    </div>
                    <div>
                      <label for="shDurationDays" class="field-label">Duration (Days)</label>
                      <input type="number" id="shDurationDays" min="1" value="1" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="shDurationNights" class="field-label">Nights</label>
                      <input type="number" id="shDurationNights" min="0" value="0" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="banknote" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Pricing (internal only — not shown on website)</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="shAdultPrice" class="field-label">Adult Price <span class="text-red-400">*</span></label>
                      <div class="field-input-group">
                        <span class="field-addon">THB</span>
                        <input type="number" id="shAdultPrice" step="0.01" required placeholder="0.00" class="field-input-grouped" />
                      </div>
                    </div>
                    <div>
                      <label for="shChildPrice" class="field-label">Child Price</label>
                      <div class="field-input-group">
                        <span class="field-addon">THB</span>
                        <input type="number" id="shChildPrice" step="0.01" placeholder="0.00" class="field-input-grouped" />
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <label class="flex items-center gap-2 mb-3 cursor-pointer">
                      <input type="checkbox" id="shParkFeeIncluded" />
                      <span class="field-label" style="margin:0">National park fee already included in the prices above</span>
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="shParkFeeAdult" class="field-label">Park Fee &mdash; Adult</label>
                        <div class="field-input-group">
                          <span class="field-addon">THB</span>
                          <input type="number" id="shParkFeeAdult" step="0.01" placeholder="0.00" class="field-input-grouped" />
                        </div>
                      </div>
                      <div>
                        <label for="shParkFeeChild" class="field-label">Park Fee &mdash; Child</label>
                        <div class="field-input-group">
                          <span class="field-addon">THB</span>
                          <input type="number" id="shParkFeeChild" step="0.01" placeholder="0.00" class="field-input-grouped" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="align-left" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Description</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="shShortDescription" class="field-label">Short Description <span class="text-gray-300 font-normal text-xs">(shown on cards)</span></label>
                    <input type="text" id="shShortDescription" placeholder="Brief one-liner for show cards" maxlength="120" class="field-input" />
                  </div>
                  <div>
                    <label for="shDescription" class="field-label">Full Description <span class="text-red-400">*</span></label>
                    <textarea id="shDescription" rows="5" required placeholder="Describe the show experience..." class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Media -->
            <div class="sh-tab-panel hidden" data-tab="sh-media">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="camera" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Cover Image</h3>
                </div>
                <div class="section-body">
                  <input type="hidden" id="shMainImage" />
                  <div id="shMainImageDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[160px] flex flex-col items-center justify-center relative">
                    <div id="shMainImagePreview" class="dropzone-preview w-full"></div>
                    <div id="shMainImagePlaceholder" class="dropzone-placeholder pointer-events-none">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="upload" class="w-6 h-6 text-gray-300"></i></div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload</p>
                      <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB) &bull; Recommended 1200x800</small>
                    </div>
                    <input type="file" id="shMainImageFile" accept="image/jpeg,image/png,image/webp" class="dropzone-input hidden" />
                  </div>
                </div>
              </div>

              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="images" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Gallery</h3>
                  <span class="ml-auto text-xs text-gray-400" id="shGalleryCount">0 / 30 images</span>
                </div>
                <div class="section-body">
                  <div id="shGalleryDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[160px] flex flex-col items-center justify-center relative">
                    <div id="shGalleryPreview" class="dropzone-gallery flex flex-wrap gap-2.5 w-full"></div>
                    <div id="shGalleryPlaceholder" class="dropzone-placeholder pointer-events-none">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="plus" class="w-6 h-6 text-gray-300"></i></div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload multiple images</p>
                      <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB each)</small>
                    </div>
                    <input type="file" id="shGalleryFiles" accept="image/jpeg,image/png,image/webp" multiple class="dropzone-input hidden" />
                  </div>
                  <input type="hidden" id="shGalleryImages" />
                </div>
              </div>
            </div>

            <!-- Tab: Show Info (showtimes + seat zones + pickup) -->
            <div class="sh-tab-panel hidden" data-tab="sh-showinfo">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="calendar-check" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Operational Days</h3>
                </div>
                <div class="section-body">
                  <p class="text-xs text-gray-400 mb-3">Select the days of the week the show runs.</p>
                  <div id="shOperationalDays" class="grid grid-cols-7 gap-2">
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="mon" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Mon</span>
                    </label>
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="tue" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Tue</span>
                    </label>
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="wed" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Wed</span>
                    </label>
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="thu" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Thu</span>
                    </label>
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="fri" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Fri</span>
                    </label>
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="sat" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Sat</span>
                    </label>
                    <label class="op-day-toggle flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" class="op-day-checkbox hidden" data-day="sun" />
                      <span class="op-day-label w-full text-center px-2 py-2 text-xs font-semibold border-2 border-gray-200 rounded-lg transition-all hover:border-navy">Sun</span>
                    </label>
                  </div>
                  <style>
                    .op-day-toggle input:checked + .op-day-label {
                      background-color: #010048;
                      color: #fff;
                      border-color: #010048;
                    }
                  </style>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="clock" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Show Times</h3>
                </div>
                <div class="section-body">
                  <p class="text-xs text-gray-400 mb-3">Add available showtime slots (e.g. 18:00, 20:30)</p>
                  <div id="shTimesBuilder"></div>
                  <button type="button" id="addShowTimeBtn" class="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-navy hover:text-navy hover:bg-navy/[0.02] transition-all flex items-center justify-center gap-2">
                    <span class="text-lg">+</span> Add Showtime
                  </button>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="armchair" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Seat Zones / Ticket Categories</h3>
                </div>
                <div class="section-body">
                  <p class="text-xs text-gray-400 mb-3">Zone name, price (THB), and capacity. Price is internal only — website shows "Contact for pricing".</p>
                  <div id="shSeatZonesBuilder"></div>
                  <button type="button" id="addSeatZoneBtn" class="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-navy hover:text-navy hover:bg-navy/[0.02] transition-all flex items-center justify-center gap-2">
                    <span class="text-lg">+</span> Add Seat Zone
                  </button>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="map-pin" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Pickup & Dropoff</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="shPickupTime" class="field-label">Pickup Time</label>
                      <input type="text" id="shPickupTime" placeholder="e.g. 17:00" class="field-input" />
                    </div>
                    <div>
                      <label for="shPickupLocation" class="field-label">Pickup Location</label>
                      <input type="text" id="shPickupLocation" placeholder="e.g. Hotel Lobby" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="shDropoffTime" class="field-label">Dropoff Time</label>
                      <input type="text" id="shDropoffTime" placeholder="e.g. 22:30" class="field-input" />
                    </div>
                    <div>
                      <label for="shDropoffLocation" class="field-label">Dropoff Location</label>
                      <input type="text" id="shDropoffLocation" placeholder="e.g. Same as pickup" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="concierge-bell" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Service Info</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="shMealInfo" class="field-label">Meal Info</label>
                      <input type="text" id="shMealInfo" placeholder="e.g. Dinner buffet included" class="field-input" />
                    </div>
                    <div>
                      <label for="shTransferInfo" class="field-label">Transfer Info</label>
                      <input type="text" id="shTransferInfo" placeholder="e.g. Round-trip hotel transfer" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Details -->
            <div class="sh-tab-panel hidden" data-tab="sh-details">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="sparkles" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Highlights</h3>
                </div>
                <div class="section-body">
                  <label for="shHighlights" class="field-label">Key Highlights <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                  <textarea id="shHighlights" rows="4" placeholder="Live performance&#10;Fire show&#10;Acrobatics" class="field-input resize-y"></textarea>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="package" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Inclusions</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-5">
                    <div>
                      <label for="shIncluded" class="field-label">Included <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                      <textarea id="shIncluded" rows="5" placeholder="Show ticket&#10;Dinner buffet&#10;Hotel transfer" class="field-input resize-y"></textarea>
                    </div>
                    <div>
                      <label for="shNotIncluded" class="field-label">Not Included <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                      <textarea id="shNotIncluded" rows="5" placeholder="Alcoholic beverages&#10;Personal expenses" class="field-input resize-y"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="backpack" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Additional Info</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="shWhatToBring" class="field-label">What to Bring <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                    <textarea id="shWhatToBring" rows="3" placeholder="ID card&#10;Camera" class="field-input resize-y"></textarea>
                  </div>
                  <div>
                    <label for="shImportantNotes" class="field-label">Important Notes</label>
                    <textarea id="shImportantNotes" rows="3" placeholder="Photography may be restricted inside the venue..." class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Settings -->
            <div class="sh-tab-panel hidden" data-tab="sh-settings">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="users" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Capacity</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="shMinParticipants" class="field-label">Min Participants</label>
                      <input type="number" id="shMinParticipants" min="1" value="1" class="field-input" />
                    </div>
                    <div>
                      <label for="shMaxParticipants" class="field-label">Max Participants</label>
                      <input type="number" id="shMaxParticipants" min="1" placeholder="Optional" class="field-input" />
                    </div>
                  </div>
                  <div>
                    <label for="shRating" class="field-label">Rating (0-5)</label>
                    <input type="number" id="shRating" min="0" max="5" step="0.1" value="0" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="scroll-text" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Policies</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="shTerms" class="field-label">Terms & Conditions</label>
                    <textarea id="shTerms" rows="4" class="field-input resize-y"></textarea>
                  </div>
                  <div>
                    <label for="shCancellation" class="field-label">Cancellation Policy</label>
                    <textarea id="shCancellation" rows="4" class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>

              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="eye" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Visibility</h3>
                </div>
                <div class="section-body">
                  <div class="flex flex-col gap-4">
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="shFeatured" class="toggle-checkbox" />
                        <span class="toggle-switch toggle-navy"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Featured Show</span>
                          <p class="text-xs text-gray-400">Show in featured section</p>
                        </div>
                      </div>
                    </label>
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="shActive" checked class="toggle-checkbox" />
                        <span class="toggle-switch toggle-green"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Active</span>
                          <p class="text-xs text-gray-400">Visible to customers</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <div class="text-xs text-gray-400"></div>
          <div class="flex gap-3">
            <button type="button" class="show-modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" form="showForm" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
              <i data-lucide="save" class="w-4 h-4"></i> Save Show
            </button>
          </div>
        </div>

      </div>
    </div>
