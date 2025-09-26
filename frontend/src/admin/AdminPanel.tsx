import { useEffect, useState } from "react";
import { api } from '../lib/api';

type Treatment = {
  _id?: string;
  title: string;
  description: string;
  price: string;
  duration: string;
};

export default function AdminPanel() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [newTreatment, setNewTreatment] = useState<Treatment>({
    title: "",
    description: "",
    price: "",
    duration: ""
  });

  const fetchTreatments = async () => {
    try {
      const res = await api.get("/api/treatments");
      setTreatments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/treatments", newTreatment);
      setTreatments([res.data, ...treatments]);
      setNewTreatment({ title: "", description: "", price: "", duration: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

      <form onSubmit={handleAddTreatment} className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Add New Treatment</h3>
        <input
          type="text"
          placeholder="Title"
          value={newTreatment.title}
          onChange={(e) => setNewTreatment({ ...newTreatment, title: e.target.value })}
          className="w-full p-3 mb-2 border rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={newTreatment.description}
          onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
          className="w-full p-3 mb-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Price"
          value={newTreatment.price}
          onChange={(e) => setNewTreatment({ ...newTreatment, price: e.target.value })}
          className="w-full p-3 mb-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Duration"
          value={newTreatment.duration}
          onChange={(e) => setNewTreatment({ ...newTreatment, duration: e.target.value })}
          className="w-full p-3 mb-2 border rounded-lg"
        />
        <button className="bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition">
          Add Treatment
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4">Existing Treatments</h3>
        <ul className="space-y-2">
          {treatments.map((t) => (
            <li key={t._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <span>{t.title}</span>
                <span className="text-rose-500">{t.price}</span>
              </div>
              <p className="text-gray-600">{t.description}</p>
              <p className="text-gray-400 text-sm">Duration: {t.duration}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
