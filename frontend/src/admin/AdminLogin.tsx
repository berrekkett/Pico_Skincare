import { useState } from "react";
import { api } from '../lib/api'; // your axios instance
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res: AxiosResponse<{ token: string }> = await api.post("/api/auth/login", {
      username,
      password
    });
    console.log(res.data); // now TypeScript knows the structure
    navigate("/admin"); // redirect to admin panel
  } catch (err: any) {
    setError(err.response?.data?.message || "Login failed");
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-rose-100 to-peach-100">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        <button className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition">
          Login
        </button>
      </form>
    </div>
  );
}
