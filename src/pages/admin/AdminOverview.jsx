import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch, formatCurrency, formatDate } from "./lib/adminApi";
import { StatusBadges } from "./bookingStatus";

function StatTile({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
      <p className="font-body text-sm text-gray-500">{label}</p>
      <p className={`font-body text-3xl font-semibold mt-1 ${accent || "text-navy"}`}>{value}</p>
    </div>
  );
}

/** Dashboard landing: booking stats + the five most recent bookings. */
export default function AdminOverview() {
  const { admin } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await apiFetch("bookings.php?stats=1");
        if (s.success) setStats(s.data);
        const r = await apiFetch("bookings.php?limit=5");
        if (r.success) setRecent(r.data.items || []);
      } catch {
        /* non-critical */
      }
    })();
  }, []);

  return (
    <div className="max-w-7xl">
      <h1 className="font-heading text-4xl text-navy">Overview</h1>
      <p className="font-body text-base text-gray-700 mt-1">
        Welcome back, {admin.username || admin.email}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatTile label="Total Bookings" value={stats?.total_bookings ?? "—"} />
        <StatTile label="Pending" value={stats?.pending_bookings ?? "—"} accent="text-amber-500" />
        <StatTile label="Confirmed" value={stats?.confirmed_bookings ?? "—"} accent="text-blue-600" />
        <StatTile
          label="Total Revenue"
          value={stats ? formatCurrency(stats.total_revenue || 0) : "—"}
          accent="text-green-600"
        />
      </div>

      <h2 className="font-body text-xl font-semibold text-navy mt-8 mb-3">Recent Bookings</h2>
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {recent.length === 0 ? (
          <p className="p-6 font-body text-gray-500">No recent bookings.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy text-white text-left">
                  <th className="font-body text-sm font-semibold px-4 py-3">Reference</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Customer</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Tour</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Date</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Status</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-sm text-navy">{b.booking_reference}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-700">{b.customer_name}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-700">{b.tour_name || "-"}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-700">{formatDate(b.travel_date)}</td>
                    <td className="px-4 py-3"><StatusBadges booking={b} /></td>
                    <td className="px-4 py-3 font-body text-sm text-gray-700 whitespace-nowrap">
                      {formatCurrency(b.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
