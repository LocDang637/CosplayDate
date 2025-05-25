import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Link,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Facebook,
  Instagram,
  YouTube,
  Twitter,
  Email,
  Send,
  Favorite,
  Help,
  Info,
  ContactMail,
  Newspaper
} from '@mui/icons-material';

const Footer = () => {
  const handleEmailSignup = () => {
    console.log('Email signup clicked');
    // Handle email signup logic
  };

  const handleSocialClick = (platform) => {
    console.log(`${platform} clicked`);
    // Handle social media links
  };

  const handleLinkClick = (page) => {
    console.log(`${page} page clicked`);
    // Handle page navigation
  };

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
        borderTop: '1px solid rgba(233, 30, 99, 0.2)',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Help Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3,
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Help sx={{ fontSize: 20, color: 'primary.main' }} />
                Help
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('FAQ')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  FAQ
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('Policy')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  Privacy Policy
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('Orders')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  Terms of Service
                </Link>
              </Box>
            </Grid>

            {/* Pages Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3,
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Info sx={{ fontSize: 20, color: 'primary.main' }} />
                Pages
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('About Us')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  About Us
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('Contact Us')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  Contact Us
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('Events')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  Events
                </Link>
                <Link
                  component="button"
                  onClick={() => handleLinkClick('Blog')}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  Blog
                </Link>
              </Box>
            </Grid>

            {/* More About CosplayDate Section */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3,
                  fontSize: '18px',
                  textAlign: { xs: 'left', md: 'center' },
                }}
              >
                MORE ABOUT COSPLAYDATE
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3
              }}>
              

                {/* Email Signup */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: 1,
                  minWidth: '200px'
                }}>
                  <TextField
                    placeholder="Enter your email"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        fontSize: '14px',
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleEmailSignup}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                              },
                            }}
                          >
                            <Send />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '11px',
                      textAlign: 'center',
                    }}
                  >
                    Get updates & cosplay news
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: 'rgba(233, 30, 99, 0.2)' }} />

        {/* Bottom Section */}
        <Box sx={{ 
          py: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          

          {/* Social Media Icons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => handleSocialClick('Twitch')}
              sx={{
                color: '#9146FF',
                backgroundColor: 'rgba(145, 70, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(145, 70, 255, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ 
                width: 20, 
                height: 20, 
                backgroundColor: '#9146FF',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700
              }}>
                TV
              </Box>
            </IconButton>

            <IconButton
              onClick={() => handleSocialClick('Facebook')}
              sx={{
                color: '#1877F2',
                backgroundColor: 'rgba(24, 119, 242, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Facebook />
            </IconButton>

            <IconButton
              onClick={() => handleSocialClick('Instagram')}
              sx={{
                color: '#E4405F',
                backgroundColor: 'rgba(228, 64, 95, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(228, 64, 95, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Instagram />
            </IconButton>

            <IconButton
              onClick={() => handleSocialClick('YouTube')}
              sx={{
                color: '#FF0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <YouTube />
            </IconButton>

            <IconButton
              onClick={() => handleSocialClick('Twitter')}
              sx={{
                color: '#1DA1F2',
                backgroundColor: 'rgba(29, 161, 242, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(29, 161, 242, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Twitter />
            </IconButton>
          </Box>
        </Box>

        {/* Copyright */}
        <Box sx={{ 
          textAlign: 'center',
          pb: 2,
          borderTop: '1px solid rgba(233, 30, 99, 0.1)',
          pt: 2
        }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '12px',
            }}
          >
            © 2024 CosplayDate. Made with 💖 for the cosplay community. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;