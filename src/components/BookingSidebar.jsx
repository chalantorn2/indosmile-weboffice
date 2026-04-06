import { useState } from "react";
import DatePicker from "./DatePicker";

export default function BookingSidebar({ tour }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    adults: 1,
    children: 0,
    message: "",
  });

  const totalPrice = (formData.adults * (tour?.adultPrice || 0)) + (formData.children * (tour?.childPrice || 0));

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
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-24">
        {/* Price Header */}
        <div className="text-center mb-4 pb-4 border-b border-gray-100">
          <p className="font-body text-[11px] text-gray-400 uppercase tracking-wider mb-2">Price per person</p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-heading text-3xl text-navy">{tour.adultPrice?.toLocaleString()}</span>
            <span className="font-body text-xs text-gray-400">THB / adult</span>
          </div>
          {tour.childPrice && (
            <div className="flex items-baseline justify-center gap-1.5 mt-1.5">
              <span className="font-heading text-xl text-navy/60">{tour.childPrice.toLocaleString()}</span>
              <span className="font-body text-xs text-gray-400">THB / child</span>
            </div>
          )}
        </div>

        {/* Estimated Total */}
        {(formData.adults > 1 || formData.children > 0) && (
          <div className="bg-navy/5 rounded-xl p-3 mb-4">
            <div className="space-y-1 mb-2">
              {formData.adults > 0 && (
                <div className="flex items-center justify-between font-body text-xs text-gray-500">
                  <span>Adult × {formData.adults}</span>
                  <span>{(formData.adults * tour.adultPrice).toLocaleString()} THB</span>
                </div>
              )}
              {formData.children > 0 && tour.childPrice && (
                <div className="flex items-center justify-between font-body text-xs text-gray-500">
                  <span>Child × {formData.children}</span>
                  <span>{(formData.children * tour.childPrice).toLocaleString()} THB</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-navy/10">
              <span className="font-body text-sm font-semibold text-navy">Total</span>
              <span className="font-heading text-xl text-navy">{totalPrice.toLocaleString()} THB</span>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors" placeholder="+66 XXX" />
            </div>
          </div>
          <div>
            <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors" placeholder="john@example.com" />
          </div>
          <DatePicker
            value={formData.date}
            onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
            required
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
              <div>
                <p className="font-body text-sm font-semibold text-navy">Adults</p>
                <p className="font-body text-[10px] text-gray-400">Age 12+</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${formData.adults <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-navy/30 text-navy hover:bg-navy hover:text-white'}`}
                  disabled={formData.adults <= 1}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
                </button>
                <span className="font-body text-base font-bold text-navy w-5 text-center">{formData.adults}</span>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}
                  className="w-8 h-8 rounded-full border border-navy/30 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>
            {tour.childPrice && (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                <div>
                  <p className="font-body text-sm font-semibold text-navy">Children</p>
                  <p className="font-body text-[10px] text-gray-400">Age 3–11</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${formData.children <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-navy/30 text-navy hover:bg-navy hover:text-white'}`}
                    disabled={formData.children <= 0}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="font-body text-base font-bold text-navy w-5 text-center">{formData.children}</span>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, children: prev.children + 1 }))}
                    className="w-8 h-8 rounded-full border border-navy/30 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button type="submit"
            className="w-full bg-navy text-white py-2.5 rounded-xl font-body font-bold text-sm hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg mt-1">
            Book Now
          </button>
        </form>

        {/* Contact */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="font-body text-[10px] text-gray-400 text-center mb-1.5">Need help? Call us</p>
          <a href="tel:+66822536662" className="flex items-center justify-center gap-1.5 text-navy hover:text-yellow transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="font-body font-semibold text-sm">+66 82 253 6662</span>
          </a>
        </div>
      </div>
    </div>
  );
}
