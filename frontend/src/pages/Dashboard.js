import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemo } from '../utils/demoFlags';
import analyticsOverview from '../mocks/fixtures/analytics_overview.json';
import { take } from '../utils/safeList';
import eventsFixture from '../mocks/fixtures/events.json';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, CheckCircle, AlertCircle, BarChart3, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [agentStats, setAgentStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo()) {
      setAnalytics({
        total_events: analyticsOverview.totals.events,
        active_markets: analyticsOverview.totals.active_markets,
        total_predictions: analyticsOverview.totals.predictions,
        total_volume: analyticsOverview.totals.volume_usd
      });
      setAgentStats({
        total_verifications: 1284,
        average_confidence: 87,
        accuracy_rate: 0.94,
        high_confidence_count: 1180
      });
      setEvents(eventsFixture);
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    
    try {
      const [analyticsRes, agentStatsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/analytics/overview`),
        axios.get(`${API}/analytics/agent-stats`),
        axios.get(`${API}/events`)
      ]);

      setAnalytics(analyticsRes.data);
      setAgentStats(agentStatsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const volumeData = [
    { name: 'Mon', volume: 12000 },
    { name: 'Tue', volume: 19000 },
    { name: 'Wed', volume: 15000 },
    { name: 'Thu', volume: 25000 },
    { name: 'Fri', volume: 32000 },
    { name: 'Sat', volume: 28000 },
    { name: 'Sun', volume: 35000 }
  ];

  const categoryData = [
    { name: 'Sports', value: 400, color: '#00FF00' },
    { name: 'Politics', value: 300, color: '#00FFFF' },
    { name: 'Crypto', value: 300, color: '#FF00FF' },
    { name: 'General', value: 200, color: '#FFFF00' }
  ];

  const confidenceData = [
    { range: '0-60%', count: 5 },
    { range: '60-80%', count: 15 },
    { range: '80-90%', count: 45 },
    { range: '90-100%', count: 85 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#00FFFF] text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-[#A9B4C2] text-lg">
            Real-time insights into events, markets, and AI agent performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6" data-testid="metric-events">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 text-[#00FFFF]" />
              <span className="text-green-400 text-sm">+12%</span>
            </div>
            <div className="text-3xl font-['Orbitron'] font-bold text-[#00FFFF] mb-1">
              {analytics?.total_events || 0}
            </div>
            <div className="text-[#A9B4C2] text-sm">Total Events</div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6" data-testid="metric-markets">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-[#00FFFF]" />
              <span className="text-green-400 text-sm">+8%</span>
            </div>
            <div className="text-3xl font-['Orbitron'] font-bold text-[#00FFFF] mb-1">
              {analytics?.active_markets || 0}
            </div>
            <div className="text-[#A9B4C2] text-sm">Active Markets</div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6" data-testid="metric-predictions">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-[#00FFFF]" />
              <span className="text-green-400 text-sm">+25%</span>
            </div>
            <div className="text-3xl font-['Orbitron'] font-bold text-[#00FFFF] mb-1">
              {analytics?.total_predictions || 0}
            </div>
            <div className="text-[#A9B4C2] text-sm">Total Predictions</div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6" data-testid="metric-volume">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 text-[#00FFFF]" />
              <span className="text-green-400 text-sm">+18%</span>
            </div>
            <div className="text-3xl font-['Orbitron'] font-bold text-[#00FFFF] mb-1">
              ${((analytics?.total_volume || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-[#A9B4C2] text-sm">Trading Volume</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events" className="mb-8">
          <TabsList className="bg-[#141b2d] border border-[#00FFFF]/30">
            <TabsTrigger value="events" data-testid="tab-events">
              Events
            </TabsTrigger>
            <TabsTrigger value="agents" data-testid="tab-agents">
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="markets" data-testid="tab-markets">
              Markets
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
              <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                Recent Events
              </h2>
              <div className="space-y-4">
                {take(events, 10).map((event, idx) => (
                  <div
                    key={event.id || event.event_id || idx}
                    className="flex items-center justify-between p-4 bg-[#0A0F1F]/50 rounded-lg hover:bg-[#0A0F1F] smooth-transition"
                    data-testid={`event-row-${event.id || event.event_id || idx}`}
                  >
                    <div className="flex-1">
                      <h3 className="text-[#00FFFF] font-semibold mb-1">{event.event_title}</h3>
                      <p className="text-[#A9B4C2] text-sm line-clamp-1">
                        {event.event_description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {event.confidence && (
                        <div className="text-center">
                          <div className="text-[#00FFFF] font-semibold">
                            {(event.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-[#A9B4C2] text-xs">Confidence</div>
                        </div>
                      )}
                      <div>
                        {event.status === 'verified' && (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        )}
                        {event.status === 'verifying' && (
                          <Activity className="h-6 w-6 text-yellow-400 animate-pulse" />
                        )}
                        {event.status === 'pending' && (
                          <AlertCircle className="h-6 w-6 text-[#A9B4C2]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
                <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                  AI Agent Performance
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#A9B4C2]">Total Verifications</span>
                      <span className="text-[#00FFFF] font-semibold">
                        {agentStats?.total_verifications || 0}
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-2">
                      <div className="bg-[#00FFFF] h-2 rounded-full glow" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#A9B4C2]">Average Confidence</span>
                      <span className="text-[#00FFFF] font-semibold">
                        {agentStats?.average_confidence || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${agentStats?.average_confidence || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#A9B4C2]">Accuracy Rate</span>
                      <span className="text-[#00FFFF] font-semibold">
                        {agentStats?.accuracy_rate || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${(agentStats?.accuracy_rate || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#A9B4C2]">High Confidence Events</span>
                      <span className="text-[#00FFFF] font-semibold">
                        {agentStats?.high_confidence_count || 0}
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-2">
                      <div className="bg-[#00FFFF] h-2 rounded-full glow" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
                <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                  Confidence Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF20" />
                    <XAxis dataKey="range" stroke="#A9B4C2" />
                    <YAxis stroke="#A9B4C2" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141b2d',
                        border: '1px solid #00FFFF50',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#00FFFF" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="mt-6">
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
              <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                Trading Volume (7 Days)
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF20" />
                  <XAxis dataKey="name" stroke="#A9B4C2" />
                  <YAxis stroke="#A9B4C2" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141b2d',
                      border: '1px solid #00FFFF50',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="volume" stroke="#00FFFF" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
                <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                  Event Categories
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
                <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                  System Logs
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {[
                    { time: '12:45:30', message: 'Event verified: Bitcoin price prediction', type: 'success' },
                    { time: '12:43:15', message: 'AI agent completed verification', type: 'info' },
                    { time: '12:40:22', message: 'New market created: Sports event', type: 'info' },
                    { time: '12:38:45', message: 'High confidence verification (95%)', type: 'success' },
                    { time: '12:35:10', message: 'Oracle published to blockchain', type: 'success' },
                    { time: '12:32:05', message: 'Market resolved successfully', type: 'success' },
                    { time: '12:30:18', message: 'New user connected wallet', type: 'info' }
                  ].map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-[#0A0F1F]/50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          log.type === 'success' ? 'bg-green-400' : 'bg-[#00FFFF]'
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-[#A9B4C2] text-xs mb-1">{log.time}</div>
                        <div className="text-[#00FFFF] text-sm">{log.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;