import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/backend/api";

const inputClass =
  "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm text-gray-700 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">
        {label}
        {hint && <span className="font-normal text-gray-400"> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Step 2 of booking: the customer has filled contact + guests in the sidebar and
 * clicked Book Now. Here they add the logistics we need to actually run the pickup
 * (hotel, room, pickup point, dietary needs), then Confirm fires the real POST.
 *
 * The extra fields are folded into `special_requests` — the backend, the office
 * email and the admin panel already surface that field, so no schema change needed.
 */
export default function BookingModal({ tour, base, onClose }) {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [extra, setExtra] = useState({
    accommodation: "",
    room: "",
    pickup: "",
    nationality: "",
    dietary: "",
    notes: "",
  });

  // Trigger the enter transition one frame after mount so the browser paints the
  // "closed" state first, then animates to "open".
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    if (submitting) return;
    setEntered(false);
    setTimeout(onClose, 200); // let the exit transition finish before unmounting
  };

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting]);

  const set = (key) => (e) =>
    setExtra((prev) => ({ ...prev, [key]: e.target.value }));

  const composeSpecialRequests = () => {
    const lines = [];
    const accommodation = extra.accommodation.trim();
    const room = extra.room.trim();
    if (accommodation) {
      lines.push(`Accommodation: ${accommodation}${room ? ` (Room ${room})` : ""}`);
    } else if (room) {
      lines.push(`Room: ${room}`);
    }
    if (extra.pickup.trim()) lines.push(`Pickup point: ${extra.pickup.trim()}`);
    if (extra.nationality.trim()) lines.push(`Nationality: ${extra.nationality.trim()}`);
    if (extra.dietary.trim()) lines.push(`Dietary / allergies: ${extra.dietary.trim()}`);
    if (extra.notes.trim()) lines.push(`Notes: ${extra.notes.trim()}`);
    return lines.length ? lines.join("\n") : null;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/bookings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tour.id,
          customer_name: base.name,
          customer_email: base.email,
          customer_phone: base.phone,
          travel_date: base.date,
          number_of_guests: base.adults + base.children,
          adults: base.adults,
          children: base.children,
          infants: base.infants,
          special_requests: composeSpecialRequests(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.booking_reference) {
        // The status page is the receipt — carry the customer straight there.
        navigate(`/booking/${data.data.booking_reference}`);
        return;
      }

      setError(data.message || "Failed to submit booking. Please try again.");
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const guestSummary = [
    `${base.adults} adult${base.adults > 1 ? "s" : ""}`,
    base.children > 0 && `${base.children} child${base.children > 1 ? "ren" : ""}`,
    base.infants > 0 && `${base.infants} infant${base.infants > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const travelDate = new Date(base.date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complete your booking"
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-lg max-h-[92vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-200 ease-out ${
          entered
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-6 sm:translate-y-4 sm:scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">Almost there</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              A few pickup details so we can serve you better
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none flex-shrink-0"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Booking summary */}
          <div className="bg-navy/5 rounded-xl p-3">
            <p className="font-body text-sm font-semibold text-navy">{tour.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 font-body text-[13px] text-gray-500">
              <span>{travelDate}</span>
              <span aria-hidden="true">·</span>
              <span>{guestSummary}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Accommodation" hint="hotel / villa">
                <input
                  type="text"
                  className={inputClass}
                  value={extra.accommodation}
                  onChange={set("accommodation")}
                  placeholder="e.g. Ao Nang Beach Resort"
                />
              </Field>
            </div>
            <Field label="Room">
              <input
                type="text"
                className={inputClass}
                value={extra.room}
                onChange={set("room")}
                placeholder="e.g. 214"
              />
            </Field>
          </div>

          <Field label="Pickup point" hint="if different from your hotel">
            <input
              type="text"
              className={inputClass}
              value={extra.pickup}
              onChange={set("pickup")}
              placeholder="e.g. Hotel lobby, or a nearby landmark"
            />
          </Field>

          <Field label="Nationality" hint="helps with the guest manifest">
            <input
              type="text"
              className={inputClass}
              value={extra.nationality}
              onChange={set("nationality")}
              placeholder="e.g. Thai"
            />
          </Field>

          <Field label="Dietary needs / allergies">
            <input
              type="text"
              className={inputClass}
              value={extra.dietary}
              onChange={set("dietary")}
              placeholder="e.g. Vegetarian, no shellfish"
            />
          </Field>

          <Field label="Anything else">
            <textarea
              rows={2}
              className={`${inputClass} resize-none`}
              value={extra.notes}
              onChange={set("notes")}
              placeholder="Special requests, occasions, questions..."
            />
          </Field>

          {error && (
            <div className="p-2 rounded-lg text-sm font-body bg-red-50 text-red-700 border border-red-200">
              <p className="font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 font-body text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-5 py-2 rounded-xl font-body font-bold text-sm text-navy bg-yellow shadow-md transition-all ${
              submitting ? "opacity-60 cursor-not-allowed" : "hover:brightness-95 hover:shadow-lg"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Confirming...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
