export default function Hero() {
  return (
    <section
      id="home"
      className="relative bg-gray-900 min-h-[600px] flex items-center"
    >
      {/* Background Image Placeholder */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(1, 0, 72, 0.9), rgba(1, 0, 72, 0.7))' }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920')] bg-cover bg-center opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Professional Travel & Land Operation Services in Southern Thailand
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
            Your trusted partner for inbound and outbound tours, comprehensive
            land operations, ticketing services, and corporate incentive
            programs across Southern Thailand.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-block bg-yellow text-navy px-8 py-4 rounded-lg font-body font-semibold text-center hover:bg-opacity-90 transition-all duration-200 shadow-lg"
            >
              Plan Your Trip
            </a>
            <a
              href="#about"
              className="inline-block border-2 border-yellow text-yellow px-8 py-4 rounded-lg font-body font-semibold text-center hover:bg-yellow hover:text-navy transition-all duration-200"
            >
              Download Company Profile
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
