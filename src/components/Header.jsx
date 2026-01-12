import { useState } from "react";

export default function Header({ currentPage, setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", page: "home" },
    { name: "About", page: "home", scrollTo: "#about" },
    { name: "Inbound Tours", page: "inbound" },
    { name: "Outbound Tours", page: "outbound" },
    { name: "Land Operations", page: "home", scrollTo: "#land-operations" },
  ];

  const handleMenuClick = (item) => {
    if (item.page) {
      setCurrentPage(item.page);
    }
    if (item.scrollTo) {
      setTimeout(() => {
        document.querySelector(item.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="shrink-0">
            <a href="#home" className="flex items-center gap-3">
              <img
                src="/Final Logo.png"
                alt="Indo Smile South Services"
                className="h-12 w-auto"
              />
              <div className="text-navy font-heading text-3xl">INDO SMILE</div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item)}
                className={`text-navy font-body font-medium hover:text-yellow transition-colors duration-200 ${
                  currentPage === item.page && !item.scrollTo ? 'text-yellow' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              className="bg-yellow text-navy px-6 py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Contact Us
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-navy focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item)}
                className={`block w-full text-left py-3 text-navy font-body font-medium hover:text-yellow transition-colors duration-200 ${
                  currentPage === item.page && !item.scrollTo ? 'text-yellow' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block w-full mt-4 bg-yellow text-navy px-6 py-3 rounded-lg font-body font-semibold text-center hover:bg-opacity-90 transition-all duration-200"
            >
              Contact Us
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
