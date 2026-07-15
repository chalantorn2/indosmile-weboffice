import { useState } from "react";
import { apiFetch } from "./lib/adminApi";

/**
 * One-time password handover. The plaintext only exists here — the server keeps a
 * hash — so emailing it must happen while the dialog is open. Nothing is sent
 * automatically; the admin decides when the partner should get access.
 */
export default function AgentPasswordModal({ data, subtitle, onClose, onToast, onSent }) {
  // `data` = { id, email, generated_password } (list row + password)
  const [emailState, setEmailState] = useState("idle"); // idle | sending | sent
  const [hint, setHint] = useState(
    "Sends the agent code, login email and this password. Nothing goes out until you press it."
  );

  const password = data.generated_password;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      onToast("success", "Password copied to clipboard");
    } catch {
      onToast("warning", "Could not copy — please select the password manually");
    }
  };

  const sendEmail = async () => {
    setEmailState("sending");
    try {
      const res = await apiFetch(`agents.php/${data.id}/send-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.success) {
        setEmailState("idle");
        onToast("error", res.message || "Failed to send the email");
        return;
      }
      setEmailState("sent");
      setHint(res.message || "Login details sent");
      onToast("success", res.message || "Login details sent");
      onSent?.();
    } catch {
      setEmailState("idle");
      onToast("error", "Error sending the email");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">Agent Password</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">{subtitle || "Shown once — copy it now"}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block font-body text-sm font-semibold text-navy mb-1.5">Login Email</label>
            <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-body text-sm text-navy">{data.email || "—"}</div>
          </div>
          <div className="mb-4">
            <label className="block font-body text-sm font-semibold text-navy mb-1.5">Password</label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-base tracking-wide text-navy break-all">{password}</div>
              <button onClick={copy} className="px-4 py-3 rounded-xl bg-navy text-white font-body text-sm font-semibold hover:bg-navy/90 transition-all">Copy</button>
            </div>
          </div>
          <p className="font-body text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            This password is not stored in plain text. Once you close this dialog it cannot be shown again — you would have to generate a new one.
          </p>

          <button
            onClick={sendEmail}
            disabled={emailState !== "idle"}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-yellow text-navy font-body text-sm font-bold hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailState === "sending" ? "Sending..." : emailState === "sent" ? "Sent" : "Email these details to the agent"}
          </button>
          <p className="font-body text-xs text-gray-400 text-center mt-2">{hint}</p>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2.5 font-body text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all">Done</button>
        </div>
      </div>
    </div>
  );
}
