import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App"; // landing page
import AdminLogin from "./admin/AdminLogin"; 
import AdminDashboard from "./admin/AdminDashBoard";

export default function MainRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
