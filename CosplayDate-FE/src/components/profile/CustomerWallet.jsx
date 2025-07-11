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
import escrowAPI from "../../services/escrowAPI";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Enhanced filter state for all escrow API parameters
  const [filters, setFilters] = useState({
    status: "all", // all, held, released, refunded, etc.
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    searchTerm: "",
    sortBy: "createdAt", // createdAt, amount, status
    sortDirection: "desc", // desc, asc
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Top-up specific state
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(balance);

  // Real transaction data from escrow API
  const [escrowTransactions, setEscrowTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [escrowSummary, setEscrowSummary] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  // Load escrow transaction history
  const loadTransactions = async (params = {}) => {
    setTransactionLoading(true);
    setError('');

    try {
      console.log('📊 Loading escrow history with params:', params);

      const result = await escrowAPI.getEscrowHistory({
        page: currentPage,
        pageSize: transactionsPerPage,
        status: filters.status !== 'all' ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        searchTerm: filters.searchTerm || undefined,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        ...params
      });

      if (result.success && result.data) {
        const transformedTransactions = escrowAPI.transformEscrowsToTransactions(result.data.escrows || []);
        setEscrowTransactions(transformedTransactions);
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.totalCount || 0);
        setEscrowSummary(result.data.summary);

        console.log('✅ Transactions loaded:', transformedTransactions.length);
      } else {
        setError(result.message || 'Failed to load transaction history');
        setEscrowTransactions([]);
      }
    } catch (err) {
      console.error('❌ Error loading transactions:', err);
      setError('Unable to load transaction history. Please try again.');
      setEscrowTransactions([]);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Load transactions on component mount and when filters change
  useEffect(() => {
    loadTransactions();
  }, [currentPage, filters.status, filters.fromDate, filters.toDate, filters.minAmount, filters.maxAmount, filters.searchTerm, filters.sortBy, filters.sortDirection]);

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
      case "released":
        return "Hoàn thành";
      case "held":
        return "Đang giữ";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const filterTransactions = () => {
    // Note: Filtering is now done server-side via the escrow API
    // This function just returns the transactions as-is since filtering is handled by the API
    return escrowTransactions;
  };

  const filteredTransactions = filterTransactions();
  // Use state totalPages instead of calculating locally
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

  // Filter management functions
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
      searchTerm: "",
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return filters.status !== "all" ||
      filters.fromDate ||
      filters.toDate ||
      filters.minAmount ||
      filters.maxAmount ||
      filters.searchTerm;
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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

  // Export transactions as CSV
  const exportTransactions = () => {
    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If the value contains comma, double quote, or newline, wrap it in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Define headers in Vietnamese
    const headers = [
      'Ngày giao dịch',
      'Mô tả',
      'Số tiền (VND)',
      'Trạng thái',
      'Mã tham chiếu',
      'Cosplayer',
      'Loại giao dịch'
    ];

    // Create CSV rows
    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...filteredTransactions.map(transaction => {
        const row = [
          new Date(transaction.date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          transaction.description || '',
          transaction.amount ? transaction.amount.toLocaleString('vi-VN') : '0',
          getStatusLabel(transaction.status) || '',
          transaction.reference || '',
          transaction.cosplayer || '',
          transaction.type || ''
        ];
        return row.map(escapeCSV).join(',');
      })
    ];

    // Join all rows with newline
    const csvContent = csvRows.join('\n');
    
    // Add BOM for proper Unicode support in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create blob with proper encoding
    const blob = new Blob([csvWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with current date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Lich_su_giao_dich_${dateStr}_${timeStr}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Show success message
    showSnackbar(`Đã xuất ${filteredTransactions.length} giao dịch thành công!`, 'success');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Top Section: Wallet Card + Filter Controls */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 10,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {/* Wallet Card */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "24px",
              p: 3,
              position: "relative",
              overflow: "hidden",
              height: "100%",
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

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleTopUpOpen}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    borderRadius: "12px",
                    flex: 1,
                    minWidth: "120px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Nạp tiền
                </Button>
                {/* <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => setWithdrawDialog(true)}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    borderRadius: "12px",
                    flex: 1,
                    minWidth: "120px",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Rút tiền
                </Button> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Filter Controls Card */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: "24px",
              p: 3,
              height: "100%",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              border: "1px solid rgba(233, 30, 99, 0.1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(233, 30, 99, 0.05)",
              },
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FilterList sx={{ fontSize: 28, mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                  Bộ lọc giao dịch
                </Typography>
              </Box>

              {/* Quick Filter Controls */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Status and Sort Row */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Trạng thái"
                      sx={{
                        borderRadius: "12px",
                        backgroundColor: 'white',
                      }}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="Held">Đang giữ</MenuItem>
                      <MenuItem value="Released">Hoàn thành</MenuItem>
                      <MenuItem value="Refunded">Đã hoàn tiền</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<SwapVert />}
                    onClick={() => handleFilterChange('sortDirection', filters.sortDirection === 'desc' ? 'asc' : 'desc')}
                    sx={{
                      borderColor: "primary.main",
                      color: "primary.main",
                      borderRadius: "12px",
                      textTransform: "none",
                      backgroundColor: 'white',
                      minWidth: "100px",
                    }}
                  >
                    {filters.sortDirection === 'desc' ? "Mới nhất" : "Cũ nhất"}
                  </Button>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant={showAdvancedFilters ? "contained" : "outlined"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    size="small"
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      backgroundColor: showAdvancedFilters ? 'primary.main' : 'white',
                    }}
                  >
                    Nâng cao
                  </Button>

                  {totalCount > 0 && (
                    <Button
                      variant="outlined"
                      onClick={exportTransactions}
                      startIcon={<Download />}
                      size="small"
                      sx={{
                        borderColor: "success.main",
                        color: "success.main",
                        borderRadius: "12px",
                        textTransform: "none",
                        backgroundColor: 'white',
                        "&:hover": {
                          borderColor: "success.dark",
                          backgroundColor: "success.light",
                        }
                      }}
                    >
                      Excel
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Paper
          sx={{
            p: 3,
            borderRadius: '16px',
            background: "linear-gradient(135deg, #ffeef7 0%, #f3e5f5 100%)",
            border: '1px solid rgba(233, 30, 99, 0.2)',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
              Bộ lọc nâng cao
            </Typography>

            <Button
              variant="text"
              onClick={resetFilters}
              size="small"
              sx={{
                color: "error.main",
                borderRadius: "12px",
                textTransform: "none",
              }}
            >
              Xóa
            </Button>
          </Box>
          <Grid container spacing={3}>
            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Khoảng thời gian
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="date"
                  label="Từ ngày"
                  value={formatDateForInput(filters.fromDate)}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white',
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary">đến</Typography>
                <TextField
                  size="small"
                  type="date"
                  label="Đến ngày"
                  value={formatDateForInput(filters.toDate)}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Khoảng số tiền (VND)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Từ"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white',
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary">-</Typography>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Đến"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Transaction History Section */}
      <Paper
        sx={{
          borderRadius: "20px",
          p: 0,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          border: "1px solid rgba(233, 30, 99, 0.1)",
          boxShadow: "0 8px 32px rgba(233, 30, 99, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* Enhanced Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 3,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Receipt sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Lịch sử giao dịch
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
          {/* Loading State */}
          {transactionLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={50} sx={{ color: 'primary.main', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Đang tải giao dịch...
                </Typography>
              </Box>
            </Box>
          )}

          {/* Enhanced Transaction List */}
          {!transactionLoading && (
            <List sx={{ p: 0 }}>
              {currentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 3,
                      borderRadius: "16px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(233, 30, 99, 0.03)",
                        transform: "translateX(4px)",
                        boxShadow: "0 4px 20px rgba(233, 30, 99, 0.1)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        pr: 4,
                        pl: 1
                      }}
                    >
                      <Avatar
                        sx={{
                          background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)",
                          width: 56,
                          height: 56,
                          boxShadow: "0 4px 12px rgba(233, 30, 99, 0.08)",
                        }}
                      >
                        {getTransactionIcon(transaction.type)}
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {transaction.description}
                          </Typography>
                          <Chip
                            label={getStatusLabel(transaction.status)}
                            size="small"
                            sx={{
                              backgroundColor: transaction.status === 'completed' || transaction.status === 'released'
                                ? "#4CAF50"
                                : transaction.status === 'held'
                                  ? "#FF9800"
                                  : "#2196F3",
                              color: "white",
                              fontSize: "11px",
                              height: "24px",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ color: "text.secondary", mb: 0.5 }}
                          >
                            📅 {new Date(transaction.date).toLocaleString("vi-VN")}
                          </Typography>
                          {transaction.cosplayer && (
                            <Typography
                              variant="body2"
                              sx={{ color: "primary.main", fontSize: "13px", mb: 0.5 }}
                            >
                              👤 {transaction.cosplayer}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", fontSize: "12px" }}
                          >
                            🏷️ Mã: {transaction.reference}
                          </Typography>
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: getTransactionColor(transaction.amount),
                            mb: 0.5,
                          }}
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: "11px",
                          }}
                        >
                          {transaction.amount >= 0 ? "Nhận" : "Chi"}
                        </Typography>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < currentTransactions.length - 1 && (
                    <Divider
                      sx={{
                        mx: 2,
                        borderColor: "rgba(233, 30, 99, 0.1)",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}

          {/* Pagination and Results Info */}
          {!transactionLoading && totalPages > 1 && (
            <Box sx={{
              display: "flex",
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2
            }}>
              {/* Results Info */}
              <Typography variant="body2" color="text.secondary">
                Hiển thị {((currentPage - 1) * transactionsPerPage) + 1} - {Math.min(currentPage * transactionsPerPage, totalCount)}
                {' '}trong tổng số {totalCount} giao dịch
                {hasActiveFilters() && ` (đã lọc từ tổng số giao dịch)`}
              </Typography>

              {/* Pagination */}
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Box>
          )}

          {/* Empty State */}
          {!transactionLoading && currentTransactions.length === 0 && (
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
        </Box>
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
