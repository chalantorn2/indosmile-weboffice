// =====================
// Import from Contract Rate
//
// Two-step picker: search a tour on the Contract Rate API, then pick its cover image
// and whether it lands in Island Tours or Shows & Adventures. Every image the source
// tour has is copied into our own uploads dir — the cover becomes the main image and
// the rest fill the gallery. The admin still has to write the description and the
// rest — the source API carries no such copy.
// =====================

let importResults = [];
let importDetail = null;
let importTarget = 'tour';
let importCoverUrl = null;

const IMPORT_MAX_IMAGES = 30;

function openImportModal(target = 'tour') {
    importTarget = target;
    importDetail = null;
    importCoverUrl = null;

    document.getElementById('importSearchInput').value = '';
    document.getElementById('importSearchResults').innerHTML =
        '<p class="text-sm text-gray-400 text-center py-10">Type to search, or leave empty and press Enter to list everything.</p>';

    showImportStep('search');
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importSearchInput').focus();

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showImportStep(step) {
    const isSearch = step === 'search';
    document.getElementById('importStepSearch').classList.toggle('hidden', !isSearch);
    document.getElementById('importStepDetail').classList.toggle('hidden', isSearch);
    document.getElementById('importContinueBtn').classList.toggle('hidden', isSearch);
    document.getElementById('importModalSubtitle').textContent = isSearch
        ? 'Search a tour on the Contract Rate site and pull it in'
        : 'Pick the cover image and where this tour should live';
    if (isSearch) document.getElementById('importFooterNote').textContent = '';
}

async function searchContractRate() {
    const q = document.getElementById('importSearchInput').value.trim();
    const container = document.getElementById('importSearchResults');
    container.innerHTML = '<p class="text-sm text-gray-400 text-center py-10">Searching...</p>';

    try {
        const response = await fetch(`${API_BASE}/contract_rate.php?action=search&q=${encodeURIComponent(q)}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            container.innerHTML = `<p class="text-sm text-red-500 text-center py-10">${escapeHtml(data.message)}</p>`;
            return;
        }

        importResults = data.data.items || [];
        renderImportResults();
    } catch (error) {
        console.error('Contract Rate search failed:', error);
        container.innerHTML = '<p class="text-sm text-red-500 text-center py-10">Search failed. Please try again.</p>';
    }
}

function renderImportResults() {
    const container = document.getElementById('importSearchResults');

    if (importResults.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 text-center py-10">No tours matched that search.</p>';
        return;
    }

    container.innerHTML = `
        <p class="text-xs text-gray-400 mb-2">${importResults.length} result(s)</p>
        <div class="space-y-2">
            ${importResults.map(r => {
                const already = r.imported;
                const where = already ? (already.type === 'tour' ? 'Island Tours' : 'Shows & Adventures') : '';
                return `
                <div class="flex items-center gap-3 p-3 rounded-xl border ${already ? 'border-gray-100 bg-gray-50' : 'border-gray-200 hover:border-navy hover:bg-navy/[0.02] cursor-pointer'} transition-all"
                     ${already ? '' : `onclick="loadImportDetail(${r.source_id})"`}>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-navy truncate">${escapeHtml(r.tour_name)}</p>
                        <p class="text-xs text-gray-400 truncate">
                            ${escapeHtml(r.supplier_name)}
                            ${r.departure_from ? ' · ' + escapeHtml(r.departure_from) : ''}
                            ${r.tour_type ? ' · ' + escapeHtml(r.tour_type) : ''}
                        </p>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="text-sm font-semibold text-gray-600">${formatCurrency(r.adult_price)}</p>
                        <p class="text-xs text-gray-400">adult</p>
                    </div>
                    ${already
                        ? `<span class="badge badge-confirmed shrink-0">In ${where}</span>`
                        : '<i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 shrink-0"></i>'}
                </div>`;
            }).join('')}
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function loadImportDetail(sourceId) {
    const container = document.getElementById('importDetailSummary');
    showImportStep('detail');
    container.innerHTML = '<p class="text-sm text-gray-400">Loading...</p>';
    document.getElementById('importImageGrid').innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/contract_rate.php?action=detail&id=${sourceId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            container.innerHTML = `<p class="text-sm text-red-500">${escapeHtml(data.message)}</p>`;
            return;
        }

        importDetail = data.data;

        // Default the cover to the first image so an admin can import without picking
        const images = importDetail.images || [];
        importCoverUrl = images.length > 0 ? images[0].file_url : null;

        // The source tour_type is only filled in on a minority of rows, so treat it as
        // a hint for the default target rather than the answer.
        importTarget = importDetail.tour_type === 'show_ticket' ? 'show' : importTarget;

        renderImportDetail();
    } catch (error) {
        console.error('Contract Rate detail failed:', error);
        container.innerHTML = '<p class="text-sm text-red-500">Failed to load tour details.</p>';
    }
}

function renderImportDetail() {
    const d = importDetail;
    const field = (label, value) => value
        ? `<div><dt class="text-xs text-gray-400">${label}</dt><dd class="text-sm text-gray-700">${escapeHtml(String(value))}</dd></div>`
        : '';

    document.getElementById('importDetailSummary').innerHTML = `
        <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p class="text-base font-bold text-navy mb-3">${escapeHtml(d.tour_name)}</p>
            <dl class="grid grid-cols-3 gap-3">
                ${field('Supplier', d.supplier_name)}
                ${field('Departure', d.departure_from)}
                ${field('Destination', d.destination)}
                ${field('Pier / Venue', d.pier)}
                ${field('Adult', d.adult_price)}
                ${field('Child', d.child_price)}
                ${field('Park fee', formatParkFee(d))}
            </dl>
            ${d.notes ? `<p class="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200"><span class="text-gray-400">Notes:</span> ${escapeHtml(d.notes)}</p>` : ''}
        </div>
    `;

    renderImportTargetButtons();
    renderImportImageGrid();

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function formatParkFee(d) {
    if (Number(d.park_fee_included) === 1) return 'Included in price';
    if (!d.park_fee_adult && !d.park_fee_child) return '';
    return `Adult ${d.park_fee_adult || '-'} / Child ${d.park_fee_child || '-'}`;
}

function renderImportTargetButtons() {
    document.querySelectorAll('.import-target-btn').forEach(btn => {
        const active = btn.dataset.importTarget === importTarget;
        btn.className = 'import-target-btn flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all '
            + (active
                ? 'border-navy bg-navy/5 text-navy'
                : 'border-gray-200 text-gray-400 hover:border-gray-300');
    });

    const hint = importDetail && importDetail.tour_type
        ? `Contract Rate tags this one as "${importDetail.tour_type}".`
        : 'Contract Rate has no type on this one — pick where it belongs.';
    document.getElementById('importTargetHint').textContent = hint;
}

function setImportTarget(target) {
    importTarget = target;
    renderImportTargetButtons();
}

function renderImportImageGrid() {
    const grid = document.getElementById('importImageGrid');
    const images = getImportImages();

    if (images.length === 0) {
        grid.innerHTML = '<p class="col-span-4 text-sm text-gray-400 text-center py-8">This tour has no images on Contract Rate. You can upload your own on the next screen.</p>';
        updateImportFooter();
        return;
    }

    grid.innerHTML = images.map((img, i) => {
        const isCover = importCoverUrl === img.file_url;
        return `
        <div class="relative rounded-xl overflow-hidden border-2 ${isCover ? 'border-navy' : 'border-transparent'}">
            <img src="${escapeHtml(img.file_url)}" alt="${escapeHtml(img.original_name)}"
                 class="w-full h-28 object-cover cursor-pointer"
                 onclick="pickImportCover(${i})" loading="lazy">
            ${isCover
                ? '<span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-navy text-white text-[10px] font-bold">COVER</span>'
                : '<span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-black/40 text-white text-[10px] font-semibold">Gallery</span>'}
            <span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px]">${escapeHtml(img.file_category)}</span>
        </div>`;
    }).join('');

    updateImportFooter();
}

/**
 * A source tour can carry more images than a tour/show can hold, so we take the first
 * IMPORT_MAX_IMAGES of them — the picker only ever shows what will actually be copied.
 */
function getImportImages() {
    const images = (importDetail && importDetail.images) || [];
    return images.slice(0, IMPORT_MAX_IMAGES);
}

function pickImportCover(index) {
    importCoverUrl = getImportImages()[index].file_url;
    renderImportImageGrid();
}

function updateImportFooter() {
    const total = getImportImages().length;
    const dropped = ((importDetail && importDetail.images) || []).length - total;

    let note = total === 0
        ? 'No images to copy'
        : `All ${total} image(s) will be copied — 1 cover + ${total - 1} gallery`;
    if (dropped > 0) note += ` (${dropped} extra skipped, max ${IMPORT_MAX_IMAGES})`;

    document.getElementById('importFooterNote').textContent = note;
}

async function confirmImport() {
    if (!importDetail) return;

    const btn = document.getElementById('importContinueBtn');
    const originalLabel = btn.textContent;
    btn.disabled = true;

    // Every image comes across; the cover goes first so it can be told apart in the
    // response, and the rest keep their source order in the gallery.
    const sourceUrls = getImportImages().map(img => img.file_url);
    const urls = sourceUrls.filter(u => u !== importCoverUrl);
    if (importCoverUrl) urls.unshift(importCoverUrl);

    let localMain = '';
    let localGallery = [];

    if (urls.length > 0) {
        btn.textContent = `Copying ${urls.length} image(s)...`;
        try {
            const response = await fetch(`${API_BASE}/contract_rate.php?action=import_images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ urls, subdir: importTarget === 'show' ? 'shows' : 'tours' })
            });
            const data = await response.json();

            if (!data.success) {
                showToast('Image import failed: ' + data.message, 'error');
                btn.disabled = false;
                btn.textContent = originalLabel;
                return;
            }

            const bySource = {};
            data.data.images.forEach(img => { bySource[img.source_url] = img.url; });

            if (importCoverUrl && bySource[importCoverUrl]) {
                localMain = bySource[importCoverUrl];
            }
            localGallery = urls
                .map(u => bySource[u])
                .filter(u => u && u !== localMain);

            if (data.data.errors && data.data.errors.length > 0) {
                showToast('Some images failed: ' + data.data.errors.join(', '), 'warning');
            }
        } catch (error) {
            console.error('Image import failed:', error);
            showToast('Image import failed. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = originalLabel;
            return;
        }
    }

    btn.disabled = false;
    btn.textContent = originalLabel;

    closeModal('importModal');

    if (importTarget === 'show') {
        prefillShowFromImport(importDetail, localMain, localGallery);
    } else {
        prefillTourFromImport(importDetail, localMain, localGallery);
    }
}

/**
 * The source API has no description, duration, highlights or itinerary — those tabs
 * stay empty on purpose and the admin fills them before saving.
 */
function prefillTourFromImport(d, mainImage, gallery) {
    openTourModal();

    document.getElementById('modalTitle').textContent = 'Import Island Tour';
    document.getElementById('modalSubtitle').textContent = `From Contract Rate · ${d.supplier_name || 'unknown supplier'}`;

    document.getElementById('tourName').value = d.tour_name || '';
    document.getElementById('tourDestination').value = d.destination || d.departure_from || '';
    document.getElementById('tourAdultPrice').value = d.adult_price || '';
    document.getElementById('tourChildPrice').value = d.child_price || '';
    document.getElementById('tourParkFeeIncluded').checked = Number(d.park_fee_included) === 1;
    document.getElementById('tourParkFeeAdult').value = d.park_fee_adult || '';
    document.getElementById('tourParkFeeChild').value = d.park_fee_child || '';
    document.getElementById('tourDurationDays').value = 1;
    document.getElementById('tourDurationNights').value = 0;
    document.getElementById('tourPickupLocation').value = d.pier || '';
    document.getElementById('tourImportantNotes').value = d.notes || '';

    document.getElementById('tourSourceId').value = d.id;
    document.getElementById('tourSourceSupplier').value = d.supplier_name || '';

    setMainImagePreview(mainImage);
    setGalleryFromUrls(gallery);

    toggleDayTripTab();
    updateTabDots();
    showToast('Imported. Fill in the description and details, then save.', 'info');
}

function prefillShowFromImport(d, mainImage, gallery) {
    openShowModal();

    document.getElementById('showModalTitle').textContent = 'Import Show & Adventure';
    document.getElementById('showModalSubtitle').textContent = `From Contract Rate · ${d.supplier_name || 'unknown supplier'}`;

    document.getElementById('shName').value = d.tour_name || '';
    document.getElementById('shDestination').value = d.destination || d.departure_from || '';
    document.getElementById('shVenue').value = d.pier || '';
    document.getElementById('shAdultPrice').value = d.adult_price || '';
    document.getElementById('shChildPrice').value = d.child_price || '';
    document.getElementById('shParkFeeIncluded').checked = Number(d.park_fee_included) === 1;
    document.getElementById('shParkFeeAdult').value = d.park_fee_adult || '';
    document.getElementById('shParkFeeChild').value = d.park_fee_child || '';
    document.getElementById('shImportantNotes').value = d.notes || '';

    document.getElementById('shSourceId').value = d.id;
    document.getElementById('shSourceSupplier').value = d.supplier_name || '';

    setShowMainImagePreview(mainImage);
    setShowGalleryFromUrls(gallery);

    showToast('Imported. Fill in the description and details, then save.', 'info');
}
