// Shared form primitives for the admin modals, styled per docs/DESIGN_SYSTEM.md.

export const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all";

export function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block font-body text-sm font-semibold text-navy mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-gray-400 font-normal text-xs"> {hint}</span>}
      </label>
      {children}
    </div>
  );
}

// Prices are whole baht, so the field holds digits only and shows them grouped.
// onChange receives the raw digit string (no commas), not an event.
export function PriceInput({ value, onChange, className = inputClass, placeholder = "0", ...props }) {
  const digits = toDigits(value);
  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      value={digits && Number(digits).toLocaleString("en-US")}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      {...props}
    />
  );
}

function toDigits(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Math.round(Number(String(value).replace(/,/g, "")));
  return Number.isNaN(n) ? "" : String(Math.abs(n));
}

// Profit a selling price makes over its net cost. Stays hidden until both sides
// are filled in, so a half-typed form doesn't flash a scary loss.
export function MarginHint({ net, selling }) {
  const netN = Number(String(net ?? "").replace(/,/g, ""));
  const sellN = Number(String(selling ?? "").replace(/,/g, ""));
  if (!netN || !sellN || Number.isNaN(netN) || Number.isNaN(sellN)) return null;

  const profit = Math.round(sellN - netN);
  const margin = Math.round((profit / sellN) * 100);
  const tone =
    profit > 0 ? "text-green-600" : profit < 0 ? "text-red-500" : "text-gray-400";

  return (
    <p className={`font-body text-xs mt-1 ${tone}`}>
      {profit >= 0 ? "+" : "−"}฿{Math.abs(profit).toLocaleString("en-US")} over net
      {profit !== 0 && ` · ${margin}% margin`}
    </p>
  );
}

export function SectionCard({ title, right, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
      <div className="flex items-center mb-4">
        <h3 className="font-body text-base font-semibold text-navy">{title}</h3>
        {right && <span className="ml-auto text-xs text-gray-400">{right}</span>}
      </div>
      {children}
    </div>
  );
}
