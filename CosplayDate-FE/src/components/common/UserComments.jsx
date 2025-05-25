import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Paper,
  Chip,
  Button,
  Pagination
} from '@mui/material';
import { ThumbUp, Reply, MoreHoriz } from '@mui/icons-material';

const UserComments = ({ title = "Đánh giá từ người dùng" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 6;

  // Mock comments data
  const allComments = [
    {
      id: 1,
      user: {
        name: 'Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      rating: 5,
      date: '2 ngày trước',
      comment: 'Website tuyệt vời! Tôi đã tìm được nhiều cosplayer tài năng và chuyên nghiệp. Giao diện đẹp và dễ sử dụng.',
      likes: 24,
      helpful: true
    },
    {
      id: 2,
      user: {
        name: 'Hoàng Nam',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        verified: false
      },
      rating: 4,
      date: '1 tuần trước',
      comment: 'Chất lượng cosplayer rất tốt, giá cả hợp lý. Hệ thống đặt lịch tiện lợi. Sẽ tiếp tục sử dụng dịch vụ.',
      likes: 18,
      helpful: false
    },
    {
      id: 3,
      user: {
        name: 'Thu Hà',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      rating: 5,
      date: '3 ngày trước',
      comment: 'Tôi là cosplayer và đây là nền tảng tuyệt vời để kết nối với khách hàng. Hỗ trợ tốt từ team.',
      likes: 31,
      helpful: true
    },
    {
      id: 4,
      user: {
        name: 'Quang Minh',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        verified: false
      },
      rating: 4,
      date: '5 ngày trước',
      comment: 'Đa dạng lựa chọn cosplayer với nhiều thể loại khác nhau. Tính năng tìm kiếm và lọc rất hữu ích.',
      likes: 12,
      helpful: false
    },
    {
      id: 5,
      user: {
        name: 'Linh Chi',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      rating: 5,
      date: '1 ngày trước',
      comment: 'CosplayDate đã giúp tôi tổ chức event thành công! Các cosplayer đều rất chuyên nghiệp và đúng giờ.',
      likes: 28,
      helpful: true
    },
    {
      id: 6,
      user: {
        name: 'Đức Anh',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        verified: false
      },
      rating: 4,
      date: '4 ngày trước',
      comment: 'Trải nghiệm tốt, giao diện thân thiện. Chỉ cần cải thiện thêm về tốc độ tải trang là hoàn hảo.',
      likes: 15,
      helpful: false
    },
    {
      id: 7,
      user: {
        name: 'Mai Phương',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      rating: 5,
      date: '6 ngày trước',
      comment: 'Hệ thống thanh toán an toàn, dễ dàng theo dõi lịch sử giao dịch. Rất hài lòng với dịch vụ!',
      likes: 22,
      helpful: true
    },
    {
      id: 8,
      user: {
        name: 'Tuấn Hùng',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
        verified: false
      },
      rating: 4,
      date: '1 tuần trước',
      comment: 'Nhiều lựa chọn cosplayer chất lượng cao. Giá cả minh bạch, không phát sinh chi phí ẩn.',
      likes: 19,
      helpful: false
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(allComments.length / commentsPerPage);
  const startIndex = (currentPage - 1) * commentsPerPage;
  const currentComments = allComments.slice(startIndex, startIndex + commentsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLike = (commentId) => {
    console.log('Liked comment:', commentId);
    // Handle like logic here
  };

  const handleReply = (commentId) => {
    console.log('Reply to comment:', commentId);
    // Handle reply logic here
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return '#4CAF50';
    if (rating >= 4) return '#FF9800';
    return '#F44336';
  };

  return (
    <Paper
      sx={{
        borderRadius: '24px',
        p: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        mb: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 2,
            fontSize: { xs: '24px', md: '28px' },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '16px',
          }}
        >
          Xem những đánh giá chân thực từ cộng đồng CosplayDate
        </Typography>
      </Box>

      {/* Comments Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        {currentComments.map((comment) => (
          <Paper
            key={comment.id}
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'white',
              border: '1px solid rgba(233, 30, 99, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={comment.user.avatar}
                alt={comment.user.name}
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  border: '2px solid rgba(233, 30, 99, 0.1)',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '14px',
                    }}
                  >
                    {comment.user.name}
                  </Typography>
                  {comment.user.verified && (
                    <Chip
                      label="✓"
                      size="small"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontSize: '10px',
                        height: '16px',
                        minWidth: '16px',
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '12px',
                  }}
                >
                  {comment.date}
                </Typography>
              </Box>
              <Button
                size="small"
                sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}
              >
                <MoreHoriz />
              </Button>
            </Box>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating
                value={comment.rating}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: getRatingColor(comment.rating),
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: 'text.secondary',
                  fontSize: '12px',
                }}
              >
                {comment.rating}/5
              </Typography>
            </Box>

            {/* Comment Text */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: '14px',
                lineHeight: 1.5,
                mb: 3,
              }}
            >
              {comment.comment}
            </Typography>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                size="small"
                startIcon={<ThumbUp />}
                onClick={() => handleLike(comment.id)}
                sx={{
                  color: comment.helpful ? 'primary.main' : 'text.secondary',
                  textTransform: 'none',
                  fontSize: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                  },
                }}
              >
                Hữu ích ({comment.likes})
              </Button>
              
              <Button
                size="small"
                startIcon={<Reply />}
                onClick={() => handleReply(comment.id)}
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontSize: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                  },
                }}
              >
                Trả lời
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default UserComments;