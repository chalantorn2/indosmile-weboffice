import { useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = "/backend/api";

// What the agent may change about themselves. agent_code, email (their login) and
// status stay with the admin, so they are shown read-only below.
const FIELDS = [
  { name: "contact_name", label: "Contact Person", required: true, placeholder: "e.g. John Doe" },
  { name: "phone", label: "Phone", placeholder: "e.g. +66 81 234 5678" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "+66..." },
  { name: "line_id", label: "LINE ID", placeholder: "@agency" },
  { name: "wechat_id", label: "WeChat ID", placeholder: "wechat_id" },
  { name: "country", label: "Country", placeholder: "e.g. Thailand" },
];

export default function AgentProfile() {
  const { agent, refreshAgent } = useOutletContext();

  const [form, setForm] = useState(() => {
    const initial = { address: agent.address || "" };
    FIELDS.forEach((field) => {
      initial[field.name] = agent[field.name] || "";
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.contact_name.trim()) {
      setFeedback({ type: "error", message: "Contact person is required" });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/agent_auth.php/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!data.success) {
        setFeedback({ type: "error", message: data.message || "Failed to save your details" });
        return;
      }

      // Keep the sidebar and the rest of the portal in step with what was just saved.
      await refreshAgent();
      setFeedback({ type: "success", message: data.message || "Your details have been updated" });
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to save your details" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-navy mb-2">My Details</h1>
        <p className="font-body text-gray-600">
          Keep your contact channels up to date so our team can reach you about bookings.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6">
        <p className="font-body text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
          Account
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          <ReadOnlyField label="Agent Code" value={agent.agent_code} />
          <ReadOnlyField label="Company" value={agent.company_name} />
          <ReadOnlyField label="Email (login)" value={agent.email} />
        </div>
        <p className="font-body text-xs text-gray-400 mt-4">
          Contact our team if your company name or login email needs to change.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {FIELDS.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block font-body text-sm font-semibold text-navy mb-2">
                {field.label}
                {field.required && <span className="text-red-400"> *</span>}
              </label>
              <input
                id={field.name}
                type="text"
                value={form[field.name]}
                onChange={handleChange(field.name)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:border-navy transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block font-body text-sm font-semibold text-navy mb-2">
            Address
          </label>
          <textarea
            id="address"
            rows={3}
            value={form.address}
            onChange={handleChange("address")}
            placeholder="Office address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:border-navy transition-colors"
          />
        </div>

        {feedback && <Feedback {...feedback} />}

        <button
          type="submit"
          disabled={saving}
          className="bg-navy text-white px-8 py-3 rounded-xl font-body font-semibold hover:bg-yellow hover:text-navy transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-body text-sm text-navy font-semibold break-all">{value || "—"}</p>
    </div>
  );
}

export function Feedback({ type, message }) {
  const styles =
    type === "success"
      ? "border-green-100 bg-green-50 text-green-700"
      : "border-red-100 bg-red-50 text-red-700";

  return (
    <div className={`mb-6 rounded-xl border px-5 py-4 ${styles}`}>
      <p className="font-body text-sm">{message}</p>
    </div>
  );
}
