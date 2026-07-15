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
