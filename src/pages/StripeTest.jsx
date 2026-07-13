import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = "/backend/api";

const CURRENCIES = [
  { code: "thb", label: "THB (฿)" },
  { code: "usd", label: "USD ($)" },
  { code: "eur", label: "EUR (€)" },
  { code: "gbp", label: "GBP (£)" },
  { code: "sgd", label: "SGD (S$)" },
  { code: "aud", label: "AUD (A$)" },
  { code: "jpy", label: "JPY (¥)" },
];

export default function StripeTest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("thb");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'cancel' | null
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const status = searchParams.get("status");
    const sid = searchParams.get("session_id");
    if (status === "success" || status === "cancel") {
      setPaymentResult(status);
      if (sid) setSessionId(sid);
    }
  }, [searchParams]);

  const clearResult = () => {
    setPaymentResult(null);
    setSessionId("");
    setLink("");
    navigate("/stripe-test", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLink("");
    setCopied(false);

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("กรุณากรอกจำนวนเงินที่มากกว่า 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stripe_payment_link.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          currency,
          description: description.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "สร้างลิงก์ไม่สำเร็จ");
      }
      setLink(json.data.url);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("คัดลอกไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-16 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Stripe Payment Test
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          กรอกจำนวนเงิน → ระบบจะสร้างลิงก์ Stripe Checkout (โหมดทดสอบ)
        </p>

        {paymentResult === "success" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800">
                  ชำระเงินสำเร็จ
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  การชำระเงินของคุณเสร็จสมบูรณ์แล้ว
                </p>
                {sessionId && (
                  <p className="text-xs text-green-600 mt-2 break-all">
                    Session ID: <code>{sessionId}</code>
                  </p>
                )}
                <button
                  onClick={clearResult}
                  type="button"
                  className="mt-3 text-sm text-green-700 hover:text-green-900 underline"
                >
                  สร้างลิงก์ใหม่
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentResult === "cancel" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                ✕
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">
                  ยกเลิกการชำระเงิน
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  คุณยกเลิกการชำระเงิน หรือการชำระเงินไม่สำเร็จ
                </p>
                <button
                  onClick={clearResult}
                  type="button"
                  className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนเงิน
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Test payment"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? "กำลังสร้างลิงก์..." : "สร้างลิงก์ชำระเงิน"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {link && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              ลิงก์พร้อมใช้งาน
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                className="flex-1 text-xs bg-white border border-green-300 rounded-md px-2 py-2 text-gray-800"
              />
              <button
                onClick={handleCopy}
                type="button"
                className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                {copied ? "คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
            >
              เปิดหน้าจ่ายเงิน →
            </a>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          ใช้บัตรทดสอบ Stripe เช่น <code>4242 4242 4242 4242</code> วันหมดอายุใน
          อนาคต / CVC อะไรก็ได้
        </p>
      </div>
    </div>
  );
}
