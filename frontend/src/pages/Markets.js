import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { isDemo } from '../utils/demoFlags';
import { normalizeOdds, oddsToPctString } from '../utils/normalizeOdds';
import { toArray } from '../utils/safeList';
import marketsFixture from '../mocks/fixtures/markets.json';
import eventsFixture from '../mocks/fixtures/events.json';
import oddsFixture from '../mocks/fixtures/odds.json';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Markets = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isDemo()) {
      console.info('[DEMO] Markets: using fixtures', marketsFixture.length);
      const enrichedMarkets = toArray(marketsFixture).map(market => {
        const event = eventsFixture.find(e => e.event_id === market.event_id) || {};
        const odds = oddsFixture[market.market_id] || { yes: 0.5, no: 0.5 };
        return {
          ...market,
          id: market.market_id,
          description: `Prediction market for: ${market.title}`,
          status: market.resolved ? 'resolved' : (new Date(market.cutoff_at) < new Date() ? 'closed' : 'active'),
          total_volume: Math.floor(Math.random() * 50000) + 10000,
          category: event.category?.toLowerCase() || 'general',
          options: [
            { label: 'YES', odds: odds.yes },
            { label: 'NO', odds: odds.no }
          ]
        };
      });
      setMarkets(enrichedMarkets);
      setLoading(false);
      return;
    }
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const timeout = setTimeout(() => {
      console.warn('[DEMO] Markets fetch timeout, falling back to fixtures');
      const enrichedMarkets = toArray(marketsFixture).map(market => {
        const event = eventsFixture.find(e => e.event_id === market.event_id) || {};
        const odds = oddsFixture[market.market_id] || { yes: 0.5, no: 0.5 };
        return {
          ...market,
          id: market.market_id,
          description: `Prediction market for: ${market.title}`,
          status: market.resolved ? 'resolved' : (new Date(market.cutoff_at) < new Date() ? 'closed' : 'active'),
          total_volume: Math.floor(Math.random() * 50000) + 10000,
          category: event.category?.toLowerCase() || 'general',
          options: [
            { label: 'YES', odds: odds.yes },
            { label: 'NO', odds: odds.no }
          ]
        };
      });
      setMarkets(enrichedMarkets);
      setLoading(false);
    }, 300);
    
    try {
      const response = await axios.get(`${API}/markets`);
      clearTimeout(timeout);
      if (response.data && response.data.length > 0) {
        setMarkets(response.data);
      } else {
        const enrichedMarkets = toArray(marketsFixture).map(market => {
          const event = eventsFixture.find(e => e.event_id === market.event_id) || {};
          const odds = oddsFixture[market.market_id] || { yes: 0.5, no: 0.5 };
          return {
            ...market,
            id: market.market_id,
            description: `Prediction market for: ${market.title}`,
            status: market.resolved ? 'resolved' : (new Date(market.cutoff_at) < new Date() ? 'closed' : 'active'),
            total_volume: Math.floor(Math.random() * 50000) + 10000,
            category: event.category?.toLowerCase() || 'general',
            options: [
              { label: 'YES', odds: odds.yes },
              { label: 'NO', odds: odds.no }
            ]
          };
        });
        setMarkets(enrichedMarkets);
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error('Error fetching markets, using fixtures:', error);
      const enrichedMarkets = toArray(marketsFixture).map(market => {
        const event = eventsFixture.find(e => e.event_id === market.event_id) || {};
        const odds = oddsFixture[market.market_id] || { yes: 0.5, no: 0.5 };
        return {
          ...market,
          id: market.market_id,
          description: `Prediction market for: ${market.title}`,
          status: market.resolved ? 'resolved' : (new Date(market.cutoff_at) < new Date() ? 'closed' : 'active'),
          total_volume: Math.floor(Math.random() * 50000) + 10000,
          category: event.category?.toLowerCase() || 'general',
          options: [
            { label: 'YES', odds: odds.yes },
            { label: 'NO', odds: odds.no }
          ]
        };
      });
      setMarkets(enrichedMarkets);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = toArray(markets).filter((market) => {
    if (activeTab === 'all') return true;
    return market.status === activeTab;
  });

  const getCategoryColor = (category) => {
    const colors = {
      sports: 'bg-green-500/20 text-green-400 border-green-500/30',
      politics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      crypto: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      general: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
            Prediction Markets
          </h1>
          <p className="text-[#A9B4C2] text-lg">
            Trade on AI-verified events with real-time odds and transparent resolution
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#141b2d] border border-[#00FFFF]/30">
            <TabsTrigger value="all" data-testid="tab-all">All Markets</TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
            <TabsTrigger value="closed" data-testid="tab-closed">Closed</TabsTrigger>
            <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Markets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-[#141b2d] border-[#00FFFF]/30 p-6 animate-pulse">
                <div className="h-6 bg-[#00FFFF]/20 rounded mb-4"></div>
                <div className="h-4 bg-[#00FFFF]/10 rounded mb-2"></div>
                <div className="h-4 bg-[#00FFFF]/10 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#A9B4C2] text-lg">No markets found</p>
            <Link to="/create">
              <Button className="mt-4 bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc]">
                Create First Market
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toArray(filteredMarkets).map((market) => (
              <Link key={market.id} to={`/market/${market.id}`}>
                <Card
                  className="bg-[#141b2d] border-[#00FFFF]/30 hover:border-[#00FFFF] smooth-transition hover:glow p-6 h-full"
                  data-testid={`market-card-${market.id}`}
                >
                  {/* Status Badge */}
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
                    <span className="text-[#A9B4C2] text-sm">
                      ${(market.total_volume || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-3 line-clamp-2">
                    {market.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#A9B4C2] text-sm mb-4 line-clamp-2">{market.description}</p>

                  {/* Options Preview */}
                  {market.options && market.options.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {toArray(market?.options).slice(0, 2).map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-[#0A0F1F]/50 rounded-lg p-2"
                        >
                          <span className="text-[#A9B4C2] text-sm">{option.label}</span>
                          <span className="text-[#00FFFF] font-semibold">
                            {oddsToPctString(option?.odds)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View Button */}
                  <Button
                    variant="outline"
                    className="w-full border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/10"
                    data-testid={`view-market-${market.id}`}
                  >
                    View Market
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;