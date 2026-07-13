import { useNavigate } from "react-router-dom";

export default function AgentPage() {
  const navigate = useNavigate();

  const benefits = [
    {
      title: "Exclusive Agent Rates",
      desc: "Access confidential contract rates on tours, hotels, and transfers reserved for our registered partners.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: "Instant Online Booking",
      desc: "Book and confirm your clients' tours, transfers, and accommodation in real time — no waiting for email replies.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Booking Dashboard",
      desc: "Track every reservation, voucher, and statement in one place. Full booking history at your fingertips.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m4 10V11m4 6V9M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Dedicated Support",
      desc: "A personal account manager and a 24/7 operations team on the ground in Southern Thailand.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829l4.243 2.828a1 1 0 001.415-1.414l-6.364-6.364a1 1 0 00-1.414 1.414l2.828 4.243z" />
        </svg>
      ),
    },
  ];

  const steps = [
    { no: "01", title: "Apply", desc: "Send us your company details and travel licence." },
    { no: "02", title: "Get Approved", desc: "We verify your agency and set up your account within 48 hours." },
    { no: "03", title: "Start Booking", desc: "Log in, view your rates, and book instantly." },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[460px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80"
            alt="Partner Agents"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 to-navy/60"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow/20 text-yellow font-body text-sm font-bold mb-6 backdrop-blur-sm border border-yellow/30">
              For Travel Agents & Tour Operators
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-xl">
              Agent Portal
            </h1>
            <p className="font-body text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-light drop-shadow-md">
              Our partner platform gives registered agents exclusive rates, live availability, and instant booking across all Indo Smile services in Southern Thailand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/agent/login")}
                className="bg-yellow text-navy px-10 py-4 rounded-xl font-body font-bold hover:bg-white hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                Agent Login
              </button>
              <button
                onClick={() => navigate("/about#contact")}
                className="border-2 border-white/60 text-white px-10 py-4 rounded-xl font-body font-bold hover:bg-white hover:text-navy transition-all duration-300"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">Why Partner With Indo Smile</h2>
            <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
              We act as your trusted local extension on the ground — so you can sell with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300 group"
              >
                <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-navy transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-heading text-2xl text-navy mb-4">{item.title}</h3>
                <p className="font-body text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">How It Works</h2>
            <div className="w-20 h-1 bg-yellow mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step) => (
              <div key={step.no} className="text-center">
                <div className="font-heading text-6xl text-yellow mb-4">{step.no}</div>
                <h3 className="font-heading text-2xl text-navy mb-3">{step.title}</h3>
                <p className="font-body text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login CTA */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-yellow" preserveAspectRatio="none">
            <polygon fill="currentColor" points="100,0 100,100 0,100" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6 leading-tight">
            Already an Indo Smile Partner?
          </h2>
          <p className="font-body text-lg text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Log in to your agent account to view contract rates and manage your bookings.
          </p>
          <button
            onClick={() => navigate("/agent/login")}
            className="bg-yellow text-navy px-10 py-4 rounded-xl font-body font-bold hover:bg-white transition-colors duration-300 shadow-lg"
          >
            Login to Agent Portal
          </button>
        </div>
      </section>
    </div>
  );
}
