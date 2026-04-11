import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import OneDayTripDetail from "./OneDayTripDetail";
import BookingSidebar from "../components/BookingSidebar";

const API_BASE = '/backend/api';

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [isOneDayTrip, setIsOneDayTrip] = useState(false);
  const [oneDayTourData, setOneDayTourData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTour();
  }, [id]);

  const fetchTour = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tours.php?id=${id}`);
      const data = await response.json();

      if (data.success) {
        const t = data.data;

        // Check if this is a One Day Trip
        if (parseInt(t.duration_days) === 1) {
          setIsOneDayTrip(true);
          setOneDayTourData({
            id: t.id,
            image: t.main_image || "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600",
            images: t.gallery_images || [],
            name: t.name,
            destination: t.destination,
            description: t.description,
            duration: t.duration_days,
            durationLabel: 'One Day Trip',
            adultPrice: parseFloat(t.adult_price),
            childPrice: t.child_price ? parseFloat(t.child_price) : null,
            rating: parseFloat(t.rating) || 0,
            reviews: t.review_count || 0,
            highlights: t.highlights || [],
            itinerary: t.itinerary || [],
            included: t.included || [],
            notIncluded: t.not_included || [],
            minParticipants: t.min_participants || 1,
            maxParticipants: t.max_participants || null,
            cancellationPolicy: t.cancellation_policy || '',
            termsConditions: t.terms_conditions || '',
            pickupTime: t.pickup_time || '',
            pickupLocation: t.pickup_location || '',
            dropoffTime: t.dropoff_time || '',
            dropoffLocation: t.dropoff_location || '',
            departureTimes: t.departure_times || [],
            mealInfo: t.meal_info || '',
            transferInfo: t.transfer_info || '',
            whatToBring: t.what_to_bring || [],
            importantNotes: t.important_notes || '',
          });
          return;
        }

        setTour({
          id: t.id,
          image: t.main_image || "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600",
          images: t.gallery_images || [],
          name: t.name,
          destination: t.destination,
          description: t.description,
          duration: t.duration_days,
          durationLabel: t.duration_days == 1 ? 'One Day Trip' : (t.duration_label || `${t.duration_days} Days / ${t.duration_nights} Nights`),
          adultPrice: parseFloat(t.adult_price),
          childPrice: t.child_price ? parseFloat(t.child_price) : null,
          rating: parseFloat(t.rating) || 0,
          reviews: t.review_count || 0,
          highlights: t.highlights || [],
          itinerary: t.itinerary || [],
          included: t.included || [],
          notIncluded: t.not_included || [],
          minParticipants: t.min_participants || 1,
          maxParticipants: t.max_participants || null,
          cancellationPolicy: t.cancellation_policy || '',
          termsConditions: t.terms_conditions || '',
        });
      } else {
        setError('Tour not found');
      }
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError('Unable to load tour details');
    } finally {
      setLoading(false);
    }
  };

  // Use gallery images from API, prepend main image, fallback to main image only
  const tourImages = tour
    ? (tour.images && tour.images.length > 0 ? [tour.image, ...tour.images] : [tour.image])
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
          <p className="mt-4 font-body text-gray-600">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    if (isOneDayTrip && oneDayTourData) {
      return <OneDayTripDetail tourData={oneDayTourData} />;
    }
    return <Navigate to="/inbound" replace />;
  }

  // If One Day Trip, render the dedicated component
  if (isOneDayTrip && oneDayTourData) {
    return <OneDayTripDetail tourData={oneDayTourData} />;
  }

  return (
    <div className="min-h-screen bg-light-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-body text-sm text-gray-500">
          <Link to="/" className="hover:text-navy transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link to="/inbound" className="hover:text-navy transition-colors">Tours</Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-navy font-medium truncate max-w-[200px]">{tour.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              {/* Main Image */}
              <div
                className={`relative bg-gray-100 overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${imageExpanded ? "h-[28rem]" : "h-96"}`}
                onMouseEnter={() => setImageExpanded(true)}
                onMouseLeave={() => setImageExpanded(false)}
              >
                <img
                  src={tourImages[selectedImage]}
                  alt={tour.name}
                  className={`w-full h-full transition-all duration-300 ${imageExpanded ? "object-contain" : "object-cover"}`}
                />
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-body text-lg font-bold text-navy">
                    {tour.rating}
                  </span>
                  <span className="font-body text-sm text-gray-500">
                    ({tour.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {tourImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {tourImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index
                          ? "border-yellow"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${tour.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tour Header Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="mb-4">
                <span className="inline-block bg-yellow bg-opacity-20 text-navy px-4 py-2 rounded-full text-sm font-body font-semibold">
                  {tour.destination}
                </span>
              </div>
              <h1 className="font-heading text-4xl text-navy mb-4">
                {tour.name}
              </h1>
              <p className="font-body text-gray-600 text-lg leading-relaxed mb-6">
                {tour.description}
              </p>

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tour.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="text-sm font-body bg-yellow bg-opacity-15 text-navy px-3 py-1 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-200">
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <AccessTimeIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Duration</p>
                  <p className="font-body font-semibold text-navy">
                    {tour.durationLabel}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <GroupIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Group Size</p>
                  <p className="font-body font-semibold text-navy">
                    {tour.minParticipants && tour.maxParticipants
                      ? `${tour.minParticipants}-${tour.maxParticipants} People`
                      : tour.maxParticipants
                        ? `Up to ${tour.maxParticipants} People`
                        : `Min ${tour.minParticipants || 1} People`}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <RestaurantIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">Meal Plan</p>
                  <p className="font-body font-semibold text-navy">Breakfast</p>
                </div>
                <div className="text-center">
                  <div className="text-navy mb-2 flex justify-center">
                    <LocalTaxiIcon sx={{ fontSize: 32 }} />
                  </div>
                  <p className="font-body text-sm text-gray-500">
                    Pickup Service
                  </p>
                  <p className="font-body font-semibold text-navy">Available</p>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("itinerary")}
                  className={`flex-1 px-6 py-4 font-body font-semibold transition-colors duration-200 ${
                    activeTab === "itinerary"
                      ? "bg-yellow text-navy border-b-2 border-navy"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Itinerary
                </button>
                <button
                  onClick={() => setActiveTab("included")}
                  className={`flex-1 px-6 py-4 font-body font-semibold transition-colors duration-200 ${
                    activeTab === "included"
                      ? "bg-yellow text-navy border-b-2 border-navy"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Included
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 px-6 py-4 font-body font-semibold transition-colors duration-200 ${
                    activeTab === "info"
                      ? "bg-yellow text-navy border-b-2 border-navy"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Important Info
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Itinerary Tab */}
                {activeTab === "itinerary" && (
                  <div className="space-y-6">
                    <h3 className="font-heading text-2xl text-navy mb-4">
                      Day by Day Itinerary
                    </h3>

                    {tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center">
                            <span className="font-body font-bold text-navy">
                              {item.day}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading text-xl text-navy mb-2">
                            Day {item.day}: {item.title}
                          </h4>
                          {item.time && (
                            <p className="font-body text-sm text-yellow font-semibold mb-1">
                              {item.time}
                            </p>
                          )}
                          <p className="font-body text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                          {item.activities && item.activities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.activities.map((activity, i) => (
                                <span key={i} className="text-xs font-body bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="font-body text-gray-500">Itinerary details will be available soon.</p>
                    )}
                  </div>
                )}

                {/* Included Tab */}
                {activeTab === "included" && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-heading text-2xl text-navy mb-4 flex items-center gap-2">
                        <svg
                          className="w-6 h-6 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        What's Included
                      </h3>
                      <ul className="space-y-3">
                        {(tour.included || []).map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 font-body text-gray-600"
                          >
                            <svg
                              className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
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
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Not Included
                      </h3>
                      <ul className="space-y-3">
                        {(tour.notIncluded || []).map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 font-body text-gray-600"
                          >
                            <svg
                              className="w-5 h-5 text-red-500 mt-1 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
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

                {/* Important Info Tab */}
                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-heading text-2xl text-navy mb-4">
                        Important Information
                      </h3>
                      <div className="space-y-4 font-body text-gray-600">
                        {tour.cancellationPolicy && (
                          <div className="bg-yellow bg-opacity-10 border-l-4 border-yellow p-4 rounded">
                            <h4 className="font-semibold text-navy mb-2">
                              Cancellation Policy
                            </h4>
                            <p className="whitespace-pre-line">{tour.cancellationPolicy}</p>
                          </div>
                        )}
                        {tour.termsConditions && (
                          <div>
                            <h4 className="font-semibold text-navy mb-2">
                              Terms & Conditions
                            </h4>
                            <p className="whitespace-pre-line">{tour.termsConditions}</p>
                          </div>
                        )}
                        {!tour.cancellationPolicy && !tour.termsConditions && (
                          <p className="text-gray-500">No additional information available for this tour.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar - Right Side */}
          <BookingSidebar tour={tour} />
        </div>
      </div>
    </div>
  );
}
