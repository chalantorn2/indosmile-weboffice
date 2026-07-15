import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "./DatePicker";

const API_BASE = '/backend/api';

export default function BookingSidebar({ tour }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    adults: 1,
    children: 0,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { success, message, reference }

  const totalPrice = (formData.adults * (tour?.adultPrice || 0)) + (formData.children * (tour?.childPrice || 0));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_BASE}/bookings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_id: tour.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          travel_date: formData.date,
          number_of_guests: formData.adults + formData.children,
          adults: formData.adults,
          children: formData.children,
          special_requests: formData.message || null,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.booking_reference) {
        // The status page is the receipt: it carries the reference, the next step,
        // and later the Pay Now button. Keep the customer there, not on this form.
        navigate(`/booking/${data.data.booking_reference}`);
        return;
      }

      setSubmitResult({ success: false, message: data.message || 'Failed to submit booking. Please try again.' });
    } catch {
      setSubmitResult({ success: false, message: 'Network error. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
        {/* Price Header */}
        <div className="text-center mb-3 pb-3 border-b border-gray-100">
          <p className="font-body text-[11px] text-gray-400 uppercase tracking-wider mb-1">Price per person</p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-heading text-3xl text-navy">{tour.adultPrice?.toLocaleString()}</span>
            <span className="font-body text-xs text-gray-400">THB / adult</span>
          </div>
          {tour.childPrice && (
            <div className="flex items-baseline justify-center gap-1.5 mt-1">
              <span className="font-heading text-xl text-navy/60">{tour.childPrice.toLocaleString()}</span>
              <span className="font-body text-xs text-gray-400">THB / child</span>
            </div>
          )}
        </div>

        {/* Estimated Total */}
        {(formData.adults > 1 || formData.children > 0) && (
          <div className="bg-navy/5 rounded-xl p-2.5 mb-3">
            <div className="space-y-1 mb-1.5">
              {formData.adults > 0 && (
                <div className="flex items-center justify-between font-body text-[13px] text-gray-500">
                  <span>Adult × {formData.adults}</span>
                  <span>{(formData.adults * tour.adultPrice).toLocaleString()} THB</span>
                </div>
              )}
              {formData.children > 0 && tour.childPrice && (
                <div className="flex items-center justify-between font-body text-[13px] text-gray-500">
                  <span>Child × {formData.children}</span>
                  <span>{(formData.children * tour.childPrice).toLocaleString()} THB</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-navy/10">
              <span className="font-body text-sm font-semibold text-navy">Total</span>
              <span className="font-heading text-xl text-navy">{totalPrice.toLocaleString()} THB</span>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors" placeholder="+66 XXX" />
            </div>
          </div>
          <div>
            <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors" placeholder="john@example.com" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-[14px]">
               <DatePicker
                 value={formData.date}
                 onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                 required
               />
            </div>
            <div>
              <label className="block font-body text-[11px] font-semibold text-navy mb-0.5">Special Requests</label>
              <textarea name="message" value={formData.message} onChange={handleInputChange} rows={1}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-yellow transition-colors resize-none" placeholder="Any special requests..." />
            </div>
          </div>
          
          <div className={`grid ${tour.childPrice ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            <div className="flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-1.5">
              <span className="font-body text-[13px] font-semibold text-navy truncate mr-2">Adults</span>
              <div className="flex items-center gap-2.5">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${formData.adults <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-navy/30 text-navy hover:bg-navy hover:text-white'}`}
                  disabled={formData.adults <= 1}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
                </button>
                <span className="font-body text-[13px] font-bold text-navy text-center min-w-[16px]">{formData.adults}</span>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}
                  className="w-5 h-5 rounded-full border border-navy/30 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>
            
            {tour.childPrice && (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-1.5">
                <span className="font-body text-[13px] font-semibold text-navy truncate mr-2">Child</span>
                <div className="flex items-center gap-2.5">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${formData.children <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-navy/30 text-navy hover:bg-navy hover:text-white'}`}
                    disabled={formData.children <= 0}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="font-body text-[13px] font-bold text-navy text-center min-w-[16px]">{formData.children}</span>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, children: prev.children + 1 }))}
                    className="w-5 h-5 rounded-full border border-navy/30 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting}
            className={`w-full bg-navy text-white py-2 rounded-xl font-body font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg mt-1 ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-opacity-90'}`}>
            {submitting ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Submitting...
              </span>
            ) : 'Book Now'}
          </button>

          {/* Success navigates away to the booking status page, so only failures land here. */}
          {submitResult && !submitResult.success && (
            <div className="mt-2 p-2 rounded-lg text-sm font-body bg-red-50 text-red-700 border border-red-200">
              <p className="font-semibold">{submitResult.message}</p>
            </div>
          )}
        </form>

        {/* Contact */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="font-body text-[11px] text-gray-400 text-center mb-1">Need help? Call us</p>
          <a href="tel:+66822536662" className="flex items-center justify-center gap-1.5 text-navy hover:text-yellow transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="font-body font-semibold text-[15px]">+66 82 253 6662</span>
          </a>
        </div>
      </div>
    </div>
  );
}
