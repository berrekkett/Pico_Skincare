import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return nav('/admin/login');

    (async () => {
      try {
        const b = await api.get('/api/bookings');
        setBookings(b.data);
        const t = await api.get('/api/treatments');
        setTreatments(t.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load');
      }
    })();
  }, []);

  const setStatus = async (id: string, status: string) => {
    await api.put(`/api/bookings/${id}/status`, { status });
    setBookings(prev => prev.map(p => p._id === id ? { ...p, status } : p));
  };

  return (
    <div className="p-6">
      <h2>Bookings</h2>
      {error && <p>{error}</p>}
      <table className="w-full">
        <thead><tr><th>Name</th><th>Treatment</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b._id}>
              <td>{b.name}<br/>{b.email}<br/>{b.phone}</td>
              <td>{b.treatmentTitle}</td>
              <td>{new Date(b.date).toLocaleString()}</td>
              <td>
                <select value={b.status} onChange={(e) => setStatus(b._id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8">Treatments</h2>
      <ul>
        {treatments.map(t => <li key={t._id}>{t.title} — {t.price}</li>)}
      </ul>
    </div>
  );
}
