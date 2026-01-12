import Hero from './Hero';
import ServiceCards from './ServiceCards';
import FeaturedTours from './FeaturedTours';
import WhyChooseUs from './WhyChooseUs';
import AboutSection from './AboutSection';
import ContactStrip from './ContactStrip';

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceCards />
      <FeaturedTours />
      <WhyChooseUs />
      <AboutSection />
      <ContactStrip />
    </>
  );
}
