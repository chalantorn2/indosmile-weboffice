// =====================
// Hotels
// =====================
let hotels = [];
let hotelGalleryImages = []; // {image_url, category, caption, sort_order}
const PRESET_CATEGORIES = ['Exterior', 'Lobby', 'Bedroom', 'Bathroom', 'Restaurant', 'Pool', 'Spa', 'Gym', 'View'];
let selectedGalleryIndexes = new Set();
let hotelsCurrentPage = 1;
const hotelsPerPage = 20;

async function loadHotels() {
    try {
        const response = await fetch(`${API_BASE}/hotels.php?active=&page=${hotelsCurrentPage}&limit=${hotelsPerPage}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            hotels = data.data.items || [];
            displayHotels(hotels, data.data.pagination || {});
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

function displayHotels(hotels, pagination = {}) {
    const container = document.getElementById('hotelsTable');

    if (!hotels || hotels.length === 0) {
        container.innerHTML = '<p>No hotels found. Click "+ Add New Hotel" to create one.</p>';
        return;
    }

    // Running number continues across pages
    const startIndex = ((pagination.current_page || hotelsCurrentPage) - 1) * hotelsPerPage;

    let html = `
        <table>
            <thead>
                <tr>
                    <th style="width:36px"></th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Destination</th>
                    <th>Stars</th>
                    <th>Rooms</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${hotels.map((hotel, index) => `
                    <tr>
                        <td class="text-gray-400">${startIndex + index + 1}</td>
                        <td>
                            ${hotel.main_image
                                ? `<img src="${hotel.main_image}" alt="${hotel.name}" class="tour-thumb" onerror="this.style.display='none'">`
                                : '<span class="no-image">No img</span>'}
                        </td>
                        <td><strong>${hotel.name}</strong></td>
                        <td>${hotel.destination}</td>
                        <td>${'★'.repeat(hotel.stars)}${'☆'.repeat(5 - hotel.stars)}</td>
                        <td>${hotel.room_types ? hotel.room_types.length : 0} types</td>
                        <td>
                            ${hotel.is_featured == 1 ? '<span class="badge badge-confirmed">Featured</span> ' : ''}
                            ${hotel.is_active == 1 ? '<span class="badge badge-confirmed">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editHotel(${hotel.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteHotel(${hotel.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    if (pagination.total_pages > 1) {
        html += `<div class="pagination">
            <button onclick="hotelsGoToPage(${pagination.current_page - 1})" ${!pagination.has_prev ? 'disabled' : ''}>← Prev</button>
            <span>Page ${pagination.current_page} of ${pagination.total_pages} (${pagination.total_items} hotels)</span>
            <button onclick="hotelsGoToPage(${pagination.current_page + 1})" ${!pagination.has_next ? 'disabled' : ''}>Next →</button>
        </div>`;
    }

    container.innerHTML = html;
}

function hotelsGoToPage(page) {
    if (page < 1) return;
    hotelsCurrentPage = page;
    loadHotels();
}

function openHotelModal(hotelId = null) {
    const modal = document.getElementById('hotelModal');
    const form = document.getElementById('hotelForm');

    form.reset();
    hotelGalleryImages = [];
    clearRoomTypeBuilder();

    switchHotelTab('h-basic');

    // Reset image areas
    setHotelMainImagePreview('');
    renderHotelGalleryGrouped();
    updateRoomTypeCategoryOptions();

    const title = document.getElementById('hotelModalTitle');
    const subtitle = document.getElementById('hotelModalSubtitle');

    if (hotelId) {
        title.textContent = 'Edit Hotel';
        subtitle.textContent = 'Update the hotel property details';
        const hotel = hotels.find(h => h.id == hotelId);
        if (hotel) {
            document.getElementById('hotelId').value = hotel.id;
            document.getElementById('hotelName').value = hotel.name || '';
            document.getElementById('hotelDestination').value = hotel.destination || '';
            document.getElementById('hotelStars').value = hotel.stars || 4;
            document.getElementById('hotelDescription').value = hotel.description || '';
            document.getElementById('hotelShortDescription').value = hotel.short_description || '';
            document.getElementById('hotelAddress').value = hotel.address || '';
            document.getElementById('hotelPhone').value = hotel.contact_phone || '';
            document.getElementById('hotelEmail').value = hotel.contact_email || '';
            document.getElementById('hotelWebsite').value = hotel.website || '';
            document.getElementById('hotelCheckIn').value = hotel.check_in_time || '';
            document.getElementById('hotelCheckOut').value = hotel.check_out_time || '';
            document.getElementById('hotelRating').value = hotel.rating || 0;
            document.getElementById('hotelReviewCount').value = hotel.review_count || 0;

            // Amenities
            const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
            document.getElementById('hotelAmenities').value = amenities.join('\n');

            // Visibility
            document.getElementById('hotelFeatured').checked = hotel.is_featured == 1;
            document.getElementById('hotelActive').checked = hotel.is_active == 1;

            // Main image
            setHotelMainImagePreview(hotel.main_image || '');

            // Gallery images
            if (Array.isArray(hotel.images)) {
                hotelGalleryImages = hotel.images.map(img => ({
                    image_url: img.image_url,
                    category: img.category || 'Other',
                    caption: img.caption || '',
                    sort_order: img.sort_order || 0
                }));
            }
            renderHotelGalleryGrouped();

            // Room types
            if (Array.isArray(hotel.room_types)) {
                hotel.room_types.forEach(room => addRoomType(room));
            }
            updateRoomTypeCategoryOptions();
        }
    } else {
        title.textContent = 'Add New Hotel';
        subtitle.textContent = 'Fill in the details to add a hotel property';
        document.getElementById('hotelId').value = '';
        document.getElementById('hotelActive').checked = true;
    }

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function handleHotelSubmit(e) {
    e.preventDefault();

    const requiredFields = [
        { id: 'hotelName', tab: 'h-basic', label: 'Hotel Name' },
        { id: 'hotelDestination', tab: 'h-basic', label: 'Destination' },
        { id: 'hotelDescription', tab: 'h-basic', label: 'Full Description' },
    ];

    for (const field of requiredFields) {
        const el = document.getElementById(field.id);
        if (!el.value || el.value.trim() === '') {
            switchHotelTab(field.tab);
            el.focus();
            showToast(`Please fill in "${field.label}"`, 'warning');
            return;
        }
    }

    const hotelId = document.getElementById('hotelId').value;

    const hotelData = {
        name: document.getElementById('hotelName').value,
        destination: document.getElementById('hotelDestination').value,
        stars: parseInt(document.getElementById('hotelStars').value),
        description: document.getElementById('hotelDescription').value,
        short_description: document.getElementById('hotelShortDescription').value,
        address: document.getElementById('hotelAddress').value || null,
        contact_phone: document.getElementById('hotelPhone').value || null,
        contact_email: document.getElementById('hotelEmail').value || null,
        website: document.getElementById('hotelWebsite').value || null,
        check_in_time: document.getElementById('hotelCheckIn').value || null,
        check_out_time: document.getElementById('hotelCheckOut').value || null,
        main_image: document.getElementById('hotelMainImage').value,
        rating: parseFloat(document.getElementById('hotelRating').value) || 0,
        review_count: parseInt(document.getElementById('hotelReviewCount').value) || 0,
        amenities: document.getElementById('hotelAmenities').value
            .split('\n').map(a => a.trim()).filter(a => a),
        is_featured: document.getElementById('hotelFeatured').checked ? 1 : 0,
        is_active: document.getElementById('hotelActive').checked ? 1 : 0,
        images: hotelGalleryImages.map((img, index) => ({ ...img, sort_order: index })),
        room_types: getRoomTypeData()
    };

    try {
        const url = hotelId ? `${API_BASE}/hotels.php?id=${hotelId}` : `${API_BASE}/hotels.php`;
        const method = hotelId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(hotelData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal('hotelModal');
            loadHotels();
            invalidateDestinationCache();
            showToast(hotelId ? 'Hotel updated successfully!' : 'Hotel created successfully!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error saving hotel:', error);
        showToast('Error saving hotel. Please try again.', 'error');
    }
}

async function editHotel(id) {
    openHotelModal(id);
}

async function deleteHotel(id) {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
        const response = await fetch(`${API_BASE}/hotels.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            loadHotels();
            showToast('Hotel deleted successfully!', 'success');
        } else {
            showToast('Error deleting hotel: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        showToast('Error deleting hotel', 'error');
    }
}

// =====================
// Hotel Tab Switching
// =====================
function switchHotelTab(tabName) {
    document.querySelectorAll('#hotelModalTabBar .hotel-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.className = 'hotel-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy';
        } else {
            btn.className = 'hotel-tab-btn px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600';
        }
    });

    document.querySelectorAll('.hotel-tab-panel').forEach(panel => {
        if (panel.dataset.tab === tabName) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

// =====================
// Hotel Main Image Upload
// =====================
async function handleHotelMainImageUpload(files) {
    const file = files[0];
    const preview = document.getElementById('hotelMainImagePreview');
    const placeholder = document.getElementById('hotelMainImagePlaceholder');

    placeholder.style.display = 'none';
    preview.innerHTML = '<div class="upload-loading"><div class="spinner"></div><span>Uploading...</span></div>';

    try {
        const data = await uploadFile(file);

        if (data.success) {
            const url = data.data.url;
            document.getElementById('hotelMainImage').value = url;
            preview.innerHTML = `
                <div class="img-preview-item main-preview">
                    <img src="${url}" alt="Main image">
                    <button type="button" class="img-remove-btn" onclick="removeHotelMainImage(event)">&times;</button>
                </div>`;
        } else {
            showToast('Upload failed: ' + data.message, 'error');
            preview.innerHTML = '';
            placeholder.style.display = '';
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload error. Please try again.', 'error');
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

function removeHotelMainImage(e) {
    e.stopPropagation();
    document.getElementById('hotelMainImage').value = '';
    document.getElementById('hotelMainImagePreview').innerHTML = '';
    document.getElementById('hotelMainImagePlaceholder').style.display = '';
}

function setHotelMainImagePreview(url) {
    const preview = document.getElementById('hotelMainImagePreview');
    const placeholder = document.getElementById('hotelMainImagePlaceholder');

    if (url) {
        document.getElementById('hotelMainImage').value = url;
        preview.innerHTML = `
            <div class="img-preview-item main-preview">
                <img src="${url}" alt="Main image">
                <button type="button" class="img-remove-btn" onclick="removeHotelMainImage(event)">&times;</button>
            </div>`;
        placeholder.style.display = 'none';
    } else {
        document.getElementById('hotelMainImage').value = '';
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

// =====================
// Hotel Gallery Upload (by category)
// =====================
function getGalleryCategoryOptions(currentValue) {
    // Build category options: presets + room types + any custom categories already used
    const roomNames = [];
    document.querySelectorAll('.room-type-item .room-name').forEach(input => {
        const name = input.value.trim();
        if (name) roomNames.push(name);
    });

    // Collect custom categories already in use
    const usedCategories = new Set(hotelGalleryImages.map(img => img.category));
    const customUsed = [...usedCategories].filter(c => c && c !== 'Uncategorized' && !PRESET_CATEGORIES.includes(c) && !roomNames.includes(c));

    let html = '<option value="Uncategorized"' + (currentValue === 'Uncategorized' ? ' selected' : '') + '>Uncategorized</option>';
    html += '<optgroup label="General">';
    PRESET_CATEGORIES.forEach(cat => {
        html += `<option value="${cat}"${currentValue === cat ? ' selected' : ''}>${cat}</option>`;
    });
    html += '</optgroup>';

    if (roomNames.length > 0) {
        html += '<optgroup label="Room Types">';
        roomNames.forEach(name => {
            html += `<option value="${name}"${currentValue === name ? ' selected' : ''}>${name}</option>`;
        });
        html += '</optgroup>';
    }

    if (customUsed.length > 0) {
        html += '<optgroup label="Custom">';
        customUsed.forEach(cat => {
            html += `<option value="${cat}"${currentValue === cat ? ' selected' : ''}>${cat}</option>`;
        });
        html += '</optgroup>';
    }

    html += '<option value="__custom__">+ New category...</option>';
    return html;
}

async function handleHotelGalleryUpload(files) {
    const categorySelect = document.getElementById('hotelImageCategory');
    let category = categorySelect.value;

    if (category === '__custom__') {
        category = document.getElementById('hotelCustomCategory').value.trim();
        if (!category) {
            category = 'Uncategorized';
        }
    }

    // Show loading in gallery area
    const container = document.getElementById('hotelGalleryGrouped');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'upload-loading';
    loadingDiv.innerHTML = `<div class="spinner"></div><span>Uploading ${files.length} image${files.length > 1 ? 's' : ''}...</span>`;
    container.prepend(loadingDiv);

    try {
        const data = await uploadFiles(files);

        loadingDiv.remove();

        if (data.success && data.data.urls) {
            data.data.urls.forEach(url => {
                hotelGalleryImages.push({
                    image_url: url,
                    category: category,
                    caption: '',
                    sort_order: hotelGalleryImages.length
                });
            });
            renderHotelGalleryGrouped();
        }

        if (data.data.errors && data.data.errors.length > 0) {
            showToast('Some uploads failed: ' + data.data.errors.join(', '), 'warning');
        }
    } catch (error) {
        loadingDiv.remove();
        console.error('Gallery upload error:', error);
        showToast('Upload error. Please try again.', 'error');
    }
}

function renderHotelGalleryGrouped() {
    const container = document.getElementById('hotelGalleryGrouped');
    selectedGalleryIndexes.clear();
    updateBulkBar();

    if (hotelGalleryImages.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 text-center py-6">No gallery images yet. Upload photos above.</p>';
    } else {
        // Group images by category
        const groups = {};
        hotelGalleryImages.forEach((img, index) => {
            const cat = img.category || 'Uncategorized';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ ...img, _index: index });
        });

        // Sort: Uncategorized first, then alphabetical
        const sortedEntries = Object.entries(groups).sort((a, b) => {
            if (a[0] === 'Uncategorized') return -1;
            if (b[0] === 'Uncategorized') return 1;
            return a[0].localeCompare(b[0]);
        });

        container.innerHTML = sortedEntries.map(([category, images]) => {
            const groupIndexes = images.map(img => img._index);
            return `
            <div class="border border-gray-100 rounded-xl overflow-hidden ${category === 'Uncategorized' ? 'border-amber-200 bg-amber-50/30' : ''}">
                <div class="bg-gray-50 px-4 py-2.5 flex items-center justify-between ${category === 'Uncategorized' ? 'bg-amber-50' : ''}">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="gallery-group-checkbox" onchange="toggleGalleryGroup(this, [${groupIndexes.join(',')}])" />
                        <span class="text-sm font-semibold ${category === 'Uncategorized' ? 'text-amber-700' : 'text-navy'}">${category === 'Uncategorized' ? 'Uncategorized' : category}</span>
                    </label>
                    <span class="text-xs text-gray-400">${images.length} photo${images.length > 1 ? 's' : ''}</span>
                </div>
                <div class="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    ${images.map(img => `
                        <div class="gallery-thumb relative group cursor-pointer rounded-lg overflow-hidden border-2 ${selectedGalleryIndexes.has(img._index) ? 'border-navy' : 'border-transparent'}" 
                             onclick="toggleGallerySelect(${img._index}, event)"
                             draggable="true" 
                             ondragstart="handleHotelGalleryDragStart(event, ${img._index})" 
                             ondragover="handleHotelGalleryDragOver(event)" 
                             ondragenter="handleHotelGalleryDragEnter(event)"
                             ondragleave="handleHotelGalleryDragLeave(event)"
                             ondrop="handleHotelGalleryDrop(event, ${img._index})" 
                             ondragend="handleHotelGalleryDragEnd(event)"
                             style="cursor: grab; transition: transform 0.2s, box-shadow 0.2s;">
                            <img src="${img.image_url}" alt="${img.caption || category}" class="w-full h-24 object-cover" style="pointer-events: none;">
                            <div class="absolute top-1.5 left-1.5">
                                <input type="checkbox" class="gallery-checkbox" data-index="${img._index}" ${selectedGalleryIndexes.has(img._index) ? 'checked' : ''} onclick="event.stopPropagation(); toggleGallerySelect(${img._index}, event)" />
                            </div>
                            <button type="button" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation(); removeHotelGalleryImage(event, ${img._index})">&times;</button>
                            ${img.caption ? `<div class="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5 text-white text-[10px] truncate">${img.caption}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('');
    }

    const countEl = document.getElementById('hotelGalleryCount');
    if (countEl) countEl.textContent = hotelGalleryImages.length + ' images';
}

// =====================
// Gallery Bulk Selection
// =====================
function toggleGallerySelect(index, e) {
    if (e && e.target.tagName === 'INPUT') {
        // Checkbox click — toggle based on checked state
        if (e.target.checked) {
            selectedGalleryIndexes.add(index);
        } else {
            selectedGalleryIndexes.delete(index);
        }
    } else {
        // Thumbnail click — toggle
        if (selectedGalleryIndexes.has(index)) {
            selectedGalleryIndexes.delete(index);
        } else {
            selectedGalleryIndexes.add(index);
        }
    }
    // Update visual state without full re-render
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        const cb = thumb.querySelector('.gallery-checkbox');
        if (!cb) return;
        const idx = parseInt(cb.dataset.index);
        const isSelected = selectedGalleryIndexes.has(idx);
        cb.checked = isSelected;
        thumb.classList.toggle('border-navy', isSelected);
        thumb.classList.toggle('border-transparent', !isSelected);
    });
    updateBulkBar();
}

function toggleGalleryGroup(checkbox, indexes) {
    if (checkbox.checked) {
        indexes.forEach(i => selectedGalleryIndexes.add(i));
    } else {
        indexes.forEach(i => selectedGalleryIndexes.delete(i));
    }
    // Update visual state
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        const cb = thumb.querySelector('.gallery-checkbox');
        if (!cb) return;
        const idx = parseInt(cb.dataset.index);
        const isSelected = selectedGalleryIndexes.has(idx);
        cb.checked = isSelected;
        thumb.classList.toggle('border-navy', isSelected);
        thumb.classList.toggle('border-transparent', !isSelected);
    });
    updateBulkBar();
}

function updateBulkBar() {
    let bar = document.getElementById('galleryBulkBar');
    const count = selectedGalleryIndexes.size;

    if (count === 0) {
        if (bar) bar.style.display = 'none';
        return;
    }

    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'galleryBulkBar';
        bar.className = 'gallery-bulk-bar';
        const section = document.getElementById('hotelGalleryGrouped').parentElement;
        section.insertBefore(bar, document.getElementById('hotelGalleryGrouped'));
    }

    bar.style.display = '';
    bar.innerHTML = `
        <div class="flex items-center gap-3 flex-wrap">
            <span class="text-sm font-semibold text-navy">${count} selected</span>
            <select id="bulkCategorySelect" class="field-input !py-1.5 !text-xs !w-auto">
                ${getGalleryCategoryOptions('')}
            </select>
            <button type="button" class="px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 transition-all" onclick="applyBulkCategory()">Apply Category</button>
            <button type="button" class="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-all" onclick="clearGallerySelection()">Deselect All</button>
            <button type="button" class="px-4 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-all ml-auto" onclick="bulkDeleteGalleryImages()">Delete Selected</button>
        </div>
    `;
}

function applyBulkCategory() {
    const select = document.getElementById('bulkCategorySelect');
    let category = select.value;

    if (category === '__custom__') {
        const custom = prompt('Enter new category name:');
        if (!custom || !custom.trim()) return;
        category = custom.trim();
    }

    if (!category || category === 'Uncategorized') {
        category = 'Uncategorized';
    }

    selectedGalleryIndexes.forEach(idx => {
        hotelGalleryImages[idx].category = category;
    });

    selectedGalleryIndexes.clear();
    renderHotelGalleryGrouped();
    showToast(`Category updated for ${selectedGalleryIndexes.size || 'selected'} images`, 'success');
}

function clearGallerySelection() {
    selectedGalleryIndexes.clear();
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        const cb = thumb.querySelector('.gallery-checkbox');
        if (cb) cb.checked = false;
        thumb.classList.remove('border-navy');
        thumb.classList.add('border-transparent');
    });
    document.querySelectorAll('.gallery-group-checkbox').forEach(cb => cb.checked = false);
    updateBulkBar();
}

function bulkDeleteGalleryImages() {
    const count = selectedGalleryIndexes.size;
    if (!confirm(`Delete ${count} selected image${count > 1 ? 's' : ''}?`)) return;

    // Delete from highest index first to avoid shifting
    const sorted = [...selectedGalleryIndexes].sort((a, b) => b - a);
    sorted.forEach(idx => hotelGalleryImages.splice(idx, 1));

    selectedGalleryIndexes.clear();
    renderHotelGalleryGrouped();
    showToast(`${count} image${count > 1 ? 's' : ''} deleted`, 'success');
}

function changeHotelImageCategory(index, newCategory) {
    if (newCategory === '__custom__') {
        const custom = prompt('Enter new category name:');
        if (custom && custom.trim()) {
            hotelGalleryImages[index].category = custom.trim();
        }
    } else {
        hotelGalleryImages[index].category = newCategory;
    }
    renderHotelGalleryGrouped();
}

function changeHotelImageCaption(index, caption) {
    hotelGalleryImages[index].caption = caption;
}

function removeHotelGalleryImage(e, index) {
    e.stopPropagation();
    hotelGalleryImages.splice(index, 1);
    renderHotelGalleryGrouped();
}

let draggedHotelGalleryIndex = null;

function handleHotelGalleryDragStart(e, index) {
    draggedHotelGalleryIndex = index;
    const thumb = e.target.closest('.gallery-thumb');
    if (thumb) {
        thumb.style.opacity = '0.4';
        thumb.style.transform = 'scale(0.95)';
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
}

function handleHotelGalleryDragEnter(e) {
    e.preventDefault();
    const target = e.target.closest('.gallery-thumb');
    if (target) {
        target.style.transform = 'scale(1.05)';
        target.style.boxShadow = '0 0 0 2px #0056b3';
    }
}

function handleHotelGalleryDragLeave(e) {
    const target = e.target.closest('.gallery-thumb');
    // We only reset if we genuinely leave the generic container.
    // However, simplest is to reset transform here to avoid stuck states.
    if (target) {
        target.style.transform = '';
        target.style.boxShadow = '';
    }
}

function handleHotelGalleryDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleHotelGalleryDrop(e, targetIndex) {
    e.stopPropagation();
    e.preventDefault();
    const target = e.target.closest('.gallery-thumb');
    if (target) {
        target.style.transform = '';
        target.style.boxShadow = '';
    }

    if (draggedHotelGalleryIndex !== null && draggedHotelGalleryIndex !== targetIndex) {
        // Save the target category BEFORE splicing
        const targetCategory = hotelGalleryImages[targetIndex] ? hotelGalleryImages[targetIndex].category : null;

        const item = hotelGalleryImages.splice(draggedHotelGalleryIndex, 1)[0];
        
        // When dropping on another image, adopt its category so it actually places there
        if (targetCategory) {
            item.category = targetCategory;
        }

        hotelGalleryImages.splice(targetIndex, 0, item);
        renderHotelGalleryGrouped();
    }
    return false;
}

function handleHotelGalleryDragEnd(e) {
    const thumb = e.target.closest('.gallery-thumb');
    if (thumb) {
        thumb.style.opacity = '1';
        thumb.style.transform = '';
    }
    draggedHotelGalleryIndex = null;
    document.querySelectorAll('.gallery-thumb').forEach(el => {
        el.style.transform = '';
        el.style.boxShadow = '';
    });
}

// =====================
// Hotel Room Types Builder
// =====================
function addRoomType(existingData = null) {
    const builder = document.getElementById('roomTypeBuilder');
    const count = builder.querySelectorAll('.room-type-item').length + 1;

    const name = existingData ? (existingData.name || '') : '';
    const description = existingData ? (existingData.description || '') : '';
    const maxGuests = existingData ? (existingData.max_guests || 2) : 2;
    const bedType = existingData ? (existingData.bed_type || '') : '';
    const roomSize = existingData ? (existingData.room_size || '') : '';
    const amenities = existingData && Array.isArray(existingData.amenities) ? existingData.amenities.join(', ') : '';

    const div = document.createElement('div');
    div.className = 'room-type-item';
    div.innerHTML = `
        <div class="itinerary-day-bar" onclick="toggleRoomType(this)">
            <span class="itinerary-day-badge">${count}</span>
            <span class="itinerary-day-bar-title">
                <span class="room-title-text">${name || 'Room Type ' + count}</span>
                <span class="day-subtitle">${bedType ? bedType + ' Bed' : ''}</span>
            </span>
            <button type="button" class="itinerary-collapse-btn" title="Toggle"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
            <button type="button" class="itinerary-remove-btn" onclick="event.stopPropagation(); removeRoomType(this)" title="Remove"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
        <div class="itinerary-day-content">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="field-label">Room Name <span class="text-red-400">*</span></label>
                    <input type="text" class="room-name field-input" value="${name}" placeholder="e.g. Deluxe Ocean View" oninput="updateRoomBarTitle(this)">
                </div>
                <div>
                    <label class="field-label">Bed Type</label>
                    <select class="room-bed-type field-input" oninput="updateRoomBarTitle(this)">
                        <option value="">Select...</option>
                        <option value="King" ${bedType === 'King' ? 'selected' : ''}>King</option>
                        <option value="Queen" ${bedType === 'Queen' ? 'selected' : ''}>Queen</option>
                        <option value="Twin" ${bedType === 'Twin' ? 'selected' : ''}>Twin</option>
                        <option value="Double" ${bedType === 'Double' ? 'selected' : ''}>Double</option>
                        <option value="Single" ${bedType === 'Single' ? 'selected' : ''}>Single</option>
                        <option value="Bunk" ${bedType === 'Bunk' ? 'selected' : ''}>Bunk</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="field-label">Max Guests</label>
                    <input type="number" class="room-max-guests field-input" min="1" value="${maxGuests}" placeholder="2">
                </div>
                <div>
                    <label class="field-label">Room Size (sqm)</label>
                    <input type="number" class="room-size field-input" min="0" step="0.1" value="${roomSize}" placeholder="32">
                </div>
            </div>
            <div class="mb-3">
                <label class="field-label">Description</label>
                <textarea class="room-description field-input resize-y" rows="2" placeholder="Describe this room type...">${description}</textarea>
            </div>
            <div>
                <label class="field-label">Amenities <span class="text-gray-300 font-normal text-xs">(comma-separated)</span></label>
                <input type="text" class="room-amenities field-input" value="${amenities}" placeholder="WiFi, TV, Minibar, Balcony, Sea View">
            </div>
        </div>
    `;

    builder.appendChild(div);
    updateRoomTypeCount();
    updateRoomTypeCategoryOptions();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleRoomType(bar) {
    const content = bar.nextElementSibling;
    const collapseBtn = bar.querySelector('.itinerary-collapse-btn');
    content.classList.toggle('collapsed');
    const isCollapsed = content.classList.contains('collapsed');
    collapseBtn.innerHTML = `<i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="w-3.5 h-3.5"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateRoomBarTitle(input) {
    const item = input.closest('.room-type-item');
    const nameInput = item.querySelector('.room-name');
    const bedTypeSelect = item.querySelector('.room-bed-type');
    const barTitle = item.querySelector('.room-title-text');
    const barSubtitle = item.querySelector('.day-subtitle');
    const num = item.querySelector('.itinerary-day-badge').textContent;

    barTitle.textContent = nameInput.value || ('Room Type ' + num);
    barSubtitle.textContent = bedTypeSelect.value ? bedTypeSelect.value + ' Bed' : '';

    updateRoomTypeCategoryOptions();
}

function removeRoomType(btn) {
    btn.closest('.room-type-item').remove();
    renumberRoomTypes();
    updateRoomTypeCount();
    updateRoomTypeCategoryOptions();
}

function renumberRoomTypes() {
    document.querySelectorAll('.room-type-item').forEach((item, index) => {
        const badge = item.querySelector('.itinerary-day-badge');
        badge.textContent = index + 1;
        const nameInput = item.querySelector('.room-name');
        const barTitle = item.querySelector('.room-title-text');
        if (!nameInput.value) {
            barTitle.textContent = 'Room Type ' + (index + 1);
        }
    });
}

function updateRoomTypeCount() {
    const count = document.querySelectorAll('.room-type-item').length;
    const el = document.getElementById('roomTypeCount');
    if (el) el.textContent = count + ' room type' + (count !== 1 ? 's' : '');
}

function clearRoomTypeBuilder() {
    document.getElementById('roomTypeBuilder').innerHTML = '';
    updateRoomTypeCount();
}

function getRoomTypeData() {
    const items = document.querySelectorAll('.room-type-item');
    const roomTypes = [];

    items.forEach((item, index) => {
        const name = item.querySelector('.room-name').value.trim();
        if (!name) return;

        const amenitiesStr = item.querySelector('.room-amenities').value.trim();
        const amenities = amenitiesStr ? amenitiesStr.split(',').map(a => a.trim()).filter(a => a) : [];

        roomTypes.push({
            name: name,
            description: item.querySelector('.room-description').value.trim() || null,
            max_guests: parseInt(item.querySelector('.room-max-guests').value) || 2,
            bed_type: item.querySelector('.room-bed-type').value || null,
            room_size: parseFloat(item.querySelector('.room-size').value) || null,
            amenities: amenities,
            sort_order: index
        });
    });

    return roomTypes;
}

// Update the category dropdown in Media tab with room type names
function updateRoomTypeCategoryOptions() {
    const optgroup = document.getElementById('hotelImageCategoryRooms');
    if (!optgroup) return;

    // Get current room type names
    const roomNames = [];
    document.querySelectorAll('.room-type-item .room-name').forEach(input => {
        const name = input.value.trim();
        if (name) roomNames.push(name);
    });

    // Update optgroup
    optgroup.innerHTML = roomNames.map(name =>
        `<option value="${name}">${name}</option>`
    ).join('');
}
