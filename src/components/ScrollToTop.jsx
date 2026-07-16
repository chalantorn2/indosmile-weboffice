import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll reset for routes that do not run the customer-side page transition.
// Animated routes reset from AnimatePresence's onExitComplete in App.jsx —
// resetting here too would jump the outgoing page to the top mid-fade.
export default function ScrollToTop({ enabled = true }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!enabled) return;
    // Pages with a hash handle their own scrolling (e.g. /about#contact)
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, enabled]);

  return null;
}
