import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Mail, Phone, CreditCard, Loader, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import axios from 'axios';

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
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [paymentStep, setPaymentStep] = useState<'form' | 'summary'>('form');

  // Load treatments for the dropdown
  useEffect(() => {
    const loadTreatments = async () => {
      try {
        const res = await api.get('/api/treatments');
        console.log('Treatments from API:', res.data);
        
        const transformedTreatments: Treatment[] = res.data.map((treatment: any) => ({
          _id: treatment._id,
          title: treatment.name || 'Treatment',
          description: treatment.description || '',
          price: `From $${treatment.price}`,
          duration: `${treatment.duration} min`
        }));
        
        setTreatments(transformedTreatments);
      } catch (err) {
        console.error('Failed to load treatments', err);
      }
    };
    loadTreatments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update selected treatment when treatment dropdown changes
    if (name === 'treatment') {
      const treatment = treatments.find(t => t.title === value);
      setSelectedTreatment(treatment || null);
    }
  };

  const handleBookOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await api.post('/api/bookings', formData);
      setMessage('🎉 Booking submitted successfully! We will contact you shortly to confirm.');
      resetForm();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 
                      err?.response?.data?.errors?.[0]?.msg || 
                      'Failed to submit booking. Please try again.';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. First create the booking
      const bookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        treatment: formData.treatment,
        date: formData.date,
        notes: formData.notes,
        status: 'pending'
      };

      const bookingRes = await api.post('/api/bookings', bookingData);
      console.log('✅ Booking created:', bookingRes.data);

      // 2. Then initiate payment
      if (selectedTreatment) {
        const amount = parseInt(selectedTreatment.price.replace(/\D/g, "")) || 500;
        const tx_ref = "tx-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
        
        const paymentRes = await axios.post("http://localhost:5000/api/payments/pay", {
          amount,
          email: formData.email,
          first_name: formData.name.split(' ')[0],
          last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
          tx_ref,
          serviceName: selectedTreatment.title,
          bookingId: bookingRes.data._id
        });

        console.log('✅ Payment initiated:', paymentRes.data);
        
        // 3. Redirect to Chapa checkout
        if (paymentRes.data.data && paymentRes.data.data.checkout_url) {
          window.location.href = paymentRes.data.data.checkout_url;
        } else {
          throw new Error('No checkout URL received');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Booking/Payment error:', error);
      setMessage(`❌ ${error.response?.data?.error || error.message || 'Booking failed. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      treatment: '',
      notes: ''
    });
    setSelectedTreatment(null);
    setPaymentStep('form');
  };

  const today = new Date().toISOString().split('T')[0];
  const minDateTime = new Date();
  minDateTime.setDate(minDateTime.getDate() + 1); // Tomorrow

  return (
    <motion.form 
      onSubmit={paymentStep === 'summary' ? handleBookAndPay : handleBookOnly}
      className="bg-white rounded-2xl p-8 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-peach-400 rounded-full flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Book Your Appointment</h3>
          <p className="text-gray-600">Fill in your details and secure your spot</p>
        </div>
      </div>
      
      {paymentStep === 'form' ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
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
                <Mail className="w-4 h-4 inline mr-2" />
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
                <Phone className="w-4 h-4 inline mr-2" />
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
                <Calendar className="w-4 h-4 inline mr-2" />
                Preferred Date & Time *
              </label>
              <input
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                min={minDateTime.toISOString().slice(0, 16)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Sparkles className="w-4 h-4 inline mr-2" />
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
                    {treatment.title} - {treatment.price}
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
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {selectedTreatment && (
              <motion.button
                type="button"
                onClick={() => setPaymentStep('summary')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CreditCard className="w-5 h-5" />
                <span>Book & Pay Now</span>
              </motion.button>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-rose-400 text-rose-500 py-4 rounded-xl font-semibold hover:bg-rose-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Book Now, Pay Later</span>
              )}
            </motion.button>
          </div>

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
      ) : (
        /* Payment Summary Step */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-rose-50 to-peach-50 rounded-xl p-6 border border-rose-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-rose-500" />
              Payment Summary
            </h4>
            
            {selectedTreatment && (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-rose-100">
                  <div>
                    <p className="font-semibold text-gray-800">{selectedTreatment.title}</p>
                    <p className="text-sm text-gray-500">{selectedTreatment.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-rose-500">{selectedTreatment.price}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-800">Total Amount</span>
                  <span className="text-xl font-bold text-green-600">{selectedTreatment.price}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-2">Booking Details</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Date:</strong> {new Date(formData.date).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setPaymentStep('form')}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Back
            </button>
            
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now</span>
                </>
              )}
            </motion.button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You'll be redirected to secure payment page
          </p>
        </motion.div>
      )}
    </motion.form>
  );
}