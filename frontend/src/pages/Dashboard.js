import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemo } from '../utils/demoFlags';
import analyticsOverview from '../mocks/fixtures/analytics_overview.json';
import charts from '../mocks/fixtures/analytics_charts.json';
import { take, toArray } from '../utils/safeList';
import eventsFixture from '../mocks/fixtures/events.json';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, CheckCircle, AlertCircle, BarChart3, Eye } from 'lucide-react';
import { toast } from 'sonner';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import SimpleLineChart from '../components/charts/SimpleLineChart';
import SimplePieChart from '../components/charts/SimplePieChart';
import SparklineMini from '../components/charts/SparklineMini';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper functions
function timeAgo(iso) {
  try {
    const d = new Date(iso);
    const s = (Date.now() - d.getTime()) / 1000;
    if (!isFinite(s)) return '—';
    if (s < 60) return `${Math.floor(s)}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  } catch { return '—'; }
}

function hashString(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function toPct(x) {
  if (x == null) return 75;
  const n = typeof x === 'number' ? x : parseFloat(String(x).replace('%',''));
  if (!isFinite(n)) return 75;
  return n <= 1 ? n * 100 : n;
}

function genSparkline(seedLabel, basePct = 75, n = 16) {
  const seed = hashString(String(seedLabel || 'seed'));
  const out = [];
  let v = Math.max(5, Math.min(95, basePct));
  for (let i = 0; i < n; i++) {
    const rnd = ((seed * (i + 11)) % 997) / 997;
    const delta = (rnd - 0.5) * 6;
    v = Math.max(5, Math.min(95, v + delta));
    out.push({ t: i, v: Number(v.toFixed(1)) });
  }
  return out;
}

function deltaFromSeries(series) {
  const arr = toArray(series);
  if (arr.length < 2) return 0;
  const a = Number(arr[arr.length - 2]?.v) || 0;
  const b = Number(arr[arr.length - 1]?.v) || 0;
  const d = b - a;
  return Number(d.toFixed(1));
}

function deltaArrow(d) {
  if (d > 0.5) return '▲';
  if (d < -0.5) return '▼';
  return '→';
}

function deltaClass(d) {
  if (d > 0.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (d < -0.5) return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
}

const Dashboard = () => {
  const DEMO = isDemo();
  
  // In-component fallback data
  const DEFAULT_ANALYTICS = {
    volume7d: [
      { d:'2025-01-01', usd:18100 },{ d:'2025-01-02', usd:22100 },
      { d:'2025-01-03', usd:19800 },{ d:'2025-01-04', usd:24300 },
      { d:'2025-01-05', usd:20900 },{ d:'2025-01-06', usd:25100 },
      { d:'2025-01-07', usd:29050 },
    ],
    confidenceBuckets: [
      { range:'50–60', count:132 },{ range:'60–70', count:148 },
      { range:'70–80', count:116 },{ range:'80–90', count:101 },
      { range:'90–100', count:48 },
    ],
    categories: [
      { name:'Crypto', value:36 },{ name:'Politics', value:22 },
      { name:'Sports', value:18 },{ name:'Tech', value:14 },
      { name:'Other', value:10 },
    ],
  };
  
  const [analytics, setAnalytics] = useState(null);
  const [agentStats, setAgentStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    if (DEMO) {
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
      // Don't fetch in DEMO mode
      return;
    }
    fetchDashboardData();
  }, [DEMO]);

  const fetchDashboardData = async () => {
    if (DEMO) return; // Block fetch in DEMO
    
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

  // Force Recharts to remeasure when tab changes
  useEffect(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      setChartKey((k) => k + 1);
    });
  }, [activeTab]);

  // Prepare chart data with fallbacks
  const chartSource = DEMO && charts && Object.keys(charts).length ? charts : (DEMO ? DEFAULT_ANALYTICS : {});
  const vol7 = DEMO ? chartSource.volume7d : [];
  const conf = DEMO ? chartSource.confidenceBuckets : [];
  const cats = DEMO ? chartSource.categories : [];
  
  if (DEMO) {
    console.debug('[Dashboard demo] vol7=', vol7?.length, 'conf=', conf?.reduce((s,i)=>s+(i.count||0),0), 'cats=', cats?.reduce((s,i)=>s+(i.value||0),0));
  }

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#141b2d] border border-[#00FFFF]/30">
            <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
            <TabsTrigger value="agents" data-testid="tab-agents">AI Agents</TabsTrigger>
            <TabsTrigger value="markets" data-testid="tab-markets">Markets</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
              <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                Recent Events
              </h2>
              <div className="space-y-4">
                {take(events, 10).map((event, idx) => {
                  const key = event?.id || event?.event_id || event?.title || `evt-${idx}`;
                  const pct = toPct(event?.confidence);
                  const sparkData = genSparkline(key, pct, 16);
                  const delta = deltaFromSeries(sparkData);
                  
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-[#0A0F1F]/50 rounded-lg hover:bg-[#0A0F1F] smooth-transition"
                      data-testid={`event-row-${key}`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-[#00FFFF] mb-1">
                          {event?.title || event?.event_title || 'Untitled Event'}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">
                          {timeAgo(event?.created_at || event?.ts)} • {event?.category || 'General'}
                        </div>
                        {isDemo() && (
                          <div className="mt-2">
                            <SparklineMini data={sparkData} yKey="v" height={40} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 ml-4">
                        {event.confidence && (
                          <div className="text-center">
                            <div className="text-[#00FFFF] font-semibold">
                              {(event.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="text-[#A9B4C2] text-xs">Confidence</div>
                            {isDemo() && (
                              <div className="mt-1 flex justify-end">
                                <span className={`px-1.5 py-0.5 rounded-md border text-[11px] leading-none ${deltaClass(delta)}`}>
                                  {deltaArrow(delta)} {delta > 0 ? '+' : ''}{Math.abs(delta).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          {event.status === 'verified' && <CheckCircle className="h-6 w-6 text-green-400" />}
                          {event.status === 'verifying' && <Activity className="h-6 w-6 text-yellow-400 animate-pulse" />}
                          {event.status === 'pending' && <AlertCircle className="h-6 w-6 text-[#A9B4C2]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="mt-6" forceMount hidden={activeTab !== 'agents'}>
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
                        {((agentStats?.accuracy_rate || 0) * 100).toFixed(0)}%
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
                <div key={`agents-${chartKey}`}>
                  <SimpleBarChart data={conf} height={260} />
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="mt-6" forceMount hidden={activeTab !== 'markets'}>
            <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
              <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                Trading Volume (7 Days)
              </h2>
              <div key={`markets-${chartKey}`}>
                <SimpleLineChart data={vol7} height={260} />
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6" forceMount hidden={activeTab !== 'analytics'}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
                <h2 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-6">
                  Event Categories
                </h2>
                <div key={`analytics-${chartKey}`}>
                  <SimplePieChart data={cats} height={260} />
                </div>
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
