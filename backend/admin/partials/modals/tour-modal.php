    <!-- Tour Modal -->
    <div id="tourModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="map" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="modalTitle" class="text-lg font-bold text-navy">Add New Tour</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="modalSubtitle">Fill in the details to create a tour package</p>
            </div>
          </div>
          <button class="modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Tabs with icons & completion dots -->
        <div class="flex px-7 bg-gray-50/80 border-b border-gray-100 gap-1" id="modalTabBar">
          <button type="button" class="tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy" data-tab="basic">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Basic Info</span>
            <span class="tab-dot w-2 h-2 rounded-full bg-navy/30 ml-1 hidden" data-tab-dot="basic"></span>
          </button>
          <button type="button" class="tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="media">
            <i data-lucide="image" class="w-4 h-4"></i>
            <span>Media</span>
            <span class="tab-dot w-2 h-2 rounded-full bg-navy/30 ml-1 hidden" data-tab-dot="media"></span>
          </button>
          <button type="button" class="tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="details">
            <i data-lucide="list-checks" class="w-4 h-4"></i>
            <span>Details</span>
            <span class="tab-dot w-2 h-2 rounded-full bg-navy/30 ml-1 hidden" data-tab-dot="details"></span>
          </button>
          <button type="button" class="tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="daytrip" id="daytripTabBtn" style="display:none">
            <i data-lucide="sun" class="w-4 h-4"></i>
            <span>One Day Trip</span>
            <span class="tab-dot w-2 h-2 rounded-full bg-navy/30 ml-1 hidden" data-tab-dot="daytrip"></span>
          </button>
          <button type="button" class="tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="settings">
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>Settings</span>
            <span class="tab-dot w-2 h-2 rounded-full bg-navy/30 ml-1 hidden" data-tab-dot="settings"></span>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-7" id="modalBody">
          <form id="tourForm" novalidate>
            <input type="hidden" id="tourId" />
            <input type="hidden" id="tourType" value="inbound" />
            <input type="hidden" id="tourSourceId" value="" />
            <input type="hidden" id="tourSourceSupplier" value="" />

            <!-- Tab: Basic Info -->
            <div class="tab-panel" data-tab="basic">
              <!-- Section: Tour Identity -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="tag" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Tour Identity</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="tourName" class="field-label">Tour Name <span class="text-red-400">*</span></label>
                      <input type="text" id="tourName" name="name" required placeholder="e.g. Phi Phi Island Adventure" class="field-input" />
                    </div>
                    <div>
                      <label for="tourDestination" class="field-label">Destination <span class="text-red-400">*</span></label>
                      <input type="text" id="tourDestination" name="destination" required placeholder="e.g. Krabi, Thailand" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="tourDurationDays" class="field-label">Days <span class="text-red-400">*</span></label>
                      <input type="number" id="tourDurationDays" name="duration_days" required min="1" placeholder="3" class="field-input" />
                    </div>
                    <div id="nightsFieldWrapper">
                      <label for="tourDurationNights" class="field-label">Nights <span class="text-red-400">*</span></label>
                      <input type="number" id="tourDurationNights" name="duration_nights" required min="0" placeholder="2" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Pricing -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="banknote" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Pricing</h3>
                </div>
                <div class="section-body">
                  <p class="text-xs text-gray-400 mb-3">Net is what the tour costs us — internal only, never shown on the website. Agent rates are built on top of it.</p>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="tourNetAdultPrice" class="field-label">Net Adult Price</label>
                      <div class="field-input-group">
                        <span class="field-addon">THB</span>
                        <input type="number" id="tourNetAdultPrice" name="net_adult_price" step="0.01" placeholder="0.00" class="field-input-grouped" />
                      </div>
                    </div>
                    <div>
                      <label for="tourNetChildPrice" class="field-label">Net Child Price</label>
                      <div class="field-input-group">
                        <span class="field-addon">THB</span>
                        <input type="number" id="tourNetChildPrice" name="net_child_price" step="0.01" placeholder="0.00" class="field-input-grouped" />
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label for="tourAdultPrice" class="field-label">Selling Adult Price <span class="text-red-400">*</span></label>
                      <div class="field-input-group">
                        <span class="field-addon">THB</span>
                        <input type="number" id="tourAdultPrice" name="adult_price" step="0.01" required placeholder="0.00" class="field-input-grouped" />
                      </div>
                    </div>
                    <div>
                      <label for="tourChildPrice" class="field-label">Selling Child Price</label>
                      <div class="field-input-group">
                        <span class="field-addon">THB</span>
                        <input type="number" id="tourChildPrice" name="child_price" step="0.01" placeholder="0.00" class="field-input-grouped" />
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <label class="flex items-center gap-2 mb-3 cursor-pointer">
                      <input type="checkbox" id="tourParkFeeIncluded" name="park_fee_included" />
                      <span class="field-label" style="margin:0">National park fee already included in the prices above</span>
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="tourParkFeeAdult" class="field-label">Park Fee &mdash; Adult</label>
                        <div class="field-input-group">
                          <span class="field-addon">THB</span>
                          <input type="number" id="tourParkFeeAdult" name="park_fee_adult" step="0.01" placeholder="0.00" class="field-input-grouped" />
                        </div>
                      </div>
                      <div>
                        <label for="tourParkFeeChild" class="field-label">Park Fee &mdash; Child</label>
                        <div class="field-input-group">
                          <span class="field-addon">THB</span>
                          <input type="number" id="tourParkFeeChild" name="park_fee_child" step="0.01" placeholder="0.00" class="field-input-grouped" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Description -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="align-left" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Description</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="tourShortDescription" class="field-label">Short Description <span class="text-gray-300 font-normal text-xs">(shown on cards)</span></label>
                    <input type="text" id="tourShortDescription" name="short_description" placeholder="Brief one-liner for tour cards" maxlength="120" class="field-input" />
                  </div>
                  <div>
                    <label for="tourDescription" class="field-label">Full Description <span class="text-red-400">*</span></label>
                    <textarea id="tourDescription" name="description" rows="5" required placeholder="Describe the full tour experience..." class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Media -->
            <div class="tab-panel hidden" data-tab="media">
              <!-- Section: Main Image -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="camera" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Cover Image</h3>
                  <span class="ml-auto text-xs text-gray-400">This image will appear as the tour thumbnail</span>
                </div>
                <div class="section-body">
                  <input type="hidden" id="tourMainImage" name="main_image" />
                  <div id="mainImageDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[160px] flex flex-col items-center justify-center relative">
                    <div id="mainImagePreview" class="dropzone-preview w-full"></div>
                    <div id="mainImagePlaceholder" class="dropzone-placeholder pointer-events-none">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="upload" class="w-6 h-6 text-gray-300"></i></div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload</p>
                      <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB) &bull; Recommended 1200x800</small>
                    </div>
                    <input type="file" id="mainImageFile" accept="image/jpeg,image/png,image/webp" class="dropzone-input hidden" />
                  </div>
                </div>
              </div>

              <!-- Section: Gallery -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="images" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Gallery</h3>
                  <span class="ml-auto text-xs text-gray-400" id="galleryCount">0 / 30 images</span>
                </div>
                <div class="section-body">
                  <div id="galleryDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[160px] flex flex-col items-center justify-center relative">
                    <div id="galleryPreview" class="dropzone-gallery flex flex-wrap gap-2.5 w-full"></div>
                    <div id="galleryPlaceholder" class="dropzone-placeholder pointer-events-none">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="plus" class="w-6 h-6 text-gray-300"></i></div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload multiple images</p>
                      <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB each)</small>
                    </div>
                    <input type="file" id="galleryFiles" accept="image/jpeg,image/png,image/webp" multiple class="dropzone-input hidden" />
                  </div>
                  <input type="hidden" id="tourGalleryImages" name="gallery_images" />
                </div>
              </div>
            </div>

            <!-- Tab: Details -->
            <div class="tab-panel hidden" data-tab="details">
              <!-- Section: Highlights -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="sparkles" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Highlights</h3>
                </div>
                <div class="section-body">
                  <label for="tourHighlights" class="field-label">Key Highlights <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                  <textarea id="tourHighlights" name="highlights" rows="4" placeholder="Phi Phi Islands&#10;Snorkeling&#10;Beach BBQ" class="field-input resize-y"></textarea>
                </div>
              </div>

              <!-- Section: Inclusions -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="package" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Inclusions</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-5">
                    <div>
                      <label for="tourIncluded" class="field-label flex items-center gap-1.5">
                        <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                        Included <span class="text-gray-300 font-normal text-xs">(one per line)</span>
                      </label>
                      <textarea id="tourIncluded" name="included" rows="5" placeholder="Hotel accommodation&#10;All meals&#10;Transportation" class="field-input resize-y"></textarea>
                    </div>
                    <div>
                      <label for="tourNotIncluded" class="field-label flex items-center gap-1.5">
                        <span class="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">✕</span>
                        Not Included <span class="text-gray-300 font-normal text-xs">(one per line)</span>
                      </label>
                      <textarea id="tourNotIncluded" name="not_included" rows="5" placeholder="International flights&#10;Personal expenses" class="field-input resize-y"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Itinerary -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="calendar-days" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Itinerary</h3>
                  <span class="ml-auto text-xs text-gray-400" id="itineraryDayCount">0 days</span>
                </div>
                <div class="section-body">
                  <div id="itineraryBuilder" class="flex flex-col gap-3"></div>
                  <button type="button" id="addItineraryDay" class="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-navy hover:text-navy hover:bg-navy/[0.02] transition-all flex items-center justify-center gap-2">
                    <span class="text-lg">+</span> Add Day
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab: One Day Trip -->
            <div class="tab-panel hidden" data-tab="daytrip">
              <!-- Section: Pickup & Dropoff -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="map-pin" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Pickup & Dropoff</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="tourPickupTime" class="field-label">Pickup Time</label>
                      <input type="text" id="tourPickupTime" name="pickup_time" placeholder="e.g. 07:30 AM" class="field-input" />
                    </div>
                    <div>
                      <label for="tourPickupLocation" class="field-label">Pickup Location</label>
                      <input type="text" id="tourPickupLocation" name="pickup_location" placeholder="e.g. Hotel Lobby / Phuket Town" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="tourDropoffTime" class="field-label">Dropoff Time</label>
                      <input type="text" id="tourDropoffTime" name="dropoff_time" placeholder="e.g. 06:00 PM" class="field-input" />
                    </div>
                    <div>
                      <label for="tourDropoffLocation" class="field-label">Dropoff Location</label>
                      <input type="text" id="tourDropoffLocation" name="dropoff_location" placeholder="e.g. Same as pickup" class="field-input" />
                    </div>
                  </div>
                  <div>
                    <label for="tourDepartureTimes" class="field-label">Available Departure Times <span class="text-gray-300 font-normal text-xs">(comma-separated)</span></label>
                    <input type="text" id="tourDepartureTimes" name="departure_times" placeholder="07:30, 08:00, 09:00" class="field-input" />
                  </div>
                </div>
              </div>

              <!-- Section: Service Info -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="concierge-bell" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Service Info</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="tourMealInfo" class="field-label">Meal Info</label>
                      <input type="text" id="tourMealInfo" name="meal_info" placeholder="e.g. Lunch included" class="field-input" />
                    </div>
                    <div>
                      <label for="tourTransferInfo" class="field-label">Transfer Info</label>
                      <input type="text" id="tourTransferInfo" name="transfer_info" placeholder="e.g. Round-trip hotel transfer" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Additional Info -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="backpack" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Additional Info</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="tourWhatToBring" class="field-label">What to Bring <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                    <textarea id="tourWhatToBring" name="what_to_bring" rows="4" placeholder="Sunscreen&#10;Swimsuit&#10;Camera&#10;Comfortable shoes" class="field-input resize-y"></textarea>
                  </div>
                  <div>
                    <label for="tourImportantNotes" class="field-label">Important Notes</label>
                    <textarea id="tourImportantNotes" name="important_notes" rows="4" placeholder="Additional important information for travelers..." class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Settings -->
            <div class="tab-panel hidden" data-tab="settings">
              <!-- Section: Capacity -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="users" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Capacity & Difficulty</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="tourMinParticipants" class="field-label">Min Participants</label>
                      <input type="number" id="tourMinParticipants" name="min_participants" min="1" value="1" class="field-input" />
                    </div>
                    <div>
                      <label for="tourMaxParticipants" class="field-label">Max Participants</label>
                      <input type="number" id="tourMaxParticipants" name="max_participants" min="1" placeholder="20" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="tourDifficulty" class="field-label">Difficulty Level</label>
                      <select id="tourDifficulty" name="difficulty_level" class="field-input">
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                    <div>
                      <label for="tourRating" class="field-label">Rating (0-5)</label>
                      <input type="number" id="tourRating" name="rating" min="0" max="5" step="0.1" value="0" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Policies -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="scroll-text" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Policies</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="tourTerms" class="field-label">Terms & Conditions</label>
                    <textarea id="tourTerms" name="terms_conditions" rows="4" placeholder="Booking terms and conditions..." class="field-input resize-y"></textarea>
                  </div>
                  <div>
                    <label for="tourCancellation" class="field-label">Cancellation Policy</label>
                    <textarea id="tourCancellation" name="cancellation_policy" rows="4" placeholder="Free cancellation up to 48 hours before..." class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>

              <!-- Section: Visibility -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="eye" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Visibility</h3>
                </div>
                <div class="section-body">
                  <div class="flex flex-col gap-4">
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="tourFeatured" name="is_featured" class="toggle-checkbox" />
                        <span class="toggle-switch toggle-navy"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Featured Tour</span>
                          <p class="text-xs text-gray-400">Show this tour in the featured section on homepage</p>
                        </div>
                      </div>
                    </label>
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="tourActive" name="is_active" checked class="toggle-checkbox" />
                        <span class="toggle-switch toggle-green"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Active</span>
                          <p class="text-xs text-gray-400">Tour is visible and bookable by customers</p>
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
          <div class="text-xs text-gray-400" id="modalFooterHint">
            <span class="hidden" id="unsavedHint">⚠️ You have unsaved changes</span>
          </div>
          <div class="flex gap-3">
            <button type="button" class="modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" form="tourForm" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
              <i data-lucide="save" class="w-4 h-4"></i> Save Tour
            </button>
          </div>
        </div>

      </div>
    </div>
