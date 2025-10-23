// frontend/src/pages/EsewaPaymentPage.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EsewaPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, submitUrl } = location.state || {};

  useEffect(() => {
    if (!formData || !submitUrl) {
      console.error('❌ Missing eSewa payment data');
      navigate('/payment-failed', { 
        state: { error: 'Missing payment information' } 
      });
      return;
    }

    console.log('🔄 Auto-submitting eSewa form...');
    
    // Create and submit form automatically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = submitUrl;
    form.style.display = 'none';

    // Add all form data as hidden inputs
    Object.keys(formData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });

    // Add form to document and submit
    document.body.appendChild(form);
    console.log('📤 Submitting eSewa form to:', submitUrl);
    console.log('📋 Form data:', formData);
    form.submit();

    // Cleanup after submission
    return () => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    };
  }, [formData, submitUrl, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to eSewa</h2>
        <p className="text-gray-600">Please wait while we redirect you to the secure payment gateway...</p>
        <p className="text-sm text-gray-500 mt-4">If you are not redirected automatically, please check your pop-up blocker.</p>
        
        <button
          onClick={() => navigate('/checkout')}
          className="mt-6 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Checkout
        </button>
      </div>
    </div>
  );
};

export default EsewaPaymentPage;