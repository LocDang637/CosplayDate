// src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
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
import BookingPayment from '../components/booking/BookingPayment';
import BookingConfirmation from '../components/booking/BookingConfirmation';
import { cosplayerAPI } from '../services/cosplayerAPI';
import { bookingAPI } from '../services/bookingAPI';
import { paymentAPI } from '../services/paymentAPI';

const steps = ['Chọn dịch vụ', 'Chọn thời gian', 'Thanh toán', 'Xác nhận'];

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [bookingNote, setBookingNote] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [bookingResult, setBookingResult] = useState(null);

  // Load initial data
  useEffect(() => {
    if (cosplayerId) {
      loadInitialData();
    }
  }, [cosplayerId]);

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
      if (servicesResult.success) {
        setServices(servicesResult.data || []);
      }

      // Check wallet balance
      const balanceResult = await bookingAPI.checkBalance();
      if (balanceResult.success) {
        setWalletBalance(balanceResult.data.Balance || 0);
      }

    } catch (err) {
      console.error('Failed to load booking data:', err);
      setError('Không thể tải thông tin đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Final step - redirect to bookings list
      navigate('/my-bookings');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    handleNext();
  };

  const handleScheduleConfirm = (date, timeSlots, note) => {
    setSelectedDate(date);
    setSelectedTimeSlots(timeSlots);
    setBookingNote(note);
    handleNext();
  };

  const handlePaymentConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      // Check balance first
      if (walletBalance < selectedService.price * selectedTimeSlots.length) {
        setError('Số dư ví không đủ. Vui lòng nạp thêm tiền.');
        return false;
      }

      // Create booking
      const bookingData = {
        cosplayerId: cosplayerId,
        serviceId: selectedService.id,
        bookingDate: selectedDate,
        timeSlots: selectedTimeSlots,
        totalAmount: selectedService.price * selectedTimeSlots.length,
        note: bookingNote,
        paymentMethod: 'wallet'
      };

      const result = await bookingAPI.createBooking(bookingData);
      
      if (result.success) {
        setBookingResult(result.data);
        handleNext();
        return true;
      } else {
        if (result.insufficientFunds) {
          setError('Số dư ví không đủ để thực hiện đặt lịch này.');
        } else {
          setError(result.message || 'Không thể tạo đặt lịch. Vui lòng thử lại.');
        }
        return false;
      }
    } catch (err) {
      console.error('Booking creation failed:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
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
            selectedDate={selectedDate}
            selectedTimeSlots={selectedTimeSlots}
            bookingNote={bookingNote}
            onConfirm={handleScheduleConfirm}
            onBack={handleBack}
          />
        );
      
      case 2:
        return (
          <BookingPayment
            cosplayer={cosplayer}
            service={selectedService}
            selectedDate={selectedDate}
            selectedTimeSlots={selectedTimeSlots}
            walletBalance={walletBalance}
            totalAmount={selectedService?.price * selectedTimeSlots.length}
            onConfirm={handlePaymentConfirm}
            onBack={handleBack}
            loading={loading}
          />
        );
      
      case 3:
        return (
          <BookingConfirmation
            booking={bookingResult}
            cosplayer={cosplayer}
            service={selectedService}
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 4,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Đặt lịch với {cosplayer?.displayName}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '12px' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {renderStepContent()}
        </Container>
      </PageLayout>
    </ThemeProvider>
  );
};

export default BookingPage;