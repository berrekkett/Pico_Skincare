import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Loader } from "lucide-react";

const CheckoutButton = ({ amount, serviceName }: { amount: number; serviceName: string }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      
      // Generate unique transaction reference
      const tx_ref = "tx-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      
      console.log("🔍 Starting payment:", { amount, serviceName, tx_ref });
      
      const res = await axios.post("http://localhost:5000/api/payments/pay", {
        amount,
        email: "bereketakuraye@gmail.com", // You should collect this from user form
        first_name: "Bereket",
        last_name: "Ayalew", 
        tx_ref,
        serviceName,
      });

      console.log("🔍 Payment initialized:", res.data);
      
      // Redirect to Chapa checkout
      if (res.data.data && res.data.data.checkout_url) {
        window.location.href = res.data.data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
      
    } catch (err: any) {
      console.error("❌ Payment error:", err);
      alert(`Payment failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handlePay}
      disabled={loading}
      className={`
        w-full mt-4 px-4 py-3 rounded-xl font-semibold transition-all duration-300
        flex items-center justify-center space-x-2
        ${loading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
        }
      `}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>Pay {amount} ETB</span>
        </>
      )}
    </motion.button>
  );
};

export default CheckoutButton;