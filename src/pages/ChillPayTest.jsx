import { useState } from "react";

const API_BASE = "/backend/api";

const CURRENCIES = [
  { code: "THB", label: "THB (฿)" },
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "SGD", label: "SGD (S$)" },
  { code: "AUD", label: "AUD (A$)" },
  { code: "JPY", label: "JPY (¥)" },
];

export default function ChillPayTest() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [expiredDays, setExpiredDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("กรุณากรอกจำนวนเงินที่มากกว่า 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chillpay_payment_link.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          currency,
          productName: productName.trim() || undefined,
          productDescription: productDescription.trim() || undefined,
          expiredDays: Number(expiredDays) || 1,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "สร้างลิงก์ไม่สำเร็จ");
      }
      setResult(json.data);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.paymentUrl) return;
    try {
      await navigator.clipboard.writeText(result.paymentUrl);
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
          ChillPay PayLink Test
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          กรอกข้อมูล → ระบบสร้างลิงก์ ChillPay PayLink + QR Code
        </p>

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
              ชื่อสินค้า/บริการ
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Test Payment"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย
            </label>
            <input
              type="text"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="รายละเอียดสินค้า/บริการ"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อายุลิงก์ (วัน)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={expiredDays}
              onChange={(e) => setExpiredDays(e.target.value)}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? "กำลังสร้างลิงก์..." : "สร้างลิงก์ ChillPay"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
            <div>
              <p className="text-sm font-medium text-green-800 mb-2">
                ลิงก์พร้อมใช้งาน
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={result.paymentUrl || ""}
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
                href={result.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-blue-600 hover:underline"
              >
                เปิดหน้าจ่ายเงิน →
              </a>
            </div>

            {result.qrImage && (
              <div>
                <p className="text-sm font-medium text-green-800 mb-2">
                  QR Code
                </p>
                <img
                  src={result.qrImage}
                  alt="ChillPay QR Code"
                  className="w-48 h-48 border border-green-300 rounded-md bg-white"
                />
              </div>
            )}

            <div className="text-xs text-gray-600 space-y-1">
              <div>PayLink ID: <code>{result.payLinkId}</code></div>
              <div>หมดอายุ: <code>{result.expiredDate}</code></div>
              <div>สถานะ: <code>{result.linkStatus}</code></div>
            </div>

            <button
              onClick={reset}
              type="button"
              className="text-sm text-green-700 hover:text-green-900 underline"
            >
              สร้างลิงก์ใหม่
            </button>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          ChillPay PayLink รองรับ PromptPay / บัตรเครดิต / Mobile Banking / TrueMoney
        </p>
      </div>
    </div>
  );
}
