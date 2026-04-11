import { useState } from 'react';

export default function FeaturedTours() {
  const [activeTab, setActiveTab] = useState('inbound');

  const tours = {
    inbound: [
      {
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
        name: 'Phuket Island Hopping',
        description: '3-day adventure exploring Phi Phi Islands, James Bond Island, and pristine beaches.',
        duration: '3 Days',
        price: 'From 15,000 THB',
      },
      {
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
        name: 'Krabi Adventure',
        description: 'Experience rock climbing, kayaking, and stunning limestone karsts of Krabi.',
        duration: '4 Days',
        price: 'From 18,000 THB',
      },
      {
        image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600',
        name: 'Cultural Phuket Tour',
        description: 'Discover Old Town Phuket, temples, and authentic local cuisine experiences.',
        duration: '2 Days',
        price: 'From 8,000 THB',
      },
    ],
    outbound: [
      {
        image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600',
        name: 'Tokyo Experience',
        description: 'Modern meets traditional in this comprehensive Tokyo exploration package.',
        duration: '5 Days',
        price: 'From 45,000 THB',
      },
      {
        image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600',
        name: 'Singapore Discovery',
        description: 'Gardens by the Bay, Marina Bay, and world-class shopping destinations.',
        duration: '4 Days',
        price: 'From 28,000 THB',
      },
      {
        image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600',
        name: 'Bali Paradise',
        description: 'Beach resorts, rice terraces, and cultural temples of Bali.',
        duration: '6 Days',
        price: 'From 32,000 THB',
      },
    ],
    incentive: [
      {
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
        name: 'Corporate Retreat Phuket',
        description: 'Team building activities with luxury resort accommodation and meetings.',
        duration: '3 Days',
        price: 'Custom Quote',
      },
      {
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
        name: 'Executive Golf Package',
        description: 'Premium golf courses combined with networking and relaxation.',
        duration: '4 Days',
        price: 'Custom Quote',
      },
    ],
  };

  const tabs = [
    { id: 'inbound', label: 'One Day Trip' },
    { id: 'outbound', label: 'Outbound Tours' },
    { id: 'incentive', label: 'Incentive Programs' },
  ];

  return (
    <section className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl text-navy mb-4">
            Featured Tours
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated selection of travel experiences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-body font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-yellow text-navy shadow-md'
                  : 'bg-white text-navy hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tour Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours[activeTab].map((tour, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              <div className="h-48 bg-gray-300 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-2xl text-navy mb-2">
                  {tour.name}
                </h3>
                <p className="font-body text-gray-600 mb-4 leading-relaxed">
                  {tour.description}
                </p>

                {/* Details */}
                <div className="flex justify-between items-center mb-4 font-body text-sm text-gray-500">
                  <span>{tour.duration}</span>
                  <span className="font-semibold text-navy">{tour.price}</span>
                </div>

                {/* CTA */}
                <a
                  href="#contact"
                  className="block w-full bg-navy text-white text-center py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
