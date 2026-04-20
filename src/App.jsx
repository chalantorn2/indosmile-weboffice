import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import InboundTours from "./pages/InboundTours";
import TourDetail from "./pages/TourDetail";
import Hotels from "./pages/Hotels";
import HotelDetail from "./pages/HotelDetail";
import LandOperationsPage from "./pages/LandOperationsPage";
import BlogPage from "./pages/BlogPage";
import BlogDetail from "./pages/BlogDetail";
import TransferPage from "./pages/TransferPage";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/land-operations" element={<LandOperationsPage />} />
          <Route path="/inbound" element={<InboundTours />} />
          <Route path="/booking-detail/:id" element={<TourDetail />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/contact" element={<Navigate to="/about#contact" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

