import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/index.css';

// Layout Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Pages
import Landing from '@/pages/Landing';
import Markets from '@/pages/Markets';
import MarketDetail from '@/pages/MarketDetail';
import CreateMarket from '@/pages/CreateMarket';
import CopyTrading from '@/pages/CopyTrading';
import Dashboard from '@/pages/Dashboard';
import Governance from '@/pages/Governance';

// Context
import { WalletProvider } from '@/context/WalletContext';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#0A0F1F]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/market/:id" element={<MarketDetail />} />
              <Route path="/create" element={<CreateMarket />} />
              <Route path="/copytrading" element={<CopyTrading />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" theme="dark" />
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;