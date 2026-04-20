import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/" || location.pathname === "/home";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !isScrolled && !isMenuOpen;

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "One Day Trip", path: "/inbound" },
    { name: "Transfer", path: "/transfer" },
    { name: "Hotels", path: "/hotels" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
  ];

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${isHome ? "fixed top-0" : "sticky top-0"} ${isTransparent ? "bg-transparent py-2 border-b border-white/10" : "bg-white shadow-md py-0"}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={handleMenuClick}
            >
              <img
                src="/Final Logo.png"
                alt="Indo Smile South Services"
                className={`h-12 w-auto transition-all duration-300 ${isTransparent ? "drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" : ""}`}
              />
              <div
                className={`font-heading text-3xl tracking-wide transition-colors duration-300 ${isTransparent ? "text-white" : "text-navy"}`}
              >
                INDO SMILE
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) =>
              item.disabled ? (
                <span
                  key={item.name}
                  title="Coming Soon"
                  className={`font-body font-medium cursor-default select-none transition-colors duration-200 ${
                    isTransparent ? "text-white/30" : "text-navy/30"
                  }`}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-body font-medium transition-colors duration-200 ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-navy hover:text-yellow"
                  } ${
                    location.pathname === item.path && !isTransparent
                      ? "text-yellow"
                      : ""
                  } ${
                    location.pathname === item.path && isTransparent
                      ? "font-bold text-white"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <button
              onClick={() => navigate("/about#contact")}
              className="bg-yellow text-navy px-6 py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden focus:outline-none transition-colors duration-300 ${isTransparent ? "text-white" : "text-navy"}`}
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
            {menuItems.map((item) =>
              item.disabled ? (
                <span
                  key={item.name}
                  className="block w-full text-left py-3 text-navy/30 font-body font-medium cursor-default select-none"
                >
                  {item.name}{" "}
                  <span className="text-xs text-navy/20 ml-1">Coming Soon</span>
                </span>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleMenuClick}
                  className={`block w-full text-left py-3 text-navy font-body font-medium hover:text-yellow transition-colors duration-200 ${
                    location.pathname === item.path ? "text-yellow" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ),
            )}
            <button
              onClick={() => {
                handleMenuClick();
                navigate("/about#contact");
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
