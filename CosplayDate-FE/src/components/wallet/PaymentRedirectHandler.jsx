// Create: src/components/PaymentRedirectHandler.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    
    console.log('🔄 Handling malformed payment URL:', path);
    
    // Handle malformed PayOS URLs
    if (path.startsWith('/payment/cancel')) {
      // Extract query parameters from malformed URL
      const urlParts = path.split('?');
      const queryString = urlParts[1] || '';
      
      // Redirect to proper cancel route
      navigate(`/payment/cancel?${queryString}`, { replace: true });
      return;
    }
    
    if (path.startsWith('/payment/success')) {
      // Extract query parameters from malformed URL  
      const urlParts = path.split('?');
      const queryString = urlParts[1] || '';
      
      // Redirect to proper success route
      navigate(`/payment/success?${queryString}`, { replace: true });
      return;
    }

    // If not a payment URL, redirect to home
    console.log('❌ Unknown payment URL, redirecting to home');
    navigate('/', { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div>🔄 Redirecting payment...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        Processing payment callback URL
      </div>
    </div>
  );
};

export default PaymentRedirectHandler;