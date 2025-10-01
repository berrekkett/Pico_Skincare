import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  Mail, Youtube, Facebook, Instagram, Sparkles, Eye, Droplets, Zap, 
  Users, Award, Leaf, MapPin, Phone as PhoneIcon, Play, Star, Clock, 
  Shield, Heart, Menu, X 
} from 'lucide-react';
import { api } from './lib/api';
import Logo from './components/Logo';
import ContactForm from './components/ContactForm';
import CheckoutButton from "./components/CheckoutButton";


type SectionId = 'home' | 'about' | 'treatments' | 'contact';

type Treatment = {
  _id?: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  price: string;
  duration: string;
};

// Default treatments in case API fails
const defaultTreatments: Treatment[] = [
  { 
    icon: Sparkles, 
    title: "Classic Facial", 
    description: "Deep cleansing, exfoliation and hydration for a refreshed complexion", 
    price: "From $80", 
    duration: "60 min" 
  },
  { 
    icon: Eye, 
    title: "Eyebrow Waxing/Shaping", 
    description: "Perfectly shaped brows for a polished look", 
    price: "From $35", 
    duration: "30 min" 
  },
  { 
    icon: Droplets, 
    title: "Chemical Peel", 
    description: "Exfoliating treatment to improve skin texture and tone", 
    price: "From $120", 
    duration: "45 min" 
  },
  { 
    icon: Zap, 
    title: "HydraFacial", 
    description: "Multi-step treatment for instant hydration and glow", 
    price: "From $150", 
    duration: "75 min" 
  }
];

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [showAllTreatments, setShowAllTreatments] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [treatmentsFromAPI, setTreatmentsFromAPI] = useState<Treatment[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const socialLinks: Record<'youtube' | 'facebook' | 'tiktok' | 'instagram', string> = {
    youtube: 'https://youtube.com/@picoskincare',
    facebook: 'https://facebook.com/picoskincare',
    tiktok: 'https://tiktok.com/@betytesfaye',
    instagram: 'https://instagram.com/bety_tesfaye'
  };

  // Helper function to map icon strings to components
  const getTreatmentIcon = (iconName: string): React.ComponentType<any> => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      sparkles: Sparkles,
      eye: Eye,
      droplets: Droplets,
      zap: Zap,
      shield: Shield,
      leaf: Leaf,
      star: Star,
      heart: Heart,
      award: Award
    };
    return iconMap[iconName] || Sparkles;
  };

  // Load rating stats from backend
  const loadRatingStats = async () => {
    try {
      const res = await api.get('/api/ratings/stats');
      if (res.data.averageRating > 0) {
        setAverageRating(res.data.averageRating);
        setRatingCount(res.data.totalRatings);
      } else {
        setAverageRating(null);
        setRatingCount(0);
      }
    } catch (err) {
      console.error('Failed to load rating stats:', err);
      setAverageRating(null);
      setRatingCount(0);
    }
  };

  // Fetch treatments from API and transform data
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/treatments");
        
        // Transform backend data to frontend display format
        const transformedTreatments: Treatment[] = res.data.map((treatment: any) => ({
          _id: treatment._id,
          icon: getTreatmentIcon(treatment.icon || 'sparkles'),
          title: treatment.name || 'Treatment',
          description: treatment.description || 'Professional skincare treatment',
          price: `From $${treatment.price}`,
          duration: `${treatment.duration} min`
        }));
        
        setTreatmentsFromAPI(transformedTreatments);
      } catch (err) {
        console.error("Failed to fetch treatments", err);
        setTreatmentsFromAPI(defaultTreatments);
      }
    })();
  }, []);

  // Load rating stats when component mounts
  useEffect(() => {
    loadRatingStats();
  }, []);

  // Intersection observers for section tracking
  const { ref: homeRef, inView: homeInView } = useInView({ threshold: 0.6 });
  const { ref: aboutRef, inView: aboutInView } = useInView({ threshold: 0.6 });
  const { ref: treatmentsRef, inView: treatmentsInView } = useInView({ threshold: 0.6 });
  const { ref: contactRef, inView: contactInView } = useInView({ threshold: 0.6 });

  // Section change effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (homeInView) setActiveSection('home');
      else if (aboutInView) setActiveSection('about');
      else if (treatmentsInView) setActiveSection('treatments');
      else if (contactInView) setActiveSection('contact');
    }, 100);
    return () => clearTimeout(timeout);
  }, [homeInView, aboutInView, treatmentsInView, contactInView]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedTreatment || showVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTreatment, showVideo]);

  const openSocialLink = (platform: keyof typeof socialLinks) => {
    const url = socialLinks[platform];
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const scrollToSection = (sectionId: SectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Star Rating Component - Connected to Backend
  const StarRating = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
      if (rating === 0) return;
      
      setLoading(true);
      setMessage('');
      
      try {
        const res = await api.post('/api/ratings', { rating });
        
        setMessage(res.data.message);
        setSubmitted(true);
        
        // Update global stats
        setAverageRating(res.data.averageRating);
        setRatingCount(res.data.totalRatings);
        
      } catch (err: any) {
        setMessage(err?.response?.data?.error || 'Failed to submit rating. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex flex-col items-center my-8 p-6 bg-white rounded-2xl shadow-lg">
        <span className="text-lg font-semibold mb-2 text-gray-800">Rate Our Services:</span>
        <div className="flex space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <button 
              key={star} 
              type="button" 
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none transition-transform duration-200 hover:scale-110"
              disabled={submitted || loading}
            >
              <Star 
                className={`w-8 h-8 ${
                  star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                } ${submitted ? 'opacity-70' : ''}`}
                fill={star <= (hover || rating) ? '#facc15' : 'none'} 
              />
            </button>
          ))}
        </div>
        
        {rating > 0 && !submitted && !loading && (
          <motion.button
            className="mt-4 px-6 py-2 bg-rose-400 text-white rounded-full font-semibold hover:bg-rose-500 transition-all duration-300"
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Rating
          </motion.button>
        )}

        {loading && (
          <div className="flex items-center space-x-2 mt-4">
            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Submitting...</span>
          </div>
        )}

        {message && (
          <motion.div 
            className={`mt-4 px-4 py-2 rounded-lg text-center text-sm font-medium ${
              message.includes('Thank you') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.div>
        )}

        {submitted && !message.includes('already') && (
          <motion.div 
            className="mt-2 text-green-500 font-medium text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Thank you for your feedback! ✨
          </motion.div>
        )}
      </div>
    );
  };

  function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg 
        viewBox="0 0 32 32" 
        fill="currentColor" 
        width={props.width || 20} 
        height={props.height || 20} 
        {...props}
      >
        <path d="M24.5 7.5c-1.7-1.1-2.7-2.7-2.7-4.5h-4.1v20.2c0 2.1-1.7 3.8-3.8 3.8s-3.8-1.7-3.8-3.8c0-2.1 1.7-3.8 3.8-3.8.3 0 .6 0 .9.1v-4.2c-.3 0-.6-.1-.9-.1-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8V11.2c1.2.9 2.6 1.5 4.1 1.5V7.5h-2.4z"/>
      </svg>
    );
  }

  // Use API treatments if available, otherwise use defaults
  const allTreatments = treatmentsFromAPI.length > 0 ? treatmentsFromAPI : defaultTreatments;
  const displayedTreatments = showAllTreatments ? allTreatments : allTreatments.slice(0, 4);

  return (
    <div className="min-h-screen bg-white font-['Montserrat'] overflow-x-hidden">
      {/* Top Contact Bar */}
      <motion.div 
        className="bg-gradient-to-r from-rose-100 to-peach-100 py-2 px-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6 text-gray-700">
            <motion.div 
              className="flex items-center space-x-2 hover:text-rose-500 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <PhoneIcon size={14} />
              <span>+251911478337</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 hover:text-rose-500 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <Mail size={14} />
              <span>adeysaro@gmail.com</span>
            </motion.div>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.12, rotate: 5 }}>
              <Youtube 
                size={16} 
                className="text-gray-600 hover:text-rose-400 cursor-pointer transition-colors" 
                onClick={() => openSocialLink('youtube')} 
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.12, rotate: -5 }}>
              <Facebook 
                size={16} 
                className="text-gray-600 hover:text-rose-400 cursor-pointer transition-colors" 
                onClick={() => openSocialLink('facebook')} 
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.12, rotate: 5 }}>
              <TikTokIcon 
                className="text-gray-600 hover:text-rose-400 cursor-pointer transition-colors" 
                onClick={() => openSocialLink('tiktok')} 
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.12, rotate: -5 }}>
              <Instagram 
                size={16} 
                className="text-gray-600 hover:text-rose-400 cursor-pointer transition-colors" 
                onClick={() => openSocialLink('instagram')} 
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <motion.header 
        className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-rose-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection('home')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo className="w-12 h-12" />
              <div>
                <span className="text-xl font-bold text-gray-800 block leading-tight">
                  Pico Skincare & Cosmotics
                </span>
              </div>
            </motion.div>

            <nav className="hidden md:flex space-x-8 items-center">
              {[
                { label: 'Home', id: 'home' },
                { label: 'Services', id: 'treatments' },
                { label: 'About', id: 'about' },
                { label: 'Contact', id: 'contact' }
              ].map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => scrollToSection(section.id as SectionId)}
                  className={`relative text-gray-700 hover:text-rose-400 transition-colors font-medium uppercase tracking-wide ${
                    activeSection === section.id ? 'text-rose-400' : ''
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {section.label}
                  {activeSection === section.id && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-400 to-peach-400"
                      layoutId="activeSection"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
              <Link 
                to="/login" 
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition ml-4"
              >
                Admin Login
              </Link>
            </nav>

            <motion.button 
              className="md:hidden p-2 rounded-lg hover:bg-rose-50 transition-colors"
              onClick={() => setIsMenuOpen(prev => !prev)}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-rose-100"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-4 py-4 space-y-2">
                {[
                  { label: 'Home', id: 'home' },
                  { label: 'Services', id: 'treatments' },
                  { label: 'About', id: 'about' },
                  { label: 'Contact', id: 'contact' }
                ].map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => scrollToSection(section.id as SectionId)}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium uppercase tracking-wide transition-colors ${
                      activeSection === section.id 
                        ? 'bg-rose-50 text-rose-400' 
                        : 'text-gray-700 hover:bg-rose-50 hover:text-rose-400'
                    }`}
                    whileHover={{ x: 10 }}
                  >
                    {section.label}
                  </motion.button>
                ))}
                <Link 
                  to="/login" 
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium uppercase tracking-wide bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Modal for selected treatment */}
      <AnimatePresence>
        {selectedTreatment && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTreatment(null)}
            aria-modal="true"
            role="dialog"
          >
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-gray-500" 
                onClick={() => setSelectedTreatment(null)}
                aria-label="Close dialog"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col items-center">
                <selectedTreatment.icon className="w-12 h-12 text-rose-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">{selectedTreatment.title}</h3>
                <p className="text-gray-600 mb-4">{selectedTreatment.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTreatment.duration}</span>
                  <span className="font-semibold text-rose-400">{selectedTreatment.price}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <div 
              className="bg-white rounded-2xl p-4 shadow-2xl max-w-2xl w-full relative" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-2 right-2 text-gray-500" 
                onClick={() => setShowVideo(false)}
              >
                <X size={24} />
              </button>
              <iframe 
                className="w-full h-64 md:h-96 rounded-lg" 
                src="./sample.mp4" 
                title="About us video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HOME SECTION */}
      <section id="home" ref={homeRef} className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-peach-50 to-rose-100" />
        <div className="absolute inset-0 bg-black bg-opacity-5" />
        
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-rose-200 rounded-full opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-16 h-16 bg-peach-200 rounded-full opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Natural Beauty
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-peach-400"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {" "}Starts Here
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-600 leading-relaxed font-['Lora'] italic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Tailored skincare solutions for a healthy complexion, offering customized care for radiant skin with authentic Ethiopian beauty traditions.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button 
                  onClick={() => scrollToSection('contact')}
                  className="bg-gradient-to-r from-rose-400 to-peach-400 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(244, 63, 94, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  BOOK AN APPOINTMENT
                </motion.button>

                <motion.button 
                  className="flex items-center justify-center space-x-3 border-2 border-rose-300 text-gray-700 px-6 py-4 rounded-full font-semibold hover:bg-rose-50 transition-all duration-300"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(251, 113, 133, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVideo(true)}
                >
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-r from-rose-400 to-peach-400 rounded-full flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Play className="w-4 h-4 text-white fill-white" />
                  </motion.div>
                  <span>Watch Video</span>
                </motion.button>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        averageRating && i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                      }`} 
                      fill={averageRating && i < Math.floor(averageRating) ? '#facc15' : 'none'}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {averageRating ? `${averageRating.toFixed(1)}/5 Rating` : 'No ratings yet'}
                    {ratingCount > 0 && (
                      <span className="ml-2 text-gray-400">
                        ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-rose-400" />
                  <span className="text-sm text-gray-600">1k+ Happy Clients</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-rose-200 to-peach-200 rounded-3xl shadow-2xl overflow-hidden">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src="/model.webp" alt="Ethiopian Model" className="w-full h-full object-cover" />
                </motion.div>
                <motion.div 
                  className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-semibold text-gray-700">Skin Loving</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TREATMENTS SECTION */}
      <section id="treatments" ref={treatmentsRef} className="py-24 bg-gradient-to-br from-white via-rose-25 to-peach-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Indulge in our <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-peach-400">Luxurious Treatments</span>
            </h2>
            <p className="text-xl text-gray-600 font-['Lora'] italic max-w-2xl mx-auto">
              Experience the perfect blend of traditional Ethiopian beauty secrets and modern skincare technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {displayedTreatments.map((treatment, index) => (
              <motion.div
                key={treatment._id || treatment.title}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-rose-400 to-peach-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <treatment.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{treatment.title}</h3>
                <p className="text-gray-600 text-center font-['Lora'] mb-4">
                  {treatment.description}
                </p>

                {/* Duration & Price */}
                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{treatment.duration}</span>
                  </div>
                  <span className="font-semibold text-rose-400">{treatment.price}</span>
                </div>
              </motion.div>
            ))}
          </div>


          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {!showAllTreatments && allTreatments.length > 4 ? (
              <motion.button
                className="bg-gradient-to-r from-rose-400 to-peach-400 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(244, 63, 94, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllTreatments(true)}
              >
                DISCOVER MORE
              </motion.button>
            ) : showAllTreatments && allTreatments.length > 4 ? (
              <motion.button
                className="bg-gradient-to-r from-peach-400 to-rose-400 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(251, 113, 133, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllTreatments(false)}
              >
                SHOW LESS
              </motion.button>
            ) : null}
          </motion.div>

          {/* <StarRating /> */}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" ref={aboutRef} className="py-24 bg-gradient-to-br from-peach-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Committed to Your Skin's <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-peach-400">Health and Beauty</span>
            </h2>
            <p className="text-xl text-gray-600 font-['Lora'] italic max-w-2xl mx-auto">
              Rooted in Ethiopian beauty traditions, we combine ancient wisdom with cutting-edge skincare technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Award, number: "2 Years", label: "On Market", description: "Serving the Ethiopian beauty community with excellence" },
              { icon: Users, number: "1k+", label: "Happy Clients", description: "Trusted by thousands across Addis Ababa and beyond" },
              { icon: Leaf, number: "95%", label: "Natural Ingredients", description: "Sourced from Ethiopia's rich botanical heritage" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white rounded-2xl p-8 shadow-lg text-center group hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-rose-400 to-peach-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h3 
                  className="text-3xl font-bold text-gray-800 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.h3>
                <p className="text-gray-600 font-['Lora'] font-semibold mb-2">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.button 
              onClick={() => scrollToSection('contact')}
              className="bg-gradient-to-r from-rose-400 to-peach-400 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(244, 63, 94, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              CONTACT US
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" ref={contactRef} className="py-24 bg-gradient-to-br from-white via-rose-25 to-peach-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-peach-400">Info</span>
            </h2>
            <p className="text-xl text-gray-600 font-['Lora'] italic">
              Ready to start your skincare journey? We're here to help you achieve radiant, healthy skin.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Get In Touch</h3>
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <MapPin className="w-6 h-6 text-rose-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Address</h4>
                      <p className="text-gray-600">Sanford, 4kilo Addis Ababa Ethiopia</p>
                      <p className="text-sm text-gray-500">Near to Bel Air Hotel</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <PhoneIcon className="w-6 h-6 text-rose-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone</h4>
                      <p className="text-gray-600">+251911478337</p>
                      <p className="text-sm text-gray-500">Available 8 AM - 6 PM</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <Mail className="w-6 h-6 text-rose-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Email</h4>
                      <p className="text-gray-600">adeysaro@gmail.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 2 hours</p>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-rose-50 to-peach-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 text-rose-400 mr-2" />
                    Business Hours
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>10:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                </div>
                <StarRating />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer 
        className="bg-gray-800 text-white py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo className="w-10 h-10" />
                <span className="text-xl font-bold">Pico Skincare & Cosmo</span>
              </div>
              <p className="text-gray-300 font-['Lora'] italic mb-4">
                Where natural beauty meets modern skincare excellence in the heart of Addis Ababa.
              </p>
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <Youtube 
                    size={20} 
                    className="text-gray-300 hover:text-rose-400 cursor-pointer transition-colors" 
                    onClick={() => openSocialLink('youtube')} 
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.2, rotate: -5 }}>
                  <Facebook 
                    size={20} 
                    className="text-gray-300 hover:text-rose-400 cursor-pointer transition-colors" 
                    onClick={() => openSocialLink('facebook')} 
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <TikTokIcon 
                    className="text-gray-300 hover:text-rose-400 cursor-pointer transition-colors" 
                    onClick={() => openSocialLink('tiktok')} 
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.2, rotate: -5 }}>
                  <Instagram 
                    size={20} 
                    className="text-gray-300 hover:text-rose-400 cursor-pointer transition-colors" 
                    onClick={() => openSocialLink('instagram')} 
                  />
                </motion.div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: 'Home', id: 'home' },
                  { label: 'Services', id: 'treatments' },
                  { label: 'About', id: 'about' },
                  { label: 'Contact', id: 'contact' }
                ].map(link => (
                  <motion.button
                    key={link.id}
                    onClick={() => scrollToSection(link.id as SectionId)}
                    className="block text-gray-300 hover:text-rose-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p>Sanford, 4kilo Addis Ababa Ethiopia</p>
                <p>+251911478337</p>
                <p>adeysaro@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-300">
              © 2025 Pico Skincare & Cosmo Salon. All rights reserved. | Natural Beauty Starts Here
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}