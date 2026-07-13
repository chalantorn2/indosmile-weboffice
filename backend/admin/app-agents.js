// =====================
// Agent Management (B2B partners)
// =====================
let agents = [];

async function loadAgents() {
    try {
        const response = await fetch(`${API_BASE}/agents.php`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            agents = data.data || [];
            displayAgents(agents);
        } else {
            document.getElementById('agentsTable').innerHTML = `<p class="loading">${escapeHtml(data.message || 'Failed to load agents')}</p>`;
        }
    } catch (error) {
        console.error('Error loading agents:', error);
        document.getElementById('agentsTable').innerHTML = '<p class="loading">Error loading agents</p>';
    }
}

function agentStatusBadge(status) {
    const map = { active: 'confirmed', inactive: 'cancelled', suspended: 'pending' };
    return `<span class="badge badge-${map[status] || 'info'}">${escapeHtml(status)}</span>`;
}

function displayAgents(agentsList) {
    const container = document.getElementById('agentsTable');

    if (!agentsList || agentsList.length === 0) {
        container.innerHTML = '<p class="loading">No agents yet. Click "Add New Agent" to create one.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Logins</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${agentsList.map(agent => `
                    <tr>
                        <td><code style="background:#f0f0f5;padding:2px 8px;border-radius:4px;font-size:13px;">${escapeHtml(agent.agent_code)}</code></td>
                        <td><span style="font-weight:600">${escapeHtml(agent.company_name)}</span></td>
                        <td>${escapeHtml(agent.contact_name || '-')}</td>
                        <td>${escapeHtml(agent.email)}</td>
                        <td>${agentStatusBadge(agent.status)}</td>
                        <td>${agent.last_login ? formatDate(agent.last_login) : '<span style="color:#999">Never</span>'}</td>
                        <td>${agent.login_count || 0}</td>
                        <td>
                            <div class="actions-cell">
                                <button class="btn btn-sm btn-secondary" onclick="viewAgent(${agent.id})">Details</button>
                                <button class="btn btn-sm btn-secondary" onclick="openAgentRates(${agent.id})">Rates</button>
                                <button class="btn btn-sm btn-primary" onclick="generateAgentPassword(${agent.id})">Generate Password</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteAgent(${agent.id}, '${escapeHtml(agent.company_name).replace(/'/g, "\\'")}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// =====================
// Create / Edit
// =====================
const AGENT_FIELD_MAP = {
    agentCode: 'agent_code',
    agentCompanyName: 'company_name',
    agentContactName: 'contact_name',
    agentEmail: 'email',
    agentPhone: 'phone',
    agentWhatsapp: 'whatsapp',
    agentLineId: 'line_id',
    agentWechatId: 'wechat_id',
    agentCountry: 'country',
    agentAddress: 'address',
    agentTaxId: 'tax_id',
    agentLicenseNo: 'license_no',
    agentNotes: 'notes',
    agentStatus: 'status'
};

// Mirrors Agent::generateAgentCodeFromName() in PHP. Only a suggestion — the server
// still normalizes it and resolves collisions.
const AGENT_CODE_STOPWORDS = ['co', 'ltd', 'inc', 'llc', 'company', 'limited', 'corp', 'corporation',
                              'the', 'and', 'group', 'agency', 'travel', 'tour', 'tours'];

function suggestAgentCode() {
    const companyName = document.getElementById('agentCompanyName').value.trim();

    if (!companyName) {
        showToast('Enter the company name first', 'warning');
        return;
    }

    const words = companyName.replace(/[^a-zA-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    let significant = words.filter(w => !AGENT_CODE_STOPWORDS.includes(w.toLowerCase()));
    if (significant.length === 0) significant = words;

    let code = significant.slice(0, 3).map(w => w[0].toUpperCase()).join('');
    if (code.length < 2 && significant[0]) {
        code = significant[0].substring(0, 3).toUpperCase();
    }

    document.getElementById('agentCode').value = code;
}

function openAgentModal(agent = null) {
    const modal = document.getElementById('agentModal');
    const form = document.getElementById('agentForm');
    form.reset();
    document.getElementById('agentId').value = '';

    if (agent) {
        document.getElementById('agentModalTitle').textContent = 'Edit Agent';
        document.getElementById('agentModalSubtitle').textContent = `${agent.agent_code} — update partner details`;
        document.getElementById('agentModalFooterHint').textContent = 'Use "Generate Password" on the list to issue a new password';
        document.getElementById('agentId').value = agent.id;

        Object.entries(AGENT_FIELD_MAP).forEach(([elementId, field]) => {
            document.getElementById(elementId).value = agent[field] || '';
        });
        document.getElementById('agentStatus').value = agent.status || 'active';
    } else {
        document.getElementById('agentModalTitle').textContent = 'Add New Agent';
        document.getElementById('agentModalSubtitle').textContent = 'A login password is generated automatically on save';
        document.getElementById('agentModalFooterHint').textContent = 'Blank code = company initials. Password is always generated.';
    }

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function editAgent(id) {
    try {
        const response = await fetch(`${API_BASE}/agents.php/${id}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            closeModal('agentDetailModal');
            openAgentModal(data.data);
        } else {
            showToast(data.message || 'Failed to load agent', 'error');
        }
    } catch (error) {
        console.error('Error loading agent:', error);
        showToast('Error loading agent', 'error');
    }
}

async function handleAgentSubmit(e) {
    e.preventDefault();

    const agentId = document.getElementById('agentId').value;
    const isEdit = !!agentId;

    const payload = {};
    Object.entries(AGENT_FIELD_MAP).forEach(([elementId, field]) => {
        payload[field] = document.getElementById(elementId).value.trim();
    });

    if (!payload.company_name || !payload.email) {
        showToast('Company name and email are required', 'warning');
        return;
    }

    try {
        const url = isEdit ? `${API_BASE}/agents.php/${agentId}` : `${API_BASE}/agents.php`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to save agent', 'error');
            return;
        }

        showToast(data.message || (isEdit ? 'Agent updated' : 'Agent created'), 'success');
        closeModal('agentModal');
        loadAgents();

        // A brand new agent comes back with its one-time password.
        if (!isEdit && data.data.generated_password) {
            showAgentPassword(data.data.email, data.data.generated_password, 'Give these credentials to the agent');
        }
    } catch (error) {
        console.error('Error saving agent:', error);
        showToast('Error saving agent. Please try again.', 'error');
    }
}

async function deleteAgent(id, companyName) {
    if (!confirm(`Delete agent "${companyName}"? Their login and history will be removed. This cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/agents.php/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'Agent deleted', 'success');
            loadAgents();
        } else {
            showToast(data.message || 'Failed to delete agent', 'error');
        }
    } catch (error) {
        console.error('Error deleting agent:', error);
        showToast('Error deleting agent', 'error');
    }
}

// =====================
// Password generation
// =====================
async function generateAgentPassword(id) {
    const agent = agents.find(a => a.id == id);
    const label = agent ? agent.company_name : 'this agent';

    if (!confirm(`Generate a new password for "${label}"? Their current password will stop working immediately.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/agents.php/${id}/generate-password`, {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showAgentPassword(agent ? agent.email : '', data.data.generated_password, 'Send the new password to the agent');
            loadAgents();
        } else {
            showToast(data.message || 'Failed to generate password', 'error');
        }
    } catch (error) {
        console.error('Error generating password:', error);
        showToast('Error generating password', 'error');
    }
}

function showAgentPassword(email, password, subtitle) {
    document.getElementById('agentPasswordEmail').textContent = email || '—';
    document.getElementById('agentPasswordValue').textContent = password;
    document.getElementById('agentPasswordSubtitle').textContent = subtitle || 'Shown once — copy it now';
    document.getElementById('agentPasswordModal').classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function copyAgentPassword() {
    const password = document.getElementById('agentPasswordValue').textContent;

    try {
        await navigator.clipboard.writeText(password);
        showToast('Password copied to clipboard', 'success');
    } catch (error) {
        showToast('Could not copy — please select the password manually', 'warning');
    }
}

// =====================
// Detail view
// =====================
async function viewAgent(id) {
    const modal = document.getElementById('agentDetailModal');
    document.getElementById('agentDetailBody').innerHTML = '<p class="loading">Loading...</p>';
    modal.classList.add('active');

    try {
        const response = await fetch(`${API_BASE}/agents.php/${id}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            document.getElementById('agentDetailBody').innerHTML = `<p class="loading">${escapeHtml(data.message || 'Failed to load agent')}</p>`;
            return;
        }

        renderAgentDetail(data.data);
    } catch (error) {
        console.error('Error loading agent:', error);
        document.getElementById('agentDetailBody').innerHTML = '<p class="loading">Error loading agent</p>';
    }
}

function agentDetailRow(label, value) {
    return `
        <div>
            <div class="text-xs text-gray-400 mb-1">${escapeHtml(label)}</div>
            <div class="text-sm text-navy font-medium">${value ? escapeHtml(value) : '<span style="color:#bbb">—</span>'}</div>
        </div>
    `;
}

function renderAgentDetail(agent) {
    document.getElementById('agentDetailTitle').textContent = agent.company_name;
    document.getElementById('agentDetailSubtitle').textContent = `${agent.agent_code} • ${agent.status}`;
    document.getElementById('agentDetailEditBtn').onclick = () => editAgent(agent.id);
    document.getElementById('agentDetailRatesBtn').onclick = () => {
        closeModal('agentDetailModal');
        openAgentRates(agent.id);
    };

    const logs = agent.login_logs || [];

    const logsHtml = logs.length === 0
        ? '<p class="text-sm text-gray-400">No login attempts recorded yet.</p>'
        : `
            <table>
                <thead>
                    <tr>
                        <th>When</th>
                        <th>Result</th>
                        <th>IP Address</th>
                        <th>Device</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => `
                        <tr>
                            <td>${formatDate(log.created_at)}</td>
                            <td>${Number(log.success) === 1
                                ? '<span class="badge badge-confirmed">Success</span>'
                                : '<span class="badge badge-cancelled">Failed</span>'}</td>
                            <td>${escapeHtml(log.ip_address || '-')}</td>
                            <td><span class="text-xs text-gray-500">${escapeHtml((log.user_agent || '-').substring(0, 60))}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    document.getElementById('agentDetailBody').innerHTML = `
        <div class="section-card mb-5">
            <div class="section-header">
                <span class="section-icon"><i data-lucide="contact" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Contact Channels</h3>
            </div>
            <div class="section-body">
                <div class="grid grid-cols-3 gap-5 mb-5">
                    ${agentDetailRow('Contact Person', agent.contact_name)}
                    ${agentDetailRow('Email (login)', agent.email)}
                    ${agentDetailRow('Phone', agent.phone)}
                </div>
                <div class="grid grid-cols-3 gap-5 mb-5">
                    ${agentDetailRow('WhatsApp', agent.whatsapp)}
                    ${agentDetailRow('LINE ID', agent.line_id)}
                    ${agentDetailRow('WeChat ID', agent.wechat_id)}
                </div>
                <div class="grid grid-cols-3 gap-5">
                    ${agentDetailRow('Country', agent.country)}
                    ${agentDetailRow('Travel Licence No.', agent.license_no)}
                    ${agentDetailRow('Tax ID', agent.tax_id)}
                </div>
            </div>
        </div>

        <div class="section-card mb-5">
            <div class="section-header">
                <span class="section-icon"><i data-lucide="file-text" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Address & Notes</h3>
            </div>
            <div class="section-body">
                <div class="grid grid-cols-2 gap-5">
                    ${agentDetailRow('Address', agent.address)}
                    ${agentDetailRow('Internal Notes', agent.notes)}
                </div>
            </div>
        </div>

        <div class="section-card">
            <div class="section-header">
                <span class="section-icon"><i data-lucide="log-in" class="w-4 h-4 text-navy"></i></span>
                <h3 class="section-title">Login Activity</h3>
                <span class="ml-auto text-xs text-gray-400">
                    ${agent.login_count || 0} logins • last ${agent.last_login ? formatDate(agent.last_login) : 'never'}
                </span>
            </div>
            <div class="section-body">
                <div class="table-container">${logsHtml}</div>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =====================
// Contract Rates
//
// Rates are stored as a discount off our selling price, and a tour is only visible
// in the agent portal once it has a rate. So this screen doubles as the agent's
// tour catalogue: removing a rate takes the tour away from them.
// =====================
let agentRatesAgentId = null;
let agentRates = [];
let agentRatesSelection = new Set();
let agentRatesFilter = 'all';
let agentRatesLastClicked = null;

async function openAgentRates(id) {
    const agent = agents.find(a => a.id == id);

    agentRatesAgentId = id;
    agentRatesSelection = new Set();
    agentRatesFilter = 'all';
    agentRatesLastClicked = null;

    document.getElementById('agentRatesTitle').textContent = agent ? `Contract Rates — ${agent.company_name}` : 'Contract Rates';
    document.getElementById('agentRatesSubtitle').textContent = agent
        ? `${agent.agent_code} • only tours with a rate are visible to this agent`
        : 'Only tours with a rate are visible to this agent';
    document.getElementById('agentRatesSearch').value = '';
    document.getElementById('agentRatesAdultDiscount').value = '';
    document.getElementById('agentRatesChildDiscount').value = '';
    document.getElementById('agentRatesTable').innerHTML = '<p class="loading">Loading...</p>';

    syncAgentRatesFilterButtons();
    document.getElementById('agentRatesModal').classList.add('active');

    await loadAgentRates();
}

async function loadAgentRates() {
    try {
        const response = await fetch(`${API_BASE}/agents.php/${agentRatesAgentId}/rates`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            document.getElementById('agentRatesTable').innerHTML = `<p class="loading">${escapeHtml(data.message || 'Failed to load rates')}</p>`;
            return;
        }

        agentRates = data.data || [];
        renderAgentRates();
    } catch (error) {
        console.error('Error loading agent rates:', error);
        document.getElementById('agentRatesTable').innerHTML = '<p class="loading">Error loading rates</p>';
    }
}

function agentRatesVisibleRows() {
    const search = document.getElementById('agentRatesSearch').value.trim().toLowerCase();

    return agentRates.filter(row => {
        const hasRate = row.adult_discount !== null;

        if (agentRatesFilter === 'rated' && !hasRate) return false;
        if (agentRatesFilter === 'unrated' && hasRate) return false;

        if (search) {
            const haystack = `${row.name} ${row.destination || ''}`.toLowerCase();
            if (!haystack.includes(search)) return false;
        }

        return true;
    });
}

function renderAgentRates() {
    const container = document.getElementById('agentRatesTable');
    const rows = agentRatesVisibleRows();

    if (rows.length === 0) {
        container.innerHTML = '<p class="loading">No tours match this filter.</p>';
        updateAgentRatesSelectedCount();
        return;
    }

    const allVisibleSelected = rows.every(row => agentRatesSelection.has(row.tour_id));

    // The whole row is the hit target — aiming at a 13px checkbox to price 20 tours is misery.
    container.innerHTML = `
        <table class="select-none">
            <thead>
                <tr>
                    <th style="width:44px">
                        <input type="checkbox" id="agentRatesSelectAll" ${allVisibleSelected ? 'checked' : ''}
                               style="width:18px;height:18px;cursor:pointer"
                               onchange="toggleAgentRatesAll(this.checked)" />
                    </th>
                    <th>Tour</th>
                    <th>Destination</th>
                    <th>Our Price</th>
                    <th>Discount</th>
                    <th>Net Rate</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => {
                    const hasRate = row.adult_discount !== null;
                    const selected = agentRatesSelection.has(row.tour_id);
                    const dash = '<span style="color:#bbb">—</span>';

                    return `
                        <tr onclick="toggleAgentRateRow(${row.tour_id}, ${!selected}, event)"
                            style="cursor:pointer;${selected ? 'background:#f5f7ff;' : ''}${hasRate ? '' : 'opacity:.62'}">
                            <td>
                                <input type="checkbox" ${selected ? 'checked' : ''}
                                       style="width:18px;height:18px;cursor:pointer;pointer-events:none" tabindex="-1" />
                            </td>
                            <td>
                                <span style="font-weight:600">${escapeHtml(row.name)}</span>
                                ${hasRate ? '' : '<span class="badge badge-info" style="margin-left:8px">No rate</span>'}
                            </td>
                            <td>${escapeHtml(row.destination || '-')}</td>
                            <td>
                                <span class="text-sm">${formatCurrency(row.adult_price)}</span>
                                <span class="text-xs text-gray-400"> / ${row.child_price !== null ? formatCurrency(row.child_price) : '—'}</span>
                            </td>
                            <td>
                                ${hasRate
                                    ? `<span class="text-sm" style="color:#c2410c">-${formatCurrency(row.adult_discount)}</span>
                                       <span class="text-xs text-gray-400"> / ${row.child_price !== null ? '-' + formatCurrency(row.child_discount) : '—'}</span>`
                                    : dash}
                            </td>
                            <td>
                                ${hasRate
                                    ? `<span class="text-sm" style="font-weight:700;color:#15803d">${formatCurrency(row.net_adult_price)}</span>
                                       <span class="text-xs text-gray-400"> / ${row.net_child_price !== null ? formatCurrency(row.net_child_price) : '—'}</span>`
                                    : dash}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    updateAgentRatesSelectedCount();
}

function updateAgentRatesSelectedCount() {
    document.getElementById('agentRatesSelectedCount').textContent = agentRatesSelection.size;
}

/**
 * Shift+click extends the selection from the last row clicked, so "these 10 tours are
 * -150" is two clicks instead of ten.
 */
function toggleAgentRateRow(tourId, checked, event) {
    const rows = agentRatesVisibleRows();

    let affected = [tourId];

    if (event && event.shiftKey && agentRatesLastClicked !== null) {
        const from = rows.findIndex(row => row.tour_id === agentRatesLastClicked);
        const to = rows.findIndex(row => row.tour_id === tourId);

        if (from !== -1 && to !== -1) {
            const [start, end] = from < to ? [from, to] : [to, from];
            affected = rows.slice(start, end + 1).map(row => row.tour_id);
        }
    }

    affected.forEach(id => {
        if (checked) {
            agentRatesSelection.add(id);
        } else {
            agentRatesSelection.delete(id);
        }
    });

    agentRatesLastClicked = tourId;
    renderAgentRates();
}

/**
 * Select-all only covers what the current filter/search shows, so an admin can't
 * accidentally re-price tours they can't see.
 */
function toggleAgentRatesAll(checked) {
    agentRatesVisibleRows().forEach(row => {
        if (checked) {
            agentRatesSelection.add(row.tour_id);
        } else {
            agentRatesSelection.delete(row.tour_id);
        }
    });

    renderAgentRates();
}

function setAgentRatesFilter(filter) {
    agentRatesFilter = filter;
    syncAgentRatesFilterButtons();
    renderAgentRates();
}

function syncAgentRatesFilterButtons() {
    document.querySelectorAll('.agent-rates-filter').forEach(btn => {
        const active = btn.dataset.filter === agentRatesFilter;
        btn.classList.toggle('bg-navy', active);
        btn.classList.toggle('text-white', active);
        btn.classList.toggle('text-gray-500', !active);
    });
}

async function applyAgentRates() {
    if (agentRatesSelection.size === 0) {
        showToast('Select at least one tour first', 'warning');
        return;
    }

    const adultDiscount = parseFloat(document.getElementById('agentRatesAdultDiscount').value);
    const childDiscountRaw = document.getElementById('agentRatesChildDiscount').value;
    const childDiscount = childDiscountRaw === '' ? 0 : parseFloat(childDiscountRaw);

    if (isNaN(adultDiscount) || adultDiscount < 0) {
        showToast('Enter an adult discount of 0 or more', 'warning');
        return;
    }

    if (isNaN(childDiscount) || childDiscount < 0) {
        showToast('Child discount cannot be negative', 'warning');
        return;
    }

    await saveAgentRates('PUT', {
        tour_ids: Array.from(agentRatesSelection),
        adult_discount: adultDiscount,
        child_discount: childDiscount
    });
}

async function removeAgentRates() {
    if (agentRatesSelection.size === 0) {
        showToast('Select at least one tour first', 'warning');
        return;
    }

    if (!confirm(`Remove ${agentRatesSelection.size} tour(s) from this agent? They will disappear from the agent's portal.`)) {
        return;
    }

    await saveAgentRates('DELETE', { tour_ids: Array.from(agentRatesSelection) });
}

/**
 * Both writes return the refreshed rate list, so the table stays in step with the
 * server without a second round trip.
 */
async function saveAgentRates(method, payload) {
    try {
        const response = await fetch(`${API_BASE}/agents.php/${agentRatesAgentId}/rates`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to save rates', 'error');
            return;
        }

        agentRates = data.data || [];
        agentRatesSelection = new Set();
        agentRatesLastClicked = null;
        renderAgentRates();
        showToast(data.message || 'Rates saved', 'success');
    } catch (error) {
        console.error('Error saving agent rates:', error);
        showToast('Error saving rates', 'error');
    }
}
