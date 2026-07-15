// Shared booking status helpers — kept in one place so the list, the detail modal
// and any future dashboard describe a booking identically (matches the legacy admin).

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

const PAYMENT_STYLES = {
  paid: "bg-green-50 text-green-600",
  unpaid: "bg-gray-100 text-gray-600",
  refunded: "bg-purple-50 text-purple-600",
  failed: "bg-red-50 text-red-600",
};

function Pill({ text, className }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${className || "bg-gray-100 text-gray-600"}`}
    >
      {text}
    </span>
  );
}

/**
 * The badges that describe a booking: workflow status + (optionally) payment status.
 * The bookings list hides the payment pill and signals "paid" via a green Total instead,
 * so pass showPayment={false} there.
 */
export function StatusBadges({ booking, showPayment = true }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Pill text={booking.status} className={STATUS_STYLES[booking.status]} />
      {showPayment && (
        <Pill text={booking.payment_status} className={PAYMENT_STYLES[booking.payment_status]} />
      )}
    </span>
  );
}
