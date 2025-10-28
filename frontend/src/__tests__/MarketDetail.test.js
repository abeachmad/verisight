import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarketDetail from '../pages/MarketDetail';

global.fetch = jest.fn();

describe('MarketDetail Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('displays evidence with cid, tx_hash, chain_id', async () => {
    fetch.mockResolvedValue({
      json: async () => ({
        market_id: 'mkt_001',
        title: 'Test Market',
        resolved: false,
        cutoff_at: '2025-12-31T23:59:59Z',
        evidence: {
          cid: 'QmDemo123',
          tx_hash: '0xDEMO123',
          chain_id: 'linera-demo-chain-001'
        },
        odds: { yes: 0.6, no: 0.4 }
      })
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketDetail />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/QmDemo123/)).toBeInTheDocument();
      expect(screen.getByText(/0xDEMO123/)).toBeInTheDocument();
      expect(screen.getByText(/linera-demo-chain-001/)).toBeInTheDocument();
    });
  });

  test('stake button disabled when resolved', async () => {
    fetch.mockResolvedValue({
      json: async () => ({
        market_id: 'mkt_002',
        title: 'Resolved Market',
        resolved: true,
        cutoff_at: '2024-01-01T00:00:00Z',
        evidence: {},
        odds: { yes: 0.5, no: 0.5 }
      })
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketDetail />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Market Resolved')).toBeInTheDocument();
    });
  });
});
