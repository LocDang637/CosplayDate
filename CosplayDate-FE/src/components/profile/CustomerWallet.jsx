import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Grid,
  Alert,
  LinearProgress,
  Avatar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Event,
  CardGiftcard,
  CreditCard,
  AccountBalance,
  Phone,
  FilterList,
  SwapVert,
  Receipt,
  LocalOffer
} from '@mui/icons-material';

const CustomerWallet = ({ 
  balance = 2500000, 
  transactions = [],
  loyaltyPoints = 1250 
}) => {
  const [topUpDialog, setTopUpDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const transactionsPerPage = 10;

  // Mock transaction data with Vietnamese descriptions
  const mockTransactions = [
    {
      id: 1,
      type: 'booking_payment',
      amount: -450000,
      description: 'Cosplay A - Buổi chụp hình',
      date: '2024-01-15T10:30:00',
      status: 'completed',
      cosplayer: 'Cosplay A',
      reference: 'BK2024001'
    },
    {
      id: 2,
      type: 'top_up',
      amount: 1000000,
      description: 'Nạp tiền ví - Thẻ tín dụng',
      date: '2024-01-14T14:20:00',
      status: 'completed',
      reference: 'TP2024001'
    },
    {
      id: 3,
      type: 'refund',
      amount: 350000,
      description: 'Hoàn tiền hủy đặt lịch',
      date: '2024-01-13T09:15:00',
      status: 'completed',
      cosplayer: 'Cosplay B',
      reference: 'RF2024001'
    },
    {
      id: 4,
      type: 'booking_payment',
      amount: -380000,
      description: 'Cosplay C - Tham dự sự kiện',
      date: '2024-01-12T16:45:00',
      status: 'completed',
      cosplayer: 'Cosplay C',
      reference: 'BK2024002'
    },
    {
      id: 5,
      type: 'loyalty_cashback',
      amount: 25000,
      description: 'Hoàn tiền điểm thưởng',
      date: '2024-01-11T11:00:00',
      status: 'completed',
      reference: 'LC2024001'
    },
    {
      id: 6,
      type: 'booking_payment',
      amount: -500000,
      description: 'Cosplay D - Tham dự hội chợ',
      date: '2024-01-10T13:30:00',
      status: 'completed',
      cosplayer: 'Cosplay D',
      reference: 'BK2024003'
    },
    {
      id: 7,
      type: 'top_up',
      amount: 2000000,
      description: 'Nạp tiền ví - Chuyển khoản',
      date: '2024-01-09T08:00:00',
      status: 'completed',
      reference: 'TP2024002'
    },
    {
      id: 8,
      type: 'gift_received',
      amount: 100000,
      description: 'Quà từ bạn bè - Sinh nhật',
      date: '2024-01-08T12:00:00',
      status: 'completed',
      reference: 'GF2024001'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'booking_payment': return <ShoppingCart sx={{ color: '#f44336' }} />;
      case 'top_up': return <Add sx={{ color: '#4caf50' }} />;
      case 'refund': return <TrendingUp sx={{ color: '#4caf50' }} />;
      case 'withdrawal': return <Download sx={{ color: '#ff9800' }} />;
      case 'loyalty_cashback': return <LocalOffer sx={{ color: '#9c27b0' }} />;
      case 'gift_received': return <CardGiftcard sx={{ color: '#e91e63' }} />;
      default: return <Receipt sx={{ color: '#757575' }} />;
    }
  };

  const getTransactionColor = (amount) => {
    return amount >= 0 ? '#4caf50' : '#f44336';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'failed': return 'Thất bại';
      default: return status;
    }
  };

  const filterTransactions = () => {
    let filtered = mockTransactions;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const filteredTransactions = filterTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + transactionsPerPage);

  const handleTopUp = () => {
    // Handle top up logic
    console.log('Top up:', topUpAmount, paymentMethod);
    setTopUpDialog(false);
    setTopUpAmount('');
  };

  const handleWithdraw = () => {
    // Handle withdrawal logic
    console.log('Withdraw:', withdrawAmount);
    setWithdrawDialog(false);
    setWithdrawAmount('');
  };

  const quickTopUpAmounts = [100000, 500000, 1000000, 2000000];

  return (
    <Box>
      {/* Wallet Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Main Balance Card */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '24px',
              p: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ví CosplayDate
                </Typography>
              </Box>
              
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(balance)}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Số dư khả dụng
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setTopUpDialog(true)}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Nạp tiền
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => setWithdrawDialog(true)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Rút tiền
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Loyalty Points Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '24px',
              p: 3,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalOffer sx={{ fontSize: 28, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Điểm thưởng
                </Typography>
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {loyaltyPoints.toLocaleString()}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                ≈ {formatCurrency(loyaltyPoints * 10)}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={75}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white',
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1, fontSize: '12px' }}>
                Còn 750 điểm để lên hạng Vàng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper
        sx={{
          borderRadius: '16px',
          p: 3,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Lịch sử giao dịch
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Lọc</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Lọc"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="booking_payment">Đặt lịch</MenuItem>
                <MenuItem value="top_up">Nạp tiền</MenuItem>
                <MenuItem value="refund">Hoàn tiền</MenuItem>
                <MenuItem value="loyalty_cashback">Hoàn điểm</MenuItem>
                <MenuItem value="gift_received">Quà tặng</MenuItem>
              </Select>
            </FormControl>

            {/* Sort */}
            <Button
              variant="outlined"
              startIcon={<SwapVert />}
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                borderRadius: '12px',
                textTransform: 'none',
              }}
            >
              {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
            </Button>
          </Box>
        </Box>

        {/* Transaction List */}
        <List sx={{ p: 0 }}>
          {currentTransactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(233, 30, 99, 0.02)',
                    borderRadius: '12px',
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      backgroundColor: 'rgba(233, 30, 99, 0.1)',
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getTransactionIcon(transaction.type)}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {transaction.description}
                      </Typography>
                      <Chip
                        label={getStatusLabel(transaction.status)}
                        size="small"
                        sx={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          fontSize: '10px',
                          height: '20px',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {new Date(transaction.date).toLocaleString('vi-VN')}
                      </Typography>
                      {transaction.cosplayer && (
                        <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '12px' }}>
                          👤 {transaction.cosplayer}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                        Mã GD: {transaction.reference}
                      </Typography>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: getTransactionColor(transaction.amount),
                      textAlign: 'right',
                    }}
                  >
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              {index < currentTransactions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        )}

        {/* Empty State */}
        {currentTransactions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              Không tìm thấy giao dịch
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Thử điều chỉnh bộ lọc hoặc thực hiện giao dịch đầu tiên của bạn
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Top Up Dialog */}
      <Dialog
        open={topUpDialog}
        onClose={() => setTopUpDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <AccountBalanceWallet sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Nạp tiền vào ví
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {/* Quick Amount Buttons */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Chọn nhanh:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {quickTopUpAmounts.map((amount) => (
              <Grid item xs={6} key={amount}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setTopUpAmount(amount.toString())}
                  sx={{
                    borderColor: topUpAmount === amount.toString() ? 'primary.main' : 'rgba(0,0,0,0.12)',
                    backgroundColor: topUpAmount === amount.toString() ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                    borderRadius: '12px',
                    py: 1.5,
                  }}
                >
                  {formatCurrency(amount)}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Custom Amount */}
          <TextField
            fullWidth
            label="Nhập số tiền"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            type="number"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
            helperText="Tối thiểu: 100.000đ"
          />

          {/* Payment Method */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Phương thức thanh toán"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="credit_card">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard sx={{ fontSize: 20 }} />
                  Thẻ tín dụng/Ghi nợ
                </Box>
              </MenuItem>
              <MenuItem value="bank_transfer">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance sx={{ fontSize: 20 }} />
                  Chuyển khoản ngân hàng
                </Box>
              </MenuItem>
              <MenuItem value="momo">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 20 }} />
                  Ví điện tử MoMo
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Phí xử lý: Miễn phí cho số tiền trên 500.000đ
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setTopUpDialog(false)}
            sx={{ borderRadius: '12px' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleTopUp}
            disabled={!topUpAmount || parseFloat(topUpAmount) < 100000}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              borderRadius: '12px',
              px: 3,
            }}
          >
            Nạp {topUpAmount && formatCurrency(parseFloat(topUpAmount))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={withdrawDialog}
        onClose={() => setWithdrawDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Download sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Rút tiền
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
            Số dư khả dụng: {formatCurrency(balance)}
          </Alert>

          <TextField
            fullWidth
            label="Số tiền rút"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            type="number"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
            helperText="Tối thiểu: 100.000đ | Thời gian xử lý: 1-3 ngày làm việc"
          />

          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Phí rút tiền: 15.000đ mỗi giao dịch
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setWithdrawDialog(false)}
            sx={{ borderRadius: '12px' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100000 || parseFloat(withdrawAmount) > balance}
            sx={{
              backgroundColor: 'warning.main',
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                backgroundColor: 'warning.dark',
              },
            }}
          >
            Rút {withdrawAmount && formatCurrency(parseFloat(withdrawAmount))}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerWallet;