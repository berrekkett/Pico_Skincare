import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Calendar, Users, DollarSign, 
  Clock, Mail, Phone, MapPin, LogOut, Menu, X,
  Sparkles, Eye, Droplets, Zap, Shield, Leaf, Star, Heart, Award
} from 'lucide-react';

// Frontend type (what we display)
type Treatment = {
  _id?: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
};

type Booking = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  treatment?: string; // Optional
  treatmentTitle: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string; // Optional
};

type Rating = {
  _id: string;
  rating: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'treatments' | 'analytics' | 'ratings'>('bookings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0
  });

  // Frontend form state
  const [newTreatment, setNewTreatment] = useState<Treatment>({
    title: '',
    description: '',
    price: '',
    duration: '',
    icon: 'sparkles'
  });

  const iconOptions = [
    { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { value: 'eye', label: 'Eye', icon: Eye },
    { value: 'droplets', label: 'Droplets', icon: Droplets },
    { value: 'zap', label: 'Zap', icon: Zap },
    { value: 'shield', label: 'Shield', icon: Shield },
    { value: 'leaf', label: 'Leaf', icon: Leaf },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'award', label: 'Award', icon: Award }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      nav('/admin/login');
      return;
    }
    loadData();
  }, [nav]);

  // Transform backend data to frontend format
  const transformBackendToFrontend = (backendData: any[]): Treatment[] => {
    return backendData.map(item => ({
      _id: item._id,
      title: item.name,
      description: item.description || '',
      price: `From $${item.price}`,
      duration: `${item.duration} min`,
      icon: item.icon || 'sparkles'
    }));
  };

  // Load ratings data
  const loadRatings = async () => {
    try {
      const [ratingsRes, statsRes] = await Promise.all([
        api.get('/api/ratings'),
        api.get('/api/ratings/stats')
      ]);
      setRatings(ratingsRes.data);
      setRatingStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load ratings', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, treatmentsRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/treatments')
      ]);
      setBookings(bookingsRes.data);
      setTreatments(transformBackendToFrontend(treatmentsRes.data));
      
      // Load ratings if on ratings tab
      if (activeTab === 'ratings') {
        await loadRatings();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load ratings when ratings tab is active
  useEffect(() => {
    if (activeTab === 'ratings') {
      loadRatings();
    }
  }, [activeTab]);

  const setStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await api.put(`/api/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(p => p._id === id ? { ...p, status } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Selected icon before sending:', newTreatment.icon);
    console.log('🔍 Full treatment data:', newTreatment);
    
    try {
      const backendData = {
        name: newTreatment.title,
        description: newTreatment.description,
        price: parseInt(newTreatment.price) || 0,
        duration: parseInt(newTreatment.duration) || 0,
        icon: newTreatment.icon
      };
      
      console.log('🔍 Data being sent to backend:', backendData);
      
      if (editingTreatment) {
        await api.put(`/api/treatments/${editingTreatment._id}`, backendData);
      } else {
        await api.post('/api/treatments', backendData);
      }
      await loadData();
      setShowAddTreatment(false);
      setEditingTreatment(null);
      setNewTreatment({ title: '', description: '', price: '', duration: '', icon: 'sparkles' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save treatment');
    }
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setNewTreatment(treatment);
    setShowAddTreatment(true);
  };

  const handleDeleteTreatment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        await api.delete(`/api/treatments/${id}`);
        await loadData();
      } catch (err) {
        setError('Failed to delete treatment');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    nav('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    totalTreatments: treatments.length,
    revenue: bookings.filter(b => b.status === 'confirmed').length * 100
  };

  const SelectedIcon = iconOptions.find(opt => opt.value === newTreatment.icon)?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-peach-50 to-rose-100">
      {/* Header */}
      <motion.header 
        className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-rose-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-peach-400 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800 block leading-tight">
                  Pico Admin Dashboard
                </span>
                <span className="text-sm text-gray-600">Manage your skincare business</span>
              </div>
            </motion.div>

            <nav className="hidden md:flex space-x-8 items-center">
              {[
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'treatments', label: 'Treatments', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: DollarSign },
                { id: 'ratings', label: 'Ratings', icon: Star }
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 text-gray-700 hover:text-rose-400 transition-colors font-medium uppercase tracking-wide ${
                      activeTab === tab.id ? 'text-rose-400' : ''
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
              <motion.button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-700 hover:text-rose-400 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
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
                  { id: 'bookings', label: 'Bookings', icon: Calendar },
                  { id: 'treatments', label: 'Treatments', icon: Users },
                  { id: 'analytics', label: 'Analytics', icon: DollarSign },
                  { id: 'ratings', label: 'Ratings', icon: Star }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg font-medium uppercase tracking-wide transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-rose-50 text-rose-400' 
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-400'
                      }`}
                      whileHover={{ x: 10 }}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </motion.button>
                  );
                })}
                <motion.button
                  onClick={logout}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-400 transition-colors"
                  whileHover={{ x: 10 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-blue-400 to-cyan-400' },
            { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'from-yellow-400 to-orange-400' },
            { label: 'Treatments', value: stats.totalTreatments, icon: Users, color: 'from-green-400 to-emerald-400' },
            { label: 'Revenue', value: `$${stats.revenue}`, icon: DollarSign, color: 'from-purple-400 to-pink-400' }
          ].map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="bg-white rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center`}>
                    <StatIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Bookings Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Client Info</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Treatment</th> {/* Keep this */}
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Date & Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking, index) => (
                        <motion.tr
                          key={booking._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-800">{booking.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span>{booking.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                <span>{booking.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-gray-800 font-medium">{booking.treatment || 'Not specified'}</p>
                              {booking.notes && (
                                <p className="text-xs text-gray-500 mt-1">Notes: {booking.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600">{new Date(booking.date).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={booking.status}
                              onChange={(e) => setStatus(booking._id, e.target.value as any)}
                              className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(booking.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'treatments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Treatments Management</h2>
              <motion.button
                onClick={() => setShowAddTreatment(true)}
                className="bg-gradient-to-r from-rose-400 to-peach-400 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Treatment</span>
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((treatment, index) => {
                const TreatmentIcon = iconOptions.find(opt => opt.value === treatment.icon)?.icon || Sparkles;
                return (
                  <motion.div
                    key={treatment._id}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-peach-400 rounded-full flex items-center justify-center">
                        <TreatmentIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleEditTreatment(treatment)}
                          className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTreatment(treatment._id!)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{treatment.title}</h3>
                    <p className="text-gray-600 mb-4">{treatment.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{treatment.duration}</span>
                      </div>
                      <span className="font-semibold text-rose-400">{treatment.price}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {treatments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No treatments added yet</p>
                <motion.button
                  onClick={() => setShowAddTreatment(true)}
                  className="bg-gradient-to-r from-rose-400 to-peach-400 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Add Your First Treatment
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Analytics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-rose-50 to-peach-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
                  <div className="space-y-3">
                    {['pending', 'confirmed', 'cancelled'].map(status => {
                      const count = bookings.filter(b => b.status === status).length;
                      const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize text-gray-600">{status}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  status === 'confirmed' ? 'bg-green-400' :
                                  status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking._id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-rose-400 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{booking.name}</p>
                          <p className="text-xs text-gray-500">{booking.treatmentTitle}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating Statistics in Analytics */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-800">{ratingStats.averageRating.toFixed(1)}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Ratings</p>
                    <p className="text-2xl font-bold text-gray-800">{ratingStats.totalRatings}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ratings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Customer Ratings & Reviews</h2>
              </div>
              
              {/* Rating Stats */}
              <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-rose-50 to-peach-50">
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-800">{ratingStats.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-3">{ratingStats.totalRatings}</div>
                  <p className="text-sm text-gray-600">Total Ratings</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-3">
                    {ratingStats.totalRatings > 0 ? Math.round((ratingStats.averageRating / 5) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Satisfaction Rate</p>
                </div>
              </div>

              {/* Ratings List */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Ratings</h3>
                <div className="space-y-4">
                  {ratings.map((rating, index) => (
                    <motion.div
                      key={rating._id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill={i < rating.rating ? '#facc15' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{rating.rating}/5</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()} at{' '}
                          {new Date(rating.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">IP:</span> {rating.ipAddress}
                      </div>
                    </motion.div>
                  ))}
                  
                  {ratings.length === 0 && (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No ratings yet</p>
                      <p className="text-sm text-gray-400 mt-1">Customer ratings will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Treatment Modal */}
      <AnimatePresence>
        {showAddTreatment && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddTreatment(false);
              setEditingTreatment(null);
              setNewTreatment({ title: '', description: '', price: '', duration: '', icon: 'sparkles' });
            }}
          >
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddTreatment(false);
                  setEditingTreatment(null);
                  setNewTreatment({ title: '', description: '', price: '', duration: '', icon: 'sparkles' });
                }}
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
              </h3>

              <form onSubmit={handleAddTreatment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Icon
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {iconOptions.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => setNewTreatment(prev => ({ ...prev, icon: option.value }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            newTreatment.icon === option.value
                              ? 'border-rose-400 bg-rose-50'
                              : 'border-gray-200 hover:border-rose-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <OptionIcon className="w-6 h-6 text-gray-600 mx-auto" />
                          <span className="text-xs mt-1 text-gray-600">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTreatment.title}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    placeholder="e.g., Classic Facial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={newTreatment.description}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    placeholder="Describe the treatment..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Number) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newTreatment.price.replace(/\D/g, '')}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      placeholder="e.g., 80"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter number only (will display as "From $X")</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newTreatment.duration.replace(/\D/g, '')}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      placeholder="e.g., 60"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter minutes only (will display as "X min")</p>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-rose-400 to-peach-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingTreatment ? 'Update Treatment' : 'Add Treatment'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowAddTreatment(false);
                      setEditingTreatment(null);
                      setNewTreatment({ title: '', description: '', price: '', duration: '', icon: 'sparkles' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}