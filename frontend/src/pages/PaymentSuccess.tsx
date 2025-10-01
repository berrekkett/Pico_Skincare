import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, Home, ArrowLeft, Receipt } from "lucide-react";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const tx_ref = params.get("tx_ref");

  useEffect(() => {
    const verifyPayment = async () => {
      if (tx_ref) {
        try {
          const res = await axios.get(`http://localhost:5000/api/payments/verify/${tx_ref}`);
          
          if (res.data.data.status === "success") {
            setStatus('success');
            setPaymentData(res.data.data);
          } else {
            setStatus('failed');
          }
        } catch (err) {
          console.error("Verification error:", err);
          setStatus('failed');
        }
      }
    };

    verifyPayment();
  }, [tx_ref]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && paymentData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Thank you for your payment</p>
            </div>

            {/* Payment Receipt */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-rose-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Payment Receipt</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold">{paymentData.service_name || "Skincare Treatment"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-600">{paymentData.amount} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{tx_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-500">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col space-y-3">
              <Link 
                to="/"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                <Receipt className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">❌</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Please try again or contact support.</p>
            <div className="flex flex-col space-y-3">
              <Link 
                to="/"
                className="flex items-center justify-center space-x-2 bg-rose-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-rose-600 transition-all duration-300"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}