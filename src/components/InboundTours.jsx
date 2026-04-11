import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/backend/api";

export default function InboundTours() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tours from API
  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/tours.php?type=inbound&active=1`,
      );
      const data = await response.json();

      if (data.success) {
        // Transform API data to match component structure
        const tours = data.data.items.map((tour) => ({
          id: tour.id,
          image:
            tour.main_image ||
            "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600",
          images: tour.gallery_images || [],
          name: tour.name,
          destination: tour.destination,
          description: tour.description,
          duration: tour.duration_days,
          durationLabel:
            tour.duration_days == 1
              ? "One Day Trip"
              : tour.duration_label ||
                `${tour.duration_days} Days / ${tour.duration_nights} Nights`,
          adultPrice: parseFloat(tour.adult_price),
          childPrice: tour.child_price ? parseFloat(tour.child_price) : null,
          rating: parseFloat(tour.rating) || 0,
          reviews: tour.review_count || 0,
          highlights: tour.highlights || [],
          itinerary: tour.itinerary || [],
          included: tour.included || [],
          notIncluded: tour.not_included || [],
          minParticipants: tour.min_participants || 1,
          maxParticipants: tour.max_participants || null,
          cancellationPolicy: tour.cancellation_policy || "",
          termsConditions: tour.terms_conditions || "",
        }));
        setAllTours(tours);
      } else {
        setError(data.message || "Failed to load tours");
      }
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError("Unable to load tours. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueDestinations = useMemo(() => {
    return [...new Set(allTours.map((tour) => tour.destination))].filter(Boolean).sort();
  }, [allTours]);

  // Filter and sort logic
  const filteredAndSortedTours = useMemo(() => {
    let filtered = allTours;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tour) =>
          tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Destination filter
    if (selectedDestination !== "all") {
      filtered = filtered.filter(
        (tour) =>
          tour.destination.toLowerCase() === selectedDestination.toLowerCase(),
      );
    }

    // Price filter
    if (selectedPriceRange !== "all") {
      filtered = filtered.filter((tour) => {
        switch (selectedPriceRange) {
          case "budget":
            return tour.adultPrice < 1500;
          case "mid":
            return tour.adultPrice >= 1500 && tour.adultPrice < 3000;
          case "luxury":
            return tour.adultPrice >= 3000;
          default:
            return true;
        }
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.adultPrice - b.adultPrice;
        case "price-high":
          return b.adultPrice - a.adultPrice;
        case "rating":
          return b.rating - a.rating;
        case "destination":
          return a.destination.localeCompare(b.destination);
        default:
          return 0;
      }
    });

    return sorted;
  }, [allTours, searchQuery, selectedDestination, selectedPriceRange, sortBy]);

  return (
    <section className="py-20 bg-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-navy mb-4">
            One Day Trip
          </h1>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best of Thailand with our carefully curated tour One
            Day Trip
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
            <p className="mt-4 font-body text-gray-600">Loading tours...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="font-body text-red-600">{error}</p>
            <button
              onClick={fetchTours}
              className="mt-4 bg-navy text-white px-6 py-2 rounded-lg font-body font-semibold hover:bg-opacity-90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tours Content */}
        {!loading && !error && (
          <>
            {/* Search & Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tours, destinations, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Destination Filter */}
                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Destination
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                  >
                    <option value="all">All Destinations</option>
                    {uniqueDestinations.map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">Budget (&lt; 1,500 THB)</option>
                    <option value="mid">Standard (1,500-3,000 THB)</option>
                    <option value="luxury">Premium (3,000+ THB)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="destination">Destination</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDestination("all");
                      setSelectedPriceRange("all");
                      setSortBy("featured");
                    }}
                    className="w-full px-4 py-3 bg-gray-100 text-navy rounded-lg font-body font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="font-body text-gray-600">
                Showing{" "}
                <span className="font-semibold text-navy">
                  {filteredAndSortedTours.length}
                </span>{" "}
                tour{filteredAndSortedTours.length !== 1 ? "s" : ""}
                {searchQuery && (
                  <span>
                    {" "}
                    for "
                    <span className="font-semibold text-navy">
                      {searchQuery}
                    </span>
                    "
                  </span>
                )}
              </p>
            </div>

            {/* Tour Cards Grid */}
            {filteredAndSortedTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedTours.map((tour) => (
                  <div
                    key={tour.id}
                    onClick={() => navigate(`/booking-detail/${tour.id}`)}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gray-300 overflow-hidden">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-yellow"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-body text-sm font-semibold text-navy">
                          {tour.rating}
                        </span>
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute top-4 left-4 bg-navy bg-opacity-90 text-white px-3 py-1 rounded-full">
                        <span className="font-body text-sm font-semibold">
                          {tour.durationLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Destination Tag */}
                      <div className="mb-2">
                        <span className="inline-block bg-yellow bg-opacity-20 text-navy px-3 py-1 rounded-full text-sm font-body font-semibold">
                          {tour.destination}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl text-navy mb-2">
                        {tour.name}
                      </h3>

                      <p className="font-body text-gray-600 mb-4 leading-relaxed line-clamp-2">
                        {tour.description}
                      </p>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tour.highlights.slice(0, 3).map((highlight, index) => (
                          <span
                            key={index}
                            className="text-xs font-body text-gray-500 bg-gray-100 px-2 py-1 rounded"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Reviews */}
                      <div className="flex items-center gap-2 mb-4 font-body text-sm text-gray-500">
                        <span>{tour.reviews} reviews</span>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="font-heading text-lg text-navy">
                            {tour.adultPrice.toLocaleString()} THB
                          </p>
                          {tour.childPrice && (
                            <p className="font-body text-sm text-gray-500">
                              Child: {tour.childPrice.toLocaleString()} THB
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/booking-detail/${tour.id}`);
                          }}
                          className="bg-navy text-white px-6 py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No Results Found
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg
                    className="w-24 h-24 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl text-navy mb-2">
                  No tours found
                </h3>
                <p className="font-body text-gray-600 mb-6">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDestination("all");
                    setSelectedPriceRange("all");
                    setSortBy("featured");
                  }}
                  className="bg-yellow text-navy px-6 py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
