// src/components/booking/BookingServiceSelect.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Avatar,
  Button,
  Grid
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BookingServiceSelect = ({
  services = [],
  selectedService,
  onServiceSelect,
  cosplayer
}) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = React.useState(selectedService?.id?.toString() || '');

  // Ensure services is always an array
  const servicesList = Array.isArray(services) ? services : [];

  const handleServiceChange = (event) => {
    setSelectedId(event.target.value);
  };

  const handleConfirm = () => {
    const service = servicesList.find(s => s.id.toString() === selectedId.toString());
    if (service) {
      onServiceSelect(service);
    }
  };

  if (servicesList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Cosplayer này chưa có dịch vụ nào
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(233, 30, 99, 0.05)'
              }
            }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cosplayer Info */}
      <Card sx={{
        mb: 3,
        borderRadius: '16px',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        boxShadow: 'none'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={cosplayer?.avatar}
              sx={{
                width: 64,
                height: 64,
                border: '3px solid rgba(233, 30, 99, 0.2)'
              }}
            >
              {cosplayer?.displayName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {cosplayer?.displayName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={`⭐ ${cosplayer?.rating || 5.0}`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}
                />
                <Chip
                  label={`${cosplayer?.completedBookings || 0} lần đặt`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Services List */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Chọn dịch vụ bạn muốn đặt:
      </Typography>

      <RadioGroup value={selectedId} onChange={handleServiceChange}>
        <Grid container spacing={2}>
          {servicesList.map((service) => (
            <Grid item xs={12} key={service.id}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: selectedId === service.id.toString()
                    ? '2px solid #E91E63'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.15)'
                  }
                }}
                onClick={() => setSelectedId(service.id.toString())}
              >
                <CardContent>
                  <FormControlLabel
                    value={service.id.toString()}
                    control={
                      <Radio
                        sx={{
                          color: 'primary.main',
                          '&.Mui-checked': { color: 'primary.main' }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {service.serviceName}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {service.serviceDescription}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      m: 0,
                      width: '100%',
                      '& .MuiFormControlLabel-label': {
                        width: '100%',
                        ml: 2
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/')}
          startIcon={<ArrowBack />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(233, 30, 99, 0.05)'
            }
          }}
        >
          Về trang chủ
        </Button>

        <Button
          variant="contained"
          size="large"
          onClick={handleConfirm}
          disabled={!selectedId}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '16px',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            }
          }}
        >
          Tiếp tục
        </Button>
      </Box>
    </Box>
  );
};

export default BookingServiceSelect;