// src/services/paymentAPI.js (Fixed for Your Specific Response Format)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const paymentAPI = {
  // ===== FIXED: createTopUp for your specific response format =====
  createTopUp: async (packageData) => {
    try {
      // console.log('🔄 Creating top-up payment...');
      
      if (!packageData || !packageData.Package) {
        throw new Error('Thiếu thông tin gói thanh toán');
      }

      const sanitizedData = {
        Package: String(packageData.Package).trim()
      };

      // console.log('📤 Sending payment request:', sanitizedData);

      const response = await api.post('/payment/topup', sanitizedData);
      
      // console.log('💳 Raw payment response:', response.data);

      // Validate response structure
      if (!response.data) {
        throw new Error('Phản hồi không hợp lệ từ server thanh toán');
      }

      // Check for explicit failure
      if (response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Tạo thanh toán thất bại');
      }

      // ===== FIXED: Handle your specific response structure =====
      let checkoutUrl = null;
      let paymentData = {};

      // Your server returns data in response.data.data
      if (response.data.data) {
        const data = response.data.data;
        
        // Extract checkout URL from your response structure
        checkoutUrl = data.checkoutUrl || data.CheckoutUrl || data.checkout_url;
        
        // Store all payment data
        paymentData = {
          paymentLinkId: data.paymentLinkId,
          orderCode: data.orderCode,
          checkoutUrl: checkoutUrl,
          qrCode: data.qrCode,
          paymentAmount: data.paymentAmount,
          digitalAmount: data.digitalAmount,
          package: data.package,
          message: data.message,
          createdAt: data.createdAt
        };

        // console.log('📋 Extracted payment data:', {
        //   hasCheckoutUrl: !!checkoutUrl,
        //   orderCode: data.orderCode,
        //   paymentAmount: data.paymentAmount
        // });
      }

      // Validate checkout URL if provided
      if (checkoutUrl) {
        try {
          const url = new URL(checkoutUrl);
          if (!url.protocol.startsWith('http')) {
            throw new Error('URL thanh toán không hợp lệ');
          }
        } catch (urlError) {
          console.error('❌ Invalid checkout URL:', checkoutUrl);
          throw new Error('URL thanh toán không hợp lệ');
        }
      } else {
        console.warn('⚠️ No checkout URL found in response');
        // Don't throw error immediately, maybe the payment flow is different
      }

      return {
        success: true,
        data: {
          CheckoutUrl: checkoutUrl, // Keep the expected property name
          ...paymentData
        },
        message: response.data.message || 'Tạo thanh toán thành công'
      };
    } catch (error) {
      console.error('❌ Payment creation error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        // console.log('❌ Error response details:', {
        //   status,
        //   data,
        //   message: data?.message
        // });
        
        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || 'Dữ liệu thanh toán không hợp lệ',
              errors: data?.errors || {}
            };
          case 401:
            return {
              success: false,
              message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
              errors: {}
            };
          case 403:
            return {
              success: false,
              message: 'Không có quyền thực hiện thanh toán',
              errors: {}
            };
          case 429:
            return {
              success: false,
              message: 'Quá nhiều yêu cầu. Vui lòng đợi một chút.',
              errors: {}
            };
          case 500:
            return {
              success: false,
              message: 'Lỗi hệ thống thanh toán. Vui lòng thử lại sau.',
              errors: {}
            };
          default:
            return {
              success: false,
              message: data?.message || 'Không thể tạo thanh toán',
              errors: data?.errors || {}
            };
        }
      } else if (error.request) {
        return {
          success: false,
          message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
          errors: {}
        };
      } else {
        return {
          success: false,
          message: error.message || 'Lỗi không xác định',
          errors: {}
        };
      }
    }
  },

  // ===== ENHANCED: getTopUpPackages with better mock data =====
  getTopUpPackages: async () => {
    try {
      // console.log('🔄 Fetching payment packages...');
      const response = await api.get('/payment/packages');
      
      // console.log('📦 Packages response:', response.data);

      if (!response.data) {
        throw new Error('Phản hồi không hợp lệ từ server');
      }

      // Handle different response structures
      let packages = [];
      if (response.data.isSuccess !== false && response.data.data) {
        packages = response.data.data;
      } else if (Array.isArray(response.data)) {
        packages = response.data;
      } else {
        throw new Error('Cấu trúc dữ liệu gói thanh toán không đúng');
      }

      // Validate and normalize package data
      const validatedPackages = packages.map((pkg, index) => {
        try {
          const normalizedPkg = {
            Package: pkg.Package || pkg.package || pkg.name || `Gói ${index + 1}`,
            PayAmount: Number(pkg.PayAmount || pkg.payAmount || pkg.amount || 0),
            ReceiveAmount: Number(pkg.ReceiveAmount || pkg.receiveAmount || pkg.receivedAmount || 0),
            Popular: Boolean(pkg.Popular || pkg.popular || pkg.isPopular),
            Bonus: pkg.Bonus || pkg.bonus || ''
          };

          // Validate required fields
          if (normalizedPkg.PayAmount <= 0 || normalizedPkg.ReceiveAmount <= 0) {
            console.warn('⚠️ Invalid package amounts:', pkg);
            return null;
          }

          // Generate bonus text if not provided
          if (!normalizedPkg.Bonus && normalizedPkg.ReceiveAmount > normalizedPkg.PayAmount) {
            const bonusPercent = Math.round(((normalizedPkg.ReceiveAmount / normalizedPkg.PayAmount) - 1) * 100);
            normalizedPkg.Bonus = `+${bonusPercent}% bonus`;
          }

          return normalizedPkg;
        } catch (pkgError) {
          console.error('❌ Error normalizing package:', pkg, pkgError);
          return null;
        }
      }).filter(Boolean);

      if (validatedPackages.length === 0) {
        // Create packages based on your actual payment amounts
        const mockPackages = [
          {
            Package: '10K',
            PayAmount: 10000,
            ReceiveAmount: 10000,
            Popular: false,
            Bonus: 'Gói cơ bản'
          },
          {
            Package: '50K', 
            PayAmount: 50000,
            ReceiveAmount: 55000,
            Popular: false,
            Bonus: '+10% bonus'
          },
          {
            Package: '100K',
            PayAmount: 100000,
            ReceiveAmount: 120000,
            Popular: true,
            Bonus: '+20% bonus'
          },
          {
            Package: '200K',
            PayAmount: 200000,
            ReceiveAmount: 250000,
            Popular: false,
            Bonus: '+25% bonus'
          },
          {
            Package: '500K',
            PayAmount: 500000,
            ReceiveAmount: 650000,
            Popular: false,
            Bonus: '+30% bonus'
          },
          {
            Package: '1M',
            PayAmount: 1000000,
            ReceiveAmount: 1400000,
            Popular: false,
            Bonus: '+40% bonus'
          }
        ];
        
        // console.log('🎭 Using mock packages for development');
        return {
          success: true,
          data: mockPackages,
          message: 'Sử dụng gói demo cho phát triển'
        };
      }

      return {
        success: true,
        data: validatedPackages,
        message: response.data.message || 'Tải gói thanh toán thành công'
      };
    } catch (error) {
      console.error('❌ Package loading error:', error);
      
      // Return mock packages on error for development  
      const mockPackages = [
        {
          Package: '10K',
          PayAmount: 10000,
          ReceiveAmount: 10000,
          Popular: false,
          Bonus: 'Gói cơ bản'
        },
        {
          Package: '100K',
          PayAmount: 100000,
          ReceiveAmount: 120000,
          Popular: true,
          Bonus: '+20% bonus'
        },
        {
          Package: '500K',
          PayAmount: 500000,
          ReceiveAmount: 650000,
          Popular: false,
          Bonus: '+30% bonus'
        }
      ];

      return {
        success: true,
        data: mockPackages,
        message: 'Sử dụng gói demo (lỗi API)'
      };
    }
  },

  // ===== ENHANCED: getWalletBalance =====
  getWalletBalance: async () => {
    try {
      // console.log('🔄 Fetching wallet balance...');
      const response = await api.get('/payment/wallet/balance');
      
      // console.log('💰 Wallet balance response:', response.data);

      if (!response.data) {
        throw new Error('Phản hồi không hợp lệ từ server');
      }

      // Handle different response structures
      let balanceData = {};
      if (response.data.isSuccess !== false && response.data.data) {
        balanceData = response.data.data;
      } else if (response.data.balance !== undefined) {
        balanceData = { Balance: response.data.balance };
      } else if (response.data.Balance !== undefined) {
        balanceData = { Balance: response.data.Balance };
      } else {
        balanceData = { Balance: 0 };
      }

      // Ensure balance is a number
      if (typeof balanceData.Balance !== 'number') {
        balanceData.Balance = Number(balanceData.Balance) || 0;
      }

      return {
        success: true,
        data: balanceData,
        message: response.data.message || 'Lấy số dư thành công'
      };
    } catch (error) {
      console.error('❌ Balance fetch error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy số dư ví',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // ===== NEW: Payment verification function =====
  verifyTransaction: async (transactionId) => {
    try {
      // console.log('🔍 Verifying transaction:', transactionId);
      
      if (!transactionId) {
        throw new Error('ID giao dịch không hợp lệ');
      }

      const response = await api.post('/payment/verify', { 
        transactionId: transactionId.toString(),
        orderCode: transactionId.toString() // Send both formats
      });
      
      // console.log('✅ Transaction verification response:', response.data);

      return {
        success: response.data.isSuccess !== false,
        data: response.data.data,
        message: response.data.message || 'Xác thực giao dịch thành công'
      };
    } catch (error) {
      console.error('❌ Transaction verification error:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Endpoint xác thực giao dịch không tồn tại',
          errors: { notFound: true, status: 404 }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xác thực giao dịch',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // ===== NEW: Alternative balance refresh method =====
  refreshBalance: async () => {
    try {
      // console.log('🔄 Refreshing balance...');
      
      const response = await api.post('/payment/refresh-balance');
      
      // console.log('💰 Balance refresh response:', response.data);

      return {
        success: response.data.isSuccess !== false,
        data: response.data.data,
        message: response.data.message || 'Làm mới số dư thành công'
      };
    } catch (error) {
      console.error('❌ Balance refresh error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể làm mới số dư',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};
