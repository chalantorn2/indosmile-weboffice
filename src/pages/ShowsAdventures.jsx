import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/backend/api";

export default function ShowsAdventures() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/shows.php?active=1`,
      );
      const data = await response.json();

      if (data.success) {
        const items = data.data.items.map((item) => ({
          id: item.id,
          image:
            item.main_image ||
            "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600",
          images: item.gallery_images || [],
          name: item.name,
          destination: item.destination,
          venue: item.venue || "",
          description: item.description,
          duration: item.duration_days,
          durationLabel:
            item.duration_days == 1
              ? "One Day Experience"
              : item.duration_label ||
                `${item.duration_days} Days / ${item.duration_nights} Nights`,
          rating: parseFloat(item.rating) || 0,
          reviews: item.review_count || 0,
          highlights: item.highlights || [],
          included: item.included || [],
          notIncluded: item.not_included || [],
          showTimes: item.show_times || [],
          seatZones: item.seat_zones || [],
          operationalDays: item.operational_days || [],
          minParticipants: item.min_participants || 1,
          maxParticipants: item.max_participants || null,
          cancellationPolicy: item.cancellation_policy || "",
          termsConditions: item.terms_conditions || "",
        }));
        setAllItems(items);
      } else {
        setError(data.message || "Failed to load shows & adventures");
      }
    } catch (err) {
      console.error("Error fetching shows & adventures:", err);
      setError("Unable to load shows & adventures. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueDestinations = useMemo(() => {
    return [...new Set(allItems.map((item) => item.destination))]
      .filter(Boolean)
      .sort();
  }, [allItems]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = allItems;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedDestination !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.destination.toLowerCase() === selectedDestination.toLowerCase(),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "destination":
          return a.destination.localeCompare(b.destination);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [allItems, searchQuery, selectedDestination, sortBy]);

  return (
    <section className="py-20 bg-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-navy mb-4">
            Shows & Adventures
          </h1>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Unforgettable performances and thrilling adventures across Thailand
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
            <p className="mt-4 font-body text-gray-600">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="font-body text-red-600">{error}</p>
            <button
              onClick={fetchItems}
              className="mt-4 bg-navy text-white px-6 py-2 rounded-lg font-body font-semibold hover:bg-opacity-90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Search & Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search shows, adventures, destinations..."
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="destination">Destination</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDestination("all");
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
                  {filteredAndSortedItems.length}
                </span>{" "}
                experience{filteredAndSortedItems.length !== 1 ? "s" : ""}
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

            {/* Cards Grid */}
            {filteredAndSortedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/shows-adventures/${item.id}`)}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                  >
                    <div className="relative h-56 bg-gray-300 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-yellow"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-body text-sm font-semibold text-navy">
                          {item.rating}
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 bg-navy bg-opacity-90 text-white px-3 py-1 rounded-full">
                        <span className="font-body text-sm font-semibold">
                          {item.durationLabel}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-2">
                        <span className="inline-block bg-yellow bg-opacity-20 text-navy px-3 py-1 rounded-full text-sm font-body font-semibold">
                          {item.destination}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl text-navy mb-2">
                        {item.name}
                      </h3>

                      <p className="font-body text-gray-600 mb-4 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.highlights.slice(0, 3).map((highlight, index) => (
                          <span
                            key={index}
                            className="text-xs font-body text-gray-500 bg-gray-100 px-2 py-1 rounded"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mb-4 font-body text-sm text-gray-500">
                        <span>{item.reviews} reviews</span>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/shows-adventures/${item.id}`);
                          }}
                          className="bg-navy text-white px-6 py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                  No shows or adventures found
                </h3>
                <p className="font-body text-gray-600 mb-6">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDestination("all");
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
