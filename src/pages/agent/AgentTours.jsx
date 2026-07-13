import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NET_RATE_NOTE, formatNetRate } from "./netRate";

const API_BASE = "/backend/api";

/**
 * The agent's tour list. The API only returns tours they hold a contract rate on,
 * so there is no "no rate" state to render here — an empty list means the admin
 * has not assigned them any tours yet.
 */
export default function AgentTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadTours = async () => {
      try {
        const response = await fetch(`${API_BASE}/agent_tours.php`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.success) {
          setTours(data.data.items || []);
        } else {
          setError(data.message || "Unable to load your tours");
        }
      } catch (err) {
        setError("Unable to load your tours");
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  // Small enough to filter in the browser — the API's ?search= exists for later.
  const visibleTours = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tours;

    return tours.filter((tour) =>
      `${tour.name} ${tour.destination || ""}`.toLowerCase().includes(term)
    );
  }, [tours, search]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-navy mb-2">Tours & Rates</h1>
        <p className="font-body text-gray-600">{NET_RATE_NOTE}</p>
      </div>

      {loading && <p className="font-body text-gray-500">Loading your tours...</p>}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-body text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && tours.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
          <h2 className="font-heading text-2xl text-navy mb-3">No tours yet</h2>
          <p className="font-body text-gray-600 max-w-md mx-auto">
            Your contract rates have not been set up yet. Contact our team and we will
            add your tours to this list.
          </p>
        </div>
      )}

      {!loading && !error && tours.length > 0 && (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours..."
            className="w-full sm:max-w-sm mb-5 px-4 py-3 rounded-xl border border-gray-200 font-body text-sm focus:outline-none focus:border-navy transition-colors"
          />

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-light-gray">
                  <tr>
                    <th className="px-6 py-4 font-body text-xs font-bold text-gray-500 uppercase tracking-wide">Tour</th>
                    <th className="px-6 py-4 font-body text-xs font-bold text-gray-500 uppercase tracking-wide">Destination</th>
                    <th className="px-6 py-4 font-body text-xs font-bold text-gray-500 uppercase tracking-wide">Duration</th>
                    <th className="px-6 py-4 font-body text-xs font-bold text-gray-500 uppercase tracking-wide">Net Adult</th>
                    <th className="px-6 py-4 font-body text-xs font-bold text-gray-500 uppercase tracking-wide">Net Child</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleTours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-light-gray/60 transition-colors">
                      <td className="px-6 py-4 font-body font-semibold text-navy">{tour.name}</td>
                      <td className="px-6 py-4 font-body text-sm text-gray-600">{tour.destination || "—"}</td>
                      <td className="px-6 py-4 font-body text-sm text-gray-600">
                        {tour.duration_label ||
                          (Number(tour.duration_days) === 1
                            ? "One Day Trip"
                            : `${tour.duration_days}D / ${tour.duration_nights}N`)}
                      </td>
                      <td className="px-6 py-4 font-body font-bold text-navy whitespace-nowrap">
                        {formatNetRate(tour.net_adult_price, tour.currency)}
                      </td>
                      <td className="px-6 py-4 font-body text-gray-600 whitespace-nowrap">
                        {formatNetRate(tour.net_child_price, tour.currency)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/agent/tours/${tour.id}`}
                          className="inline-block bg-navy text-white px-5 py-2 rounded-xl font-body text-sm font-semibold hover:bg-yellow hover:text-navy transition-all duration-300 whitespace-nowrap"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visibleTours.length === 0 && (
              <p className="px-6 py-8 text-center font-body text-gray-500">
                No tours match "{search}".
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
