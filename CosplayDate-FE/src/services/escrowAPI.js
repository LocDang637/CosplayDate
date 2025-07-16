// escrowAPI.js - Service for escrow/payment history operations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7241/api';

/**
 * Get escrow payment history with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 10)
 * @param {string} params.status - Filter by status (optional)
 * @param {string} params.fromDate - Filter from date (optional)
 * @param {string} params.toDate - Filter to date (optional)
 * @param {number} params.minAmount - Filter by minimum amount (optional)
 * @param {number} params.maxAmount - Filter by maximum amount (optional)
 * @param {string} params.searchTerm - Search term (optional)
 * @param {string} params.sortBy - Sort field (optional)
 * @param {string} params.sortDirection - Sort direction (optional)
 * @returns {Promise<Object>} API response with escrow history
 */
export const getEscrowHistory = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist
    if (params.page) queryParams.append('Page', params.page);
    if (params.pageSize) queryParams.append('PageSize', params.pageSize);
    if (params.status) queryParams.append('Status', params.status);
    if (params.fromDate) queryParams.append('FromDate', params.fromDate);
    if (params.toDate) queryParams.append('ToDate', params.toDate);
    if (params.minAmount) queryParams.append('MinAmount', params.minAmount);
    if (params.maxAmount) queryParams.append('MaxAmount', params.maxAmount);
    if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
    if (params.sortBy) queryParams.append('SortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('SortDirection', params.sortDirection);

    const url = `${API_BASE_URL}/Escrow/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('📊 Fetching escrow history from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      if (response.status === 404) {
        throw new Error('Escrow history endpoint not found.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Escrow history response:', data);

    return {
      success: true,
      data: data,
      message: 'Escrow history loaded successfully'
    };

  } catch (error) {
    console.error('❌ Error fetching escrow history:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to load escrow history'
    };
  }
};

/**
 * Transform escrow data to transaction format for CustomerWallet component
 * @param {Array} escrows - Array of escrow objects from API
 * @param {string} userType - "Customer" or "Cosplayer" to determine transaction perspective
 * @returns {Array} Array of transformed transaction objects
 */
export const transformEscrowsToTransactions = (escrows = [], userType = "Customer") => {
  return escrows.map(escrow => {
    // Determine transaction type and description based on status and user type
    let type, description;
    
    if (userType === "Cosplayer") {
      // From cosplayer perspective
      switch (escrow.status) {
        case 'Held':
          type = 'booking_payment';
          description = 'Thanh toán đặt lịch';
          break;
        case 'Released':
          type = 'booking_payment';
          description = 'Hoàn tiền đặt lịch'; // Cosplayer receives money
          break;
        case 'Refunded':
          type = 'refund';
          description = 'Thanh toán đặt lịch'; // Money is returned to customer (cosplayer loses)
          break;
        default:
          type = 'booking_payment';
          description = 'Thanh toán đặt lịch';
      }
      
      // For cosplayers: Released = positive (received), Refunded = negative (lost)
      const amount = escrow.status === 'Released' ? escrow.amount : -escrow.amount;
      
      return {
        id: escrow.id,
        type: type,
        description: description,
        amount: amount,
        date: escrow.releasedAt || escrow.refundedAt || escrow.createdAt,
        status: escrow.status.toLowerCase(),
        reference: escrow.transactionCode,
        bookingId: escrow.bookingId,
        cosplayer: escrow.cosplayerName || `Cosplayer #${escrow.cosplayerId}`,
        serviceType: escrow.serviceType,
        bookingDate: escrow.bookingDate,
        // Additional escrow-specific fields
        escrowStatus: escrow.status,
        paymentId: escrow.paymentId,
        customerId: escrow.customerId,
        cosplayerId: escrow.cosplayerId,
        createdAt: escrow.createdAt,
        releasedAt: escrow.releasedAt,
        refundedAt: escrow.refundedAt
      };
    } else {
      // From customer perspective (original logic)
      switch (escrow.status) {
        case 'Held':
          type = 'booking_payment';
          description = 'Thanh toán đặt lịch';
          break;
        case 'Released':
          type = 'booking_payment';
          description = 'Thanh toán đặt lịch';
          break;
        case 'Refunded':
          type = 'refund';
          description = 'Hoàn tiền đặt lịch';
          break;
        default:
          type = 'booking_payment';
          description = 'Thanh toán đặt lịch';
      }

      // For customers: negative for outgoing payments, positive for refunds
      const amount = escrow.status === 'Refunded' ? escrow.amount : -escrow.amount;

      return {
        id: escrow.id,
        type: type,
        description: description,
        amount: amount,
        date: escrow.releasedAt || escrow.refundedAt || escrow.createdAt,
        status: escrow.status.toLowerCase(),
        reference: escrow.transactionCode,
        bookingId: escrow.bookingId,
        cosplayer: escrow.cosplayerName || `Cosplayer #${escrow.cosplayerId}`,
        serviceType: escrow.serviceType,
        bookingDate: escrow.bookingDate,
        // Additional escrow-specific fields
        escrowStatus: escrow.status,
        paymentId: escrow.paymentId,
        customerId: escrow.customerId,
        cosplayerId: escrow.cosplayerId,
        createdAt: escrow.createdAt,
        releasedAt: escrow.releasedAt,
        refundedAt: escrow.refundedAt
      };
    }
  });
};

/**
 * Get escrow summary statistics
 * @returns {Promise<Object>} API response with escrow summary
 */
export const getEscrowSummary = async () => {
  try {
    const result = await getEscrowHistory({ page: 1, pageSize: 1 });
    
    if (result.success && result.data?.summary) {
      return {
        success: true,
        data: result.data.summary,
        message: 'Escrow summary loaded successfully'
      };
    }

    return {
      success: false,
      data: null,
      message: 'Failed to load escrow summary'
    };

  } catch (error) {
    console.error('❌ Error fetching escrow summary:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to load escrow summary'
    };
  }
};

export default {
  getEscrowHistory,
  transformEscrowsToTransactions,
  getEscrowSummary
};
