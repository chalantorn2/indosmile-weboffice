import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE = "/backend/api";

/* ─── Reusable Autocomplete Input ─── */
function AutocompleteInput({
  label,
  icon,
  value,
  onChange,
  onSelect,
  suggestions,
  onFocus,
  placeholder,
  required,
  disabled,
  loading,
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  /* Filter suggestions by typed value */
  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes((value || "").toLowerCase())
  );

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Keyboard navigation */
  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      selectItem(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  const selectItem = (item) => {
    onSelect(item);
    setOpen(false);
    setHighlighted(-1);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="flex items-center gap-1.5 font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => {
            onFocus?.();
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all placeholder:text-gray-300 ${
            disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""
          }`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 animate-spin text-navy/40" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto animate-fade-in">
          {filtered.map((item, idx) => (
            <button
              key={item}
              type="button"
              onMouseDown={() => selectItem(item)}
              onMouseEnter={() => setHighlighted(idx)}
              className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors ${
                idx === highlighted
                  ? "bg-navy/10 text-navy font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              } ${idx === 0 ? "rounded-t-xl" : ""} ${
                idx === filtered.length - 1 ? "rounded-b-xl" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {open && value && filtered.length === 0 && !loading && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 px-4 py-3 animate-fade-in">
          <p className="font-body text-sm text-gray-400 text-center">No matching locations</p>
        </div>
      )}
    </div>
  );
}

export default function TransferPage() {
  const [tripType, setTripType] = useState("one-way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showPassengers, setShowPassengers] = useState(false);
  const passengersRef = useRef(null);

  /* ─── Modal + Contact info state ─── */
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  /* ─── Submit state ─── */
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  /* ─── Lightbox state ─── */
  const [lightboxIdx, setLightboxIdx] = useState(null);

  /* ─── Autocomplete state ─── */
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loadingOrigins, setLoadingOrigins] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  /* Fetch origins from API */
  const fetchOrigins = useCallback(async () => {
    if (origins.length > 0) return;
    setLoadingOrigins(true);
    try {
      const res = await fetch(`${API_BASE}/transfers.php?action=options`);
      const data = await res.json();
      setOrigins(Array.isArray(data.data) ? data.data : data);
    } catch (err) {
      console.error("Failed to fetch origins:", err);
    } finally {
      setLoadingOrigins(false);
    }
  }, [origins.length]);

  /* Fetch destinations when pickup changes */
  const fetchDestinations = useCallback(async (origin) => {
    if (!origin) {
      setDestinations([]);
      return;
    }
    setLoadingDestinations(true);
    try {
      const res = await fetch(
        `${API_BASE}/transfers.php?action=options&origin=${encodeURIComponent(origin)}`
      );
      const data = await res.json();
      setDestinations(Array.isArray(data.data) ? data.data : data);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    } finally {
      setLoadingDestinations(false);
    }
  }, []);

  /* Close passengers dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (passengersRef.current && !passengersRef.current.contains(e.target)) {
        setShowPassengers(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  /* ─── Modal form submit ─── */
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_BASE}/transfers.php?action=book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          trip_type: tripType,
          pickup_location: pickup,
          dropoff_location: dropoff,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          return_date: tripType === 'return' ? returnDate : null,
          return_time: tripType === 'return' ? returnTime : null,
          adults,
          children,
          infants,
          special_requests: specialRequests || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitResult({
          success: true,
          message: 'Transfer booking submitted successfully!',
          reference: data.data?.booking_reference,
        });
      } else {
        setSubmitResult({ success: false, message: data.message || 'Failed to submit booking. Please try again.' });
      }
    } catch {
      setSubmitResult({ success: false, message: 'Network error. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (submitResult?.success) {
      setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
      setPickup(""); setDropoff(""); setPickupDate(""); setPickupTime("");
      setReturnDate(""); setReturnTime(""); setSpecialRequests("");
      setAdults(1); setChildren(0); setInfants(0);
      setTripType("one-way");
    }
    setSubmitResult(null);
    setShowModal(false);
  };

  /* ─── Counter helper ─── */
  const Counter = ({ label, sub, value, onChange, min = 0 }) => (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-body text-sm font-semibold text-navy">{label}</span>
        {sub && <span className="font-body text-xs text-gray-400 ml-1">({sub})</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white hover:border-navy transition-all text-lg leading-none font-medium"
        >
          −
        </button>
        <span className="w-8 text-center font-body font-semibold text-navy">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white hover:border-navy transition-all text-lg leading-none font-medium"
        >
          +
        </button>
      </div>
    </div>
  );

  /* ─── Gallery images (fetched from admin, with fallback) ─── */
  const defaultGallery = [
    { src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80", alt: "VIP Van Transfer" },
    { src: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80", alt: "Luxury Coach Service" },
    { src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80", alt: "Airport Transfer" },
    { src: "https://images.unsplash.com/photo-1549317661-a47734bbd828?w=600&q=80", alt: "Private Sedan" },
    { src: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80", alt: "Airport Pickup Service" },
    { src: "https://images.unsplash.com/photo-1609520505218-7421df70a75b?w=600&q=80", alt: "Group Transfer" },
  ];
  const [gallery, setGallery] = useState(defaultGallery);

  useEffect(() => {
    fetch(`${API_BASE}/transfers.php?action=gallery`)
      .then((res) => res.json())
      .then((data) => {
        const images = Array.isArray(data.data) ? data.data : [];
        if (images.length > 0) setGallery(images);
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* ════════════════════════════════════════════
          HERO + BOOKING FORM
      ════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=80"
            alt="Premium Fleet and Ground Handling"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Hero Text */}
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-yellow/20 text-yellow font-body text-sm font-bold mb-6 backdrop-blur-sm border border-yellow/30">
                Premium Ground Handling
              </div>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-xl">
                Transfer & Transport Solutions
              </h1>
              <p className="font-body text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
                From VIP airport transfers to private city rides. Safe, comfortable, and on-time — every single trip across Southern Thailand.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: "🛡️", text: "Fully Insured" },
                  { icon: "⏱️", text: "On-Time Guarantee" },
                  { icon: "🌏", text: "English-Speaking Drivers" },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2">
                    <span className="text-xl">{badge.icon}</span>
                    <span className="font-body text-sm text-gray-300 font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Booking Form (ORIGINAL LAYOUT) */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <form
                onSubmit={(e) => { e.preventDefault(); setSubmitResult(null); setShowModal(true); }}
                className="bg-white rounded-3xl shadow-2xl p-8 space-y-5"
              >
                <h2 className="font-heading text-2xl text-navy text-center mb-2">
                  Book Your Ride
                </h2>

                {/* Trip Type Toggle */}
                <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
                  {[
                    { value: "one-way", label: "One Way" },
                    { value: "return", label: "Return" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTripType(opt.value)}
                      className={`py-2.5 rounded-lg font-body text-sm font-semibold transition-all duration-200 ${
                        tripType === opt.value
                          ? "bg-navy text-white shadow-md"
                          : "text-gray-500 hover:text-navy"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Pick-up & Drop-off Locations (Autocomplete) */}
                <div className="grid grid-cols-2 gap-3">
                  <AutocompleteInput
                    label="Pick-up"
                    icon={
                      <svg className="w-3.5 h-3.5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="4" />
                      </svg>
                    }
                    value={pickup}
                    onChange={setPickup}
                    onSelect={(val) => {
                      setPickup(val);
                      setDropoff("");
                      setDestinations([]);
                      fetchDestinations(val);
                    }}
                    suggestions={origins}
                    onFocus={fetchOrigins}
                    placeholder="e.g. Phuket Airport..."
                    required
                    loading={loadingOrigins}
                  />
                  <AutocompleteInput
                    label="Drop-off"
                    icon={
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    value={dropoff}
                    onChange={setDropoff}
                    onSelect={setDropoff}
                    suggestions={destinations}
                    placeholder={pickup ? "Select destination..." : "Select pick-up first"}
                    required
                    disabled={!pickup}
                    loading={loadingDestinations}
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Pick-up Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all text-navy"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Pick-up Time
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all text-navy"
                    />
                  </div>
                </div>

                {/* Return Date & Time — only when Return is selected */}
                {tripType === 'return' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        required
                        min={pickupDate || new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all text-navy"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Return Time
                      </label>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all text-navy"
                      />
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div className="relative" ref={passengersRef}>
                  <label className="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Passengers
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassengers((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl font-body text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all bg-white hover:border-gray-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {adults} Adult{adults !== 1 ? "s" : ""}
                      {children > 0 && `, ${children} Child${children !== 1 ? "ren" : ""}`}
                      {infants > 0 && `, ${infants} Infant${infants !== 1 ? "s" : ""}`}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showPassengers ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPassengers && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-3 z-50 animate-fade-in">
                      <Counter label="Adults" sub="12+" value={adults} onChange={setAdults} min={1} />
                      <Counter label="Children" sub="2–11" value={children} onChange={setChildren} />
                      <Counter label="Infants" sub="0–1" value={infants} onChange={setInfants} />
                      <button
                        type="button"
                        onClick={() => setShowPassengers(false)}
                        className="w-full mt-1 py-2 rounded-lg bg-navy text-white font-body text-sm font-semibold hover:bg-navy/90 transition-all"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit — opens modal */}
                <button
                  type="submit"
                  className="w-full bg-yellow text-navy py-4 rounded-xl font-body font-bold text-base hover:bg-navy hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Request Booking
                </button>

                <p className="text-center font-body text-xs text-gray-400">
                  Free cancellation • Instant confirmation
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          GALLERY — Our Services in Action
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl text-navy mb-4">
              Our Services in Action
            </h2>
            <p className="font-body text-lg text-gray-500 max-w-2xl mx-auto">
              A glimpse of our premium fleet and the journeys we've made across Southern Thailand.
            </p>
          </div>

          {/* Masonry-style gallery */}
          <div className="columns-2 md:columns-3 gap-4 md:gap-5 [column-fill:_balance]">
            {gallery.map((img, idx) => (
              <div
                key={idx}
                className="relative mb-4 md:mb-5 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                onClick={() => setLightboxIdx(idx)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ minHeight: '160px' }}
                />
                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                            <span className="font-body text-white/60 text-xs mt-0.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    Click to enlarge
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          LIGHTBOX
      ════════════════════════════════════════════ */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all z-10"
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + gallery.length) % gallery.length); }}
            className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-all z-10"
          >
            ‹
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={gallery[lightboxIdx].src}
              alt={gallery[lightboxIdx].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              style={{ animation: 'modalFadeIn 0.25s ease-out' }}
            />        
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % gallery.length); }}
            className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-all z-10"
          >
            ›
          </button>

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-body text-white/50 text-xs">
            {lightboxIdx + 1} / {gallery.length}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          BOOKING MODAL
      ════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => { if (!submitting) handleCloseModal(); }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Card */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ animation: 'modalFadeIn 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { if (!submitting) handleCloseModal(); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-navy transition-all z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              <h3 className="font-heading text-2xl text-navy text-center mb-1">Complete Your Booking</h3>
              <p className="font-body text-sm text-gray-400 text-center mb-6">Fill in your details to confirm the transfer</p>

              {/* Booking Summary */}
              <div className="bg-navy/5 rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider">Pick-up</p>
                    <p className="font-body text-sm font-semibold text-navy truncate">{pickup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider">Drop-off</p>
                    <p className="font-body text-sm font-semibold text-navy truncate">{dropoff}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-navy/10 mt-2 flex-wrap">
                  <span className="font-body text-xs font-semibold text-navy">
                    {tripType === 'return' ? '↔ Return' : '→ One Way'}
                  </span>
                  <span className="font-body text-xs text-gray-500">
                    📅 {pickupDate ? new Date(pickupDate + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <span className="font-body text-xs text-gray-500">
                    ⏰ {pickupTime || '—'}
                  </span>
                  <span className="font-body text-xs text-gray-500">
                    👥 {adults + children + infants} pax
                  </span>
                </div>
                {tripType === 'return' && returnDate && (
                  <div className="flex items-center gap-4 pt-2 border-t border-navy/10 mt-1 flex-wrap">
                    <span className="font-body text-xs font-semibold text-navy">↩ Return Trip</span>
                    <span className="font-body text-xs text-gray-500">
                      📅 {new Date(returnDate + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {returnTime && (
                      <span className="font-body text-xs text-gray-500">
                        ⏰ {returnTime}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Success / Error Message */}
              {submitResult && (
                <div className={`p-4 rounded-xl text-sm font-body mb-6 ${
                  submitResult.success
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <p className="font-semibold">{submitResult.message}</p>
                  {submitResult.reference && (
                    <p className="mt-1">Reference: <span className="font-bold text-base">{submitResult.reference}</span></p>
                  )}
                  {submitResult.success && (
                    <p className="mt-1 text-xs">We will contact you shortly to confirm your transfer.</p>
                  )}
                </div>
              )}

              {/* Contact Form (hide after success) */}
              {!submitResult?.success && (
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-body text-xs font-semibold text-navy mb-1">Name *</label>
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all placeholder:text-gray-300" />
                    </div>
                    <div>
                      <label className="block font-body text-xs font-semibold text-navy mb-1">Phone *</label>
                      <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required placeholder="+66 XXX"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all placeholder:text-gray-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-xs font-semibold text-navy mb-1">Email *</label>
                    <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all placeholder:text-gray-300" />
                  </div>



                  <div>
                    <label className="block font-body text-xs font-semibold text-navy mb-1">Special Requests</label>
                    <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={2}
                      placeholder="Flight number, child seat, extra luggage..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all placeholder:text-gray-300 resize-none" />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full bg-navy text-white py-4 rounded-xl font-body font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
                      submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-navy/90'
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirm Booking
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Close button after success */}
              {submitResult?.success && (
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-navy text-white py-3 rounded-xl font-body font-bold text-sm hover:bg-navy/90 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal animation */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
