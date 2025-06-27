// src/pages/BookingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
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
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const steps = ['Chọn dịch vụ', 'Chọn thời gian', 'Chờ xác nhận', 'Hoàn tất'];

// Helper function to save booking state
const saveBookingState = (cosplayerId, state) => {
  try {
    sessionStorage.setItem(`booking_${cosplayerId}`, JSON.stringify({
      ...state,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Failed to save booking state:', e);
  }
};

// Helper function to load booking state
const loadBookingState = (cosplayerId) => {
  try {
    const stored = sessionStorage.getItem(`booking_${cosplayerId}`);
    if (stored) {
      const data = JSON.parse(stored);
      // Check if data is not older than 24 hours
      if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      } else {
        sessionStorage.removeItem(`booking_${cosplayerId}`);
      }
    }
  } catch (e) {
    console.error('Failed to load booking state:', e);
  }
  return null;
};

const BookingPage = () => {
  const { cosplayerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load saved state if exists
  const savedState = loadBookingState(cosplayerId);
  
  const [activeStep, setActiveStep] = useState(savedState?.activeStep || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking data
  const [cosplayer, setCosplayer] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(savedState?.selectedService || null);
  const [bookingResult, setBookingResult] = useState(savedState?.bookingResult || null);
  const [bookingStatus, setBookingStatus] = useState(savedState?.bookingStatus || 'Pending');

  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('bookingId');

  // Polling ref
  const pollingIntervalRef = useRef(null);

  // Save state whenever it changes
  useEffect(() => {
    if (cosplayerId && !bookingId) {
      saveBookingState(cosplayerId, {
        activeStep,
        selectedService,
        bookingResult,
        bookingStatus
      });
    }
  }, [activeStep, selectedService, bookingResult, bookingStatus, cosplayerId, bookingId]);

  useEffect(() => {
    if (bookingId) {
      loadExistingBooking();
    } else if (cosplayerId) {
      loadInitialData();
    }
  }, [cosplayerId, bookingId]);

  const loadExistingBooking = async () => {
    try {
      setLoading(true);
      setError('');

      // Load booking details
      const bookingResult = await bookingAPI.getBookingById(bookingId);

      if (bookingResult.success && bookingResult.data) {
        const booking = bookingResult.data;

        // Set booking data
        setBookingResult(booking);
        setBookingStatus(booking.status);

        // Load cosplayer data
        const cosplayerResult = await cosplayerAPI.getCosplayerDetails(booking.cosplayer?.id || cosplayerId);
        if (cosplayerResult.success) {
          setCosplayer(cosplayerResult.data);
        }

        // Set selected service from booking
        if (booking.serviceType) {
          setSelectedService({
            serviceType: booking.serviceType,
            price: booking.totalPrice,
            duration: booking.duration
          });
        }

        // Set active step based on booking status
        switch (booking.status) {
          case 'Pending':
            setActiveStep(2); // Waiting confirmation
            break;
          case 'Confirmed':
            setActiveStep(3); // Success confirmation
            break;
          case 'Cancelled':
            setActiveStep(3); // Show cancelled status
            break;
          case 'Completed':
            setActiveStep(3); // Show completed status
            break;
          default:
            setActiveStep(2);
        }
      } else {
        setError('Không thể tải thông tin đặt lịch');
      }
    } catch (err) {
      console.error('Failed to load existing booking:', err);
      setError('Không thể tải thông tin đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (cosplayerId) {
      loadInitialData();
    }
  }, [cosplayerId]);

  // Poll for booking status updates when waiting for confirmation
  useEffect(() => {
    if (activeStep === 2 && bookingResult) {
      // Get the booking ID from different possible properties
      const bookingIdToUse = bookingResult.id || bookingResult.bookingId || bookingId;
      
      if (!bookingIdToUse) {
        console.error('No booking ID available for polling');
        return;
      }
      
      // Skip polling if we're viewing an existing booking that's not pending
      if (bookingId && bookingStatus !== 'Pending') {
        return;
      }
      
      // Start polling for booking status
      startStatusPolling(bookingIdToUse);

      return () => {
        // Cleanup polling on unmount
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [activeStep, bookingResult, bookingId, bookingStatus]);

  const startStatusPolling = (bookingIdToUse) => {
    let pollCount = 0;
    const maxPolls = 288; // 24 hours with 5-second intervals

    console.log('Starting status polling for booking:', bookingIdToUse);

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;

      try {
        const result = await bookingAPI.getBookingById(bookingIdToUse);
        if (result.success && result.data) {
          const newStatus = result.data.status;
          setBookingStatus(newStatus);

          // Stop polling and navigate based on status
          if (newStatus === 'Confirmed') {
            clearInterval(pollingIntervalRef.current);
            setActiveStep(3);
            // Clear saved state when booking is confirmed
            sessionStorage.removeItem(`booking_${cosplayerId}`);
          } else if (newStatus === 'Cancelled') {
            clearInterval(pollingIntervalRef.current);
            setActiveStep(3);
            // Clear saved state when booking is cancelled
            sessionStorage.removeItem(`booking_${cosplayerId}`);
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
    if (bookingId) return;
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
    // Ensure we have the booking ID (might be 'id' or 'bookingId' from backend)
    const bookingId = booking.id || booking.bookingId;
    const bookingWithId = { ...booking, id: bookingId, totalPrice };
    
    setBookingResult(bookingWithId);
    setBookingStatus('Pending');
    setActiveStep(2);
    
    // Update URL with bookingId if available
    if (bookingId) {
      navigate(`/booking/${cosplayerId}?bookingId=${bookingId}`, { replace: true });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        if (bookingId) {
          return null;
        }
        return (
          <BookingServiceSelect
            services={services}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
            cosplayer={cosplayer}
          />
        );

      case 1:
        if (bookingId) {
          return null;
        }
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
            onViewBookings={() => {
              sessionStorage.removeItem(`booking_${cosplayerId}`);
              // Navigate to customer profile with bookings tab
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              navigate(`/customer-profile/${user.id}?tab=bookings`);
            }}
            onBackToHome={() => {
              sessionStorage.removeItem(`booking_${cosplayerId}`);
              navigate('/');
            }}
          />
        );

      case 3:
        return (
          <BookingSuccessConfirmation
            booking={bookingResult}
            cosplayer={cosplayer}
            bookingStatus={bookingStatus}
            onViewBookings={() => {
              sessionStorage.removeItem(`booking_${cosplayerId}`);
              // Navigate to customer profile with bookings tab
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              navigate(`/customer-profile/${user.id}?tab=bookings`);
            }}
            onBackToHome={() => {
              sessionStorage.removeItem(`booking_${cosplayerId}`);
              navigate('/');
            }}
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
            {/* Stepper */}
            <Box sx={{ mb: 4, mt: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                {bookingId ? 'Tiến trình đặt lịch' : 'Đặt lịch với Cosplayer'}
              </Typography>

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label} completed={index < activeStep}>
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