import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Clock,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { api } from './lib/api'; // <-- axios instance

type SectionId = "home" | "about" | "treatments" | "contact";

type Treatment = {
  _id?: string; // from MongoDB
  title: string;
  description: string;
  price: string;
  duration: string;
};

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] =
    useState<Treatment | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const [treatmentsFromAPI, setTreatmentsFromAPI] = useState<Treatment[]>([]);

  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const treatmentsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // fetch from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/treatments");
        setTreatmentsFromAPI(res.data); // expect array
      } catch (err) {
        console.error("Failed to fetch treatments", err);
      }
    })();
  }, []);

  // observe scroll position for nav highlight
  useEffect(() => {
    const sections = {
      home: homeRef,
      about: aboutRef,
      treatments: treatmentsRef,
      contact: contactRef,
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(sections).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      Object.values(sections).forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <header className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <span className="text-xl font-bold text-rose-500">Skin Clinic</span>
          <nav className="hidden md:flex space-x-8">
            {["home", "about", "treatments", "contact"].map((sec) => (
              <a
                key={sec}
                href={`#${sec}`}
                className={`capitalize hover:text-rose-500 ${
                  activeSection === sec ? "text-rose-500 font-semibold" : ""
                }`}
              >
                {sec}
              </a>
            ))}
            <Link
              to="/login"
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition"
            >
              Admin Login
            </Link>


          </nav>
          <button
            className="md:hidden text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 w-full z-40">
          <nav className="flex flex-col space-y-4 p-4">
            {["home", "about", "treatments", "contact"].map((sec) => (
              <a
                key={sec}
                href={`#${sec}`}
                className={`capitalize hover:text-rose-500 ${
                  activeSection === sec ? "text-rose-500 font-semibold" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {sec}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Home Section */}
      <section
        id="home"
        ref={homeRef}
        className="h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 to-peach-100"
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Discover Your True Glow
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Professional skin care treatments to bring out your natural beauty.
          </p>
          <a
            href="#treatments"
            className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition"
          >
            Explore Treatments
          </a>
        </motion.div>
      </section>

      {/* About Section */}
      <section
        id="about"
        ref={aboutRef}
        className="py-24 bg-gradient-to-br from-white via-peach-25 to-rose-25"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">About Us</h2>
            <p className="text-gray-600 mb-6">
              We are a team of certified skin specialists with years of
              experience in delivering personalized treatments. Our mission is to
              help you achieve radiant and healthy skin in a relaxing
              environment.
            </p>
            <button
              className="flex items-center text-rose-500 font-semibold"
              onClick={() => setShowVideo(true)}
            >
              ▶ Watch Video
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img
              src="/about-image.jpg"
              alt="About us"
              className="rounded-2xl shadow-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Treatments Section */}
      <section
        id="treatments"
        ref={treatmentsRef}
        className="py-24 bg-gradient-to-br from-white via-rose-25 to-peach-25"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Our Treatments
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from a wide variety of treatments carefully curated for
              your skin.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatmentsFromAPI.map((treatment, idx) => (
              <motion.div
                key={treatment._id || idx}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
                whileHover={{ y: -5 }}
                onClick={() => setSelectedTreatment(treatment)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-800">
                    {treatment.title}
                  </span>
                  <span className="text-rose-500 font-bold">
                    {treatment.price}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{treatment.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {treatment.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        ref={contactRef}
        className="py-24 bg-gradient-to-br from-peach-50 to-rose-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-6">
              Book your appointment today or reach out for any inquiries.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3 text-rose-500" />
                <span>+123 456 7890</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3 text-rose-500" />
                <span>info@skinclinic.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-rose-500" />
                <span>123 Glow Street, Beauty City</span>
              </div>
            </div>
            <div className="flex space-x-6 mt-6">
              <a href="#" className="text-gray-600 hover:text-rose-500">
                <Instagram />
              </a>
              <a href="#" className="text-gray-600 hover:text-rose-500">
                <Facebook />
              </a>
              <a href="#" className="text-gray-600 hover:text-rose-500">
                <Twitter />
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <form className="bg-white rounded-2xl shadow-lg p-8">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 mb-4 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 mb-4 border rounded-lg"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full p-3 mb-4 border rounded-lg"
              />
              <button className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Treatment Modal */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-bold mb-4">
              {selectedTreatment.title}
            </h3>
            <p className="text-gray-600 mb-4">{selectedTreatment.description}</p>
            <p className="font-semibold text-rose-500 mb-2">
              {selectedTreatment.price}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Duration: {selectedTreatment.duration}
            </p>
            <button
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition"
              onClick={() => setSelectedTreatment(null)}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative w-11/12 md:w-3/4 lg:w-1/2">
            <iframe
              className="w-full h-64 md:h-96 rounded-xl"
              src="https://www.youtube.com/embed/your-video-id"
              title="About us video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button
              className="absolute -top-10 right-0 text-white text-3xl"
              onClick={() => setShowVideo(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
