import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '@/context/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Bot, Award, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CopyTrading = () => {
  const { isConnected, getAuthHeaders } = useWallet();
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await axios.get(`${API}/strategies`);
      setStrategies(response.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast.error('Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowStrategy = async (strategyId) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await axios.post(`${API}/strategies/${strategyId}/follow`, {}, { headers: getAuthHeaders() });
      toast.success('Strategy followed successfully!');
      fetchStrategies();
    } catch (error) {
      console.error('Error following strategy:', error);
      toast.error('Failed to follow strategy');
    }
  };

  const filteredStrategies = strategies.filter((strategy) => {
    if (activeTab === 'all') return true;
    return strategy.strategy_type === activeTab;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
            Copy Trading
          </h1>
          <p className="text-[#A9B4C2] text-lg">
            Follow top traders and AI strategies to maximize your returns
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">245</div>
                <div className="text-[#A9B4C2] text-sm">Active Traders</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">12</div>
                <div className="text-[#A9B4C2] text-sm">AI Agents</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">78%</div>
                <div className="text-[#A9B4C2] text-sm">Avg Win Rate</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">+45%</div>
                <div className="text-[#A9B4C2] text-sm">Avg ROI</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#141b2d] border border-[#00FFFF]/30">
            <TabsTrigger value="all" data-testid="tab-all-strategies">
              All Strategies
            </TabsTrigger>
            <TabsTrigger value="ai-agent" data-testid="tab-ai-strategies">
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="manual" data-testid="tab-manual-strategies">
              Manual Traders
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Strategies Grid */}
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
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#A9B4C2] text-lg">No strategies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStrategies.map((strategy) => (
              <Card
                key={strategy.id}
                className="bg-[#141b2d] border-[#00FFFF]/30 hover:border-[#00FFFF] smooth-transition hover:glow p-6"
                data-testid={`strategy-card-${strategy.id}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-['Orbitron'] font-semibold text-[#00FFFF]">
                        {strategy.name}
                      </h3>
                      {strategy.strategy_type === 'ai-agent' && (
                        <Bot className="h-4 w-4 text-[#00FFFF]" />
                      )}
                    </div>
                    <Badge className="bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30 border">
                      {strategy.strategy_type === 'ai-agent' ? 'AI Agent' : 'Manual'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-[#00FFFF]">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm font-semibold">{strategy.followers}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#A9B4C2] text-sm mb-4 line-clamp-2">{strategy.description}</p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-[#0A0F1F]/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-[#00FFFF] font-semibold">
                      {strategy.performance?.total_trades || 0}
                    </div>
                    <div className="text-[#A9B4C2] text-xs">Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">
                      {((strategy.performance?.win_rate || 0.7) * 100).toFixed(0)}%
                    </div>
                    <div className="text-[#A9B4C2] text-xs">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#00FFFF] font-semibold flex items-center justify-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {((strategy.performance?.roi || 0.25) * 100).toFixed(0)}%
                    </div>
                    <div className="text-[#A9B4C2] text-xs">ROI</div>
                  </div>
                </div>

                {/* Follow Button */}
                <Button
                  onClick={() => handleFollowStrategy(strategy.id)}
                  disabled={!isConnected}
                  className="w-full bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] font-semibold"
                  data-testid={`follow-strategy-${strategy.id}`}
                >
                  {isConnected ? 'Follow Strategy' : 'Connect Wallet'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTrading;