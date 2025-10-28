import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Events from '../pages/Events';

global.fetch = jest.fn();

describe('Events Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders events with confidence badges', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => [{
        event_id: 'evt_001',
        title: 'Test Event',
        category: 'Crypto',
        status: 'verified',
        confidence: 0.91,
        sources: ['https://example.com']
      }]
    });

    render(
      <BrowserRouter>
        <Events />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('91%')).toBeInTheDocument();
    });
  });
});
