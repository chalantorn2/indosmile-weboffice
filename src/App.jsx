import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import InboundTours from "./components/InboundTours";
import TourDetail from "./components/TourDetail";
import ContactUs from "./components/ContactUs";
import Hotels from "./components/Hotels";
import HotelDetail from "./components/HotelDetail";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AboutPage from "./components/AboutPage";
import LandOperationsPage from "./components/LandOperationsPage";
import BlogPage from "./components/BlogPage";
import BlogDetail from "./components/BlogDetail";
import TransferPage from "./components/TransferPage";

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
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

