import { useSearchParams, Link } from "react-router-dom";

/**
 * Landing page Stripe returns to after a manual payment link (see
 * backend/api/stripe_manual_link.php). It only reflects what the redirect says —
 * the webhook is what actually records money received.
 */
export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("status") === "success";

  return (
    <div className="bg-light-gray min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 max-w-md w-full text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            success ? "bg-green-50" : "bg-amber-50"
          }`}
        >
          {success ? (
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          )}
        </div>

        <h1 className="font-heading text-4xl text-navy mb-2">
          {success ? "Payment Complete" : "Payment Cancelled"}
        </h1>
        <p className="font-body text-base text-gray-700 mb-6">
          {success
            ? "Thank you — your payment went through. A receipt has been sent to your email."
            : "Your payment was cancelled. You can open the same link again whenever you are ready."}
        </p>

        <Link
          to="/"
          className="inline-block bg-yellow text-navy font-body text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
