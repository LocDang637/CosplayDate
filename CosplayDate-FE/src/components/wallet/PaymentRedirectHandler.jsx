// src/components/wallet/PaymentRedirectHandler.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fullPath = location.pathname + location.search;
    
    // console.log('🔄 Handling malformed payment URL:', fullPath);
    // console.log('📍 Path:', location.pathname);
    // console.log('🔍 Search:', location.search);
    
    // Handle malformed PayOS URLs
    if (location.pathname.includes('/payment/cancel')) {
      // console.log('🔄 Processing cancel payment URL...');
      
      // Extract parameters from the malformed URL
      let queryParams = '';
      
      // Case 1: /payment/cancelOrderCode=123&other=params
      if (location.pathname.includes('OrderCode=')) {
        const pathParts = location.pathname.split('OrderCode=');
        if (pathParts.length > 1) {
          // Extract orderCode and other params from path
          const paramString = pathParts[1];
          queryParams = `orderCode=${paramString}`;
          
          // Add any existing search params
          if (location.search) {
            queryParams += '&' + location.search.substring(1);
          }
        }
      }
      // Case 2: /payment/cancel with existing search params
      else if (location.search) {
        queryParams = location.search.substring(1);
      }
      
      // console.log('📝 Extracted query params:', queryParams);
      
      // Redirect to proper cancel route
      navigate(`/payment/cancel?${queryParams}`, { replace: true });
      return;
    }
    
    if (location.pathname.includes('/payment/success')) {
      // console.log('🔄 Processing success payment URL...');
      
      // Extract parameters from the malformed URL
      let queryParams = '';
      
      // Case 1: /payment/successOrderCode=123&other=params
      if (location.pathname.includes('OrderCode=')) {
        const pathParts = location.pathname.split('OrderCode=');
        if (pathParts.length > 1) {
          // Extract orderCode and other params from path
          const paramString = pathParts[1];
          queryParams = `orderCode=${paramString}`;
          
          // Add any existing search params
          if (location.search) {
            queryParams += '&' + location.search.substring(1);
          }
        }
      }
      // Case 2: /payment/success with existing search params
      else if (location.search) {
        queryParams = location.search.substring(1);
      }
      
      // console.log('📝 Extracted query params:', queryParams);
      
      // Redirect to proper success route
      navigate(`/payment/success?${queryParams}`, { replace: true });
      return;
    }

    // Handle any other malformed payment URLs
    if (location.pathname.startsWith('/payment/')) {
      // console.log('❓ Unknown payment URL format, trying to extract parameters...');
      
      // Try to extract any orderCode from the path
      const orderCodeMatch = fullPath.match(/orderCode=([^&]+)/i);
      const codeMatch = fullPath.match(/code=([^&]+)/i);
      const statusMatch = fullPath.match(/status=([^&]+)/i);
      
      if (orderCodeMatch) {
        let queryParams = `orderCode=${orderCodeMatch[1]}`;
        if (codeMatch) queryParams += `&code=${codeMatch[1]}`;
        if (statusMatch) queryParams += `&status=${statusMatch[1]}`;
        
        // Determine if it's success or cancel based on status
        if (statusMatch && statusMatch[1].toLowerCase().includes('cancel')) {
          // console.log('🔄 Redirecting to cancel based on status');
          navigate(`/payment/cancel?${queryParams}`, { replace: true });
        } else {
          // console.log('🔄 Redirecting to success as default');
          navigate(`/payment/success?${queryParams}`, { replace: true });
        }
        return;
      }
    }

    // If we can't parse it, redirect to home
    // console.log('❌ Could not parse payment URL, redirecting to home');
    navigate('/', { replace: true });
  }, [location.pathname, location.search, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ fontSize: '24px' }}>🔄 Redirecting payment...</div>
      <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Processing payment callback URL<br/>
        <code style={{ background: '#f5f5f5', padding: '4px' }}>
          {location.pathname + location.search}
        </code>
      </div>
    </div>
  );
};

export default PaymentRedirectHandler;
