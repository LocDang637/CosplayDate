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
  Divider,
  Button,
  Grid
} from '@mui/material';
import {
  AccessTime,
  AttachMoney,
  Category,
  CheckCircle
} from '@mui/icons-material';

const BookingServiceSelect = ({ 
  services = [], 
  selectedService, 
  onServiceSelect,
  cosplayer 
}) => {
  const [selectedId, setSelectedId] = React.useState(selectedService?.id || '');

  const handleServiceChange = (event) => {
    setSelectedId(event.target.value);
  };

  const handleConfirm = () => {
    const service = services.find(s => s.id === selectedId);
    if (service) {
      onServiceSelect(service);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (services.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Cosplayer này chưa có dịch vụ nào
        </Typography>
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
          {services.map((service) => (
            <Grid item xs={12} key={service.id}>
              <Card 
                sx={{ 
                  borderRadius: '12px',
                  border: selectedId === service.id 
                    ? '2px solid #E91E63' 
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.15)'
                  }
                }}
                onClick={() => setSelectedId(service.id)}
              >
                <CardContent>
                  <FormControlLabel
                    value={service.id}
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
                            {service.name}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: 'primary.main',
                              fontWeight: 700
                            }}
                          >
                            {formatPrice(service.price)}
                          </Typography>
                        </Box>

                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {service.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDuration(service.duration)} / slot
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatPrice(service.price)} / {formatDuration(service.duration)}
                            </Typography>
                          </Box>

                          {service.category && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {service.category}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {service.includedItems && service.includedItems.length > 0 && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                              Bao gồm:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {service.includedItems.map((item, index) => (
                                <Box 
                                  key={index}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <CheckCircle 
                                    sx={{ 
                                      fontSize: 16, 
                                      color: 'success.main' 
                                    }} 
                                  />
                                  <Typography variant="body2">
                                    {item}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </>
                        )}
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

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
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