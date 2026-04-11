export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1920&q=80"
            alt="About Us Hero"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for sophisticated dark premium look */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/60 to-navy/90"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 drop-shadow-lg">
            Our Story
          </h1>
          <p className="font-body text-lg md:text-xl text-gray-200 leading-relaxed font-light">
            Crafting unforgettable journeys with passion, expertise, and a commitment to excellence in every detail.
          </p>
        </div>
      </section>

      {/* Who We Are & Heritage */}
      <section className="py-24 bg-light-gray relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl relative z-10 w-full md:w-11/12">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"
                  alt="Our Heritage"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              {/* Decorative Accent */}
              <div className="absolute -bottom-6 -right-6 w-3/4 h-3/4 border-4 border-yellow rounded-2xl z-0 hidden md:block"></div>
            </div>

            {/* Content Side */}
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-yellow/20 text-yellow font-body text-sm font-semibold mb-6">
                Established 2011
              </div>
              <h2 className="font-heading text-4xl md:text-5xl text-navy mb-8 leading-tight">
                Pioneering Exceptional Travel Experiences
              </h2>
              <div className="space-y-6 font-body text-gray-600 leading-relaxed text-lg">
                <p>
                  Indo Smile South Services was founded with a singular vision: to transform ordinary trips into extraordinary memories. We are a premier travel management company based in the heart of Southern Thailand.
                </p>
                <p>
                  Our dedicated team brings decades of combined experience in the hospitality and tourism sectors. We pride ourselves on offering bespoke travel solutions that cater precisely to our clients' unique desires, whether it's a tranquil beach escape, an adventurous inland trek, or a high-profile corporate incentive program.
                </p>
                <p className="font-medium text-navy border-l-4 border-yellow pl-4 italic">
                  "Our reputation is built on trust, impeccable service, and a deep understanding of the destinations we offer."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Glassmorphism Style */}
      <section className="py-24 relative bg-navy overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <svg className="absolute w-[800px] h-[800px] -right-40 -top-40 text-yellow" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
           <svg className="absolute w-[600px] h-[600px] -left-20 -bottom-20 text-white/5" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">Our Purpose</h2>
            <div className="w-24 h-1 bg-yellow mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-2xl hover:bg-white/15 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-heading text-3xl text-white mb-4">Our Vision</h3>
              <p className="font-body text-gray-300 text-lg leading-relaxed">
                To be the most trusted and innovative travel partner in Southeast Asia, continuously redefining the standards of premium travel and delivering unparalleled value to every single guest.
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-2xl hover:bg-white/15 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading text-3xl text-white mb-4">Our Mission</h3>
              <p className="font-body text-gray-300 text-lg leading-relaxed">
                To provide flawless, end-to-end travel services through meticulous planning, local expertise, and a relentless dedication to customer satisfaction, ensuring every journey is safe, enriching, and deeply memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">Why Choose Us</h2>
            <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
              Our core values are the foundation of everything we do and how we deliver excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Value 1 */}
            <div className="p-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow group-hover:scale-110 transition-all duration-300">
                <svg className="w-10 h-10 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-navy mb-3">Reliability</h3>
              <p className="font-body text-gray-600">
                We are a dependable partner, meticulously handling every logistical detail so you can travel with complete peace of mind.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="p-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow group-hover:scale-110 transition-all duration-300">
                <svg className="w-10 h-10 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-navy mb-3">Local Expertise</h3>
              <p className="font-body text-gray-600">
                Our deep-rooted local knowledge unlocks hidden gems and authentic experiences that go beyond the standard tourist trail.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow group-hover:scale-110 transition-all duration-300">
                <svg className="w-10 h-10 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-navy mb-3">Service Excellence</h3>
              <p className="font-body text-gray-600">
                We are fiercely committed to surpassing expectations, delivering warm, personalized, and proactive service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Placeholders */}
      {/* <section className="py-24 bg-light-gray">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">Meet the Experts</h2>
             <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto mb-16">
               Leading a dedicated team that is passionate about sharing the beauty of Southeast Asia with the world.
             </p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                      <div className="h-64 bg-gray-200 overflow-hidden relative">
                         <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-all duration-300 z-10"></div>
                         <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?placeholderIfNotFound=true&w=400&h=400`} alt="Team Member" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 blur-sm grayscale group-hover:grayscale-0 group-hover:blur-0" />
                                         <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            <span className="bg-white/80 text-navy px-4 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">Team Data Needed</span>
                         </div>
                      </div>
                      <div className="p-6">
                         <h3 className="font-heading text-xl text-navy mb-1">Coming Soon</h3>
                         <p className="font-body text-yellow font-medium text-sm">Position</p>
                      </div>
                   </div>
                ))}
             </div>
         </div>
      </section> */}

    </div>
  );
}
