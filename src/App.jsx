import { useState } from "react";
import Home from "./components/Home";
import InboundTours from "./components/InboundTours";
import BookingDetail from "./components/BookingDetail";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedTour, setSelectedTour] = useState(null);

  const handleTourSelect = (tour) => {
    setSelectedTour(tour);
    setCurrentPage("booking-detail");
  };

  const handleBackToTours = () => {
    setSelectedTour(null);
    setCurrentPage("inbound");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "inbound":
        return <InboundTours onTourSelect={handleTourSelect} />;
      case "booking-detail":
        return selectedTour ? (
          <BookingDetail tour={selectedTour} onBack={handleBackToTours} />
        ) : (
          <InboundTours onTourSelect={handleTourSelect} />
        );
      case "home":
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
