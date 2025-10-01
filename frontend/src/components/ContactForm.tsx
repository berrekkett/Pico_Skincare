import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

type Treatment = {
  _id?: string;
  title: string;
  description: string;
  price: string;
  duration: string;
};

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    treatment: '',
    notes: ''
  });
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load treatments for the dropdown
  useEffect(() => {
    const loadTreatments = async () => {
      try {
        const res = await api.get('/api/treatments');
        console.log('Treatments from API:', res.data); // Debug log
        
        // Transform backend data to match our Treatment type
        const transformedTreatments: Treatment[] = res.data.map((treatment: any) => ({
          _id: treatment._id,
          title: treatment.name || 'Treatment', // Map 'name' to 'title'
          description: treatment.description || '',
          price: `From $${treatment.price}`,
          duration: `${treatment.duration} min`
        }));
        
        setTreatments(transformedTreatments);
        console.log('Transformed treatments:', transformedTreatments); // Debug log
      } catch (err) {
        console.error('Failed to load treatments', err);
      }
    };
    loadTreatments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await api.post('/api/bookings', formData);
      setMessage('🎉 Booking submitted successfully! We will contact you shortly to confirm.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        treatment: '',
        notes: ''
      });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 
                      err?.response?.data?.errors?.[0]?.msg || 
                      'Failed to submit booking. Please try again.';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="bg-white rounded-2xl p-8 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Book Your Appointment</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+251 XXX XXX XXX"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date & Time *
            </label>
            <input
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Treatment
            </label>
            <select
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300"
            >
              <option value="">Select a treatment...</option>
              {treatments.map(treatment => (
                <option key={treatment._id} value={treatment.title}>
                  {treatment.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific concerns or preferences..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300 resize-none"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-400 to-peach-400 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            'Book Appointment Now'
          )}
        </motion.button>

        {message && (
          <motion.div 
            className={`p-4 rounded-lg text-center ${
              message.includes('❌') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {message}
          </motion.div>
        )}
      </div>
    </motion.form>
  );
}