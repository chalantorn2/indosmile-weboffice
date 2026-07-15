import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

const API_BASE = "/backend/api";

/* The customer-visible journey. `cancelled` is handled separately — it is an exit,
   not a step along this line. */
const STEPS = [
  { key: "received", label: "Request received", desc: "We have your booking" },
  { key: "confirmed", label: "Confirmed", desc: "Availability secured" },
  { key: "paid", label: "Paid", desc: "Payment complete" },
];

function currentStep(booking) {
  if (booking.payment_status === "paid") return 2;
  if (booking.status === "confirmed") return 1;
  return 0;
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "-";

const formatPrice = (value, currency = "THB") =>
  `${Number(value).toLocaleString()} ${currency}`;

export default function BookingStatus() {
  const { reference } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payError, setPayError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const justPaid = searchParams.get("paid") === "1";
  const justCancelled = searchParams.get("cancelled") === "1";

  // Stripe bounces the customer back here the instant checkout completes, but the
  // webhook that actually marks the booking paid may land a second or two later.
  // Rather than show a stale "awaiting payment", poll briefly until it catches up.
  const [awaitingWebhook, setAwaitingWebhook] = useState(justPaid);
  const pollCount = useRef(0);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/booking_status.php?reference=${encodeURIComponent(reference)}`);
      const data = await res.json();

      if (data.success) {
        setBooking(data.data);
        setError(null);
        return data.data;
      }
      setError(data.message || "Booking not found.");
      return null;
    } catch {
      setError("Could not load your booking. Please check your connection and try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  useEffect(() => {
    if (!awaitingWebhook) return;

    if (booking?.payment_status === "paid") {
      setAwaitingWebhook(false);
      return;
    }

    // ~20s of grace, then stop and let the page show whatever the server says.
    if (pollCount.current >= 10) {
      setAwaitingWebhook(false);
      return;
    }

    const timer = setTimeout(() => {
      pollCount.current += 1;
      fetchBooking();
    }, 2000);

    return () => clearTimeout(timer);
  }, [awaitingWebhook, booking, fetchBooking]);

  const handlePay = async () => {
    setPayError(null);
    setRedirecting(true);

    try {
      const res = await fetch(`${API_BASE}/stripe_checkout.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
        return;
      }

      setPayError(data.message || "Could not start the payment. Please try again.");
    } catch {
      setPayError("Network error. Please try again.");
    }
    setRedirecting(false);
  };

  const dismissBanner = () => {
    searchParams.delete("paid");
    searchParams.delete("cancelled");
    setSearchParams(searchParams, { replace: true });
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-navy" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-body text-sm text-gray-500">Loading your booking...</p>
        </div>
      </div>
    );
  }

  /* ─── Not found ─── */
  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl text-navy mb-2">Booking not found</h1>
          <p className="font-body text-sm text-gray-500 mb-6">{error}</p>
          <Link to="/inbound" className="inline-block bg-navy text-white px-6 py-2.5 rounded-xl font-body font-bold text-sm hover:bg-opacity-90 transition-all">
            Browse Tours
          </Link>
        </div>
      </div>
    );
  }

  const step = currentStep(booking);
  const isCancelled = booking.status === "cancelled";
  const isPaid = booking.payment_status === "paid";

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Post-checkout banners */}
        {justPaid && (
          <div className="mb-5 rounded-2xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-body font-bold text-sm text-green-800">Thank you — your payment went through.</p>
              <p className="font-body text-[13px] text-green-700 mt-0.5">
                {awaitingWebhook
                  ? "Confirming with our payment provider..."
                  : "A receipt has been sent to your email."}
              </p>
            </div>
            <button onClick={dismissBanner} className="text-green-600 hover:text-green-800 text-lg leading-none">×</button>
          </div>
        )}

        {justCancelled && !isPaid && (
          <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <p className="font-body font-bold text-sm text-amber-800">Payment cancelled</p>
              <p className="font-body text-[13px] text-amber-700 mt-0.5">
                Your booking is still held. You can pay whenever you are ready.
              </p>
            </div>
            <button onClick={dismissBanner} className="text-amber-600 hover:text-amber-800 text-lg leading-none">×</button>
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5">
          <div className="bg-navy text-white px-6 py-5">
            <p className="font-body text-[11px] uppercase tracking-wider text-white/50 mb-1">Booking Reference</p>
            <h1 className="font-heading text-2xl md:text-3xl tracking-wide">{booking.booking_reference}</h1>
          </div>

          {/* Progress */}
          <div className="px-6 py-6">
            {isCancelled ? (
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div>
                  <p className="font-body font-bold text-sm text-red-800">Booking cancelled</p>
                  <p className="font-body text-[13px] text-red-600">Contact us if you think this is a mistake.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                {STEPS.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <div key={s.key} className="flex-1 flex flex-col items-center relative">
                      {/* Connector to the previous dot */}
                      {i > 0 && (
                        <div className={`absolute top-4 right-1/2 w-full h-0.5 ${done || active ? "bg-navy" : "bg-gray-200"}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                        ${done ? "bg-navy border-navy text-white"
                          : active ? "bg-yellow border-yellow text-navy"
                          : "bg-white border-gray-200 text-gray-300"}`}>
                        {done ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="font-body text-xs font-bold">{i + 1}</span>
                        )}
                      </div>
                      <p className={`font-body text-[12px] font-bold mt-2 text-center px-1 ${done || active ? "text-navy" : "text-gray-300"}`}>
                        {s.label}
                      </p>
                      <p className={`font-body text-[11px] text-center px-1 ${active ? "text-gray-500" : "text-gray-300"}`}>
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status-driven call to action */}
          {!isCancelled && (
            <div className="border-t border-gray-100 px-6 py-5">
              {isPaid ? (
                <div className="text-center">
                  <p className="font-body text-sm text-gray-600">
                    Paid on <strong className="text-navy">{formatDate(booking.payment_date)}</strong>.
                    Our team will contact you with pickup details.
                  </p>
                </div>
              ) : booking.can_pay ? (
                <div className="text-center">
                  <p className="font-body text-sm text-gray-600 mb-1">
                    Your booking is confirmed. Complete payment to secure your seats.
                  </p>
                  <p className="font-heading text-3xl text-navy mb-4">
                    {formatPrice(booking.total_price, booking.currency)}
                  </p>
                  <button
                    onClick={handlePay}
                    disabled={redirecting}
                    className={`w-full sm:w-auto px-10 bg-navy text-white py-3 rounded-xl font-body font-bold text-sm shadow-md transition-all
                      ${redirecting ? "opacity-60 cursor-not-allowed" : "hover:bg-opacity-90 hover:shadow-lg"}`}
                  >
                    {redirecting ? "Opening secure checkout..." : "Pay Now"}
                  </button>
                  <p className="font-body text-[11px] text-gray-400 mt-2.5">
                    Secure card payment powered by Stripe
                  </p>
                  {payError && (
                    <p className="font-body text-[13px] text-red-600 mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
                      {payError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-yellow/10 rounded-xl p-4">
                  <svg className="w-5 h-5 text-navy mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-body font-bold text-sm text-navy">Awaiting confirmation</p>
                    <p className="font-body text-[13px] text-gray-600 mt-0.5">
                      We are checking availability. Within 24 hours we will email you a secure
                      payment link. <strong>No payment is needed yet.</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
          <h2 className="font-heading text-lg text-navy mb-4">Your Trip</h2>

          {booking.tour && (
            <div className="flex gap-4 mb-5 pb-5 border-b border-gray-100">
              {booking.tour.image && (
                <img src={booking.tour.image} alt={booking.tour.name}
                  className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="min-w-0">
                <Link to={`/booking-detail/${booking.tour.id}`}
                  className="font-body font-bold text-navy hover:text-yellow transition-colors block truncate">
                  {booking.tour.name}
                </Link>
                <p className="font-body text-[13px] text-gray-500 mt-0.5">{booking.tour.destination}</p>
                {booking.tour.duration && (
                  <p className="font-body text-[12px] text-gray-400 mt-0.5">{booking.tour.duration}</p>
                )}
              </div>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-y-3 gap-x-4">
            <Detail label="Travel date" value={formatDate(booking.travel_date)} />
            <Detail label="Guests" value={
              `${booking.adults} adult${booking.adults === 1 ? "" : "s"}` +
              (booking.children > 0 ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : "") +
              (booking.infants > 0 ? `, ${booking.infants} infant${booking.infants === 1 ? "" : "s"}` : "")
            } />
            <Detail label="Booked by" value={booking.customer_name} />
            <Detail label="Contact" value={booking.customer_email} />
            <Detail label="Total price" value={formatPrice(booking.total_price, booking.currency)} strong />
            <Detail label="Payment" value={isPaid ? "Paid" : "Not paid yet"} />
          </dl>

          {booking.special_requests && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="font-body text-[11px] uppercase tracking-wider text-gray-400 mb-1">Special requests</p>
              <p className="font-body text-sm text-gray-600 whitespace-pre-line">{booking.special_requests}</p>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="font-body text-sm text-gray-500 mb-2">Questions about this booking?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="tel:+66822536662" className="font-body font-bold text-navy hover:text-yellow transition-colors">
              +66 82 253 6662
            </a>
            <span className="hidden sm:inline text-gray-200">|</span>
            <a href={`mailto:info@indosmilesouthservices.com?subject=Booking ${booking.booking_reference}`}
              className="font-body font-bold text-navy hover:text-yellow transition-colors">
              info@indosmilesouthservices.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, strong }) {
  return (
    <div>
      <dt className="font-body text-[11px] uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className={`font-body text-sm mt-0.5 ${strong ? "font-bold text-navy" : "text-gray-700"}`}>{value}</dd>
    </div>
  );
}
