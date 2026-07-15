import { useEffect, useState } from "react";
import { apiFetch } from "./lib/adminApi";

const FIELDS = [
  "agent_code",
  "company_name",
  "contact_name",
  "email",
  "phone",
  "whatsapp",
  "line_id",
  "wechat_id",
  "country",
  "address",
  "tax_id",
  "license_no",
  "notes",
  "status",
];

const EMPTY = FIELDS.reduce((o, k) => ({ ...o, [k]: "" }), { status: "active" });

// Mirrors Agent::generateAgentCodeFromName() in PHP. Only a suggestion — the server
// still normalizes it and resolves collisions.
const STOPWORDS = [
  "co", "ltd", "inc", "llc", "company", "limited", "corp", "corporation",
  "the", "and", "group", "agency", "travel", "tour", "tours",
];

function suggestCode(companyName) {
  const words = companyName.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  let sig = words.filter((w) => !STOPWORDS.includes(w.toLowerCase()));
  if (sig.length === 0) sig = words;
  let code = sig.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  if (code.length < 2 && sig[0]) code = sig[0].substring(0, 3).toUpperCase();
  return code;
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block font-body text-sm font-semibold text-navy mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
      <h3 className="font-body text-base font-semibold text-navy mb-4">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Create / edit an agent. New agents come back with a one-time password, which the
 * caller surfaces through the password modal. Editing never touches the password.
 */
export default function AgentFormModal({ agent, onClose, onSaved }) {
  const isEdit = Boolean(agent);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agent) {
      setForm({ ...EMPTY, ...Object.fromEntries(FIELDS.map((k) => [k, agent[k] || ""])), status: agent.status || "active" });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [agent]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(FIELDS.map((k) => [k, (form[k] || "").trim()]));
    if (!payload.company_name || !payload.email) {
      setError("Company name and email are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const path = isEdit ? `agents.php/${agent.id}` : "agents.php";
      const data = await apiFetch(path, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!data.success) {
        setError(data.message || "Failed to save agent");
        return;
      }
      onSaved(
        data.message || (isEdit ? "Agent updated" : "Agent created"),
        // A brand new agent comes back with its one-time password.
        !isEdit && data.data.generated_password ? data.data : null
      );
    } catch {
      setError("Error saving agent. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">
              {isEdit ? "Edit Agent" : "Add New Agent"}
            </h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              {isEdit
                ? `${agent.agent_code} — update partner details`
                : "A login password is generated automatically on save"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <form id="agentForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <Section title="Company">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Company Name" required>
                <input className={inputClass} value={form.company_name} onChange={set("company_name")} placeholder="e.g. Sunrise Travel Co., Ltd." />
              </Field>
              <Field label="Contact Person">
                <input className={inputClass} value={form.contact_name} onChange={set("contact_name")} placeholder="e.g. John Doe" />
              </Field>
            </div>
            <div className="mb-4">
              <Field label="Agent Code">
                <div className="flex gap-2">
                  <input className={`${inputClass} uppercase`} value={form.agent_code} onChange={set("agent_code")} placeholder="Leave blank to use the company initials" />
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.company_name.trim()) {
                        setError("Enter the company name first");
                        return;
                      }
                      setForm((f) => ({ ...f, agent_code: suggestCode(f.company_name.trim()) }));
                    }}
                    className="px-4 shrink-0 font-body text-sm font-semibold text-navy bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Suggest
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Letters, numbers and dashes only. Must be unique.</p>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Country">
                <input className={inputClass} value={form.country} onChange={set("country")} placeholder="e.g. Thailand" />
              </Field>
              <Field label="Travel Licence No.">
                <input className={inputClass} value={form.license_no} onChange={set("license_no")} placeholder="e.g. 31/00123" />
              </Field>
            </div>
          </Section>

          <Section title="Contact Channels">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Email (login)" required>
                <input type="email" className={inputClass} value={form.email} onChange={set("email")} placeholder="e.g. booking@agency.com" />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={form.phone} onChange={set("phone")} placeholder="e.g. +66 81 234 5678" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Field label="WhatsApp">
                <input className={inputClass} value={form.whatsapp} onChange={set("whatsapp")} placeholder="+66..." />
              </Field>
              <Field label="LINE ID">
                <input className={inputClass} value={form.line_id} onChange={set("line_id")} placeholder="@agency" />
              </Field>
              <Field label="WeChat ID">
                <input className={inputClass} value={form.wechat_id} onChange={set("wechat_id")} placeholder="wechat_id" />
              </Field>
            </div>
            <Field label="Address">
              <textarea rows={2} className={`${inputClass} resize-y`} value={form.address} onChange={set("address")} placeholder="Office address" />
            </Field>
          </Section>

          <Section title="Account">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={set("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
              <Field label="Tax ID">
                <input className={inputClass} value={form.tax_id} onChange={set("tax_id")} placeholder="e.g. 0105561000000" />
              </Field>
            </div>
            <Field label="Internal Notes">
              <textarea rows={2} className={`${inputClass} resize-y`} value={form.notes} onChange={set("notes")} placeholder="Only visible to admins" />
            </Field>
          </Section>
        </form>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="font-body text-sm text-red-600">{error}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
            <button type="submit" form="agentForm" disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Agent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
