import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventSeatIcon from "@mui/icons-material/EventSeat";

const API_BASE = "/backend/api";

export default function ShowDetail() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchShow();
  }, [id]);

  const fetchShow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/shows.php?id=${id}`);
      const data = await response.json();

      if (data.success) {
        const s = data.data;
        setShow({
          id: s.id,
          image: s.main_image || "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600",
          images: s.gallery_images || [],
          name: s.name,
          destination: s.destination,
          venue: s.venue || "",
          description: s.description,
          duration: s.duration_days,
          durationLabel:
            s.duration_days == 1
              ? "One Day Experience"
              : s.duration_label || `${s.duration_days} Days / ${s.duration_nights} Nights`,
          rating: parseFloat(s.rating) || 0,
          reviews: s.review_count || 0,
          highlights: s.highlights || [],
          included: s.included || [],
          notIncluded: s.not_included || [],
          showTimes: s.show_times || [],
          seatZones: s.seat_zones || [],
          operationalDays: s.operational_days || [],
          minParticipants: s.min_participants || 1,
          maxParticipants: s.max_participants || null,
          pickupTime: s.pickup_time || "",
          pickupLocation: s.pickup_location || "",
          dropoffTime: s.dropoff_time || "",
          dropoffLocation: s.dropoff_location || "",
          mealInfo: s.meal_info || "",
          transferInfo: s.transfer_info || "",
          whatToBring: s.what_to_bring || [],
          importantNotes: s.important_notes || "",
          termsConditions: s.terms_conditions || "",
          cancellationPolicy: s.cancellation_policy || "",
        });
      } else {
        setError("Show not found");
      }
    } catch (err) {
      console.error("Error fetching show:", err);
      setError("Unable to load show details");
    } finally {
      setLoading(false);
    }
  };

  const showImages = show
    ? show.images && show.images.length > 0
      ? [show.image, ...show.images]
      : [show.image]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
          <p className="mt-4 font-body text-gray-600">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return <Navigate to="/shows-adventures" replace />;
  }

  return (
    <div className="min-h-screen bg-light-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-body text-sm text-gray-500">
          <Link to="/" className="hover:text-navy transition-colors">
            Home
          </Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/shows-adventures" className="hover:text-navy transition-colors">
            Shows & Adventures
          </Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-navy font-medium truncate max-w-[200px]">{show.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <div
                className={`relative bg-gray-100 overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${imageExpanded ? "h-[28rem]" : "h-96"}`}
                onMouseEnter={() => setImageExpanded(true)}
                onMouseLeave={() => setImageExpanded(false)}
              >
                <img
                  src={showImages[selectedImage]}
                  alt={show.name}
                  className={`w-full h-full transition-all duration-300 ${imageExpanded ? "object-contain" : "object-cover"}`}
                />
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-body text-lg font-bold text-navy">{show.rating}</span>
                  <span className="font-body text-sm text-gray-500">({show.reviews} reviews)</span>
                </div>
              </div>

              {showImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {showImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index ? "border-yellow" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt={`${show.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Show Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-block bg-yellow bg-opacity-20 text-navy px-4 py-2 rounded-full text-sm font-body font-semibold">
                  {show.destination}
                </span>
                {show.venue && (
                  <span className="inline-flex items-center gap-1 bg-navy bg-opacity-10 text-navy px-4 py-2 rounded-full text-sm font-body font-semibold">
                    <LocationOnIcon sx={{ fontSize: 16 }} />
                    {show.venue}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-4xl text-navy mb-4">{show.name}</h1>
              <p className="font-body text-gray-600 text-lg leading-relaxed mb-6">{show.description}</p>

              {show.highlights && show.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {show.highlights.map((highlight, index) => (
                    <span key={index} className="text-sm font-body bg-yellow bg-opacity-15 text-navy px-3 py-1 rounded-full">
                      {highlight}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-200">
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <AccessTimeIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Duration</p>
                  <p className="font-body font-semibold text-navy">{show.durationLabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <GroupIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Group Size</p>
                  <p className="font-body font-semibold text-navy">
                    {show.minParticipants && show.maxParticipants
                      ? `${show.minParticipants}-${show.maxParticipants} People`
                      : show.maxParticipants
                        ? `Up to ${show.maxParticipants} People`
                        : `Min ${show.minParticipants || 1} People`}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <LocationOnIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Venue</p>
                  <p className="font-body font-semibold text-navy line-clamp-1">{show.venue || show.destination}</p>
                </div>
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <EventSeatIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Seat Zones</p>
                  <p className="font-body font-semibold text-navy">
                    {show.seatZones.length > 0 ? `${show.seatZones.length} Options` : "Standard"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`flex-1 px-6 py-4 font-body font-semibold transition-colors duration-200 ${
                    activeTab === "schedule" ? "bg-yellow text-navy border-b-2 border-navy" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Schedule & Seats
                </button>
                <button
                  onClick={() => setActiveTab("included")}
                  className={`flex-1 px-6 py-4 font-body font-semibold transition-colors duration-200 ${
                    activeTab === "included" ? "bg-yellow text-navy border-b-2 border-navy" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Included
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 px-6 py-4 font-body font-semibold transition-colors duration-200 ${
                    activeTab === "info" ? "bg-yellow text-navy border-b-2 border-navy" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Important Info
                </button>
              </div>

              <div className="p-6">
                {activeTab === "schedule" && (
                  <div className="space-y-8">
                    {/* Operational Days */}
                    <div>
                      <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Operational Days
                      </h3>
                      {show.operationalDays && show.operationalDays.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => {
                            const isActive = show.operationalDays.includes(day);
                            const labels = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
                            return (
                              <div
                                key={day}
                                className={`w-14 h-14 flex items-center justify-center rounded-lg font-body font-bold border-2 ${
                                  isActive
                                    ? "bg-navy text-white border-navy"
                                    : "bg-gray-50 text-gray-300 border-gray-100"
                                }`}
                              >
                                {labels[day]}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="font-body text-gray-500">Operates daily — please confirm at time of booking.</p>
                      )}
                    </div>

                    {/* Show Times */}
                    <div>
                      <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                        <AccessTimeIcon sx={{ fontSize: 24 }} />
                        Show Times
                      </h3>
                      {show.showTimes && show.showTimes.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {show.showTimes.map((time, index) => (
                            <div
                              key={index}
                              className="bg-navy text-white px-5 py-3 rounded-lg font-body font-semibold text-lg shadow-sm"
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-body text-gray-500">Showtimes will be confirmed upon booking.</p>
                      )}
                    </div>

                    {/* Venue */}
                    {show.venue && (
                      <div>
                        <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                          <LocationOnIcon sx={{ fontSize: 24 }} />
                          Venue
                        </h3>
                        <p className="font-body text-gray-600 text-lg">{show.venue}</p>
                        <p className="font-body text-gray-500 text-sm mt-1">{show.destination}</p>
                      </div>
                    )}

                    {/* Seat Zones (no pricing displayed) */}
                    {show.seatZones && show.seatZones.length > 0 && (
                      <div>
                        <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                          <EventSeatIcon sx={{ fontSize: 24 }} />
                          Seat Zones
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {show.seatZones.map((zone, index) => (
                            <div
                              key={index}
                              className="border-2 border-gray-100 rounded-lg p-4 hover:border-yellow transition-colors duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-heading text-lg text-navy">{zone.name}</h4>
                                {zone.capacity && (
                                  <span className="text-xs font-body bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {zone.capacity} seats
                                  </span>
                                )}
                              </div>
                              <p className="font-body text-sm text-gray-500">Contact us for availability and pricing</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pickup / Dropoff */}
                    {(show.pickupTime || show.pickupLocation || show.dropoffTime || show.dropoffLocation) && (
                      <div>
                        <h3 className="font-heading text-2xl text-navy mb-4">Pickup & Dropoff</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(show.pickupTime || show.pickupLocation) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="font-body text-sm text-gray-500 mb-1">Pickup</p>
                              {show.pickupTime && (
                                <p className="font-body font-semibold text-navy">{show.pickupTime}</p>
                              )}
                              {show.pickupLocation && (
                                <p className="font-body text-gray-600">{show.pickupLocation}</p>
                              )}
                            </div>
                          )}
                          {(show.dropoffTime || show.dropoffLocation) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="font-body text-sm text-gray-500 mb-1">Dropoff</p>
                              {show.dropoffTime && (
                                <p className="font-body font-semibold text-navy">{show.dropoffTime}</p>
                              )}
                              {show.dropoffLocation && (
                                <p className="font-body text-gray-600">{show.dropoffLocation}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "included" && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        What's Included
                      </h3>
                      <ul className="space-y-3">
                        {(show.included || []).map((item, index) => (
                          <li key={index} className="flex items-start gap-3 font-body text-gray-600">
                            <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Not Included
                      </h3>
                      <ul className="space-y-3">
                        {(show.notIncluded || []).map((item, index) => (
                          <li key={index} className="flex items-start gap-3 font-body text-gray-600">
                            <svg className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "info" && (
                  <div className="space-y-6">
                    {show.whatToBring && show.whatToBring.length > 0 && (
                      <div>
                        <h4 className="font-heading text-xl text-navy mb-3">What to Bring</h4>
                        <ul className="space-y-2">
                          {show.whatToBring.map((item, idx) => (
                            <li key={idx} className="font-body text-gray-600 flex items-start gap-2">
                              <span className="text-yellow mt-1">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {show.importantNotes && (
                      <div className="bg-yellow bg-opacity-10 border-l-4 border-yellow p-4 rounded">
                        <h4 className="font-semibold text-navy mb-2">Important Notes</h4>
                        <p className="font-body text-gray-600 whitespace-pre-line">{show.importantNotes}</p>
                      </div>
                    )}

                    {show.cancellationPolicy && (
                      <div>
                        <h4 className="font-semibold text-navy mb-2">Cancellation Policy</h4>
                        <p className="font-body text-gray-600 whitespace-pre-line">{show.cancellationPolicy}</p>
                      </div>
                    )}

                    {show.termsConditions && (
                      <div>
                        <h4 className="font-semibold text-navy mb-2">Terms & Conditions</h4>
                        <p className="font-body text-gray-600 whitespace-pre-line">{show.termsConditions}</p>
                      </div>
                    )}

                    {!show.cancellationPolicy && !show.termsConditions && !show.importantNotes && (!show.whatToBring || show.whatToBring.length === 0) && (
                      <p className="font-body text-gray-500">No additional information available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — Contact CTA (no pricing) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="font-heading text-2xl text-navy mb-4">Interested in this experience?</h3>
              <p className="font-body text-gray-600 mb-6 leading-relaxed">
                Get in touch with our team for availability, pricing, and to reserve your seats.
              </p>

              {show.showTimes && show.showTimes.length > 0 && (
                <div className="mb-6">
                  <p className="font-body text-sm font-semibold text-navy mb-2">Available Showtimes</p>
                  <div className="flex flex-wrap gap-2">
                    {show.showTimes.map((time, i) => (
                      <span key={i} className="bg-gray-100 text-navy px-3 py-1.5 rounded-md text-sm font-body font-medium">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to="/about#contact"
                className="block w-full text-center bg-navy text-white px-6 py-4 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200 mb-3"
              >
                Contact Us to Book
              </Link>
              <Link
                to="/shows-adventures"
                className="block w-full text-center bg-gray-100 text-navy px-6 py-3 rounded-lg font-body font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Browse Other Experiences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
