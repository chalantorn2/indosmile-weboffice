    <!-- Hotel Modal -->
    <div id="hotelModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="building-2" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="hotelModalTitle" class="text-lg font-bold text-navy">Add New Hotel</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="hotelModalSubtitle">Fill in the details to add a hotel property</p>
            </div>
          </div>
          <button class="hotel-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Tabs -->
        <div class="flex px-7 bg-gray-50/80 border-b border-gray-100 gap-1" id="hotelModalTabBar">
          <button type="button" class="hotel-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy" data-tab="h-basic">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Basic Info</span>
          </button>
          <button type="button" class="hotel-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="h-media">
            <i data-lucide="image" class="w-4 h-4"></i>
            <span>Media</span>
          </button>
          <button type="button" class="hotel-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="h-rooms">
            <i data-lucide="bed-double" class="w-4 h-4"></i>
            <span>Room Types</span>
          </button>
          <button type="button" class="hotel-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="h-settings">
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>Settings</span>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-7" id="hotelModalBody">
          <form id="hotelForm" novalidate>
            <input type="hidden" id="hotelId" />

            <!-- Tab: Basic Info -->
            <div class="hotel-tab-panel" data-tab="h-basic">
              <!-- Section: Hotel Identity -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="building-2" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Hotel Identity</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="hotelName" class="field-label">Hotel Name <span class="text-red-400">*</span></label>
                      <input type="text" id="hotelName" name="name" required placeholder="e.g. The Nai Harn Phuket" class="field-input" />
                    </div>
                    <div>
                      <label for="hotelDestination" class="field-label">Destination <span class="text-red-400">*</span></label>
                      <input type="text" id="hotelDestination" name="destination" required placeholder="e.g. Nai Harn Beach, Phuket" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="hotelStars" class="field-label">Star Rating <span class="text-red-400">*</span></label>
                      <select id="hotelStars" name="stars" class="field-input">
                        <option value="5">5 Stars - Luxury</option>
                        <option value="4" selected>4 Stars - Premium</option>
                        <option value="3">3 Stars - Comfort</option>
                        <option value="2">2 Stars - Standard</option>
                        <option value="1">1 Star - Budget</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Description -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="align-left" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Description</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="hotelShortDescription" class="field-label">Short Description <span class="text-gray-300 font-normal text-xs">(shown on cards)</span></label>
                    <input type="text" id="hotelShortDescription" name="short_description" placeholder="Brief one-liner for hotel cards" maxlength="120" class="field-input" />
                  </div>
                  <div>
                    <label for="hotelDescription" class="field-label">Full Description <span class="text-red-400">*</span></label>
                    <textarea id="hotelDescription" name="description" rows="5" required placeholder="Describe the hotel property..." class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>

              <!-- Section: Contact -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="phone" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Contact & Location</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="hotelAddress" class="field-label">Address</label>
                    <input type="text" id="hotelAddress" name="address" placeholder="Full hotel address" class="field-input" />
                  </div>
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="hotelPhone" class="field-label">Phone</label>
                      <input type="text" id="hotelPhone" name="contact_phone" placeholder="+66 XX XXX XXXX" class="field-input" />
                    </div>
                    <div>
                      <label for="hotelEmail" class="field-label">Email</label>
                      <input type="email" id="hotelEmail" name="contact_email" placeholder="info@hotel.com" class="field-input" />
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label for="hotelWebsite" class="field-label">Website</label>
                      <input type="text" id="hotelWebsite" name="website" placeholder="https://..." class="field-input" />
                    </div>
                    <div>
                      <label for="hotelCheckIn" class="field-label">Check-in Time</label>
                      <input type="text" id="hotelCheckIn" name="check_in_time" placeholder="14:00" class="field-input" />
                    </div>
                    <div>
                      <label for="hotelCheckOut" class="field-label">Check-out Time</label>
                      <input type="text" id="hotelCheckOut" name="check_out_time" placeholder="12:00" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Media -->
            <div class="hotel-tab-panel hidden" data-tab="h-media">
              <!-- Section: Cover Image -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="camera" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Cover Image</h3>
                  <span class="ml-auto text-xs text-gray-400">This image will appear as the hotel thumbnail</span>
                </div>
                <div class="section-body">
                  <input type="hidden" id="hotelMainImage" name="main_image" />
                  <div id="hotelMainImageDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[160px] flex flex-col items-center justify-center relative">
                    <div id="hotelMainImagePreview" class="dropzone-preview w-full"></div>
                    <div id="hotelMainImagePlaceholder" class="dropzone-placeholder pointer-events-none">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="upload" class="w-6 h-6 text-gray-300"></i></div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload</p>
                      <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB)</small>
                    </div>
                    <input type="file" id="hotelMainImageFile" accept="image/jpeg,image/png,image/webp" class="dropzone-input hidden" />
                  </div>
                </div>
              </div>

              <!-- Section: Gallery by Category -->
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="images" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Gallery Images</h3>
                  <span class="ml-auto text-xs text-gray-400" id="hotelGalleryCount">0 images</span>
                </div>
                <div class="section-body">
                  <!-- Upload area + optional pre-select category -->
                  <div class="flex gap-3 mb-3 items-end">
                    <div class="flex-1">
                      <label class="field-label">Pre-select category <span class="text-gray-300 font-normal text-xs">(optional - can change per image later)</span></label>
                      <select id="hotelImageCategory" class="field-input">
                        <option value="Uncategorized">-- No category (assign later) --</option>
                        <optgroup label="General">
                          <option value="Exterior">Exterior</option>
                          <option value="Lobby">Lobby</option>
                          <option value="Bedroom">Bedroom</option>
                          <option value="Bathroom">Bathroom</option>
                          <option value="Restaurant">Restaurant</option>
                          <option value="Pool">Pool</option>
                          <option value="Spa">Spa</option>
                          <option value="Gym">Gym</option>
                          <option value="View">View</option>
                        </optgroup>
                        <optgroup label="Room Types" id="hotelImageCategoryRooms">
                        </optgroup>
                        <optgroup label="Custom">
                          <option value="__custom__">Other (type your own)...</option>
                        </optgroup>
                      </select>
                    </div>
                    <div id="hotelCustomCategoryWrapper" class="flex-1" style="display:none">
                      <label class="field-label">Custom Category</label>
                      <input type="text" id="hotelCustomCategory" placeholder="e.g. Rooftop Bar" class="field-input" />
                    </div>
                  </div>
                  <div id="hotelGalleryDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all mb-5 flex flex-col items-center justify-center">
                    <div class="flex items-center gap-2">
                      <i data-lucide="upload" class="w-5 h-5 text-gray-400"></i>
                      <span class="text-sm font-medium text-gray-500">Drag & drop or click to upload multiple photos</span>
                    </div>
                    <small class="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB each)</small>
                    <input type="file" id="hotelGalleryFiles" accept="image/jpeg,image/png,image/webp" multiple class="dropzone-input hidden" />
                  </div>

                  <!-- Gallery grouped by category -->
                  <div id="hotelGalleryGrouped" class="flex flex-col gap-5"></div>
                </div>
              </div>
            </div>

            <!-- Tab: Room Types -->
            <div class="hotel-tab-panel hidden" data-tab="h-rooms">
              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="bed-double" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Room Types</h3>
                  <span class="ml-auto text-xs text-gray-400" id="roomTypeCount">0 room types</span>
                </div>
                <div class="section-body">
                  <div id="roomTypeBuilder" class="flex flex-col gap-3"></div>
                  <button type="button" id="addRoomTypeBtn" class="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-navy hover:text-navy hover:bg-navy/[0.02] transition-all flex items-center justify-center gap-2">
                    <span class="text-lg">+</span> Add Room Type
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab: Settings -->
            <div class="hotel-tab-panel hidden" data-tab="h-settings">
              <!-- Section: Ratings -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="star" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Ratings</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="hotelRating" class="field-label">Rating (0-5)</label>
                      <input type="number" id="hotelRating" name="rating" min="0" max="5" step="0.1" value="0" class="field-input" />
                    </div>
                    <div>
                      <label for="hotelReviewCount" class="field-label">Review Count</label>
                      <input type="number" id="hotelReviewCount" name="review_count" min="0" value="0" class="field-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Amenities -->
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="sparkles" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Hotel Amenities</h3>
                </div>
                <div class="section-body">
                  <label for="hotelAmenities" class="field-label">Amenities <span class="text-gray-300 font-normal text-xs">(one per line)</span></label>
                  <textarea id="hotelAmenities" name="amenities" rows="5" placeholder="Ocean View&#10;Infinity Pool&#10;Spa&#10;Fitness Center&#10;Free WiFi" class="field-input resize-y"></textarea>
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
                        <input type="checkbox" id="hotelFeatured" name="is_featured" class="toggle-checkbox" />
                        <span class="toggle-switch toggle-navy"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Featured Hotel</span>
                          <p class="text-xs text-gray-400">Show this hotel in the featured section</p>
                        </div>
                      </div>
                    </label>
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="hotelActive" name="is_active" checked class="toggle-checkbox" />
                        <span class="toggle-switch toggle-green"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Active</span>
                          <p class="text-xs text-gray-400">Hotel is visible to customers</p>
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
            <button type="button" class="hotel-modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" form="hotelForm" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
              <i data-lucide="save" class="w-4 h-4"></i> Save Hotel
            </button>
          </div>
        </div>

      </div>
    </div>
