import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Share2, Wallet, BellRing } from "lucide-react";
import { apiFetch } from "./lib/adminApi";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all";

// Brand marks for the social fields — matching the legacy admin. Rendered in a small
// coloured chip beside the label. Kept as inline SVG since lucide has no brand icons.
function BrandChip({ bg, children }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded"
      style={{ background: bg }}
    >
      <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24">{children}</svg>
    </span>
  );
}

const BRAND = {
  facebook: (
    <BrandChip bg="#1877f2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </BrandChip>
  ),
  instagram: (
    <BrandChip bg="linear-gradient(135deg,#f58529,#dd2a7b,#8134af)">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </BrandChip>
  ),
  line: (
    <BrandChip bg="#06c755">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.634.634 0 01-.199.031c-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595a.64.64 0 01.194-.033c.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.086l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </BrandChip>
  ),
  whatsapp: (
    <BrandChip bg="#25d366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </BrandChip>
  ),
};

// Field metadata lives here (the API only stores key/value/type), mirroring the
// legacy settings form so labels and groupings stay meaningful.
const SCHEMA = [
  {
    title: "Company Information",
    icon: Building2,
    note: "Displayed on website header, footer & contact page",
    fields: [
      { key: "site_name", label: "Company / Site Name", type: "text", placeholder: "Indo Smile South Services" },
      { key: "site_email", label: "Contact Email", type: "email", placeholder: "info@indosmilesouthservices.com" },
      { key: "site_phone", label: "Primary Phone (comma-separated)", type: "text", placeholder: "+66 XX XXX XXXX" },
      { key: "site_address", label: "Office Address", type: "text", placeholder: "199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110" },
    ],
  },
  {
    title: "Social Media Links",
    icon: Share2,
    note: "Shown in website footer",
    fields: [
      { key: "social_facebook", label: "Facebook", type: "url", placeholder: "https://facebook.com/yourpage", brand: "facebook" },
      { key: "social_instagram", label: "Instagram", type: "url", placeholder: "https://instagram.com/yourpage", brand: "instagram" },
      { key: "social_line", label: "LINE Official", type: "url", placeholder: "https://line.me/ti/p/@yourline", brand: "line" },
      { key: "social_whatsapp", label: "WhatsApp", type: "url", placeholder: "https://wa.me/66XXXXXXXXX", brand: "whatsapp" },
    ],
  },
  {
    title: "Booking & Currency",
    icon: Wallet,
    fields: [
      {
        key: "currency_default",
        label: "Default Currency",
        type: "select",
        options: [
          ["THB", "Thai Baht (THB)"],
          ["USD", "US Dollar (USD)"],
          ["EUR", "Euro (EUR)"],
          ["GBP", "British Pound (GBP)"],
          ["AUD", "Australian Dollar (AUD)"],
        ],
      },
      {
        key: "booking_confirmation_auto",
        label: "Auto-Confirm Bookings",
        type: "boolean",
        hint: "New bookings will be automatically confirmed without manual review",
      },
    ],
  },
  {
    title: "Notifications",
    icon: BellRing,
    fields: [
      {
        key: "email_notifications_enabled",
        label: "Email Notifications",
        type: "boolean",
        hint: "Receive an email alert when a new booking is submitted",
      },
    ],
  },
];

const ALL_KEYS = SCHEMA.flatMap((s) => s.fields.map((f) => f.key));
const isBoolTrue = (v) => v === "1" || v === "true" || v === true;

export default function Settings() {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState({}); // last-saved snapshot for dirty detection
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("settings.php");
      if (data.success) {
        const map = {};
        (data.data || []).forEach((s) => {
          map[s.setting_key] = s.setting_type === "boolean" ? (isBoolTrue(s.setting_value) ? "1" : "0") : s.setting_value || "";
        });
        // Ensure every schema key has an entry.
        ALL_KEYS.forEach((k) => {
          if (!(k in map)) map[k] = "";
        });
        setValues(map);
        setSaved(map);
      }
    } catch {
      showToast("error", "Error loading settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const dirty = useMemo(
    () => ALL_KEYS.some((k) => (values[k] ?? "") !== (saved[k] ?? "")),
    [values, saved]
  );

  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const discard = () => {
    setValues(saved);
    showToast("info", "Changes discarded");
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = ALL_KEYS.map((k) => ({ setting_key: k, setting_value: values[k] ?? "" }));
      const data = await apiFetch("settings.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setSaved(values);
        showToast("success", "Settings saved successfully!");
      } else {
        showToast("error", data.message || "Failed to save settings");
      }
    } catch {
      showToast("error", "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-4xl text-navy">Settings</h1>
        <p className="font-body text-sm text-gray-500 mt-1">Platform-wide configuration</p>
      </div>

      {toast && (
        <div className={`mb-4 rounded-xl px-4 py-3 font-body text-sm ${toast.type === "success" ? "bg-green-50 text-green-600" : toast.type === "info" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <p className="font-body text-gray-500">Loading settings...</p>
      ) : (
        <div className="flex flex-col gap-5 pb-24">
          {SCHEMA.map((section) => (
            <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-navy" />
                </span>
                <h3 className="font-body text-base font-semibold text-navy">{section.title}</h3>
                {section.note && <span className="ml-auto text-xs text-gray-400">{section.note}</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {section.fields.map((f) => {
                  if (f.type === "boolean") {
                    return (
                      <label key={f.key} className="md:col-span-2 flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={isBoolTrue(values[f.key])}
                          onChange={(e) => setValue(f.key, e.target.checked ? "1" : "0")}
                        />
                        <div>
                          <span className="font-body text-sm font-semibold text-gray-700">{f.label}</span>
                          {f.hint && <p className="text-xs text-gray-400 mt-0.5">{f.hint}</p>}
                        </div>
                      </label>
                    );
                  }
                  return (
                    <div key={f.key}>
                      <label className="flex items-center gap-2 font-body text-sm font-semibold text-navy mb-1.5">
                        {f.brand && BRAND[f.brand]}
                        {f.label}
                      </label>
                      {f.type === "select" ? (
                        <select className={inputClass} value={values[f.key] ?? ""} onChange={(e) => setValue(f.key, e.target.value)}>
                          {f.options.map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          className={inputClass}
                          value={values[f.key] ?? ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                          placeholder={f.placeholder}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky save bar — only when there are unsaved changes */}
      {dirty && !loading && (
        <div className="fixed bottom-0 left-0 lg:left-56 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-6 py-3 flex items-center justify-between z-40">
          <span className="font-body text-sm text-gray-500">You have unsaved changes</span>
          <div className="flex gap-3">
            <button onClick={discard} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Discard</button>
            <button onClick={save} disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
