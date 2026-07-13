import Hero from '../components/Hero';
import ServiceCards from '../components/ServiceCards';
import WhyChooseUs from '../components/WhyChooseUs';
import ContactStrip from '../components/ContactStrip';
import FeaturedTours from '../sections/FeaturedTours';
import AboutSection from '../sections/AboutSection';

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceCards />
      <FeaturedTours />
      <WhyChooseUs />
      <AboutSection />
      {/* <ContactStrip /> */}
    </>
  );
}
