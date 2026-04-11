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
        container.innerHTML = '<p>No recent bookings</p>';
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
                        <td>${booking.booking_reference}</td>
                        <td>${booking.customer_name}</td>
                        <td>${booking.tour_name}</td>
                        <td>${formatDate(booking.travel_date)}</td>
                        <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
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

async function loadBookings() {
    try {
        const status = document.getElementById('statusFilter').value;
        const search = document.getElementById('searchBookings').value;

        let url = `${API_BASE}/bookings.php?`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${search}&`;

        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            bookings = data.data.items || [];
            displayBookings(bookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsTable');

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Tour</th>
                    <th>Travel Date</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.booking_reference}</td>
                        <td>
                            ${booking.customer_name}<br>
                            <small>${booking.customer_email}</small>
                        </td>
                        <td>${booking.tour_name}</td>
                        <td>${formatDate(booking.travel_date)}</td>
                        <td>${booking.number_of_guests}</td>
                        <td>${formatCurrency(booking.total_price)}</td>
                        <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
                        <td class="actions-cell">
                            ${booking.status === 'pending' ?
                                `<button class="btn btn-sm btn-success" onclick="confirmBooking(${booking.id})">Confirm</button>` :
                                ''}
                            ${booking.status !== 'cancelled' ?
                                `<button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button>` :
                                ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function confirmBooking(id) {
    if (!confirm('Confirm this booking?')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings.php?id=${id}&action=confirm`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (data.success) {
            loadBookings();
            loadOverview();
            showToast('Booking confirmed!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error confirming booking:', error);
    }
}

async function cancelBooking(id) {
    const reason = prompt('Cancellation reason:');
    if (!reason) return;

    try {
        const response = await fetch(`${API_BASE}/bookings.php?id=${id}&action=cancel`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (data.success) {
            loadBookings();
            loadOverview();
            showToast('Booking cancelled.', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
    }
}
