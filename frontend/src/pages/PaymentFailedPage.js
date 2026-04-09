import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RotateCcw, ShoppingCart, Home, AlertTriangle } from 'lucide-react';

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'cancelled':
        return 'Payment was cancelled.';
      case 'payment_failed':
        return 'Payment processing failed. Please try again.';
      case 'signature_invalid':
        return 'Security verification failed. Please contact support.';
      case 'no_order_id':
        return 'Order information missing. Please contact support.';
      default:
        return 'Payment processing failed. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white/10 backdrop-blur-md border border-red-400/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <XCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-black text-white mb-3">Payment Failed</h1>

          <div className="mb-6 bg-red-500/15 border border-red-400/30 rounded-2xl p-4">
            <p className="text-red-100 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {getErrorMessage()}
            </p>
            {orderId && (
              <p className="text-sm text-red-200 mt-2">
                Order ID: <span className="font-mono">#{orderId}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              to="/checkout"
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Back to Checkout
            </Link>

            <Link
              to="/"
              className="w-full text-cyan-200 hover:text-cyan-100 py-2 text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;
