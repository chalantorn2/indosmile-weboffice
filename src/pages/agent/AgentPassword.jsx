import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Feedback } from "./AgentProfile";

const API_BASE = "/backend/api";
const MIN_LENGTH = 8;

export default function AgentPassword() {
  const navigate = useNavigate();
  const { agent, refreshAgent } = useOutletContext();

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const mustChange = Number(agent.must_change_password) === 1;

  const handleChange = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.next.length < MIN_LENGTH) {
      setFeedback({ type: "error", message: `New password must be at least ${MIN_LENGTH} characters` });
      return;
    }

    if (form.next !== form.confirm) {
      setFeedback({ type: "error", message: "The two new passwords do not match" });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/agent_auth.php/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: form.current,
          new_password: form.next,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        setFeedback({ type: "error", message: data.message || "Failed to change your password" });
        return;
      }

      setForm({ current: "", next: "", confirm: "" });

      // Clears must_change_password, which is what releases the forced redirect.
      const updated = await refreshAgent();

      if (mustChange && updated) {
        navigate("/agent/tours", { replace: true });
        return;
      }

      setFeedback({ type: "success", message: data.message || "Password changed successfully" });
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to change your password" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-navy mb-2">Password</h1>
        <p className="font-body text-gray-600">
          {mustChange
            ? "Choose your own password to finish setting up your account."
            : "Change the password you use to sign in to the agent portal."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <PasswordField
          id="current"
          label={mustChange ? "Temporary password" : "Current password"}
          value={form.current}
          onChange={handleChange("current")}
        />
        <PasswordField
          id="next"
          label="New password"
          value={form.next}
          onChange={handleChange("next")}
          hint={`At least ${MIN_LENGTH} characters.`}
        />
        <PasswordField
          id="confirm"
          label="Confirm new password"
          value={form.confirm}
          onChange={handleChange("confirm")}
        />

        {feedback && <Feedback {...feedback} />}

        <button
          type="submit"
          disabled={saving}
          className="bg-navy text-white px-8 py-3 rounded-xl font-body font-semibold hover:bg-yellow hover:text-navy transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, hint }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block font-body text-sm font-semibold text-navy mb-2">
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        required
        autoComplete={id === "current" ? "current-password" : "new-password"}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:border-navy transition-colors"
      />
      {hint && <p className="font-body text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
