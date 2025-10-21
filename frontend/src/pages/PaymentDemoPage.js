import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentDemoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const gateway = searchParams.get('gateway');
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');

  const handlePaymentSuccess = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Simulate payment verification
      await fetch(`http://localhost:5000/api/payments/${gateway}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pidx: `demo_${Date.now()}`,
          data: `demo_data_${Date.now()}`
        })
      });

      navigate('/order-success', {
        state: { 
          orderId, 
          total: amount,
          message: `Demo ${gateway.toUpperCase()} Payment Successful!`
        }
      });
    } catch (error) {
      console.error('Payment demo error:', error);
    }
  };

  const handlePaymentFailure = () => {
    navigate('/payment-failure', {
      state: { 
        orderId,
        gateway 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">💳</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {gateway?.toUpperCase()} Payment Demo
          </h1>
          
          <div className="space-y-4 mb-8">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">This is a demo payment page</p>
              <p className="font-semibold">Amount: ${amount}</p>
              <p className="text-sm text-gray-500">Order: #{orderId}</p>
            </div>
            
            <p className="text-gray-600 text-sm">
              In a real application, you would be redirected to {gateway}'s payment gateway.
              For this demo, you can simulate successful or failed payments.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePaymentSuccess}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Simulate Successful Payment
            </button>
            
            <button
              onClick={handlePaymentFailure}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Simulate Failed Payment
            </button>
            
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-secondary"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemoPage;