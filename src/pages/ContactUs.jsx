import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_BASE = "/backend/api";

export default function ContactUs() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: location.state?.subject || "",
    message: "",
  });

  useEffect(() => {
    if (location.state?.subject) {
      setFormData((prev) => ({ ...prev, subject: location.state.subject }));
    }
  }, [location.state?.subject]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE}/contact.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.message || "Failed to send message. Please try again.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = [
    {
      title: "Tours & Transfers",
      email: "info@indosmilesouthservices.com",
      phones: [
        { name: "Mrs. Janthawarath Loosathidkool", number: "+66 95 265 5516" },
        { name: "Ms. Kimaya Gopal Nair", number: "+66 95 268 3663" },
      ],
      icon: (
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
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
      hover: "group-hover:text-blue-600",
      iconHover: "group-hover:bg-blue-600 group-hover:text-white",
    },
    {
      title: "Events & Weddings",
      email: "events@indosmilesouthservices.com",
      phones: [
        { name: "Mr. Gopal Ravishankar", number: "+66 96 472 9474" },
        { name: "Ms. Kimaya Gopal Nair", number: "+66 95 268 3663" },
      ],
      icon: (
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
            d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
          />
        </svg>
      ),
      color: "bg-pink-50 text-pink-600",
      hover: "group-hover:text-pink-600",
      iconHover: "group-hover:bg-pink-600 group-hover:text-white",
    },
    {
      title: "Our Office",
      address: "199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110",
      phones: [
        { name: "Main Office", number: "+66 82 253 6662" },
        { name: "Website Tech Support (Mr. Lay)", number: "+66 62 243 9182" },
      ],
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z"
          />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-600",
      hover: "group-hover:text-emerald-600",
      iconHover: "group-hover:bg-emerald-600 group-hover:text-white",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 blur-xl">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6">
            Get in <span className="text-yellow">Touch</span>
          </h1>
          <p className="text-gray-300 font-body text-lg md:text-xl max-w-2xl mx-auto">
            Have questions about our tours or need custom travel arrangements?
            Our dedicated team is ready to help you plan your perfect getaway.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {departments.map((dept, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${dept.color} ${dept.iconHover}`}
              >
                {dept.icon}
              </div>
              <h3
                className={`text-2xl font-heading text-navy mb-5 transition-colors ${dept.hover}`}
              >
                {dept.title}
              </h3>

              <div className="space-y-4 font-body mt-auto">
                {dept.phones &&
                  dept.phones.map((phone, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-gray-600 hover:text-navy transition-colors"
                    >
                      <svg
                        className="w-5 h-5 shrink-0 text-gray-400"
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
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {phone.name}
                        </span>
                        <a
                          href={`tel:${phone.number.replace(/\s+/g, "")}`}
                          className="font-medium"
                        >
                          {phone.number}
                        </a>
                      </div>
                    </div>
                  ))}

                {dept.email && (
                  <div className="flex items-center gap-3 text-gray-600 hover:text-navy transition-colors pt-2 border-t border-gray-50">
                    <svg
                      className="w-5 h-5 shrink-0 text-gray-400"
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
                    <a
                      href={`mailto:${dept.email}`}
                      className="font-medium text-sm xl:text-base break-words tracking-tight"
                    >
                      {dept.email}
                    </a>
                  </div>
                )}

                {dept.address && (
                  <div className="flex items-start gap-3 text-gray-600 hover:text-navy transition-colors pt-2 border-t border-gray-50">
                    <svg
                      className="w-5 h-5 shrink-0 text-gray-400 mt-1"
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
                    <a
                      href="https://maps.app.goo.gl/NBTXA3osrXzZUBGX6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium leading-tight"
                    >
                      {dept.address}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Contact Form */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-heading text-navy mb-2">
              Send us a Message
            </h2>
            <p className="text-gray-500 font-body mb-8">
              We would love to hear from you. Fill out the form and we will get
              back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-body text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white font-body"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block font-body text-sm font-medium text-gray-700 mb-2 "
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white font-body"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block font-body text-sm font-medium text-gray-700 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white font-body"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block font-body text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white resize-none font-body"
                  placeholder="Tell us about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy text-white font-body font-semibold py-4 rounded-lg hover:bg-yellow hover:text-navy transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white group-hover:text-navy"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              {submitStatus === "success" && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 animate-fade-in-up">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-body font-medium">
                    Thank you! Your message has been sent successfully.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 animate-fade-in-up">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-body font-medium">{errorMessage}</p>
                </div>
              )}
            </form>
          </div>

          {/* Map Overlay */}
          <div className="bg-gray-100 relative min-h-[400px]">
            <iframe
              src="https://maps.google.com/maps?q=8.0691397,98.3432648&hl=en&z=16&output=embed"
              className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Indo Smile Office Location"
            ></iframe>

            {/* Info Badge overlaid on map */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20">
              <h4 className="font-heading text-navy text-lg mb-2">
                Our Headquarters
              </h4>
              <p className="font-body text-gray-600 text-sm">
                199/100 Moo 9, Thepkrasattri,
                <br />
                Thalang, Phuket 83110
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
