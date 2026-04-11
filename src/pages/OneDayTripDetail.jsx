import { useState, useEffect } from "react";
import BookingSidebar from "../components/BookingSidebar";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BackpackIcon from "@mui/icons-material/Backpack";
import InfoIcon from "@mui/icons-material/Info";

const API_BASE = '/backend/api';

export default function OneDayTripDetail({ tourData }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(tourData || null);
  const [loading, setLoading] = useState(!tourData);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);
    if (!tourData) fetchTour();
  }, [id]);



  const fetchTour = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tours.php?id=${id}`);
      const data = await response.json();

      if (data.success) {
        const t = data.data;
        setTour({
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

  const tourImages = tour
    ? (tour.images && tour.images.length > 0 ? [tour.image, ...tour.images] : [tour.image])
    : [];

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (selectedImage < tourImages.length - 1) setSelectedImage(prev => prev + 1);
      } else if (e.key === 'ArrowLeft') {
        if (selectedImage > 0) setSelectedImage(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, selectedImage, tourImages.length]);


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
    return <Navigate to="/inbound" replace />;
  }

  return (
    <div className="min-h-screen bg-light-gray">

      {/* ======================================= */}
      {/* LIGHTBOX OVERLAY                        */}
      {/* ======================================= */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all text-2xl">✕</button>
          {selectedImage > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage - 1); }} className="absolute left-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {selectedImage < tourImages.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage + 1); }} className="absolute right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <img src={tourImages[selectedImage]} alt={tour.name} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full font-body text-sm">
            {selectedImage + 1} / {tourImages.length}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MAIN 2-COLUMN LAYOUT                    */}
      {/* ======================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 font-body text-sm text-gray-500">
          <Link to="/" className="hover:text-navy transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link to="/inbound" className="hover:text-navy transition-colors">Tours</Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-navy font-medium truncate max-w-[200px]">{tour.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ======================================= */}
          {/* LEFT COLUMN: Gallery + Content           */}
          {/* ======================================= */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tour Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-yellow text-navy px-4 py-1.5 rounded-full text-sm font-body font-bold">
                  One Day Trip
                </span>
                <span className="bg-navy/10 text-navy px-3 py-1 rounded-full text-sm font-body font-semibold">
                  {tour.destination}
                </span>
                {tour.pickupTime && tour.dropoffTime && (
                  <span className="flex items-center gap-1 text-gray-500 font-body text-sm">
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    {tour.pickupTime} — {tour.dropoffTime}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl text-navy mb-2">{tour.name}</h1>
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tour.highlights.map((h, i) => (
                    <span key={i} className="text-sm font-body bg-yellow/15 text-navy px-3 py-1.5 rounded-full font-medium">{h}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Compact Bento Grid Gallery */}
            <div className={`rounded-2xl overflow-hidden shadow-lg ${tourImages.length > 1 ? 'grid grid-cols-4 grid-rows-2 gap-1 h-[260px] md:h-[320px]' : 'h-[260px] md:h-[320px]'}`}>
              <div
                className={`relative cursor-pointer group overflow-hidden ${tourImages.length > 1 ? 'col-span-2 row-span-2' : 'col-span-4 row-span-2'}`}
                onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}
              >
                <img src={tourImages[0]} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <svg className="w-3.5 h-3.5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-body text-xs font-bold text-navy">{tour.rating}</span>
                  <span className="font-body text-[10px] text-gray-500">({tour.reviews})</span>
                </div>
              </div>
              {tourImages.length > 1 && tourImages.slice(1, 5).map((img, index) => (
                <div key={index} className="relative cursor-pointer group overflow-hidden" onClick={() => { setSelectedImage(index + 1); setLightboxOpen(true); }}>
                  <img src={img} alt={`${tour.name} ${index + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
                  {index === 3 && tourImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <p className="font-body text-xl font-bold">+{tourImages.length - 5}</p>
                        <p className="font-body text-[10px]">View All</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <p className="font-body text-gray-600 leading-relaxed">{tour.description}</p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                <div className="text-navy mb-1.5 flex justify-center"><LocationOnIcon sx={{ fontSize: 26 }} /></div>
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Pickup</p>
                <p className="font-body font-semibold text-navy text-sm">{tour.pickupTime || 'TBA'}</p>
                {tour.pickupLocation && <p className="font-body text-[10px] text-gray-500 mt-0.5">{tour.pickupLocation}</p>}
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                <div className="text-navy mb-1.5 flex justify-center"><LocationOnIcon sx={{ fontSize: 26, transform: 'scaleX(-1)' }} /></div>
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Dropoff</p>
                <p className="font-body font-semibold text-navy text-sm">{tour.dropoffTime || 'TBA'}</p>
                {tour.dropoffLocation && <p className="font-body text-[10px] text-gray-500 mt-0.5">{tour.dropoffLocation}</p>}
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                <div className="text-navy mb-1.5 flex justify-center"><RestaurantIcon sx={{ fontSize: 26 }} /></div>
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Meals</p>
                <p className="font-body font-semibold text-navy text-sm">{tour.mealInfo || 'Not included'}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                <div className="text-navy mb-1.5 flex justify-center"><LocalTaxiIcon sx={{ fontSize: 26 }} /></div>
                <p className="font-body text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Transfer</p>
                <p className="font-body font-semibold text-navy text-sm">{tour.transferInfo || 'Available'}</p>
              </div>
            </div>

            {/* Timeline Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="font-heading text-2xl text-navy mb-5 flex items-center gap-2">
                  <AccessTimeIcon sx={{ fontSize: 26 }} />
                  Today's Schedule
                </h2>
                <div className="relative">
                  <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-yellow via-navy/20 to-yellow/30" />
                  <div className="space-y-0">
                    {tour.itinerary.map((item, index) => (
                      <div key={index} className="relative flex gap-4 group py-3">
                        <div className="relative z-10 flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 ${
                            index === 0 ? 'bg-yellow text-navy' :
                            index === tour.itinerary.length - 1 ? 'bg-navy text-white' :
                            'bg-white border-2 border-navy/20 text-navy'
                          }`}>
                            <span className="font-body font-bold text-xs">{item.time || `#${item.day}`}</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3.5 group-hover:bg-yellow/5 transition-colors duration-200">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-heading text-base text-navy">{item.title}</h4>
                            {item.time && <span className="font-body text-xs text-yellow-600 bg-yellow/10 px-2 py-0.5 rounded-full font-semibold">{item.time}</span>}
                          </div>
                          {item.description && <p className="font-body text-gray-600 text-sm leading-relaxed">{item.description}</p>}
                          {item.activities && item.activities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.activities.map((activity, i) => (
                                <span key={i} className="text-xs font-body bg-navy/5 text-navy/70 px-2 py-0.5 rounded-full">{activity}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Included / Not Included */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading text-lg text-navy mb-3 flex items-center gap-2">
                    <CheckCircleIcon sx={{ fontSize: 22, color: '#22c55e' }} />
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {(tour.included || []).map((item, index) => (
                      <li key={index} className="flex items-start gap-2 font-body text-gray-600 text-sm">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-heading text-lg text-navy mb-3 flex items-center gap-2">
                    <CancelIcon sx={{ fontSize: 22, color: '#ef4444' }} />
                    Not Included
                  </h3>
                  <ul className="space-y-2">
                    {(tour.notIncluded || []).map((item, index) => (
                      <li key={index} className="flex items-start gap-2 font-body text-gray-600 text-sm">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            {tour.whatToBring && tour.whatToBring.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-heading text-lg text-navy mb-3 flex items-center gap-2">
                  <BackpackIcon sx={{ fontSize: 22 }} />
                  What to Bring
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tour.whatToBring.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-navy/5 px-3 py-2 rounded-xl">
                      <BackpackIcon sx={{ fontSize: 16, color: '#1a2b4a' }} />
                      <span className="font-body text-navy text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Notes / Terms */}
            {(tour.importantNotes || tour.cancellationPolicy || tour.termsConditions) && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-heading text-lg text-navy mb-3 flex items-center gap-2">
                  <InfoIcon sx={{ fontSize: 22 }} />
                  Important Information
                </h3>
                <div className="space-y-3 font-body text-gray-600 text-sm">
                  {tour.importantNotes && (
                    <div className="bg-yellow/10 border-l-4 border-yellow p-3 rounded-r-lg">
                      <h4 className="font-semibold text-navy mb-1">Important Notes</h4>
                      <p className="whitespace-pre-line">{tour.importantNotes}</p>
                    </div>
                  )}
                  {tour.cancellationPolicy && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-navy mb-1">Cancellation Policy</h4>
                      <p className="whitespace-pre-line">{tour.cancellationPolicy}</p>
                    </div>
                  )}
                  {tour.termsConditions && (
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Terms & Conditions</h4>
                      <p className="whitespace-pre-line">{tour.termsConditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================= */}
          {/* RIGHT COLUMN: Sticky Booking Form       */}
          {/* ======================================= */}
          <BookingSidebar tour={tour} />
        </div>
      </div>
    </div>
  );
}
