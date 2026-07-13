import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import { NET_RATE_NOTE, formatNetRate } from "./netRate";

const API_BASE = "/backend/api";

const TABS = [
  { id: "itinerary", label: "Itinerary" },
  { id: "included", label: "Included" },
  { id: "info", label: "Important Info" },
];

/**
 * The customer tour page, rebuilt for the agent portal: same content, but the price
 * shown is the agent's contract net rate and there is no booking form — agents book
 * through our team, not through the site.
 *
 * agent_tours.php refuses tours the agent has no rate on, so reaching this page by
 * URL alone gets the same 404 as a tour that doesn't exist.
 */
export default function AgentTourDetail() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("itinerary");

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadTour = async () => {
      setLoading(true);
      setSelectedImage(0);

      try {
        const response = await fetch(`${API_BASE}/agent_tours.php?id=${id}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.success) {
          setTour(data.data);
          setError(null);
        } else {
          setError(data.message || "Tour not found");
        }
      } catch (err) {
        setError("Unable to load this tour");
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id]);

  if (loading) {
    return <p className="font-body text-gray-500">Loading tour details...</p>;
  }

  if (error || !tour) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
        <h2 className="font-heading text-2xl text-navy mb-3">Tour not available</h2>
        <p className="font-body text-gray-600 mb-6">
          {error || "This tour is not part of your contract rates."}
        </p>
        <Link
          to="/agent/tours"
          className="inline-block bg-navy text-white px-6 py-3 rounded-xl font-body font-semibold hover:bg-yellow hover:text-navy transition-all duration-300"
        >
          Back to Tours
        </Link>
      </div>
    );
  }

  const images = tour.gallery_images?.length
    ? [tour.main_image, ...tour.gallery_images].filter(Boolean)
    : [tour.main_image].filter(Boolean);

  const durationLabel =
    tour.duration_label ||
    (Number(tour.duration_days) === 1
      ? "One Day Trip"
      : `${tour.duration_days} Days / ${tour.duration_nights} Nights`);

  const groupSize =
    tour.min_participants && tour.max_participants
      ? `${tour.min_participants}-${tour.max_participants} People`
      : tour.max_participants
        ? `Up to ${tour.max_participants} People`
        : `Min ${tour.min_participants || 1} People`;

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 font-body text-sm text-gray-500">
        <Link to="/agent/tours" className="hover:text-navy transition-colors">
          Tours &amp; Rates
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-navy font-medium truncate max-w-[240px]">{tour.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 min-w-0">
          {images.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="h-80 sm:h-96 bg-gray-100">
                <img
                  src={images[selectedImage]}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index
                          ? "border-yellow"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt={`${tour.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            <span className="inline-block bg-yellow/20 text-navy px-4 py-2 rounded-full text-sm font-body font-semibold mb-4">
              {tour.destination}
            </span>

            <h1 className="font-heading text-3xl sm:text-4xl text-navy mb-4">{tour.name}</h1>

            <p className="font-body text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {tour.description}
            </p>

            {tour.highlights?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tour.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="text-sm font-body bg-yellow/15 text-navy px-3 py-1 rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-navy mb-2 flex justify-center">
                  <AccessTimeIcon sx={{ fontSize: 30 }} />
                </div>
                <p className="font-body text-sm text-gray-500">Duration</p>
                <p className="font-body font-semibold text-navy">{durationLabel}</p>
              </div>
              <div className="text-center">
                <div className="text-navy mb-2 flex justify-center">
                  <GroupIcon sx={{ fontSize: 30 }} />
                </div>
                <p className="font-body text-sm text-gray-500">Group Size</p>
                <p className="font-body font-semibold text-navy">{groupSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 font-body font-semibold text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-yellow text-navy border-b-2 border-navy"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === "itinerary" && (
                <div className="space-y-6">
                  {tour.itinerary?.length > 0 ? (
                    tour.itinerary.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-11 h-11 shrink-0 bg-yellow rounded-full flex items-center justify-center">
                          <span className="font-body font-bold text-navy">{item.day}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading text-xl text-navy mb-1">
                            Day {item.day}: {item.title}
                          </h4>
                          {item.time && (
                            <p className="font-body text-sm text-yellow font-semibold mb-1">{item.time}</p>
                          )}
                          <p className="font-body text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="font-body text-gray-500">Itinerary details will be available soon.</p>
                  )}
                </div>
              )}

              {activeTab === "included" && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-heading text-2xl text-navy mb-4">What's Included</h3>
                    <ul className="space-y-2 font-body text-gray-600">
                      {(tour.included || []).map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-green-500 font-bold">✓</span>
                          {item}
                        </li>
                      ))}
                      {!tour.included?.length && <li className="text-gray-400">—</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl text-navy mb-4">Not Included</h3>
                    <ul className="space-y-2 font-body text-gray-600">
                      {(tour.not_included || []).map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-red-500 font-bold">✕</span>
                          {item}
                        </li>
                      ))}
                      {!tour.not_included?.length && <li className="text-gray-400">—</li>}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "info" && (
                <div className="space-y-5 font-body text-gray-600">
                  {tour.cancellation_policy && (
                    <div className="bg-yellow/10 border-l-4 border-yellow p-4 rounded">
                      <h4 className="font-semibold text-navy mb-2">Cancellation Policy</h4>
                      <p className="whitespace-pre-line">{tour.cancellation_policy}</p>
                    </div>
                  )}
                  {tour.terms_conditions && (
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Terms &amp; Conditions</h4>
                      <p className="whitespace-pre-line">{tour.terms_conditions}</p>
                    </div>
                  )}
                  {tour.important_notes && (
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Important Notes</h4>
                      <p className="whitespace-pre-line">{tour.important_notes}</p>
                    </div>
                  )}
                  {!tour.cancellation_policy && !tour.terms_conditions && !tour.important_notes && (
                    <p className="text-gray-500">No additional information available for this tour.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Net rate card — the booking sidebar's slot, without a booking form */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-8">
            <p className="font-body text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
              Your Contract Rate
            </p>

            <div className="mb-4">
              <p className="font-body text-sm text-gray-500 mb-1">Adult (net)</p>
              <p className="font-heading text-4xl text-navy">
                {formatNetRate(tour.adult_price, tour.currency)}
              </p>
            </div>

            <div className="pb-5 mb-5 border-b border-gray-100">
              <p className="font-body text-sm text-gray-500 mb-1">Child (net)</p>
              <p className="font-heading text-2xl text-navy">
                {formatNetRate(tour.child_price, tour.currency)}
              </p>
            </div>

            <p className="font-body text-xs text-gray-500 leading-relaxed mb-5">{NET_RATE_NOTE}</p>

            <div className="rounded-xl bg-light-gray px-4 py-4">
              <p className="font-body text-sm text-navy font-semibold mb-1">To book</p>
              <p className="font-body text-sm text-gray-600">
                Send your booking request to our reservations team — online booking is not
                available in the portal yet.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
