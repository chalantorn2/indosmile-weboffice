import { useNavigate } from "react-router-dom";

export default function LandOperationsPage() {
  const navigate = useNavigate();
  const fleet = [
    {
      type: "Premium VIP Vans",
      capacity: "9-10 Passengers",
      features: ["Plush Captain Seats", "Free Wi-Fi", "USB Charging Ports", "Complimentary Water"],
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    },
    {
      type: "Luxury Coaches",
      capacity: "30-50 Passengers",
      features: ["Panoramic Windows", "Reclining Seats", "Onboard Restroom", "PA System for Guides"],
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
    },
    {
      type: "Private Sedans & SUVs",
      capacity: "2-4 Passengers",
      features: ["High-end Interiors", "Quiet Cabin", "Refreshments", "Discreet Professional Drivers"],
      image: "https://images.unsplash.com/photo-1549317661-a47734bbd828?w=800&q=80",
    }
  ];

  const services = [
    {
      title: "Airport Meet & Greet",
      desc: "Fast-track your arrival with our professional airport representatives holding personalized signage, ensuring a smooth transition from luggage claim to your waiting vehicle.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: "Professional Tour Guides",
      desc: "Licensed, multilingual guides who bring destinations to life through deep historical knowledge and warm, engaging storytelling.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Seamless Logistics",
      desc: "From complex corporate movements spanning multiple venues to simple A-to-B transfers, we manage every logistical detail flawlessly.",
      icon: (
        <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=80"
            alt="Premium Fleet and Ground Handling"
            className="w-full h-full object-cover"
          />
          {/* Dark sophisticated overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 to-navy/50"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
             <div className="inline-block px-4 py-1.5 rounded-full bg-yellow/20 text-yellow font-body text-sm font-bold mb-6 backdrop-blur-sm border border-yellow/30">
               Premium Ground Handling
             </div>
             <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-xl">
               Flawless Logistics & Transport Solutions
             </h1>
             <p className="font-body text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-light drop-shadow-md">
               From VIP airport transfers to large-scale corporate event mobility. We provide the highest standard of ground operations across Southern Thailand.
             </p>
             <button 
               onClick={() => navigate('/contact')}
               className="bg-yellow text-navy px-10 py-4 rounded-xl font-body font-bold text-center hover:bg-white hover:text-navy hover:-translate-y-1 transition-all duration-300 shadow-xl"
             >
               Request a Quote
             </button>
          </div>
        </div>
      </section>

      {/* Our Core Services */}
      <section className="py-24 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">Expert Services on the Ground</h2>
            <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
              We ensure your clients start, continue, and end their journey with absolute comfort and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300 group">
                <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-navy transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="font-heading text-2xl text-navy mb-4">{service.title}</h3>
                <p className="font-body text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Fleet Segment */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">Our Premium Fleet</h2>
                <p className="font-body text-lg text-gray-600">
                  Impeccably maintained vehicles driven by courteous, safety-trained professionals. We have the perfect vehicle for any group size.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               {fleet.map((vehicle, idx) => (
                 <div key={idx} className="rounded-2xl overflow-hidden shadow-xl group border border-gray-100">
                    <div className="h-64 overflow-hidden relative">
                       <img src={vehicle.image} alt={vehicle.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-navy font-body font-bold text-sm shadow-sm">
                         {vehicle.capacity}
                       </div>
                    </div>
                    <div className="p-8 bg-white">
                       <h3 className="font-heading text-2xl text-navy mb-6">{vehicle.type}</h3>
                       <ul className="space-y-3 mb-8">
                         {vehicle.features.map((feature, fIdx) => (
                           <li key={fIdx} className="flex items-center text-gray-600 font-body">
                             <svg className="w-5 h-5 text-yellow mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                             {feature}
                           </li>
                         ))}
                       </ul>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* B2B Partner Section */}
      <section className="py-24 bg-navy relative overflow-hidden">
        {/* Background abstract graphic */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full text-yellow" preserveAspectRatio="none">
             <polygon fill="currentColor" points="100,0 100,100 0,100" />
           </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="font-heading text-4xl md:text-5xl text-white mb-6 leading-tight">
                  Your Trusted Local Ground Partner in Thailand
                </h2>
                <div className="w-20 h-1 bg-yellow mb-8 md:mx-0 mx-auto rounded-full"></div>
                <p className="font-body text-lg text-gray-300 mb-8 leading-relaxed">
                  We specialize in acting as the reliable local extension for international travel agencies and tour operators. With Indo Smile wrapping your clients in our hospitality, your brand's reputation is safely guarded.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                   <button 
                     onClick={() => navigate('/contact')}
                     className="bg-yellow text-navy px-8 py-3.5 rounded-xl font-body font-bold hover:bg-white transition-colors duration-300 shadow-lg"
                   >
                     Partner With Us
                   </button>
                </div>
             </div>
             
             {/* Stats or trust markers */}
             <div className="grid grid-cols-2 gap-6 relative">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center shadow-2xl">
                   <div className="text-4xl text-yellow font-heading mb-2">1,000+</div>
                   <div className="text-white font-body text-sm font-medium">Transfers Annually</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center shadow-2xl translate-y-8">
                   <div className="text-4xl text-yellow font-heading mb-2">50+</div>
                   <div className="text-white font-body text-sm font-medium">Premium Vehicles</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center shadow-2xl">
                   <div className="text-4xl text-yellow font-heading mb-2">24/7</div>
                   <div className="text-white font-body text-sm font-medium">Ops Support</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center shadow-2xl translate-y-8">
                   <div className="text-4xl text-yellow font-heading mb-2">100%</div>
                   <div className="text-white font-body text-sm font-medium">Safety Record</div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Testimonial / Separator Section (Light Background) */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-navy mb-12">
            Trusted by Travelers & Agencies Worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Indo Smile has been our go-to handler in Phuket for 5 years. Flawless execution every time.",
                author: "Sarah L.",
                role: "International Tour Operator"
              },
              {
                text: "The VIP vans are pristine and the drivers are incredibly professional. Highly recommended.",
                author: "Mark D.",
                role: "Corporate Event Planner"
              },
              {
                text: "Seamless airport meet and greet. They made our clients feel like VIPs from the moment they landed.",
                author: "Elena G.",
                role: "Luxury Travel Advisor"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="text-yellow mb-4">
                  <svg className="w-8 h-8 mx-auto opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="font-body text-gray-600 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-heading text-navy font-semibold">{testimonial.author}</h4>
                  <p className="font-body text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
