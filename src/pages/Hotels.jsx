import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = '/backend/api';

export default function Hotels() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStars, setSelectedStars] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    fetchHotels();
  }, []);

  const mapHotel = (hotel) => ({
    id: hotel.id,
    image: hotel.main_image || "",
    name: hotel.name,
    destination: hotel.destination,
    description: hotel.short_description || hotel.description,
    stars: parseInt(hotel.stars) || 4,
    rating: parseFloat(hotel.rating) || 0,
    reviews: hotel.review_count || 0,
    amenities: hotel.amenities || [],
  });

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const FETCH_LIMIT = 100;
      let page = 1;
      let collected = [];
      let totalPages = 1;

      do {
        const response = await fetch(`${API_BASE}/hotels.php?active=1&limit=${FETCH_LIMIT}&page=${page}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (!data.success) throw new Error('Failed to fetch');
        collected = collected.concat((data.data.items || []).map(mapHotel));
        totalPages = data.data.pagination?.total_pages || 1;
        page++;
      } while (page <= totalPages);

      setAllHotels(collected);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique destinations for filter
  const destinations = useMemo(() => {
    const unique = [...new Set(allHotels.map(h => h.destination).filter(Boolean))];
    return unique.sort();
  }, [allHotels]);

  // Filter and sort logic
  const filteredAndSortedHotels = useMemo(() => {
    let filtered = allHotels;

    if (searchQuery) {
      filtered = filtered.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hotel.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hotel.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStars !== "all") {
      filtered = filtered.filter((hotel) => hotel.stars === parseInt(selectedStars));
    }

    if (selectedDestination !== "all") {
      filtered = filtered.filter((hotel) => hotel.destination === selectedDestination);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        default: return 0;
      }
    });

    return sorted;
  }, [searchQuery, selectedStars, selectedDestination, sortBy, allHotels]);

  // Reset to first page whenever filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStars, selectedDestination, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedHotels.length / PAGE_SIZE));
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedHotels.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedHotels, currentPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookNow = (hotel) => {
    navigate("/about#contact", { state: { subject: `Enquiry for ${hotel.name}` } });
  };

  return (
    <section className="py-20 bg-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-navy mb-4">
            Premium Hotels & Resorts
          </h1>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect stay for your tropical vacation. From luxury pool villas to family-friendly beach resorts.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
            <p className="mt-4 font-body text-gray-600">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-heading text-2xl text-navy mb-2">Unable to Load Hotels</h3>
            <p className="font-body text-gray-500 mb-6">Please try again later.</p>
            <button onClick={fetchHotels} className="bg-yellow text-navy px-6 py-2.5 rounded-xl font-body font-semibold hover:opacity-90 transition-all">
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Search & Filters Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for hotels, locations, or vibes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-4 pl-12 border border-gray-200 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition-all duration-200"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">Destination</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Destinations</option>
                    {destinations.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">Hotel Rating</label>
                  <select
                    value={selectedStars}
                    onChange={(e) => setSelectedStars(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Star Ratings</option>
                    <option value="5">5 Stars Luxury</option>
                    <option value="4">4 Stars Premium</option>
                    <option value="3">3 Stars Comfort</option>
                  </select>
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition-all duration-200"
                  >
                    <option value="featured">Recommended</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStars("all");
                      setSelectedDestination("all");
                      setSortBy("featured");
                    }}
                    className="w-full px-4 py-3 bg-gray-50 text-navy border border-gray-200 rounded-xl font-body font-semibold hover:bg-gray-100 transition-colors duration-200"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 flex justify-between items-center">
              <p className="font-body text-gray-600">
                Found <span className="font-semibold text-navy">{filteredAndSortedHotels.length}</span> properties
              </p>
            </div>

            {filteredAndSortedHotels.length > 0 ? (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedHotels.map((hotel) => (
                  <div key={hotel.id} onClick={() => navigate(`/hotels/${hotel.id}`)} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-400 group cursor-pointer">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                      <div className="absolute top-4 left-4 flex gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-navy">
                        {hotel.rating} / 5.0 ({hotel.reviews} Reviews)
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">{hotel.destination}</div>
                      <h3 className="font-heading text-2xl text-navy mb-3 group-hover:text-yellow transition-colors">{hotel.name}</h3>
                      <p className="font-body text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                        {hotel.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-5 border-t border-gray-100/80">
                        <button
                          onClick={() => navigate(`/hotels/${hotel.id}`)}
                          className="flex-1 bg-navy/5 text-navy px-4 py-3 rounded-xl font-body font-semibold hover:bg-navy/10 transition-all duration-300 text-center"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookNow(hotel); }}
                          className="flex-1 bg-yellow text-navy px-4 py-3 rounded-xl font-body font-semibold hover:bg-navy hover:text-white transition-all duration-300 text-center"
                        >
                          Enquire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2.5 rounded-xl font-body font-semibold border border-gray-200 bg-white text-navy hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-11 h-11 rounded-xl font-body font-semibold transition-colors ${
                          page === currentPage
                            ? "bg-yellow text-navy"
                            : "bg-white text-navy border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2.5 rounded-xl font-body font-semibold border border-gray-200 bg-white text-navy hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                </svg>
                <h3 className="font-heading text-2xl text-navy mb-2">No Properties Found</h3>
                <p className="font-body text-gray-500 mb-6">We couldn't find any hotels matching your current filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStars("all");
                    setSortBy("featured");
                  }}
                  className="bg-yellow text-navy px-6 py-2.5 rounded-xl font-body font-semibold hover:opacity-90 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
