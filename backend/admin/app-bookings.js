// =====================
// Overview
// =====================
async function loadOverview() {
    try {
        const statsResponse = await fetch(`${API_BASE}/bookings.php?stats=1`, {
            credentials: 'include'
        });
        const statsData = await statsResponse.json();

        if (statsData.success) {
            const stats = statsData.data;
            document.getElementById('totalBookings').textContent = stats.total_bookings || 0;
            document.getElementById('pendingBookings').textContent = stats.pending_bookings || 0;
            document.getElementById('confirmedBookings').textContent = stats.confirmed_bookings || 0;
            document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenue || 0);
        }

        const bookingsResponse = await fetch(`${API_BASE}/bookings.php?limit=5`, {
            credentials: 'include'
        });
        const bookingsData = await bookingsResponse.json();

        if (bookingsData.success) {
            displayRecentBookings(bookingsData.data.items || []);
        }
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

function displayRecentBookings(bookings) {
    const container = document.getElementById('recentBookings');

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent bookings</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Tour</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td class="mono">${booking.booking_reference}</td>
                        <td>${escapeHtml(booking.customer_name)}</td>
                        <td>${escapeHtml(booking.tour_name || '-')}</td>
                        <td>${formatDate(booking.travel_date)}</td>
                        <td>${statusBadges(booking)}</td>
                        <td>${formatCurrency(booking.total_price)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// =====================
// Bookings
// =====================
let bookings = [];
let bookingsPage = 1;

/**
 * The two badges that describe a booking everywhere it appears: where it is in the
 * workflow, and whether the money has arrived.
 */
function statusBadges(booking) {
    return `
        <span class="badge badge-${booking.status}">${booking.status}</span>
        <span class="badge badge-pay-${booking.payment_status}">${booking.payment_status}</span>
    `;
}

/**
 * Payment can only be collected once availability is confirmed — the same rule the
 * customer's status page enforces, so the two never disagree.
 */
function isAwaitingPayment(booking) {
    return booking.status === 'confirmed' && booking.payment_status === 'unpaid';
}

async function loadBookings(page = bookingsPage) {
    bookingsPage = page;

    try {
        const status = document.getElementById('statusFilter').value;
        const payment = document.getElementById('paymentFilter').value;
        const search = document.getElementById('searchBookings').value;

        const params = new URLSearchParams({ page: bookingsPage, limit: 20 });
        if (status) params.set('status', status);
        if (payment) params.set('payment_status', payment);
        if (search) params.set('search', search);

        const response = await fetch(`${API_BASE}/bookings.php?${params}`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            bookings = data.data.items || [];
            displayBookings(bookings);
            displayBookingsPagination(data.data.pagination);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

/**
 * Any filter change invalidates the current page number.
 */
function reloadBookingsFromFirstPage() {
    loadBookings(1);
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsTable');

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p class="empty-state">No bookings match these filters.</p>';
        return;
    }

    container.innerHTML = `
        <table class="bookings-table">
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Tour</th>
                    <th>Travel Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr class="row-clickable" onclick="openBookingModal(${booking.id})">
                        <td class="mono">${booking.booking_reference}</td>
                        <td>
                            ${escapeHtml(booking.customer_name)}
                            <small>${escapeHtml(booking.customer_email)}</small>
                        </td>
                        <td>${escapeHtml(booking.tour_name || '-')}</td>
                        <td>
                            ${formatDate(booking.travel_date)}
                            <small>${booking.number_of_guests} guest${booking.number_of_guests == 1 ? '' : 's'}</small>
                        </td>
                        <td class="nowrap">${formatCurrency(booking.total_price)}</td>
                        <td class="stacked-badges">${statusBadges(booking)}</td>
                        <td class="actions-cell" onclick="event.stopPropagation()">
                            ${primaryAction(booking)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * One button per row — whatever the booking is actually waiting for. Everything else
 * lives in the detail modal, so the table stays readable.
 */
function primaryAction(booking) {
    if (booking.status === 'pending') {
        return `<button class="btn btn-sm btn-success" onclick="confirmBooking(${booking.id})">Confirm</button>`;
    }
    if (isAwaitingPayment(booking)) {
        return `<button class="btn btn-sm btn-secondary" onclick="openBookingModal(${booking.id})">Manage</button>`;
    }
    return `<button class="btn btn-sm btn-ghost" onclick="openBookingModal(${booking.id})">View</button>`;
}

function displayBookingsPagination(pagination) {
    const container = document.getElementById('bookingsPagination');
    if (!pagination || pagination.total_pages <= 1) {
        container.innerHTML = '';
        return;
    }

    const { current_page, total_pages, total_items, has_prev, has_next } = pagination;

    container.innerHTML = `
        <span class="pagination-info">${total_items} booking${total_items == 1 ? '' : 's'}</span>
        <div class="pagination-controls">
            <button class="btn btn-sm btn-ghost" ${has_prev ? '' : 'disabled'}
                onclick="loadBookings(${current_page - 1})">‹ Prev</button>
            <span class="pagination-page">Page ${current_page} of ${total_pages}</span>
            <button class="btn btn-sm btn-ghost" ${has_next ? '' : 'disabled'}
                onclick="loadBookings(${current_page + 1})">Next ›</button>
        </div>
    `;
}

// =====================
// Booking detail modal
// =====================
let activeBooking = null;

function openBookingModal(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    activeBooking = booking;

    document.getElementById('bookingModalRef').textContent = booking.booking_reference;
    document.getElementById('bookingModalBadges').innerHTML = statusBadges(booking);
    document.getElementById('bookingModalBody').innerHTML = bookingModalBody(booking);
    document.getElementById('bookingModalActions').innerHTML = bookingModalActions(booking);

    hideBookingPanels();
    document.getElementById('bookingModal').classList.add('active');

    if (window.lucide) lucide.createIcons();
}

function bookingModalBody(booking) {
    const guests = `${booking.adults} adult${booking.adults == 1 ? '' : 's'}`
        + (booking.children > 0 ? `, ${booking.children} child${booking.children == 1 ? '' : 'ren'}` : '');

    const paymentRows = booking.payment_status === 'paid'
        ? `
            ${detailRow('Method', booking.payment_method || '-')}
            ${detailRow('Paid on', booking.payment_date ? formatDateTime(booking.payment_date) : '-')}
            ${booking.payment_intent_id ? detailRow('Stripe ref', `<span class="mono text-xs">${escapeHtml(booking.payment_intent_id)}</span>`) : ''}
        `
        : detailRow('Status', isAwaitingPayment(booking)
            ? 'Awaiting payment — the customer has a Pay Now link'
            : 'Not payable yet — confirm the booking first');

    return `
        <div class="detail-section">
            <h3 class="detail-heading">Customer</h3>
            ${detailRow('Name', escapeHtml(booking.customer_name))}
            ${detailRow('Email', `<a href="mailto:${escapeHtml(booking.customer_email)}">${escapeHtml(booking.customer_email)}</a>`)}
            ${detailRow('Phone', `<a href="tel:${escapeHtml(booking.customer_phone)}">${escapeHtml(booking.customer_phone)}</a>`)}
        </div>

        <div class="detail-section">
            <h3 class="detail-heading">Trip</h3>
            ${detailRow('Tour', escapeHtml(booking.tour_name || '-'))}
            ${detailRow('Destination', escapeHtml(booking.destination || '-'))}
            ${detailRow('Travel date', formatDate(booking.travel_date))}
            ${detailRow('Guests', guests)}
            ${detailRow('Total', `<strong>${formatCurrency(booking.total_price)}</strong>`)}
        </div>

        ${booking.special_requests ? `
        <div class="detail-section">
            <h3 class="detail-heading">Special requests</h3>
            <p class="detail-note">${escapeHtml(booking.special_requests)}</p>
        </div>` : ''}

        <div class="detail-section">
            <h3 class="detail-heading">Payment</h3>
            ${paymentRows}
        </div>

        <div class="detail-section">
            <h3 class="detail-heading">History</h3>
            ${detailRow('Booked', formatDateTime(booking.created_at))}
            ${booking.confirmed_at ? detailRow('Confirmed', formatDateTime(booking.confirmed_at)) : ''}
            ${booking.cancelled_at ? detailRow('Cancelled', formatDateTime(booking.cancelled_at)) : ''}
            ${booking.cancellation_reason ? detailRow('Reason', escapeHtml(booking.cancellation_reason)) : ''}
        </div>
    `;
}

function detailRow(label, value) {
    return `
        <div class="detail-row">
            <span class="detail-label">${label}</span>
            <span class="detail-value">${value}</span>
        </div>
    `;
}

function bookingModalActions(booking) {
    const buttons = [];

    if (booking.status === 'pending') {
        buttons.push(`<button class="btn btn-success" onclick="confirmBooking(${booking.id})">Confirm &amp; Send Payment Link</button>`);
    }

    if (isAwaitingPayment(booking)) {
        buttons.push(`<button class="btn btn-secondary" onclick="resendPaymentLink(${booking.id})">Resend Payment Link</button>`);
    }

    if (booking.payment_status === 'unpaid' && booking.status !== 'cancelled') {
        buttons.push(`<button class="btn btn-success" onclick="showMarkPaidPanel()">Mark Paid</button>`);
    }

    if (booking.status !== 'cancelled' && booking.payment_status !== 'paid') {
        buttons.push(`<button class="btn btn-danger ml-auto" onclick="showCancelPanel()">Cancel Booking</button>`);
    }

    return buttons.length
        ? buttons.join('')
        : '<span class="text-xs text-gray-400">No actions available for this booking.</span>';
}

function hideBookingPanels() {
    document.getElementById('markPaidPanel').classList.add('hidden');
    document.getElementById('cancelPanel').classList.add('hidden');
}

function showMarkPaidPanel() {
    hideBookingPanels();
    document.getElementById('markPaidPanel').classList.remove('hidden');
    document.getElementById('markPaidPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showCancelPanel() {
    hideBookingPanels();
    document.getElementById('cancelReason').value = '';
    document.getElementById('cancelPanel').classList.remove('hidden');
    document.getElementById('cancelPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// =====================
// Actions
// =====================

/**
 * Shared PUT for the booking actions. Returns the API payload, or null on failure
 * (the toast is already shown by then).
 */
async function bookingAction(id, action, body = {}) {
    try {
        const response = await fetch(`${API_BASE}/bookings.php?id=${id}&action=${action}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!data.success) {
            showToast('Error: ' + data.message, 'error');
            return null;
        }

        await loadBookings();
        loadOverview();
        return data;
    } catch (error) {
        console.error(`Error on booking action "${action}":`, error);
        showToast('Network error. Please try again.', 'error');
        return null;
    }
}

async function confirmBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (!confirm(`Confirm ${booking.booking_reference}?\n\nThis emails ${booking.customer_email} a Pay Now link for ${formatCurrency(booking.total_price)}.`)) return;

    const data = await bookingAction(id, 'confirm');
    if (data) {
        showToast('Confirmed. Payment link sent.', 'success');
        closeModal('bookingModal');
    }
}

async function resendPaymentLink(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (!confirm(`Resend the payment link to ${booking.customer_email}?`)) return;

    const data = await bookingAction(id, 'resend_payment_link');
    if (data) showToast(data.message || 'Payment link resent.', 'success');
}

async function markPaidConfirmed() {
    if (!activeBooking) return;

    const method = document.getElementById('markPaidMethod').value;
    const data = await bookingAction(activeBooking.id, 'mark_paid', { payment_method: method });

    if (data) {
        showToast('Marked as paid. Receipt sent to customer.', 'success');
        closeModal('bookingModal');
    }
}

async function cancelBookingConfirmed() {
    if (!activeBooking) return;

    const reason = document.getElementById('cancelReason').value.trim();
    if (!reason) {
        showToast('Please give a reason for the cancellation.', 'error');
        return;
    }

    const data = await bookingAction(activeBooking.id, 'cancel', { reason });
    if (data) {
        showToast('Booking cancelled.', 'success');
        closeModal('bookingModal');
    }
}

// =====================
// Wiring
// =====================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.booking-modal-close')?.addEventListener('click', () => closeModal('bookingModal'));
    document.getElementById('markPaidConfirm')?.addEventListener('click', markPaidConfirmed);
    document.getElementById('markPaidCancel')?.addEventListener('click', hideBookingPanels);
    document.getElementById('cancelConfirm')?.addEventListener('click', cancelBookingConfirmed);
    document.getElementById('cancelBack')?.addEventListener('click', hideBookingPanels);
});
