import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AgentPage from "./pages/AgentPage";
import AgentLogin from "./pages/AgentLogin";
import AgentLayout from "./pages/agent/AgentLayout";
import AgentTours from "./pages/agent/AgentTours";
import AgentTourDetail from "./pages/agent/AgentTourDetail";
import AgentProfile from "./pages/agent/AgentProfile";
import AgentPassword from "./pages/agent/AgentPassword";
import StripeTest from "./pages/StripeTest";
import ChillPayTest from "./pages/ChillPayTest";

// Signed-in agents get their own chrome (AgentLayout), not the customer nav.
// /agent and /agent/login stay on the public site — they are how an agent gets in.
const AGENT_PORTAL_PATH = /^\/agent\/(tours|profile|password)\b/;

function App() {
  const { pathname } = useLocation();
  const inAgentPortal = AGENT_PORTAL_PATH.test(pathname);

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!inAgentPortal && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/land-operations" element={<LandOperationsPage />} />
          <Route path="/inbound" element={<InboundTours />} />
          <Route path="/shows-adventures" element={<ShowsAdventures />} />
          <Route path="/shows-adventures/:id" element={<ShowDetail />} />
          <Route path="/booking-detail/:id" element={<TourDetail />} />
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

          <Route path="/stripe-test" element={<StripeTest />} />
          <Route path="/chillpay-test" element={<ChillPayTest />} />
          <Route path="/contact" element={<Navigate to="/about#contact" replace />} />
        </Routes>
      </main>
      {!inAgentPortal && <Footer />}
    </div>
  );
}

export default App;
