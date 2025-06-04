// src/contexts/WalletContext.jsx (New File for Better State Management)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { paymentAPI } from '../services/paymentAPI';

const WalletContext = createContext();

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [membershipTier, setMembershipTier] = useState('Bronze');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);

  // Initialize wallet data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      setBalance(user.walletBalance || 0);
      setLoyaltyPoints(user.loyaltyPoints || 0);
      setMembershipTier(user.membershipTier || 'Bronze');
    }
  }, []);

  // Refresh wallet balance from API
  const refreshBalance = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Refreshing wallet balance...');
      const result = await paymentAPI.getWalletBalance();
      
      if (result.success) {
        const newBalance = result.data.Balance || 0;
        setBalance(newBalance);
        
        // Update localStorage user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { 
          ...user, 
          walletBalance: newBalance,
          lastBalanceUpdate: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('✅ Wallet balance updated:', newBalance);
        return newBalance;
      } else {
        setError(result.message || 'Không thể cập nhật số dư');
        return null;
      }
    } catch (err) {
      console.error('❌ Failed to refresh wallet balance:', err);
      setError('Lỗi kết nối khi cập nhật số dư');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load transaction history
  const loadTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    
    try {
      console.log('🔄 Loading transaction history...');
      const result = await paymentAPI.getTransactionHistory(params);
      
      if (result.success) {
        setTransactions(result.data || []);
        console.log('✅ Transactions loaded:', result.data?.length || 0);
        return result.data;
      } else {
        setError(result.message || 'Không thể tải lịch sử giao dịch');
        return [];
      }
    } catch (err) {
      console.error('❌ Failed to load transactions:', err);
      setError('Lỗi khi tải lịch sử giao dịch');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update balance locally (for optimistic updates)
  const updateBalance = useCallback((newBalance) => {
    setBalance(newBalance);
    
    // Update localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { 
      ...user, 
      walletBalance: newBalance 
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Update loyalty points
  const updateLoyaltyPoints = useCallback((points) => {
    setLoyaltyPoints(points);
    
    // Update localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { 
      ...user, 
      loyaltyPoints: points 
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Add transaction to local state (for real-time updates)
  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Calculate membership progress
  const getMembershipProgress = useCallback(() => {
    const progressMap = {
      Bronze: { current: loyaltyPoints, next: 2500, nextTier: 'Silver' },
      Silver: { current: loyaltyPoints, next: 5000, nextTier: 'Gold' },
      Gold: { current: loyaltyPoints, next: 10000, nextTier: 'Platinum' },
      Platinum: { current: loyaltyPoints, next: loyaltyPoints, nextTier: 'Platinum Max' }
    };
    
    return progressMap[membershipTier] || progressMap.Bronze;
  }, [loyaltyPoints, membershipTier]);

  // Format currency helper
  const formatCurrency = useCallback((amount) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(validAmount);
  }, []);

  // Check if user can afford an amount
  const canAfford = useCallback((amount) => {
    return balance >= amount;
  }, [balance]);

  // Get tier color helper
  const getTierColor = useCallback((tier) => {
    switch (tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  }, []);

  const contextValue = {
    // State
    balance,
    loyaltyPoints,
    membershipTier,
    loading,
    error,
    transactions,
    
    // Actions
    refreshBalance,
    loadTransactions,
    updateBalance,
    updateLoyaltyPoints,
    addTransaction,
    clearError,
    
    // Helpers
    getMembershipProgress,
    formatCurrency,
    canAfford,
    getTierColor,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// HOC for components that need wallet data
export const withWallet = (Component) => {
  return function WithWalletComponent(props) {
    return (
      <WalletProvider>
        <Component {...props} />
      </WalletProvider>
    );
  };
};

export default WalletContext;