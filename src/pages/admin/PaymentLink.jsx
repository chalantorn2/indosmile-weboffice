import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { apiMutate } from "./lib/adminApi";
import { Field, inputClass } from "./lib/formUi";

const CURRENCIES = [
  { code: "thb", label: "THB (฿)" },
  { code: "usd", label: "USD ($)" },
  { code: "eur", label: "EUR (€)" },
  { code: "gbp", label: "GBP (£)" },
  { code: "sgd", label: "SGD (S$)" },
  { code: "aud", label: "AUD (A$)" },
  { code: "jpy", label: "JPY (¥)" },
];

/**
 * Manual payment link: staff type any amount, we mint a one-off Stripe Checkout
 * session and show it as a copyable link + QR to hand to the customer.
 * For anything tied to a real booking use the booking's own payment link instead —
 * that one is amount-checked against the DB and updates payment_status on the webhook.
 */
export default function PaymentLink() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("thb");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const canvasWrapRef = useRef(null);

  const createLink = useMutation({
    mutationFn: (body) => apiMutate("stripe_manual_link.php", "POST", body),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Payment link created");
    },
    onError: (err) => toast.error(err.message || "Could not create link"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("กรอกจำนวนเงินมากกว่า 0");
      return;
    }
    setResult(null);
    createLink.mutate({
      amount: numericAmount,
      currency,
      description: description.trim() || undefined,
      customer_email: email.trim() || undefined,
    });
  };

  const reset = () => {
    setResult(null);
    setAmount("");
    setDescription("");
    setEmail("");
  };

  const copyLink = async () => {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const downloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `payment-qr-${result.amount}-${result.currency}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-4xl text-navy">Payment Link</h1>
        <p className="font-body text-sm text-gray-500 mt-1">
          กรอกราคาเอง แล้วสร้างลิงก์ + QR Code ส่งให้ลูกค้าจ่าย
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Amount" required>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500.00"
                required
                className={inputClass}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`${inputClass} w-40 bg-white`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Description" hint="— ลูกค้าเห็นข้อความนี้บนหน้าจ่ายเงิน">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Phi Phi Island Tour — 2 pax"
              className={inputClass}
            />
          </Field>

          <Field label="Customer Email" hint="— ไม่บังคับ ใส่แล้ว Stripe ส่งใบเสร็จไปที่นี่">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className={inputClass}
            />
          </Field>

          <button
            type="submit"
            disabled={createLink.isPending}
            className="bg-yellow text-navy font-body text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {createLink.isPending ? "กำลังสร้าง..." : "สร้างลิงก์ + QR Code"}
          </button>
        </form>
      </div>

      {/* Result card — its own area, so its primary (Copy) doesn't compete with the form's */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-body text-3xl font-semibold text-navy">
              {result.currency} {Number(result.amount).toLocaleString()}
            </p>
            {result.mode === "test" && (
              <span className="inline-block mt-2 rounded-full bg-amber-50 px-3 py-1 font-body text-sm font-semibold text-amber-500">
                Test mode — เงินไม่เข้าจริง
              </span>
            )}
          </div>

          <div ref={canvasWrapRef} className="p-4 bg-white rounded-xl border border-gray-200">
            <QRCodeCanvas value={result.url} size={240} level="M" marginSize={2} fgColor="#010048" />
          </div>

          <label className="w-full">
            <span className="block font-body text-sm font-semibold text-navy mb-1.5">Payment link</span>
            <input
              readOnly
              value={result.url}
              onFocus={(e) => e.target.select()}
              className={`${inputClass} text-sm bg-light-gray`}
            />
          </label>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={copyLink}
              className="bg-yellow text-navy font-body text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all duration-200"
            >
              Copy Link
            </button>
            <button
              onClick={downloadPng}
              className="border-2 border-navy text-navy font-body text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-navy hover:text-white focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all duration-200"
            >
              Download QR
            </button>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-semibold text-navy hover:underline"
            >
              เปิดหน้าจ่ายเงิน →
            </a>
            <button
              onClick={reset}
              className="font-body text-sm text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              สร้างลิงก์ใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
