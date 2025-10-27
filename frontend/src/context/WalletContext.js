import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const WalletContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('wallet_address');
    const savedToken = localStorage.getItem('auth_token');
    
    if (savedAddress && savedToken) {
      setWalletAddress(savedAddress);
      setToken(savedToken);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if Web3 wallet is available
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask or another Web3 wallet');
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        toast.error('No accounts found');
        setIsConnecting(false);
        return;
      }

      const address = accounts[0];

      // Get challenge message from backend
      const challengeResponse = await axios.post(`${API}/auth/challenge`, null, {
        params: { wallet_address: address }
      });

      const message = challengeResponse.data.message;

      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Verify signature with backend
      const verifyResponse = await axios.post(`${API}/auth/verify`, {
        wallet_address: address,
        signature: signature,
        message: message
      });

      const authToken = verifyResponse.data.access_token;

      // Save to state and localStorage
      setWalletAddress(address);
      setToken(authToken);
      setIsConnected(true);
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('auth_token', authToken);

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setToken(null);
    setIsConnected(false);
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('auth_token');
    toast.success('Wallet disconnected');
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        isConnecting,
        token,
        connectWallet,
        disconnectWallet,
        getAuthHeaders
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};