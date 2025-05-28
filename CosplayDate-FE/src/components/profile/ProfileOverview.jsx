import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  AccessTime,
  AttachMoney,
  EmojiEvents,
  TrendingUp,
  Star,
  PhotoCamera,
  VideoLibrary,
  Event,
  Palette,
  TheaterComedy,
  Games,
  Movie,
  Person,
  LocalOffer
} from '@mui/icons-material';

const ProfileOverview = ({ user, stats, recentActivity, skills }) => {
  const StatCard = ({ icon, label, value, color = 'primary' }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
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
            background: `linear-gradient(45deg, ${color === 'primary' ? '#E91E63, #9C27B0' : '#4CAF50, #2196F3'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );

  const SkillBar = ({ skill, level, color = '#E91E63' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {skill}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {level}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={level}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );

  const getCategoryIcon = (category) => {
    const icons = {
      'Anime': <TheaterComedy />,
      'Game': <Games />,
      'Movie': <Movie />,
      'Original': <Person />,
      'Historical': <Palette />,
    };
    return icons[category] || <Person />;
  };

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PhotoCamera />}
            label="Photos"
            value={stats?.photos || 0}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<VideoLibrary />}
            label="Videos"
            value={stats?.videos || 0}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Star />}
            label="Rating"
            value={user.rating || "N/A"}
            color="secondary"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<EmojiEvents />}
            label="Awards"
            value={stats?.awards || 0}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* About Section */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              About {user.firstName}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
              {user.bio || "No bio available yet."}
            </Typography>

            {/* Specialties */}
            {user.specialties && user.specialties.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Specialties
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      icon={getCategoryIcon(specialty)}
                      label={specialty}
                      sx={{
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        color: 'primary.main',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(233, 30, 99, 0.2)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Skills & Expertise
                </Typography>
                {skills.map((skill, index) => (
                  <SkillBar
                    key={index}
                    skill={skill.name}
                    level={skill.level}
                    color={skill.color || '#E91E63'}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Recent Activity
              </Typography>
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.description}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: '14px',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '12px',
                          color: 'text.secondary',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {activity.time}
                      </Typography>
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Stats */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Quick Stats
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccessTime sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Response Time"
                  secondary={user.responseTime || "< 1 hour"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AttachMoney sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Starting Price"
                  secondary={user.startingPrice || "Contact for rates"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <TrendingUp sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Success Rate"
                  secondary={user.successRate || "95%"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Available Services */}
          {user.services && user.services.length > 0 && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Available Services
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {user.services.map((service, index) => (
                  <Chip
                    key={index}
                    icon={<LocalOffer />}
                    label={service}
                    variant="outlined"
                    sx={{
                      justifyContent: 'flex-start',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(233, 30, 99, 0.05)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileOverview;