import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { fadeFromLeft, fadeFromRight, viewportOnce } from "../lib/motion";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            variants={fadeFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="order-2 lg:order-1"
          >
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
                alt="About Indo Smile South Services"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={fadeFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="order-1 lg:order-2"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-navy mb-6">
              About Indo Smile South Services
            </h2>

            <div className="space-y-4 font-body text-gray-700 leading-relaxed">
              <p>
                Indo Smile South Services is a professional travel agency based in Phuket,
                specializing in comprehensive travel solutions for both inbound and outbound
                tourism across Southern Thailand.
              </p>

              <p>
                With years of experience in the industry, we have built a reputation for
                excellence in land operations, ticketing services, and corporate incentive
                travel programs. Our team of dedicated professionals ensures every journey
                is seamless and memorable.
              </p>

              <p className="font-semibold text-navy">
                Our Mission: To deliver exceptional travel experiences through professional
                service, local expertise, and unwavering commitment to customer satisfaction.
              </p>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center mt-8 text-yellow font-semibold hover:text-navy transition-colors duration-200 font-body"
            >
              Learn More About Us
              <svg
                className="inline-block w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
