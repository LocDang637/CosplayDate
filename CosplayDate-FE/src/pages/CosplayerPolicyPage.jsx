import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import {
  TheaterComedy,
  CheckCircle,
  PhotoCamera,
  Groups,
  AttachMoney,
  Verified,
  Star,
  Event,
  Support,
  Security,
  ExpandMore,
  ArrowBack
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const CosplayerPolicyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleConfirm = async () => {
    if (!acceptTerms) {
      setSubmitError('Bạn phải chấp nhận các điều khoản và điều kiện để tiếp tục.');
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      // Simulate API call to upgrade user to cosplayer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user type in localStorage
      const updatedUser = { ...user, userType: 'Cosplayer' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Navigate to cosplayer profile with success message
      navigate(`/profile/${updatedUser.id}`, { 
        state: { 
          message: 'Chúc mừng! Bạn đã trở thành Cosplayer. Hãy hoàn thiện hồ sơ của bạn.',
          upgraded: true 
        }
      });
      
    } catch (error) {
      console.error('Failed to upgrade to cosplayer:', error);
      setSubmitError('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <AttachMoney sx={{ color: '#4CAF50' }} />,
      title: 'Thu nhập hấp dẫn',
      description: 'Kiếm tiền từ đam mê cosplay của bạn với mức giá cạnh tranh'
    },
    {
      icon: <Groups sx={{ color: '#2196F3' }} />,
      title: 'Cộng đồng rộng lớn',
      description: 'Kết nối với hàng nghìn fan cosplay và khách hàng tiềm năng'
    },
    {
      icon: <PhotoCamera sx={{ color: '#FF9800' }} />,
      title: 'Quảng bá tài năng',
      description: 'Showcase tác phẩm và kỹ năng cosplay đến đông đảo người xem'
    },
    {
      icon: <Event sx={{ color: '#9C27B0' }} />,
      title: 'Cơ hội sự kiện',
      description: 'Tham gia các sự kiện, convention và hoạt động đặc biệt'
    },
    {
      icon: <Support sx={{ color: '#E91E63' }} />,
      title: 'Hỗ trợ chuyên nghiệp',
      description: 'Đội ngũ hỗ trợ 24/7 và các công cụ quản lý chuyên nghiệp'
    },
    {
      icon: <Verified sx={{ color: '#00BCD4' }} />,
      title: 'Xác thực uy tín',
      description: 'Hệ thống xác thực giúp xây dựng uy tín và niềm tin với khách hàng'
    }
  ];

  const requirements = [
    'Phải từ 18 tuổi trở lên',
    'Có kinh nghiệm hoặc đam mê cosplay',
    'Sở hữu ít nhất 3 bộ trang phục cosplay chất lượng',
    'Có khả năng giao tiếp tốt',
    'Cam kết duy trì chất lượng dịch vụ chuyên nghiệp',
    'Tuân thủ các quy định của nền tảng'
  ];

  const policies = [
    {
      title: 'Quy định về nội dung',
      content: 'Mọi nội dung cosplay phải phù hợp, không vi phạm bản quyền và tuân thủ các tiêu chuẩn cộng đồng. Không được phép nội dung có tính chất khiêu dâm, bạo lực hoặc phân biệt đối xử.'
    },
    {
      title: 'Chính sách thanh toán',
      content: 'Thanh toán được thực hiện qua hệ thống an toàn của CosplayDate. Cosplayer sẽ nhận được 80% giá trị dịch vụ, sau khi trừ phí nền tảng 20%. Thanh toán được xử lý trong vòng 3-5 ngày làm việc.'
    },
    {
      title: 'Quy định về dịch vụ',
      content: 'Cosplayer cam kết cung cấp dịch vụ đúng như mô tả, đúng giờ và chuyên nghiệp. Mọi thay đổi lịch trình phải thông báo trước ít nhất 24 giờ. Việc hủy bỏ dịch vụ có thể ảnh hưởng đến đánh giá.'
    },
    {
      title: 'Chính sách bảo mật',
      content: 'Thông tin cá nhân của khách hàng phải được bảo mật tuyệt đối. Không được phép chia sẻ thông tin liên lạc hoặc giao dịch bên ngoài nền tảng. Vi phạm có thể dẫn đến việc khóa tài khoản vĩnh viễn.'
    },
    {
      title: 'Quy định về đánh giá',
      content: 'Hệ thống đánh giá là quan trọng để duy trì chất lượng dịch vụ. Cosplayer cần duy trì đánh giá trung bình tối thiểu 4.0 sao. Những tài khoản có đánh giá thấp liên tục có thể bị đình chỉ hoạt động.'
    }
  ];

  if (!user) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />
        
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 3,
              color: 'text.secondary',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(233, 30, 99, 0.05)',
                color: 'primary.main',
              },
            }}
          >
            Quay lại
          </Button>

          {/* Header Section */}
          <Paper
            sx={{
              borderRadius: '24px',
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
              textAlign: 'center',
            }}
          >
            <TheaterComedy 
              sx={{ 
                fontSize: 64, 
                color: 'primary.main', 
                mb: 2 
              }} 
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Trở thành Cosplayer
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Chào mừng {user.firstName}! Bạn đang chuẩn bị tham gia vào cộng đồng Cosplayer chuyên nghiệp của CosplayDate. 
              Hãy đọc kỹ các điều khoản và lợi ích bên dưới.
            </Typography>
          </Paper>

          {/* Benefits Section */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 4,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                textAlign: 'center',
              }}
            >
              🌟 Lợi ích khi trở thành Cosplayer
            </Typography>
            
            <Grid container spacing={3}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '12px',
                      border: '1px solid rgba(233, 30, 99, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: 'rgba(233, 30, 99, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          fontSize: '16px',
                        }}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '14px',
                          lineHeight: 1.5,
                        }}
                      >
                        {benefit.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Requirements Section */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 4,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                textAlign: 'center',
              }}
            >
              📋 Yêu cầu để trở thành Cosplayer
            </Typography>
            
            <List sx={{ maxWidth: '600px', mx: 'auto' }}>
              {requirements.map((requirement, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4CAF50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={requirement}
                    primaryTypographyProps={{
                      fontSize: '15px',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Policies Section */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 4,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                textAlign: 'center',
              }}
            >
              📜 Điều khoản và Chính sách
            </Typography>
            
            {policies.map((policy, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: '12px !important',
                  border: '1px solid rgba(233, 30, 99, 0.1)',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    '&.Mui-expanded': {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: 'primary.main',
                    }}
                  >
                    {policy.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontSize: '14px',
                    }}
                  >
                    {policy.content}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Important Notes */}
          <Alert
            severity="info"
            sx={{
              mb: 4,
              borderRadius: '12px',
              '& .MuiAlert-message': {
                fontSize: '14px',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              📌 Lưu ý quan trọng:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Sau khi xác nhận, tài khoản của bạn sẽ được chuyển đổi thành tài khoản Cosplayer
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Bạn sẽ cần hoàn thiện hồ sơ Cosplayer và tải lên ít nhất 3 ảnh portfolio
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Tài khoản sẽ được xem xét và phê duyệt trong vòng 24-48 giờ
            </Typography>
            <Typography variant="body2">
              • Sau khi được phê duyệt, bạn có thể bắt đầu nhận booking và kiếm tiền
            </Typography>
          </Alert>

          {/* Error Message */}
          {submitError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '12px',
              }}
              onClose={() => setSubmitError('')}
            >
              {submitError}
            </Alert>
          )}

          {/* Confirmation Section */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 4,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
              textAlign: 'center',
            }}
          >
            <Security 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2 
              }} 
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
              }}
            >
              Xác nhận tham gia
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': { color: 'primary.main' },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontSize: '15px', textAlign: 'left' }}>
                  Tôi đã đọc và hiểu tất cả các điều khoản, chính sách và yêu cầu được nêu trên. 
                  Tôi cam kết tuân thủ các quy định của CosplayDate và cung cấp dịch vụ cosplay 
                  chuyên nghiệp, chất lượng cao cho khách hàng.
                </Typography>
              }
              sx={{ 
                alignItems: 'flex-start',
                mb: 3,
                maxWidth: '600px',
                mx: 'auto',
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={loading}
                sx={{
                  borderColor: 'text.secondary',
                  color: 'text.secondary',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                }}
              >
                Hủy bỏ
              </Button>
              
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={!acceptTerms || loading}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: '200px',
                  position: 'relative',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.26)',
                  },
                }}
              >
                {loading && (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: 'white',
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-10px',
                      marginTop: '-10px',
                    }}
                  />
                )}
                <span style={{ opacity: loading ? 0 : 1 }}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận trở thành Cosplayer'}
                </span>
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 3,
                fontSize: '13px',
                fontStyle: 'italic',
              }}
            >
              Bằng cách nhấn "Xác nhận", bạn đồng ý chuyển đổi tài khoản khách hàng 
              thành tài khoản Cosplayer và tuân thủ tất cả các điều khoản đã nêu.
            </Typography>
          </Paper>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default CosplayerPolicyPage;
