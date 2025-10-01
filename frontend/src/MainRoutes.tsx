import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App"; // landing page
import AdminLogin from "./admin/AdminLogin"; 
import AdminDashboard from "./admin/AdminDashBoard";
import PaymentSuccess from "./pages/PaymentSuccess";

export default function MainRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </Router>
  );
}
