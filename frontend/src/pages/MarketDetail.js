import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '@/context/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MarketDetail = () => {
  const { id } = useParams();
  const { isConnected, getAuthHeaders } = useWallet();
  const [market, setMarket] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, [id]);

  const fetchMarketData = async () => {
    try {
      const marketResponse = await axios.get(`${API}/markets/${id}`);
      setMarket(marketResponse.data);

      // Fetch related event
      if (marketResponse.data.event_id) {
        const eventResponse = await axios.get(`${API}/events/${marketResponse.data.event_id}`);
        setEvent(eventResponse.data);
      }
    } catch (error) {
      console.error('Error fetching market:', error);
      toast.error('Failed to load market');
    } finally {
      setLoading(false);
    }
  };

  const handlePlacePrediction = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedOption || !betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please select an option and enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/predictions`,
        {
          market_id: id,
          option_id: selectedOption,
          amount: parseFloat(betAmount)
        },
        { headers: getAuthHeaders() }
      );

      toast.success('Prediction placed successfully!');
      setBetAmount('');
      setSelectedOption(null);
      fetchMarketData(); // Refresh market data
    } catch (error) {
      console.error('Error placing prediction:', error);
      toast.error('Failed to place prediction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#00FFFF] text-xl">Loading...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#A9B4C2] text-xl">Market not found</div>
      </div>
    );
  }

  // Mock chart data
  const chartData = [
    { time: '00:00', odds: 1.5 },
    { time: '04:00', odds: 1.6 },
    { time: '08:00', odds: 1.55 },
    { time: '12:00', odds: 1.7 },
    { time: '16:00', odds: 1.65 },
    { time: '20:00', odds: 1.8 },
    { time: 'Now', odds: market.options[0]?.odds || 1.5 }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Info */}
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6" data-testid="market-detail-card">
              <div className="flex items-center justify-between mb-4">
                <Badge
                  className={`${
                    market.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : market.status === 'closed'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  } border`}
                >
                  {market.status === 'active' && <TrendingUp className="mr-1 h-3 w-3" />}
                  {market.status === 'closed' && <Clock className="mr-1 h-3 w-3" />}
                  {market.status === 'resolved' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {market.status.toUpperCase()}
                </Badge>
                <span className="text-[#A9B4C2]">
                  Volume: <span className="text-[#00FFFF] font-semibold">${market.total_volume?.toLocaleString() || 0}</span>
                </span>
              </div>

              <h1 className="text-3xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
                {market.title}
              </h1>
              <p className="text-[#A9B4C2] mb-6">{market.description}</p>

              {event && (
                <div className="bg-[#0A0F1F]/50 rounded-lg p-4">
                  <h3 className="text-[#00FFFF] font-semibold mb-2">Event Details</h3>
                  <p className="text-[#A9B4C2] text-sm mb-2">{event.event_description}</p>
                  {event.confidence && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[#A9B4C2] text-sm">AI Confidence:</span>
                      <div className="flex-1 bg-[#0A0F1F] rounded-full h-2 max-w-xs">
                        <div
                          className="bg-[#00FFFF] h-2 rounded-full glow"
                          style={{ width: `${event.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[#00FFFF] text-sm font-semibold">
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Odds Chart */}
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-5 w-5 text-[#00FFFF]" />
                <h2 className="text-xl font-['Orbitron'] font-semibold text-[#00FFFF]">
                  Odds History
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF20" />
                  <XAxis dataKey="time" stroke="#A9B4C2" />
                  <YAxis stroke="#A9B4C2" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141b2d',
                      border: '1px solid #00FFFF50',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="odds" stroke="#00FFFF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Trade Panel */}
          <div className="space-y-6">
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6 sticky top-20" data-testid="trade-panel">
              <h2 className="text-xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                Place Prediction
              </h2>

              {market.status === 'active' ? (
                <div className="space-y-4">
                  {/* Options */}
                  <div className="space-y-2">
                    <label className="text-[#A9B4C2] text-sm font-semibold">Select Option</label>
                    {market.options?.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`w-full p-4 rounded-lg border smooth-transition ${
                          selectedOption === option.id
                            ? 'border-[#00FFFF] bg-[#00FFFF]/10'
                            : 'border-[#00FFFF]/30 hover:border-[#00FFFF]/60'
                        }`}
                        data-testid={`option-${option.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B4C2]">{option.label}</span>
                          <span className="text-[#00FFFF] font-bold">{option.odds?.toFixed(2)}x</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-[#A9B4C2] text-sm font-semibold mb-2 block">
                      Amount (USD)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                      data-testid="bet-amount-input"
                    />
                  </div>

                  {/* Potential Payout */}
                  {betAmount && selectedOption && (
                    <div className="bg-[#0A0F1F]/50 rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[#A9B4C2]">Potential Payout</span>
                        <span className="text-[#00FFFF] font-semibold">
                          $
                          {
                            (
                              parseFloat(betAmount) *
                              (market.options.find((o) => o.id === selectedOption)?.odds || 1)
                            ).toFixed(2)
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A9B4C2]">Potential Profit</span>
                        <span className="text-green-400 font-semibold">
                          $
                          {
                            (
                              parseFloat(betAmount) *
                                (market.options.find((o) => o.id === selectedOption)?.odds || 1) -
                              parseFloat(betAmount)
                            ).toFixed(2)
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handlePlacePrediction}
                    disabled={!isConnected || submitting || !selectedOption || !betAmount}
                    className="w-full bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] font-semibold glow"
                    data-testid="place-prediction-btn"
                  >
                    {!isConnected
                      ? 'Connect Wallet'
                      : submitting
                      ? 'Placing...'
                      : 'Place Prediction'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#A9B4C2]">
                    This market is {market.status}. Trading is not available.
                  </p>
                  {market.resolution && (
                    <div className="mt-4 p-4 bg-[#0A0F1F]/50 rounded-lg">
                      <p className="text-[#00FFFF] font-semibold">Resolution: {market.resolution}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;