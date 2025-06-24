// File: src/components/profile/CustomerWallet.jsx (Fixed Version)
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
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
  Pagination,
  CircularProgress,
  Snackbar,
  TextField,
} from "@mui/material";
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
  LocalOffer,
  Star,
  CheckCircle,
  Payment,
  Security,
  Close,
} from "@mui/icons-material";
import { paymentAPI } from "../../services/paymentAPI";

const CustomerWallet = ({
  balance = 0,
  transactions = [],
  loyaltyPoints = 0,
  onBalanceUpdate,
}) => {
  // State management
  const [topUpDialog, setTopUpDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Top-up specific state
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(balance);

  const transactionsPerPage = 10;

  // Load initial data
  useEffect(() => {
    loadWalletData();
  }, []);

  useEffect(() => {
    setWalletBalance(balance);
  }, [balance]);

  const loadWalletData = async () => {
    try {
      const result = await paymentAPI.getWalletBalance();
      if (result.success) {
        setWalletBalance(result.data.Balance || balance);
        onBalanceUpdate?.(result.data.Balance || balance);
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    }
  };

  // ===== FIXED: Enhanced loadPackages function =====
  const loadPackages = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔄 Loading payment packages...");
      const result = await paymentAPI.getTopUpPackages();

      if (result.success && Array.isArray(result.data)) {
        // Validate and sanitize package data
        const validPackages = result.data.filter((pkg) => {
          const isValid =
            pkg &&
            typeof pkg.PayAmount === "number" &&
            typeof pkg.ReceiveAmount === "number" &&
            pkg.PayAmount > 0 &&
            pkg.ReceiveAmount > 0 &&
            pkg.Package;

          if (!isValid) {
            console.warn("⚠️ Invalid package filtered out:", pkg);
          }

          return isValid;
        });

        if (validPackages.length === 0) {
          throw new Error("Không có gói thanh toán hợp lệ");
        }

        console.log("✅ Valid packages loaded:", validPackages.length);
        setPackages(validPackages);

        // Auto-select popular package
        const popularPackage = validPackages.find((pkg) => pkg.Popular);
        if (popularPackage) {
          setSelectedPackage(popularPackage);
          console.log(
            "📌 Auto-selected popular package:",
            popularPackage.Package
          );
        } else if (validPackages.length > 0) {
          setSelectedPackage(validPackages[0]);
          console.log(
            "📌 Auto-selected first package:",
            validPackages[0].Package
          );
        }
      } else {
        throw new Error(
          result.message || "Không thể tải danh sách gói thanh toán"
        );
      }
    } catch (err) {
      console.error("❌ Load packages error:", err);
      setError(err.message || "Lỗi tải gói thanh toán");
      setPackages([]);
      setSelectedPackage(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock transaction data with Vietnamese descriptions
  const mockTransactions = [
    {
      id: 1,
      type: "booking_payment",
      amount: -450000,
      description: "Cosplay A - Buổi chụp hình",
      date: "2024-01-15T10:30:00",
      status: "completed",
      cosplayer: "Cosplay A",
      reference: "BK2024001",
    },
    {
      id: 2,
      type: "top_up",
      amount: 1000000,
      description: "Nạp tiền ví - PayOS",
      date: "2024-01-14T14:20:00",
      status: "completed",
      reference: "TP2024001",
    },
    {
      id: 3,
      type: "refund",
      amount: 350000,
      description: "Hoàn tiền hủy đặt lịch",
      date: "2024-01-13T09:15:00",
      status: "completed",
      cosplayer: "Cosplay B",
      reference: "RF2024001",
    },
    {
      id: 4,
      type: "booking_payment",
      amount: -380000,
      description: "Cosplay C - Tham dự sự kiện",
      date: "2024-01-12T16:45:00",
      status: "completed",
      cosplayer: "Cosplay C",
      reference: "BK2024002",
    },
    {
      id: 5,
      type: "loyalty_cashback",
      amount: 25000,
      description: "Hoàn tiền điểm thưởng",
      date: "2024-01-11T11:00:00",
      status: "completed",
      reference: "LC2024001",
    },
    {
      id: 6,
      type: "booking_payment",
      amount: -500000,
      description: "Cosplay D - Tham dự hội chợ",
      date: "2024-01-10T13:30:00",
      status: "completed",
      cosplayer: "Cosplay D",
      reference: "BK2024003",
    },
    {
      id: 7,
      type: "top_up",
      amount: 2000000,
      description: "Nạp tiền ví - PayOS",
      date: "2024-01-09T08:00:00",
      status: "completed",
      reference: "TP2024002",
    },
    {
      id: 8,
      type: "gift_received",
      amount: 100000,
      description: "Quà từ bạn bè - Sinh nhật",
      date: "2024-01-08T12:00:00",
      status: "completed",
      reference: "GF2024001",
    },
  ];

  // ===== FIXED: Null-safe currency formatting =====
  const formatCurrency = (amount) => {
    const validAmount =
      typeof amount === "number" && !isNaN(amount) ? amount : 0;

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(validAmount);
  };

  // ===== FIXED: Safe calculation functions =====
  const getBonusMultiplier = (pkg) => {
    if (!pkg?.ReceiveAmount || !pkg?.PayAmount || pkg.PayAmount === 0) return 1;
    return Math.round(pkg.ReceiveAmount / pkg.PayAmount);
  };

  const getSavingsAmount = (pkg) => {
    if (!pkg?.ReceiveAmount || !pkg?.PayAmount) return 0;
    return pkg.ReceiveAmount - pkg.PayAmount;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "booking_payment":
        return <ShoppingCart sx={{ color: "#f44336" }} />;
      case "top_up":
        return <Add sx={{ color: "#4caf50" }} />;
      case "refund":
        return <TrendingUp sx={{ color: "#4caf50" }} />;
      case "withdrawal":
        return <Download sx={{ color: "#ff9800" }} />;
      case "loyalty_cashback":
        return <LocalOffer sx={{ color: "#9c27b0" }} />;
      case "gift_received":
        return <CardGiftcard sx={{ color: "#e91e63" }} />;
      default:
        return <Receipt sx={{ color: "#757575" }} />;
    }
  };

  const getTransactionColor = (amount) => {
    return amount >= 0 ? "#4caf50" : "#f44336";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const filterTransactions = () => {
    let filtered = mockTransactions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredTransactions = filterTransactions();
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + transactionsPerPage
  );

  // ===== FIXED: Enhanced top-up handler =====
  const handleTopUpOpen = async () => {
    setTopUpDialog(true);
    setError("");
    setSelectedPackage(null);
    await loadPackages();
  };

  const handlePackageSelect = (pkg) => {
    if (pkg && pkg.PayAmount && pkg.ReceiveAmount) {
      setSelectedPackage(pkg);
      console.log("📦 Package selected:", pkg.Package);
    }
  };

  // ===== FIXED: Enhanced payment processing =====
  const handleProceedToPayment = async () => {
    // Comprehensive validation
    if (!selectedPackage) {
      setError("Vui lòng chọn gói thanh toán");
      return;
    }

    if (!selectedPackage.Package) {
      setError("Gói thanh toán không hợp lệ");
      return;
    }

    if (!selectedPackage.PayAmount || selectedPackage.PayAmount <= 0) {
      setError("Số tiền thanh toán không hợp lệ");
      return;
    }

    if (!selectedPackage.ReceiveAmount || selectedPackage.ReceiveAmount <= 0) {
      setError("Số tiền nhận không hợp lệ");
      return;
    }

    setProcessingPayment(true);
    setError("");

    try {
      const paymentData = {
        Package: selectedPackage.Package,
      };

      console.log("🔄 Creating payment for package:", selectedPackage.Package);

      const result = await paymentAPI.createTopUp(paymentData);

      console.log("💳 Payment creation result:", result);

      if (result.success) {
        // ===== UPDATED: Handle your specific response structure =====
        const checkoutUrl =
          result.data?.CheckoutUrl ||
          result.data?.checkoutUrl ||
          result.data?.checkout_url;

        if (checkoutUrl) {
          try {
            const url = new URL(checkoutUrl);

            console.log("🔍 Validating checkout URL:", {
              protocol: url.protocol,
              hostname: url.hostname,
              fullUrl: checkoutUrl,
            });

            // Enhanced URL validation for PayOS
            if (
              url.protocol === "https:" &&
              (url.hostname.includes("payos") ||
                url.hostname.includes("pay.os") ||
                url.hostname.includes("dev.payos") ||
                url.hostname === "pay.payos.vn")
            ) {
              console.log("✅ Valid PayOS URL, redirecting...");

              // Store payment info for success page
              sessionStorage.setItem(
                "pendingPayment",
                JSON.stringify({
                  package: selectedPackage.Package,
                  amount: selectedPackage.PayAmount,
                  orderCode: result.data.orderCode,
                  paymentLinkId: result.data.paymentLinkId,
                  timestamp: new Date().toISOString(),
                })
              );

              setTopUpDialog(false);
              window.location.href = checkoutUrl;
            } else {
              console.error("❌ Invalid payment URL domain:", url.hostname);
              setError("URL thanh toán không hợp lệ - domain không được phép");
            }
          } catch (urlError) {
            console.error(
              "❌ Invalid checkout URL format:",
              checkoutUrl,
              urlError
            );
            setError("Định dạng URL thanh toán không hợp lệ");
          }
        } else {
          console.error("❌ No checkout URL in response:", result.data);

          // Show detailed error for debugging
          const availableFields = Object.keys(result.data || {});
          setError(
            `Không nhận được link thanh toán. Available fields: ${availableFields.join(
              ", "
            )}`
          );

          // Log the full response for debugging
          console.log(
            "🔍 Full payment response for debugging:",
            JSON.stringify(result, null, 2)
          );
        }
      } else {
        setError(result.message || "Không thể tạo thanh toán");
      }
    } catch (err) {
      console.error("❌ Payment creation error:", err.message);
      setError("Lỗi tạo thanh toán. Vui lòng thử lại.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleWithdraw = () => {
    // Handle withdrawal logic
    console.log("Withdraw:", withdrawAmount);
    setWithdrawDialog(false);
    setWithdrawAmount("");
    showSnackbar("Yêu cầu rút tiền đã được gửi", "success");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ===== FIXED: Enhanced PackageCard component =====
  const PackageCard = ({ pkg, isSelected, onSelect }) => {
    // Add validation to prevent NaN issues
    if (
      !pkg ||
      typeof pkg.PayAmount !== "number" ||
      typeof pkg.ReceiveAmount !== "number"
    ) {
      return (
        <Card
          sx={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: "12px",
            p: 2,
            textAlign: "center",
            minHeight: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Đang tải...
            </Typography>
          </Box>
        </Card>
      );
    }

    const bonusMultiplier = getBonusMultiplier(pkg);
    const savings = getSavingsAmount(pkg);

    return (
      <Card
        sx={{
          cursor: "pointer",
          border: isSelected
            ? "2px solid #E91E63"
            : "1px solid rgba(0,0,0,0.12)",
          backgroundColor: isSelected ? "rgba(233, 30, 99, 0.05)" : "white",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          position: "relative",
          minHeight: "140px",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(233, 30, 99, 0.15)",
          },
        }}
        onClick={() => onSelect(pkg)}
      >
        {/* Popular Badge */}
        {pkg.Popular && (
          <Chip
            label="Phổ biến"
            size="small"
            sx={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#FF6B35",
              color: "white",
              fontSize: "10px",
              height: "20px",
            }}
          />
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <CheckCircle
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#E91E63",
              fontSize: 20,
            }}
          />
        )}

        <CardContent sx={{ textAlign: "center", p: 2 }}>
          {/* Package Name */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {pkg.Package || "Gói thanh toán"}
          </Typography>

          {/* Payment Amount */}
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
            Trả: {formatCurrency(pkg.PayAmount)}
          </Typography>

          {/* Receive Amount */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#E91E63", mb: 1 }}
          >
            Nhận: {formatCurrency(pkg.ReceiveAmount)}
          </Typography>

          {/* Bonus */}
          {savings > 0 && (
            <Chip
              label={`Tiết kiệm ${formatCurrency(savings)}`}
              size="small"
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                fontSize: "10px",
                height: "20px",
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Wallet Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Main Balance Card */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "24px",
              p: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ví CosplayDate
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(walletBalance)}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Số dư khả dụng
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleTopUpOpen}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    borderRadius: "12px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
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
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    borderRadius: "12px",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
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
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              borderRadius: "24px",
              p: 3,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
                  backgroundColor: "rgba(255,255,255,0.3)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "white",
                    borderRadius: 4,
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{ opacity: 0.8, mt: 1, fontSize: "12px" }}
              >
                Còn 750 điểm để lên hạng Vàng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper
        sx={{
          borderRadius: "16px",
          p: 3,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(233, 30, 99, 0.1)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Lịch sử giao dịch
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Lọc</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Lọc"
                sx={{ borderRadius: "12px" }}
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
              onClick={() =>
                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
              }
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                borderRadius: "12px",
                textTransform: "none",
              }}
            >
              {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
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
                  "&:hover": {
                    backgroundColor: "rgba(233, 30, 99, 0.02)",
                    borderRadius: "12px",
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      backgroundColor: "rgba(233, 30, 99, 0.1)",
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getTransactionIcon(transaction.type)}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {transaction.description}
                      </Typography>
                      <Chip
                        label={getStatusLabel(transaction.status)}
                        size="small"
                        sx={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          fontSize: "10px",
                          height: "20px",
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {new Date(transaction.date).toLocaleString("vi-VN")}
                      </Typography>
                      {transaction.cosplayer && (
                        <Typography
                          variant="body2"
                          sx={{ color: "primary.main", fontSize: "12px" }}
                        >
                          👤 {transaction.cosplayer}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontSize: "11px" }}
                      >
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
                      textAlign: "right",
                    }}
                  >
                    {transaction.amount >= 0 ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              {index < currentTransactions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Box>
        )}

        {/* Empty State */}
        {currentTransactions.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              Không tìm thấy giao dịch
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Thử điều chỉnh bộ lọc hoặc thực hiện giao dịch đầu tiên của bạn
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Top Up Dialog */}
      <Dialog
        open={topUpDialog}
        onClose={() => setTopUpDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1 }} />
            <Box sx={{ textAlign: "center" }}>
              <AccountBalanceWallet
                sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Nạp tiền vào ví
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={() => setTopUpDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: "12px",
                fontSize: "14px",
              }}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={60} sx={{ color: "primary.main" }} />
            </Box>
          ) : (
            <>
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  Chọn gói nạp tiền phù hợp với bạn
                </Typography>
              </Box>

              {/* Package Grid */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {packages.map((pkg) => (
                  <Grid item xs={6} sm={4} md={4} key={pkg.Package}>
                    <PackageCard
                      pkg={pkg}
                      isSelected={selectedPackage?.Package === pkg.Package}
                      onSelect={handlePackageSelect}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Selected Package Details */}
              {selectedPackage && (
                <Paper
                  sx={{
                    backgroundColor: "rgba(233, 30, 99, 0.05)",
                    borderRadius: "12px",
                    p: 3,
                    mb: 3,
                    border: "1px solid rgba(233, 30, 99, 0.2)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
                  >
                    Chi tiết gói {selectedPackage.Package}
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Số tiền thanh toán
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#E91E63" }}
                            >
                              {formatCurrency(selectedPackage.PayAmount)}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Số dư nhận được
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#4CAF50" }}
                            >
                              {formatCurrency(selectedPackage.ReceiveAmount)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TrendingUp sx={{ color: "#FF9800", fontSize: 20 }} />
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "#FF9800" }}
                        >
                          Tiết kiệm được:{" "}
                          {formatCurrency(getSavingsAmount(selectedPackage))}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="contained"
                        onClick={handleProceedToPayment}
                        disabled={processingPayment}
                        startIcon={
                          processingPayment ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Payment />
                          )
                        }
                        fullWidth
                        sx={{
                          background:
                            "linear-gradient(45deg, #E91E63, #9C27B0)",
                          borderRadius: "8px",
                          py: 1.5,
                          fontSize: "16px",
                          fontWeight: 600,
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #AD1457, #7B1FA2)",
                          },
                        }}
                      >
                        {processingPayment ? "Đang xử lý..." : "Thanh toán"}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Security Info */}
              <Alert
                severity="info"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(33, 150, 243, 0.05)",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Security sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    Thanh toán được bảo mật bởi PayOS • Không lưu trữ thông tin
                    thẻ
                  </Typography>
                </Box>
              </Alert>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={withdrawDialog}
        onClose={() => setWithdrawDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px" },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Download sx={{ fontSize: 32, color: "warning.main", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Rút tiền
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "12px" }}>
            Số dư khả dụng: {formatCurrency(walletBalance)}
          </Alert>

          <TextField
            fullWidth
            label="Số tiền rút"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            type="number"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
            helperText="Tối thiểu: 100.000đ | Thời gian xử lý: 1-3 ngày làm việc"
          />

          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            Phí rút tiền: 15.000đ mỗi giao dịch
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setWithdrawDialog(false)}
            sx={{ borderRadius: "12px" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={
              !withdrawAmount ||
              parseFloat(withdrawAmount) < 100000 ||
              parseFloat(withdrawAmount) > walletBalance
            }
            sx={{
              backgroundColor: "warning.main",
              borderRadius: "12px",
              px: 3,
              "&:hover": {
                backgroundColor: "warning.dark",
              },
            }}
          >
            Rút {withdrawAmount && formatCurrency(parseFloat(withdrawAmount))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerWallet;
