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
  const isCompact = isScrolled && !isMenuOpen;

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Island Tours", path: "/inbound" },
    { name: "Shows & Adventures", path: "/shows-adventures" },
    { name: "Transfer", path: "/transfer" },
    { name: "Hotels", path: "/hotels" },
    { name: "Blog", path: "/blog" },
    { name: "Agent", path: "/agent" },
    { name: "About", path: "/about" },
  ];

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${isHome ? "fixed top-0" : "sticky top-0"} ${isTransparent ? "bg-transparent border-b border-white/10" : "bg-white shadow-md"}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${isCompact ? "h-16" : "h-20"}`}
        >
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
                className={`w-auto transition-all duration-300 ${isCompact ? "h-9" : "h-12"} ${isTransparent ? "drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" : ""}`}
              />
              <div
                className={`font-heading tracking-wide transition-all duration-300 ${isCompact ? "text-2xl" : "text-3xl"} ${isTransparent ? "text-white" : "text-navy"}`}
              >
                INDO SMILE
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center gap-6">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              if (item.disabled) {
                return (
                  <span
                    key={item.name}
                    title="Coming Soon"
                    className={`font-body text-[15px] font-medium cursor-default select-none ${
                      isTransparent ? "text-white/30" : "text-navy/30"
                    }`}
                  >
                    {item.name}
                  </span>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative font-body text-[15px] py-1 transition-colors duration-200 ${
                    isTransparent
                      ? isActive
                        ? "text-white font-semibold"
                        : "text-white/80 hover:text-white font-medium"
                      : isActive
                        ? "text-navy font-semibold"
                        : "text-navy/70 hover:text-navy font-medium"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-0.5 w-full bg-yellow origin-center transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden xl:block">
            <button
              onClick={() => navigate("/about#contact")}
              className={`px-6 rounded-lg font-body font-semibold transition-all duration-300 ${isCompact ? "py-2.5" : "py-3"} ${
                isTransparent
                  ? "bg-white/10 backdrop-blur-sm border border-white/70 text-white hover:bg-white hover:text-navy"
                  : "bg-yellow text-navy border border-transparent hover:bg-opacity-90"
              }`}
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className={`xl:hidden focus:outline-none transition-colors duration-300 ${isTransparent ? "text-white" : "text-navy"}`}
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
          <div className="xl:hidden py-4 border-t border-gray-200">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              if (item.disabled) {
                return (
                  <span
                    key={item.name}
                    className="block w-full text-left py-3 text-navy/30 font-body font-medium cursor-default select-none"
                  >
                    {item.name}{" "}
                    <span className="text-xs text-navy/20 ml-1">
                      Coming Soon
                    </span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleMenuClick}
                  aria-current={isActive ? "page" : undefined}
                  className={`block w-full text-left py-3 pl-3 font-body transition-colors duration-200 border-l-2 ${
                    isActive
                      ? "border-yellow text-navy font-semibold bg-navy/5"
                      : "border-transparent text-navy/70 hover:text-navy font-medium"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
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
