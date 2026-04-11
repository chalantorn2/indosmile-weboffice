// =====================
// Platform Settings
// =====================
let currentSettings = [];
let originalSettingsSnapshot = {};
let settingsDirty = false;

async function loadSettings() {
    const loader = document.getElementById('settingsLoader');
    const form = document.getElementById('settingsForm');
    if (loader) loader.classList.remove('hidden');
    if (form) form.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/settings.php`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            currentSettings = data.data || [];
            populateSettingsForm(currentSettings);
            snapshotSettings();
            settingsDirty = false;
            updateSaveBar();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Error loading settings', 'error');
    } finally {
        if (loader) loader.classList.add('hidden');
        if (form) form.style.display = '';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function populateSettingsForm(settingsList) {
    if (!settingsList || settingsList.length === 0) return;

    settingsList.forEach(setting => {
        const key = setting.setting_key;
        const value = setting.setting_value;
        const type = setting.setting_type;

        const el = document.getElementById(`setting_${key}`);
        if (el) {
            if (type === 'boolean') {
                el.checked = (value === '1' || value === 'true');
            } else {
                el.value = value || '';
            }
        }
    });
}

/** Save a snapshot of current values so we can detect dirty state */
function snapshotSettings() {
    originalSettingsSnapshot = {};
    document.querySelectorAll('[id^="setting_"]').forEach(input => {
        const key = input.id;
        if (input.type === 'checkbox') {
            originalSettingsSnapshot[key] = input.checked;
        } else {
            originalSettingsSnapshot[key] = input.value;
        }
    });
}

function checkDirty() {
    let dirty = false;
    document.querySelectorAll('[id^="setting_"]').forEach(input => {
        const key = input.id;
        if (input.type === 'checkbox') {
            if (originalSettingsSnapshot[key] !== input.checked) dirty = true;
        } else {
            if (originalSettingsSnapshot[key] !== input.value) dirty = true;
        }
    });
    settingsDirty = dirty;
    updateSaveBar();
}

function updateSaveBar() {
    const bar = document.getElementById('settingsSaveBar');
    if (!bar) return;
    if (settingsDirty) {
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}

function setupSettingsUI() {
    // Listen to all input changes for dirty tracking
    document.querySelectorAll('[id^="setting_"]').forEach(input => {
        const events = input.type === 'checkbox' ? ['change'] : ['input', 'change'];
        events.forEach(evt => input.addEventListener(evt, checkDirty));
    });

    // Form submit
    const form = document.getElementById('settingsForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings();
        });
    }

    // Sticky save bar buttons
    const saveBtn = document.getElementById('settingsSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);

    const discardBtn = document.getElementById('settingsDiscardBtn');
    if (discardBtn) {
        discardBtn.addEventListener('click', () => {
            // Restore from snapshot
            document.querySelectorAll('[id^="setting_"]').forEach(input => {
                const key = input.id;
                if (input.type === 'checkbox') {
                    input.checked = !!originalSettingsSnapshot[key];
                } else {
                    input.value = originalSettingsSnapshot[key] || '';
                }
            });
            settingsDirty = false;
            updateSaveBar();
            showToast('Changes discarded', 'info');
        });
    }
}

async function saveSettings() {
    const saveBtn = document.querySelector('.settings-save-main-btn');
    const barSaveBtn = document.getElementById('settingsSaveBtn');
    const origText = saveBtn ? saveBtn.innerHTML : '';
    const origBarText = barSaveBtn ? barSaveBtn.innerHTML : '';

    // Show loading state
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Saving...';
    }
    if (barSaveBtn) {
        barSaveBtn.disabled = true;
        barSaveBtn.innerHTML = 'Saving...';
    }

    // Collect all setting_ inputs
    const payload = [];
    document.querySelectorAll('[id^="setting_"]').forEach(input => {
        const key = input.id.replace('setting_', '');
        let val;
        if (input.type === 'checkbox') {
            val = input.checked ? '1' : '0';
        } else {
            val = input.value;
        }
        payload.push({ setting_key: key, setting_value: val });
    });

    try {
        const response = await fetch(`${API_BASE}/settings.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Settings saved successfully!', 'success');
            snapshotSettings();
            settingsDirty = false;
            updateSaveBar();
        } else {
            showToast(data.message || 'Failed to save settings', 'error');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('An error occurred while saving', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = origText;
        }
        if (barSaveBtn) {
            barSaveBtn.disabled = false;
            barSaveBtn.innerHTML = origBarText;
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}
