import { useState, useEffect } from "react";

export default function ContactStrip() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/backend/api/public_settings.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch(() => {});
  }, []);

  const phone = settings?.site_phone || "082 253 6662";
  const email = settings?.site_email || "info@indosmilesouthservices.com";
  const address =
    settings?.site_address ||
    "199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110";

  const contactInfo = [
    {
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      label: "Phone",
      value: phone,
      href: `tel:${phone.split(/[\n,]+/)[0].replace(/\s+/g, "")}`,
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      label: "Address",
      value: address,
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
  ];

  return (
    <section id="contact" className="py-16 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 w-full">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.href}
                target={info.label === "Address" ? "_blank" : undefined}
                rel={
                  info.label === "Address" ? "noopener noreferrer" : undefined
                }
                className="flex items-start gap-4 text-white hover:text-yellow transition-colors duration-200"
              >
                <div className="shrink-0 text-yellow">{info.icon}</div>
                <div>
                  <div className="font-body font-semibold mb-1">
                    {info.label}
                  </div>
                  <div className="font-body text-sm text-gray-300">
                    {info.value}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="lg:ml-8">
            <a
              href={`mailto:${email}`}
              className="inline-block bg-yellow text-navy px-8 py-4 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-lg whitespace-nowrap"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
