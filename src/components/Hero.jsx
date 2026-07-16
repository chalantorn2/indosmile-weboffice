import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { EASE_OUT, fadeUp } from "../lib/motion";

// The h1 is this page's LCP element. Fading it in from opacity 0 would delay the
// LCP timestamp by the full animation, so it only slides — it is painted, and
// measurable, from the first frame. Everything below it fades normally.
const heroHeadline = {
  hidden: { y: 12 },
  visible: { y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const heroGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative bg-gray-900 min-h-[600px] flex items-center"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-navy">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
          {/* Fallback image if video fails to load or before it loads */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920')] bg-cover bg-center"></div>
        </video>
        
        {/* Navy Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20 lg:pt-48 lg:pb-32 w-full">
        <motion.div
          variants={heroGroup}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          {/* Headline */}
          <motion.h1
            variants={heroHeadline}
            className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-lg"
          >
            Professional Travel & Land Operation Services
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="font-body text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl drop-shadow-md"
          >
            Your trusted partner for inbound and outbound tours, comprehensive
            land operations, ticketing services, and corporate incentive
            programs across Southern Thailand.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-6 justify-center w-full"
          >
            <Link
              to="/inbound"
              className="inline-block bg-yellow text-navy px-10 py-4 rounded-xl font-body font-bold text-center hover:bg-white hover:text-navy hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              Plan Your Trip
            </Link>
            <Link
              to="/about#contact"
              className="inline-block bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-xl font-body font-bold text-center hover:bg-white/20 hover:text-white transition-all duration-300"
            >
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
