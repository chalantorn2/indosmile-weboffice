import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_BASE = "/backend/api";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [copied, setCopied] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxIsGallery, setLightboxIsGallery] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(`${API_BASE}/hotels.php?id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      if (data.success) {
        setHotel(data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching hotel:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const amenities = useMemo(() => {
    if (!hotel?.amenities) return [];
    return typeof hotel.amenities === "string"
      ? JSON.parse(hotel.amenities)
      : hotel.amenities;
  }, [hotel]);

  const roomTypes = useMemo(() => {
    if (!hotel?.room_types) return [];
    return hotel.room_types.map((r) => ({
      ...r,
      amenities:
        typeof r.amenities === "string"
          ? JSON.parse(r.amenities)
          : r.amenities || [],
    }));
  }, [hotel]);

  // Map room type names to their images (matched by category)
  const roomTypeNames = useMemo(
    () => new Set(roomTypes.map((r) => r.name)),
    [roomTypes],
  );

  const roomImageMap = useMemo(() => {
    if (!hotel?.images) return {};
    const map = {};
    hotel.images.forEach((img) => {
      if (roomTypeNames.has(img.category)) {
        if (!map[img.category]) map[img.category] = [];
        map[img.category].push(img);
      }
    });
    return map;
  }, [hotel, roomTypeNames]);

  // Gallery images = exclude images that belong to a room type
  const galleryImages = useMemo(() => {
    if (!hotel?.images) return [];
    return hotel.images.filter((img) => !roomTypeNames.has(img.category));
  }, [hotel, roomTypeNames]);

  // Gallery grouped by category (excluding room type images)
  const galleryByCategory = useMemo(() => {
    const groups = {};
    galleryImages.forEach((img) => {
      const cat = img.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(img);
    });
    return groups;
  }, [galleryImages]);

  const galleryCategories = useMemo(
    () => Object.keys(galleryByCategory),
    [galleryByCategory],
  );

  const filteredGalleryImages = useMemo(() => {
    if (activeCategory === "all") return galleryImages;
    return galleryImages.filter((img) => img.category === activeCategory);
  }, [galleryImages, activeCategory]);

  // Lightbox — shared for gallery & room images
  const openGalleryLightbox = (index) => {
    setLightboxImages(filteredGalleryImages);
    setLightboxIndex(index);
    setLightboxIsGallery(true);
  };
  const openRoomLightbox = (roomName, index) => {
    setLightboxImages(roomImageMap[roomName] || []);
    setLightboxIndex(index);
    setLightboxIsGallery(false);
  };
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLightboxImages([]);
    setLightboxIsGallery(false);
  }, []);
  const nextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    },
    [lightboxImages.length],
  );
  const prevImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex(
        (prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length,
      );
    },
    [lightboxImages.length],
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: hotel.name,
      text: `Check out ${hotel.name} in ${hotel.destination}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
          <p className="mt-4 font-body text-gray-600">Loading hotel...</p>
        </div>
      </div>
    );
  }

  if (!hotel && !error) return null;

  // Error state with retry
  if (error && !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-2xl text-navy mb-3">
            Hotel Not Found
          </h2>
          <p className="font-body text-gray-500 mb-8">
            We couldn't load this hotel. It may have been removed or there was a
            connection issue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchHotel}
              className="px-6 py-3 bg-navy text-white rounded-xl font-body font-semibold hover:bg-navy/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => navigate("/hotels")}
              className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-body font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-gray min-h-screen pb-28 lg:pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 font-body text-sm text-gray-500">
          <Link to="/" className="hover:text-navy transition-colors">
            Home
          </Link>
          <svg
            className="w-3.5 h-3.5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link to="/hotels" className="hover:text-navy transition-colors">
            Hotels
          </Link>
          <svg
            className="w-3.5 h-3.5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-navy font-medium truncate max-w-[200px]">
            {hotel.name}
          </span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden mt-4">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hotel.main_image || ""})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 p-3 rounded-full transition-all"
            title="Share this hotel"
          >
            {copied ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            )}
          </button>
          {copied && (
            <span className="absolute top-6 right-20 bg-black/60 backdrop-blur-md text-white text-xs font-body px-3 py-2 rounded-full animate-fade-in">
              Link copied!
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-yellow text-navy px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-body">
              {hotel.destination}
            </span>
            <div className="flex gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
              {Array.from({ length: parseInt(hotel.stars) || 0 }).map(
                (_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ),
              )}
            </div>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl text-white mb-4 leading-tight">
            {hotel.name}
          </h1>

          <div className="flex items-center text-white/90 gap-6 font-body text-sm md:text-base">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {hotel.destination}
            </div>
            {parseFloat(hotel.rating) > 0 && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{hotel.rating} / 5.0</span>
                <span className="text-white/60">
                  ({hotel.review_count} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery by Category (excludes room type images) */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl text-navy mb-4">
                  Gallery
                </h2>

                {/* Category Tabs */}
                {galleryCategories.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    <button
                      onClick={() => setActiveCategory("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-all ${activeCategory === "all" ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-navy/30"}`}
                    >
                      All ({galleryImages.length})
                    </button>
                    {galleryCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-all ${activeCategory === cat ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-navy/30"}`}
                      >
                        {cat} ({galleryByCategory[cat].length})
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Grid — show max 6, rest via lightbox */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredGalleryImages.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => openGalleryLightbox(idx)}
                      className="relative h-48 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || img.category}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                          <span className="text-white text-xs font-body">
                            {img.caption}
                          </span>
                        </div>
                      )}
                      {/* Overlay on 6th image if there are more */}
                      {idx === 5 && filteredGalleryImages.length > 6 && (
                        <div className="absolute inset-0 bg-navy/60 flex items-center justify-center">
                          <span className="text-white font-heading text-2xl">
                            +{filteredGalleryImages.length - 6} photos
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h2 className="font-heading text-3xl text-navy mb-6">
                Property Overview
              </h2>
              <p className="font-body text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {hotel.description}
              </p>

              {/* Check-in / Check-out info */}
              {(hotel.check_in_time || hotel.check_out_time) && (
                <div className="mt-6 flex gap-6">
                  {hotel.check_in_time && (
                    <div className="flex items-center gap-2 font-body text-gray-600">
                      <svg
                        className="w-5 h-5 text-navy"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Check-in: <strong>{hotel.check_in_time}</strong>
                      </span>
                    </div>
                  )}
                  {hotel.check_out_time && (
                    <div className="flex items-center gap-2 font-body text-gray-600">
                      <svg
                        className="w-5 h-5 text-navy"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Check-out: <strong>{hotel.check_out_time}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h2 className="font-heading text-3xl text-navy mb-8">
                  Popular Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 font-body text-gray-700"
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow/20 flex items-center justify-center text-navy shrink-0">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm md:text-base">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Types */}
            {roomTypes.length > 0 && (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h2 className="font-heading text-3xl text-navy mb-8">
                  Room Types
                </h2>
                <div className="space-y-6">
                  {roomTypes.map((room, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Room Images */}
                      {roomImageMap[room.name] &&
                        roomImageMap[room.name].length > 0 && (
                          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                            {roomImageMap[room.name].map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img.image_url}
                                alt={img.caption || room.name}
                                loading="lazy"
                                onClick={() =>
                                  openRoomLightbox(room.name, imgIdx)
                                }
                                className="h-44 w-auto object-cover flex-shrink-0 first:rounded-tl-2xl last:rounded-tr-2xl cursor-pointer hover:brightness-90 transition-all"
                              />
                            ))}
                          </div>
                        )}
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-heading text-xl text-navy mb-2">
                              {room.name}
                            </h3>
                            {room.description && (
                              <p className="font-body text-gray-500 text-sm mb-3">
                                {room.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-sm font-body text-gray-600">
                              {room.bed_type && (
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4 text-navy/60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
                                    />
                                  </svg>
                                  {room.bed_type} Bed
                                </div>
                              )}
                              {room.max_guests && (
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4 text-navy/60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  Max {room.max_guests} guests
                                </div>
                              )}
                              {room.room_size && (
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4 text-navy/60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                    />
                                  </svg>
                                  {room.room_size} sqm
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                            {room.amenities.map((a, i) => (
                              <span
                                key={i}
                                className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium font-body"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA (Right) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="font-heading text-2xl text-navy mb-2">
                  Interested in this property?
                </h3>
                <p className="font-body text-sm text-gray-500">
                  Contact us to get the best rates, check availability, and
                  arrange your booking instantly.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/about#contact", {
                    state: { subject: `Enquiry for ${hotel.name}` },
                  })
                }
                className="w-full bg-navy text-white px-6 py-4 rounded-xl font-body font-bold text-lg hover:bg-yellow hover:text-navy hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group mb-4"
              >
                <svg
                  className="w-5 h-5 group-hover:animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Enquire Now
              </button>

              <p className="text-center text-xs font-body text-gray-400">
                You will be redirected to our Contact page.
                <br />
                Our team typically replies within 2 hours.
              </p>

              {/* Our Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-3">
                  Contact Us Directly
                </p>
                <div className="flex items-center gap-3 font-body text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-navy/60 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +66 95 268 3663, +66 95 265 5516
                </div>
                <div className="flex items-center gap-3 font-body text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-navy/60 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@indosmilesouthservices.com
                </div>
              </div>

              {/* Address with Google Maps link */}
              {hotel.address && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3 font-body text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-navy/60 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span>{hotel.address}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1.5 text-navy hover:underline font-medium text-xs flex items-center gap-1"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgb(0,0,0,0.08)]">
        <button
          onClick={() =>
            navigate("/about#contact", {
              state: { subject: `Enquiry for ${hotel.name}` },
            })
          }
          className="w-full bg-navy text-white px-6 py-3.5 rounded-xl font-body font-bold text-base hover:bg-yellow hover:text-navy transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Enquire Now
        </button>
      </div>

      {/* Lightbox Modal — shared for gallery & room images */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* Category Tabs — only for gallery lightbox */}
          {lightboxIsGallery && galleryCategories.length > 1 && (
            <div
              className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 z-10 max-w-[80vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setLightboxImages(galleryImages);
                  setLightboxIndex(0);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium font-body transition-all ${activeCategory === "all" ? "bg-white text-navy" : "bg-white/15 text-white/80 hover:bg-white/25"}`}
              >
                All ({galleryImages.length})
              </button>
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    const imgs = galleryImages.filter(
                      (img) => img.category === cat,
                    );
                    setLightboxImages(imgs);
                    setLightboxIndex(0);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium font-body transition-all ${activeCategory === cat ? "bg-white text-navy" : "bg-white/15 text-white/80 hover:bg-white/25"}`}
                >
                  {cat} ({galleryByCategory[cat].length})
                </button>
              ))}
            </div>
          )}

          <button
            className="absolute top-6 right-6 lg:top-8 lg:right-8 text-white/70 hover:text-white p-2 transition-colors z-10"
            onClick={closeLightbox}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <button
            className="absolute left-4 md:left-8 text-white/70 hover:text-white p-4 transition-colors bg-black/20 hover:bg-black/50 rounded-full"
            onClick={prevImage}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <img
            src={lightboxImages[lightboxIndex]?.image_url}
            alt={lightboxImages[lightboxIndex]?.caption || "Gallery"}
            className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 md:right-8 text-white/70 hover:text-white p-4 transition-colors bg-black/20 hover:bg-black/50 rounded-full"
            onClick={nextImage}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            {lightboxImages[lightboxIndex]?.caption && (
              <span className="text-white/80 font-body text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                {lightboxImages[lightboxIndex].caption}
              </span>
            )}
            <span className="text-white/80 font-body tracking-widest text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
              {lightboxIndex + 1} / {lightboxImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
