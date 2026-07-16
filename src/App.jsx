import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import InboundTours from "./pages/InboundTours";
import ShowsAdventures from "./pages/ShowsAdventures";
import ShowDetail from "./pages/ShowDetail";
import TourDetail from "./pages/TourDetail";
import Hotels from "./pages/Hotels";
import HotelDetail from "./pages/HotelDetail";
import LandOperationsPage from "./pages/LandOperationsPage";
import BlogPage from "./pages/BlogPage";
import BlogDetail from "./pages/BlogDetail";
import TransferPage from "./pages/TransferPage";
import BookingStatus from "./pages/BookingStatus";
import AgentPage from "./pages/AgentPage";
import AgentLogin from "./pages/AgentLogin";
import AgentLayout from "./pages/agent/AgentLayout";
import AgentTours from "./pages/agent/AgentTours";
import AgentTourDetail from "./pages/agent/AgentTourDetail";
import AgentProfile from "./pages/agent/AgentProfile";
import AgentPassword from "./pages/agent/AgentPassword";
import StripeTest from "./pages/StripeTest";
import ChillPayTest from "./pages/ChillPayTest";
import PaymentResult from "./pages/PaymentResult";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminTours from "./pages/admin/Tours";
import AdminBookings from "./pages/admin/Bookings";
import AdminAgents from "./pages/admin/Agents";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminShows from "./pages/admin/Shows";
import AdminBlog from "./pages/admin/Blog";
import AdminHotels from "./pages/admin/Hotels";
import AdminTransfers from "./pages/admin/Transfers";
import AdminMessages from "./pages/admin/Messages";
import AdminImport from "./pages/admin/Import";
import AdminPaymentLink from "./pages/admin/PaymentLink";

// Signed-in agents get their own chrome (AgentLayout), not the customer nav.
// /agent and /agent/login stay on the public site — they are how an agent gets in.
const AGENT_PORTAL_PATH = /^\/agent\/(tours|profile|password)\b/;
// The admin owns its own chrome (AdminLayout / AdminLogin) — never the customer nav.
const ADMIN_PATH = /^\/admin\b/;

function App() {
  const location = useLocation();
  const { pathname, hash } = location;
  const inAgentPortal = AGENT_PORTAL_PATH.test(pathname);
  const inAdmin = ADMIN_PATH.test(pathname);
  const hideCustomerChrome = inAgentPortal || inAdmin;

  // The portals navigate like an app, not like a site: a fade on every sidebar
  // click reads as lag. Holding the key constant across them means no exit/enter
  // cycle fires, so only customer-side navigation animates.
  const transitionKey = hideCustomerChrome ? "app-chrome" : pathname;

  return (
    <div className="min-h-screen bg-white">
      {/* The customer-side transition owns its own scroll reset (below), so
          ScrollToTop only covers the routes that never animate. */}
      <ScrollToTop enabled={hideCustomerChrome} />
      {!hideCustomerChrome && <Header />}
      <main>
        <AnimatePresence
          mode="wait"
          // initial={false} skips the enter animation on first mount. Without it
          // the whole page — Hero's LCP h1 included — starts at opacity 0 and
          // the first paint is blank, which is the exact cost Hero avoids.
          // Route-to-route navigation still animates normally.
          initial={false}
          onExitComplete={() => {
            // Runs after the outgoing page is gone, so the reset is never
            // visible as the old content jumping to the top mid-fade.
            // Hash routes scroll themselves (see ScrollToTop).
            if (!hash) window.scrollTo(0, 0);
          }}
        >
          <motion.div
            key={transitionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/land-operations" element={<LandOperationsPage />} />
          <Route path="/inbound" element={<InboundTours />} />
          <Route path="/shows-adventures" element={<ShowsAdventures />} />
          <Route path="/shows-adventures/:id" element={<ShowDetail />} />
          <Route path="/booking-detail/:id" element={<TourDetail />} />
          <Route path="/booking/:reference" element={<BookingStatus />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/agent/login" element={<AgentLogin />} />

          {/* Agent portal — AgentLayout guards the session for every child.
              Tours is the landing page: it is the only thing an agent comes here for. */}
          <Route element={<AgentLayout />}>
            <Route path="/agent/tours" element={<AgentTours />} />
            <Route path="/agent/tours/:id" element={<AgentTourDetail />} />
            <Route path="/agent/profile" element={<AgentProfile />} />
            <Route path="/agent/password" element={<AgentPassword />} />
          </Route>
          <Route path="/agent/dashboard" element={<Navigate to="/agent/tours" replace />} />

          {/* Admin — AdminLayout guards the session for every child.
              Migration is module-by-module: new React modules become child routes
              here, the rest still open the legacy PHP admin from the sidebar. */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="tours" element={<AdminTours />} />
            <Route path="shows" element={<AdminShows />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="transfers" element={<AdminTransfers />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="import" element={<AdminImport />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="payment-link" element={<AdminPaymentLink />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/stripe-test" element={<StripeTest />} />
          <Route path="/chillpay-test" element={<ChillPayTest />} />
          <Route path="/payment-result" element={<PaymentResult />} />
              <Route path="/contact" element={<Navigate to="/about#contact" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideCustomerChrome && <Footer />}
    </div>
  );
}

export default function AppWithMotion() {
  // reducedMotion="user" makes every Motion animation in the tree respect the OS
  // setting, matching the prefers-reduced-motion guard already in index.css.
  return (
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  );
}
