import React, { useState } from 'react';
import { api } from '../lib/api';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [treatment, setTreatment] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/bookings', {
        name, email, phone, treatment, date, notes
      });
      setMessage('Booking submitted! We will contact you shortly.');
      setName(''); setEmail(''); setPhone(''); setDate(''); setNotes('');
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow">
      <div className="grid grid-cols-1 gap-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" required />
        <input value={date} onChange={e => setDate(e.target.value)} type="datetime-local" required />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"></textarea>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Submitting...' : 'Book Appointment'}</button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    </form>
  );
}
