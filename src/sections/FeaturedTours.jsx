import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/backend/api';

const TRANSFER_IMAGE =
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800';

export default function FeaturedTours() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tours');
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const sortFeatured = (a, b) =>
      (Number(b.is_featured) || 0) - (Number(a.is_featured) || 0);

    async function load() {
      try {
        const [toursRes, hotelsRes, routesRes] = await Promise.all([
          fetch(`${API_BASE}/tours.php?active=1`).then((r) => r.json()),
          fetch(`${API_BASE}/hotels.php?active=1`).then((r) => r.json()),
          fetch(`${API_BASE}/transfers.php?resource=routes&active=1`).then((r) =>
            r.json()
          ),
        ]);
        if (cancelled) return;

        setTours(
          (toursRes?.data?.items || []).slice().sort(sortFeatured).slice(0, 3)
        );
        setHotels(
          (hotelsRes?.data?.items || []).slice().sort(sortFeatured).slice(0, 3)
        );
        setRoutes((routesRes?.data?.data || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured items:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: 'tours', label: 'Tours' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'hotels', label: 'Hotels' },
  ];

  const renderTours = () =>
    tours.map((t) => (
      <div
        key={t.id}
        onClick={() => navigate(`/booking-detail/${t.id}`)}
        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
      >
        <div className="relative h-48 bg-gray-300 overflow-hidden">
          <img
            src={t.main_image}
            alt={t.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {t.duration_label && (
            <div className="absolute top-4 left-4 bg-navy bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-body font-semibold">
              {t.duration_label}
            </div>
          )}
        </div>
        <div className="p-6">
          <span className="inline-block bg-yellow bg-opacity-20 text-navy px-3 py-1 rounded-full text-xs font-body font-semibold mb-3">
            {t.destination}
          </span>
          <h3 className="font-heading text-2xl text-navy mb-2 line-clamp-1">
            {t.name}
          </h3>
          <p className="font-body text-gray-600 mb-5 leading-relaxed line-clamp-2">
            {t.short_description || t.description}
          </p>
          <span className="block w-full bg-navy text-white text-center py-3 rounded-lg font-body font-semibold group-hover:bg-opacity-90 transition-all duration-200">
            View Details
          </span>
        </div>
      </div>
    ));

  const renderHotels = () =>
    hotels.map((h) => (
      <div
        key={h.id}
        onClick={() => navigate(`/hotels/${h.id}`)}
        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
      >
        <div className="relative h-48 bg-gray-300 overflow-hidden">
          <img
            src={h.main_image}
            alt={h.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4 flex gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {Array.from({ length: parseInt(h.stars) || 0 }).map((_, i) => (
              <svg
                key={i}
                className="w-3.5 h-3.5 text-yellow"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="p-6">
          <span className="inline-block bg-yellow bg-opacity-20 text-navy px-3 py-1 rounded-full text-xs font-body font-semibold mb-3">
            {h.destination}
          </span>
          <h3 className="font-heading text-2xl text-navy mb-2 line-clamp-1">
            {h.name}
          </h3>
          <p className="font-body text-gray-600 mb-5 leading-relaxed line-clamp-2">
            {h.short_description || h.description}
          </p>
          <span className="block w-full bg-navy text-white text-center py-3 rounded-lg font-body font-semibold group-hover:bg-opacity-90 transition-all duration-200">
            View Hotel
          </span>
        </div>
      </div>
    ));

  const renderTransfers = () =>
    routes.map((r) => {
      const vehicleCount = (r.prices || []).length;
      return (
        <div
          key={r.id}
          onClick={() => navigate('/transfer')}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={TRANSFER_IMAGE}
              alt={`${r.origin_name} to ${r.destination_name}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 font-body text-sm font-semibold">
                <span className="truncate">{r.origin_name}</span>
                <svg
                  className="w-4 h-4 shrink-0 text-yellow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <span className="truncate">{r.destination_name}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <span className="inline-block bg-yellow bg-opacity-20 text-navy px-3 py-1 rounded-full text-xs font-body font-semibold mb-3">
              Private Transfer
            </span>
            <h3 className="font-heading text-xl text-navy mb-2 line-clamp-1">
              {r.origin_name} → {r.destination_name}
            </h3>
            <p className="font-body text-gray-600 mb-5 leading-relaxed line-clamp-2">
              Door-to-door transfer with{' '}
              {vehicleCount > 0
                ? `${vehicleCount} vehicle option${vehicleCount === 1 ? '' : 's'}`
                : 'multiple vehicle options'}
              . Flexible pickup times and professional drivers.
            </p>
            <span className="block w-full bg-navy text-white text-center py-3 rounded-lg font-body font-semibold group-hover:bg-opacity-90 transition-all duration-200">
              Book Transfer
            </span>
          </div>
        </div>
      );
    });

  const cards = {
    tours: { render: renderTours, items: tours, empty: 'No tours available yet.' },
    hotels: { render: renderHotels, items: hotels, empty: 'No hotels available yet.' },
    transfers: {
      render: renderTransfers,
      items: routes,
      empty: 'No transfer routes available yet.',
    },
  };

  const current = cards[activeTab];

  return (
    <section className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl text-navy mb-4">
            Featured Services
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of tours, transfers, and hotels
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-body font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-yellow text-navy shadow-md'
                  : 'bg-white text-navy hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
            <p className="mt-4 font-body text-gray-600">Loading...</p>
          </div>
        ) : current.items.length === 0 ? (
          <div className="text-center py-16 font-body text-gray-500">
            {current.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {current.render()}
          </div>
        )}
      </div>
    </section>
  );
}
