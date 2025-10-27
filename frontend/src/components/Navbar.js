import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Eye, Menu, X, Wallet } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const navLinks = [
    { path: '/markets', label: 'Markets' },
    { path: '/events', label: 'Events' },
    { path: '/copytrading', label: 'Copy Trading' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/governance', label: 'Governance' }
  ];

  const isActive = (path) => location.pathname === path;

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-glass border-b border-[#00FFFF]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Eye className="h-8 w-8 text-[#00FFFF] group-hover:rotate-12 smooth-transition" />
              <div className="absolute inset-0 bg-[#00FFFF] opacity-20 blur-lg group-hover:opacity-40 smooth-transition"></div>
            </div>
            <span className="text-2xl font-bold text-[#00FFFF] font-['Orbitron'] tracking-wider">
              VERISIGHT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                className={`px-4 py-2 rounded-lg smooth-transition ${
                  isActive(link.path)
                    ? 'bg-[#00FFFF]/20 text-[#00FFFF]'
                    : 'text-[#A9B4C2] hover:text-[#00FFFF] hover:bg-[#00FFFF]/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-[#141b2d] border border-[#00FFFF]/30 rounded-lg">
                  <span className="text-[#00FFFF] text-sm font-mono">
                    {formatAddress(walletAddress)}
                  </span>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  data-testid="disconnect-wallet-btn"
                  className="border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/10"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                data-testid="connect-wallet-btn"
                className="bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] font-semibold glow"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#00FFFF]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg smooth-transition ${
                  isActive(link.path)
                    ? 'bg-[#00FFFF]/20 text-[#00FFFF]'
                    : 'text-[#A9B4C2] hover:text-[#00FFFF] hover:bg-[#00FFFF]/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#00FFFF]/20">
              {isConnected ? (
                <>
                  <div className="px-4 py-2 mb-2 bg-[#141b2d] border border-[#00FFFF]/30 rounded-lg text-center">
                    <span className="text-[#00FFFF] text-sm font-mono">
                      {formatAddress(walletAddress)}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/10"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    connectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className="w-full bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] font-semibold"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;