import { useRef, useState } from "react";
import DatePicker from "./DatePicker";
import BookingModal from "./BookingModal";

/** Compact -/+ counter used for the guest fields. One component so the three
 *  counters can never drift apart again (Infants was a copy-paste of Child). */
function Stepper({ label, value, min = 0, onChange }) {
  const atMin = value <= min;
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-1.5">
      <span className="font-body text-[13px] font-semibold text-navy">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
            atMin
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-navy/30 text-navy hover:bg-navy hover:text-white"
          }`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        <span className="font-body text-[13px] font-bold text-navy text-center min-w-[16px]">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
          className="w-5 h-5 rounded-full border border-navy/30 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors flex-shrink-0"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function BookingSidebar({ tour }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [showModal, setShowModal] = useState(false);
  // Anchor + first field so the mobile sticky bar can jump straight to the form.
  const cardRef = useRef(null);
  const nameRef = useRef(null);

  const scrollToForm = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Focus after the smooth scroll settles so the keyboard doesn't fight it.
    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 500);
  };

  const totalPrice =
    formData.adults * (tour?.adultPrice || 0) +
    formData.children * (tour?.childPrice || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Book Now no longer submits — it hands off to the modal, which collects the
  // logistics details and fires the actual booking. The form's `required` fields
  // still block this until name/phone/email are filled.
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className="lg:col-span-1">
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-lg p-4 sticky top-24 scroll-mt-24"
      >
        {/* Price Header */}
        <div className="text-center mb-3 pb-3 border-b border-gray-100">
          <p className="font-body text-[11px] text-gray-400 uppercase tracking-wider mb-1">
            Price per person
          </p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-heading text-3xl text-navy">
              {tour.adultPrice?.toLocaleString()}
            </span>
            <span className="font-body text-xs text-gray-400">THB / adult</span>
          </div>
          {tour.childPrice && (
            <div className="flex items-baseline justify-center gap-1.5 mt-1">
              <span className="font-heading text-xl text-navy/60">
                {tour.childPrice.toLocaleString()}
              </span>
              <span className="font-body text-xs text-gray-400">
                THB / child
              </span>
            </div>
          )}
        </div>

        {/* Estimated Total */}
        {(formData.adults > 1 || formData.children > 0) && (
          <div className="bg-navy/5 rounded-xl p-2.5 mb-3">
            <div className="space-y-1 mb-1.5">
              {formData.adults > 0 && (
                <div className="flex items-center justify-between font-body text-[13px] text-gray-500">
                  <span>Adult × {formData.adults}</span>
                  <span>
                    {(formData.adults * tour.adultPrice).toLocaleString()} THB
                  </span>
                </div>
              )}
              {formData.children > 0 && tour.childPrice && (
                <div className="flex items-center justify-between font-body text-[13px] text-gray-500">
                  <span>Child × {formData.children}</span>
                  <span>
                    {(formData.children * tour.childPrice).toLocaleString()} THB
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-navy/10">
              <span className="font-body text-sm font-semibold text-navy">
                Total
              </span>
              <span className="font-heading text-xl text-navy">
                {totalPrice.toLocaleString()} THB
              </span>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-2">
            <div className="lg:col-span-6">
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">
                Name *
              </label>
              <input
                ref={nameRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div className="lg:col-span-4">
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors"
                placeholder="+66 XXX"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-2">
            <div className="lg:col-span-6">
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div className="lg:col-span-4 text-[14px]">
              <DatePicker
                value={formData.date}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, date: val }))
                }
                required
              />
            </div>
          </div>

          {/* Guests — stacked full-width rows so a third counter can't wrap and
              strand itself (the Infants layout bug). */}
          <div className="space-y-1.5">
            <Stepper
              label="Adults"
              value={formData.adults}
              min={1}
              onChange={(v) => setFormData((prev) => ({ ...prev, adults: v }))}
            />

            {tour.childPrice && (
              <Stepper
                label="Child"
                value={formData.children}
                min={0}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, children: v }))
                }
              />
            )}

            {/* Infants travel free — tracked for headcount only. */}
            <Stepper
              label="Infants"
              value={formData.infants}
              min={0}
              onChange={(v) => setFormData((prev) => ({ ...prev, infants: v }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-navy text-white py-2 rounded-xl font-body font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:bg-opacity-90 mt-1"
          >
            Book Now
          </button>
        </form>

        {/* Contact */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="font-body text-[11px] text-gray-400 text-center mb-1">
            Need help? Call us
          </p>
          <a
            href="tel:+66822536662"
            className="flex items-center justify-center gap-1.5 text-navy hover:text-yellow transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="font-body font-semibold text-[15px]">
              +66 82 253 6662
            </span>
          </a>
        </div>
      </div>

      {/* Mobile sticky CTA — mirrors the booking sites' bottom bar so the form
          is always one tap away instead of buried at the end of the page.
          Hidden on lg+ where the sidebar itself is already sticky. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider">
            {formData.adults > 1 || formData.children > 0
              ? "Total"
              : "Per person"}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-lg text-navy">
              {(formData.adults > 1 || formData.children > 0
                ? totalPrice
                : tour.adultPrice || 0
              ).toLocaleString()}
            </span>
            <span className="font-body text-[11px] text-gray-400">THB</span>
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToForm}
          className="flex-shrink-0 bg-navy text-white px-6 py-2.5 rounded-xl font-body font-bold text-sm shadow-md active:scale-95 transition-transform"
        >
          Book Now
        </button>
      </div>
      {/* Spacer so the fixed bar never covers the bottom of the page content. */}
      <div className="h-16 lg:hidden" aria-hidden="true" />

      {showModal && (
        <BookingModal
          tour={tour}
          base={formData}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
