import { useState } from "react";
import {
  apiFetch,
  formatCurrency,
  formatDate,
  formatDateTime,
  isAwaitingPayment,
} from "./lib/adminApi";
import { StatusBadges } from "./bookingStatus";

function DetailRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="font-body text-sm text-gray-500 shrink-0">{label}</span>
      <span className="font-body text-sm text-gray-700 text-right break-words">
        {children}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="font-body text-sm font-semibold text-navy uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * Booking detail + workflow actions. Faithful port of the legacy booking modal:
 * confirm, resend payment link, mark paid (offline), cancel — same PUT actions.
 */
export default function BookingDetailModal({
  booking,
  onClose,
  onActionDone,
  onError,
}) {
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState(null); // 'markPaid' | 'cancel' | null
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [cancelReason, setCancelReason] = useState("");

  const guests =
    `${booking.adults} adult${Number(booking.adults) === 1 ? "" : "s"}` +
    (Number(booking.children) > 0
      ? `, ${booking.children} child${Number(booking.children) === 1 ? "" : "ren"}`
      : "") +
    (Number(booking.infants) > 0
      ? `, ${booking.infants} infant${Number(booking.infants) === 1 ? "" : "s"}`
      : "");

  const runAction = async (action, body = {}) => {
    setBusy(true);
    try {
      const data = await apiFetch(
        `bookings.php?id=${booking.id}&action=${action}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!data.success) {
        onError("Error: " + (data.message || "action failed"));
        return null;
      }
      return data;
    } catch {
      onError("Network error. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (
      !window.confirm(
        `Confirm ${booking.booking_reference}?\n\nThis emails ${booking.customer_email} a Pay Now link for ${formatCurrency(booking.total_price)}.`,
      )
    )
      return;
    const data = await runAction("confirm");
    if (data) onActionDone("Confirmed. Payment link sent.");
  };

  const handleResend = async () => {
    if (
      !window.confirm(`Resend the payment link to ${booking.customer_email}?`)
    )
      return;
    const data = await runAction("resend_payment_link");
    if (data) onActionDone(data.message || "Payment link resent.");
  };

  const handleMarkPaid = async () => {
    const data = await runAction("mark_paid", { payment_method: payMethod });
    if (data) onActionDone("Marked as paid. Receipt sent to customer.");
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      onError("Please give a reason for the cancellation.");
      return;
    }
    const data = await runAction("cancel", { reason: cancelReason.trim() });
    if (data) onActionDone("Booking cancelled.");
  };

  const awaitingPayment = isAwaitingPayment(booking);
  const paid = booking.payment_status === "paid";
  const cancelled = booking.status === "cancelled";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-mono text-lg font-bold text-navy">
              {booking.booking_reference}
            </h2>
            <div className="mt-1">
              <StatusBadges booking={booking} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <Section title="Customer">
            <DetailRow label="Name">{booking.customer_name}</DetailRow>
            <DetailRow label="Email">
              <a
                className="text-blue-600 hover:underline"
                href={`mailto:${booking.customer_email}`}
              >
                {booking.customer_email}
              </a>
            </DetailRow>
            <DetailRow label="Phone">
              <a
                className="text-blue-600 hover:underline"
                href={`tel:${booking.customer_phone}`}
              >
                {booking.customer_phone}
              </a>
            </DetailRow>
          </Section>

          <Section title="Trip">
            <DetailRow label="Tour">{booking.tour_name || "-"}</DetailRow>
            <DetailRow label="Destination">
              {booking.destination || "-"}
            </DetailRow>
            <DetailRow label="Travel date">
              {formatDate(booking.travel_date)}
            </DetailRow>
            <DetailRow label="Guests">{guests}</DetailRow>
            <DetailRow label="Total">
              <strong>{formatCurrency(booking.total_price)}</strong>
            </DetailRow>
          </Section>

          {booking.special_requests && (
            <Section title="Special requests">
              <p className="font-body text-sm text-gray-700">
                {booking.special_requests}
              </p>
            </Section>
          )}

          <Section title="Payment">
            {paid ? (
              <>
                <DetailRow label="Method">
                  {booking.payment_method || "-"}
                </DetailRow>
                <DetailRow label="Paid on">
                  {booking.payment_date
                    ? formatDateTime(booking.payment_date)
                    : "-"}
                </DetailRow>
                {booking.payment_intent_id && (
                  <DetailRow label="Stripe ref">
                    <span className="font-mono text-xs">
                      {booking.payment_intent_id}
                    </span>
                  </DetailRow>
                )}
              </>
            ) : (
              <DetailRow label="Status">
                {awaitingPayment
                  ? "Awaiting payment — the customer has a Pay Now link"
                  : "Not payable yet — confirm the booking first"}
              </DetailRow>
            )}
          </Section>

          <Section title="History">
            <DetailRow label="Booked">
              {formatDateTime(booking.created_at)}
            </DetailRow>
            {booking.confirmed_at && (
              <DetailRow label="Confirmed">
                {formatDateTime(booking.confirmed_at)}
              </DetailRow>
            )}
            {booking.cancelled_at && (
              <DetailRow label="Cancelled">
                {formatDateTime(booking.cancelled_at)}
              </DetailRow>
            )}
            {booking.cancellation_reason && (
              <DetailRow label="Reason">
                {booking.cancellation_reason}
              </DetailRow>
            )}
          </Section>

          {/* Mark-paid panel */}
          {panel === "markPaid" && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="font-body text-sm font-bold text-navy mb-1">
                Record an offline payment
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Card payments record themselves via Stripe. Use this only for
                money received another way.
              </p>
              <label className="block font-body text-xs font-semibold text-navy mb-1.5">
                Payment method
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white mb-4"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkPaid}
                  disabled={busy}
                  className="px-4 py-2 font-body text-sm font-semibold text-white bg-green-600 rounded-lg hover:brightness-95 disabled:opacity-50"
                >
                  Confirm Payment Received
                </button>
                <button
                  onClick={() => setPanel(null)}
                  className="px-4 py-2 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Cancel panel */}
          {panel === "cancel" && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="font-body text-sm font-bold text-navy mb-1">
                Cancel this booking
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                The reason is stored for your records.
              </p>
              <label className="block font-body text-xs font-semibold text-navy mb-1.5">
                Reason
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white mb-4 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={busy}
                  className="px-4 py-2 font-body text-sm font-semibold text-white bg-red-600 rounded-lg hover:brightness-95 disabled:opacity-50"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={() => setPanel(null)}
                  className="px-4 py-2 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-2 flex-wrap">
          {booking.status === "pending" && (
            <button
              onClick={handleConfirm}
              disabled={busy}
              className="px-4 py-2 font-body text-sm font-semibold text-white bg-green-600 rounded-lg hover:brightness-95 disabled:opacity-50"
            >
              Confirm &amp; Send Payment Link
            </button>
          )}
          {awaitingPayment && (
            <button
              onClick={handleResend}
              disabled={busy}
              className="px-4 py-2 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white disabled:opacity-50"
            >
              Resend Payment Link
            </button>
          )}
          {booking.payment_status === "unpaid" && !cancelled && (
            <button
              onClick={() => setPanel("markPaid")}
              className="px-4 py-2 font-body text-sm font-semibold text-white bg-green-500 rounded-lg hover:brightness-95"
            >
              Mark Paid
            </button>
          )}
          {!cancelled && !paid && (
            <button
              onClick={() => setPanel("cancel")}
              className="ml-auto px-4 py-2 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
