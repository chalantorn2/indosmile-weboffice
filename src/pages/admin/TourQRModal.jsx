import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

// Public site base. QR encodes the same URL the website menu links to
// (/booking-detail/:id), so scanning lands on the exact tour detail page.
const SITE_BASE = "https://indosmilesouthservices.com";

/**
 * Shows a scannable QR for an item's public detail page, plus actions to
 * download it as PNG or copy the link. Used by both Island Tours
 * (/booking-detail/:id) and Shows & Adventures (/shows-adventures/:id) — pass
 * the matching detailPath.
 */
export default function TourQRModal({ tour, detailPath = "booking-detail", onClose }) {
  const canvasWrapRef = useRef(null);
  const tourUrl = `${SITE_BASE}/${detailPath}/${tour.id}`;

  const downloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const safeName = (tour.name || "tour")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const link = document.createElement("a");
    link.download = `qr-${safeName || tour.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(tourUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">Tour QR Code</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5 line-clamp-1">{tour.name}</p>
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
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <div
            ref={canvasWrapRef}
            className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            <QRCodeCanvas
              value={tourUrl}
              size={240}
              level="M"
              marginSize={2}
              fgColor="#0a1e3f"
            />
          </div>

          <p className="font-body text-xs text-gray-400 text-center break-all">{tourUrl}</p>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={downloadPng}
              className="bg-yellow text-navy font-body font-semibold px-4 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all"
            >
              Download PNG
            </button>
            <button
              onClick={copyLink}
              className="px-4 py-2.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-xl hover:bg-navy hover:text-white transition-all"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
