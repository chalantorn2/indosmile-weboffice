import { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";

export default function BookingDetail({ tour, onBack }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: 1,
    message: "",
  });

  // Default tour images (will use tour.images if available)
  const tourImages = tour.images || [tour.image, tour.image, tour.image];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Booking request submitted! We will contact you soon.");
    console.log("Booking data:", { tour: tour.name, ...formData });
  };

  return (
    <div className="min-h-screen bg-light-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-navy font-body font-semibold hover:text-yellow transition-colors duration-200"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Tours
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-300">
                <img
                  src={tourImages[selectedImage]}
                  alt={tour.name}
                  className="w-full h-full object-cover"
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
              <div className="grid grid-cols-3 gap-2 p-4">
                {tourImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? "border-yellow"
                        : "border-transparent"
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
                    2-15 People
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

                    {(
                      tour.itinerary || [
                        {
                          day: 1,
                          title: "Arrival & Hotel Check-in",
                          description:
                            "Meet and greet at the airport. Transfer to hotel. Evening free time to explore the local area.",
                        },
                        {
                          day: 2,
                          title: "Main Activities",
                          description:
                            "Full day tour visiting main attractions. Lunch included at local restaurant. Return to hotel in the evening.",
                        },
                        {
                          day: 3,
                          title: "Departure",
                          description:
                            "Breakfast at hotel. Free time for last-minute shopping. Transfer to airport for departure.",
                        },
                      ]
                    ).map((item, index) => (
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
                          <p className="font-body text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
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
                        {(
                          tour.included || [
                            "Hotel accommodation",
                            "Daily breakfast",
                            "Professional tour guide",
                            "All entrance fees",
                            "Transportation",
                            "Travel insurance",
                          ]
                        ).map((item, index) => (
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
                        {(
                          tour.notIncluded || [
                            "International flights",
                            "Personal expenses",
                            "Alcoholic beverages",
                            "Tips for guide and driver",
                            "Optional activities",
                          ]
                        ).map((item, index) => (
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
                        <div className="bg-yellow bg-opacity-10 border-l-4 border-yellow p-4 rounded">
                          <h4 className="font-semibold text-navy mb-2">
                            Cancellation Policy
                          </h4>
                          <p>
                            Free cancellation up to 7 days before departure. 50%
                            refund for 3-7 days before. No refund within 3 days
                            of departure.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy mb-2">
                            What to Bring
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Comfortable walking shoes</li>
                            <li>Sun protection (hat, sunscreen)</li>
                            <li>Camera</li>
                            <li>Light jacket for air-conditioned venues</li>
                            <li>Valid passport/ID</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy mb-2">
                            Health & Safety
                          </h4>
                          <p>
                            This tour involves moderate physical activity.
                            Please inform us of any health conditions or dietary
                            restrictions when booking.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="font-heading text-3xl text-navy font-bold">
                  {tour.priceLabel}
                </p>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                    placeholder="+66 XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Number of Guests *
                  </label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-navy mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-body focus:outline-none focus:border-yellow transition-colors duration-200 resize-none"
                    placeholder="Any special requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-navy text-white py-4 rounded-lg font-body font-bold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Book Now
                </button>
              </form>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-body text-sm text-gray-600 text-center mb-3">
                  Have questions? Contact us
                </p>
                <a
                  href="tel:+66XXXXXXXXX"
                  className="flex items-center justify-center gap-2 text-navy hover:text-yellow transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="font-body font-semibold">
                    +66 XX XXX XXXX
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
