// src/pages/BookingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import PageLayout from '../components/layout/PageLayout';
import BookingServiceSelect from '../components/booking/BookingServiceSelect';
import BookingSchedule from '../components/booking/BookingSchedule';
import BookingWaitingConfirmation from '../components/booking/BookingWaitingConfirmation';
import BookingSuccessConfirmation from '../components/booking/BookingSuccessConfirmation';
import { cosplayerAPI } from '../services/cosplayerAPI';
import { bookingAPI } from '../services/bookingAPI';

const steps = ['Chọn dịch vụ', 'Chọn thời gian', 'Chờ xác nhận', 'Hoàn tất'];

const BookingPage = () => {
  const { cosplayerId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking data
  const [cosplayer, setCosplayer] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('Pending');
  
  // Polling ref
  const pollingIntervalRef = useRef(null);

  // Load initial data
  useEffect(() => {
    if (cosplayerId) {
      loadInitialData();
    }
  }, [cosplayerId]);

  // Poll for booking status updates when waiting for confirmation
  useEffect(() => {
    if (activeStep === 2 && bookingResult?.id) {
      // Start polling for booking status
      startStatusPolling();
      
      return () => {
        // Cleanup polling on unmount
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [activeStep, bookingResult]);

  const startStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 288; // 24 hours with 5-second intervals
    
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      
      try {
        const result = await bookingAPI.getBookingDetails(bookingResult.id);
        if (result.success && result.data) {
          const newStatus = result.data.status;
          setBookingStatus(newStatus);
          
          // Stop polling and navigate based on status
          if (newStatus === 'Confirmed') {
            clearInterval(pollingIntervalRef.current);
            setActiveStep(3);
          } else if (newStatus === 'Cancelled') {
            clearInterval(pollingIntervalRef.current);
            setActiveStep(3);
          }
        }
      } catch (error) {
        console.error('Error polling booking status:', error);
        
        // Optional: Show error after multiple failures
        if (pollCount > 3) {
          setError('Không thể kiểm tra trạng thái đặt lịch. Vui lòng tải lại trang.');
        }
      }
      
      // Auto-cancel if no response after 24 hours
      if (pollCount >= maxPolls) {
        clearInterval(pollingIntervalRef.current);
        setBookingStatus('Cancelled');
        setActiveStep(3);
      }
    }, 5000);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load cosplayer details
      const cosplayerResult = await cosplayerAPI.getCosplayerDetails(cosplayerId);
      if (!cosplayerResult.success) {
        throw new Error(cosplayerResult.message);
      }
      setCosplayer(cosplayerResult.data);

      // Load services
      const servicesResult = await cosplayerAPI.getServices(cosplayerId);
      if (servicesResult.success && servicesResult.data.length > 0) {
        setServices(servicesResult.data);
        
        // Update cosplayer name if provided
        if (servicesResult.cosplayerName && cosplayer) {
          setCosplayer({
            ...cosplayer,
            displayName: servicesResult.cosplayerName
          });
        }
      } else {
        setServices([]);
        setError('Cosplayer này chưa có dịch vụ nào.');
      }

    } catch (err) {
      console.error('Failed to load booking data:', err);
      setError('Không thể tải thông tin đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setActiveStep(1);
  };

  const handleBookingCreated = (booking, totalPrice) => {
    setBookingResult({ ...booking, totalPrice });
    setBookingStatus('Pending');
    setActiveStep(2);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <BookingServiceSelect
            services={services}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
            cosplayer={cosplayer}
          />
        );
      
      case 1:
        return (
          <BookingSchedule
            cosplayer={cosplayer}
            service={selectedService}
            onConfirm={handleBookingCreated}
            onBack={handleBack}
          />
        );
      
      case 2:
        return (
          <BookingWaitingConfirmation
            booking={bookingResult}
            cosplayer={cosplayer}
            bookingStatus={bookingStatus}
            onViewBookings={() => navigate('/my-bookings')}
            onBackToHome={() => navigate('/')}
          />
        );
      
      case 3:
        return (
          <BookingSuccessConfirmation
            booking={bookingResult}
            cosplayer={cosplayer}
            bookingStatus={bookingStatus}
            onViewBookings={() => navigate('/my-bookings')}
            onBackToHome={() => navigate('/')}
          />
        );
      
      default:
        return null;
    }
  };

  if (loading && activeStep === 0) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <PageLayout>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '60vh' 
            }}>
              <CircularProgress />
            </Box>
          </Container>
        </PageLayout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={cosplayTheme}>
      <PageLayout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            {/* Page Title */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              Đặt lịch hẹn
            </Typography>
            
            {/* Stepper */}
            <Box sx={{ mb: 4, mt: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Error Display */}
            {error && activeStep === 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Step Content */}
            {renderStepContent()}
          </Box>
        </Container>
      </PageLayout>
    </ThemeProvider>
  );
};

export default BookingPage;